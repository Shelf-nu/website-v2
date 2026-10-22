import {
    BarcodeFormat,
    BinaryBitmap,
    DecodeHintType,
    HybridBinarizer,
    MultiFormatReader,
    RGBLuminanceSource,
    type Result,
} from '@zxing/library';
import {
    adaptiveThreshold,
    boxBlur,
    invert,
    resize,
    stretchContrast,
    unsharpMask,
    type GrayImage,
} from './enhance';

/**
 * The "try harder" pass for still images, run only after the normal decode
 * has failed. It feeds zxing a series of cleaned-up versions of the photo
 * (inverted, contrast-stretched, sharpened, locally thresholded, rescaled)
 * and stops at the first one that reads.
 *
 * DOM-free on purpose: it takes a grayscale buffer, so the browser decoder
 * and offline tests run exactly the same code.
 */

export type EnhanceStep = 'invert' | 'contrast' | 'sharpen' | 'lighting' | 'enlarge' | 'shrink';

export type HarderResult = {
    result: Result;
    /** What was done to the image before it read, in the order it was done. */
    steps: EnhanceStep[];
    /** How many variants were tried, including the one that read. */
    attempts: number;
};

export type HarderOptions = {
    /** Give up when `Date.now()` passes this. */
    deadline: number;
    /** Hard cap on decode attempts, whatever the clock says. */
    maxAttempts?: number;
    /** Awaited between attempts so the page stays responsive. */
    yieldToUi?: () => Promise<void>;
};

const STEP_PHRASES: Record<EnhanceStep, string> = {
    invert: 'inverting the colors',
    contrast: 'boosting the contrast',
    sharpen: 'sharpening',
    lighting: 'evening out the lighting',
    enlarge: 'enlarging the code',
    shrink: 'shrinking the photo',
};

/** "Read after inverting the colors and evening out the lighting." */
export function describeSteps(steps: EnhanceStep[]): string {
    const phrases = [...new Set(steps)].map((s) => STEP_PHRASES[s]);
    if (phrases.length === 0) return '';
    const list = phrases.length === 1 ? phrases[0] : `${phrases.slice(0, -1).join(', ')} and ${phrases[phrases.length - 1]}`;
    return `Read after ${list}.`;
}

type Variant = { steps: EnhanceStep[]; image: () => GrayImage };

/**
 * Working sizes for the photo's longest side. Detection needs a few pixels
 * per module, so small images are enlarged; huge phone photos are shrunk,
 * which is faster and averages away sensor and JPEG noise.
 */
function workingSizes(longest: number): { size: number; step?: EnhanceStep }[] {
    if (longest < 400) {
        return [
            { size: Math.min(1200, longest * 3), step: 'enlarge' },
            { size: Math.min(900, longest * 2), step: 'enlarge' },
        ];
    }
    if (longest < 700) return [{ size: longest }, { size: longest * 2, step: 'enlarge' }];
    if (longest <= 1300) return [{ size: longest }, { size: Math.round(longest * 0.6), step: 'shrink' }];
    return [{ size: 1000, step: 'shrink' }, { size: 1500, step: 'shrink' }];
}

function scaled(img: GrayImage, longestTarget: number): GrayImage {
    const longest = Math.max(img.width, img.height);
    if (Math.abs(longestTarget - longest) < 2) return img;
    const f = longestTarget / longest;
    return resize(img, Math.max(1, Math.round(img.width * f)), Math.max(1, Math.round(img.height * f)));
}

/** Lazily builds the variants for one working size, cheapest and most likely first. */
function* variantsFor(base: () => GrayImage, sizeStep: EnhanceStep | undefined, skipPlainUpright: boolean): Generator<Variant> {
    const pre: EnhanceStep[] = sizeStep ? [sizeStep] : [];
    let stretched: GrayImage | undefined;
    const getStretched = () => (stretched ??= stretchContrast(base(), 1, 1));

    // 1. Plain and inverted. Light-on-dark codes (engraved metal, white-on-black
    //    stickers) fail only because zxing looks for dark finder squares.
    if (!skipPlainUpright) yield { steps: pre, image: base };
    yield { steps: [...pre, 'invert'], image: () => invert(base()) };

    // 2. Contrast stretch, for faded print and grey-on-grey photos.
    yield { steps: [...pre, 'contrast'], image: getStretched };
    yield { steps: [...pre, 'contrast', 'invert'], image: () => invert(getStretched()) };

    // 3. Local threshold at a few window sizes, for light that falls off
    //    across the code. A light smoothing first stops JPEG noise from
    //    turning into speckles.
    const img = base();
    const short = Math.min(img.width, img.height);
    let smooth: GrayImage | undefined;
    const getSmooth = () => (smooth ??= boxBlur(getStretched(), Math.max(1, Math.round(short / 400))));
    for (const divisor of [12, 24, 6]) {
        const window = Math.max(9, Math.round(short / divisor) | 1);
        let bin: GrayImage | undefined;
        const getBin = () => (bin ??= adaptiveThreshold(getSmooth(), window, 3));
        yield { steps: [...pre, 'lighting'], image: getBin };
        yield { steps: [...pre, 'lighting', 'invert'], image: () => invert(getBin()) };
    }

    // 4. Unsharp mask for soft focus, plain and then thresholded.
    const radius = Math.max(2, Math.round(short / 120));
    let sharp: GrayImage | undefined;
    const getSharp = () => (sharp ??= stretchContrast(unsharpMask(getStretched(), radius, 1.5), 0.5, 0.5));
    yield { steps: [...pre, 'sharpen'], image: getSharp };
    yield { steps: [...pre, 'sharpen', 'invert'], image: () => invert(getSharp()) };
    let sharpBin: GrayImage | undefined;
    const getSharpBin = () => (sharpBin ??= adaptiveThreshold(getSharp(), Math.max(9, Math.round(short / 12) | 1), 3));
    yield { steps: [...pre, 'sharpen', 'lighting'], image: getSharpBin };
    yield { steps: [...pre, 'sharpen', 'lighting', 'invert'], image: () => invert(getSharpBin()) };
}

function tryDecode(reader: MultiFormatReader, img: GrayImage): Result | null {
    try {
        const source = new RGBLuminanceSource(img.data, img.width, img.height);
        return reader.decodeWithState(new BinaryBitmap(new HybridBinarizer(source)));
    } catch {
        return null;
    } finally {
        reader.reset();
    }
}

/**
 * Tries enhanced variants of `gray` until one decodes, the deadline passes
 * or `maxAttempts` is reached. Returns null when nothing reads.
 */
export async function decodeHarder(gray: GrayImage, options: HarderOptions): Promise<HarderResult | null> {
    const { deadline, maxAttempts = 60, yieldToUi } = options;
    const reader = new MultiFormatReader();
    // 2D codes only: they are what people photograph up close (QR on tags,
    // Data Matrix on parts), and skipping the eleven 1D readers makes each
    // attempt several times faster, so far more variants fit in the budget.
    reader.setHints(
        new Map<DecodeHintType, unknown>([
            [DecodeHintType.TRY_HARDER, true],
            [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX, BarcodeFormat.AZTEC]],
        ]),
    );

    const longest = Math.max(gray.width, gray.height);
    let attempts = 0;

    for (const { size, step } of workingSizes(longest)) {
        let base: GrayImage | undefined;
        const getBase = () => (base ??= scaled(gray, size));
        // The normal pass already tried the photo as-is at its own size.
        const skipPlain = step === undefined;
        for (const variant of variantsFor(getBase, step, skipPlain)) {
            if (attempts >= maxAttempts || Date.now() > deadline) return null;
            if (yieldToUi) await yieldToUi();
            attempts += 1;
            const result = tryDecode(reader, variant.image());
            if (result) return { result, steps: variant.steps, attempts };
        }
    }
    return null;
}
