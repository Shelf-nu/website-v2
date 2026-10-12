import { BrowserMultiFormatReader, HTMLCanvasElementLuminanceSource, type IScannerControls } from '@zxing/browser';
import {
    BarcodeFormat,
    BinaryBitmap,
    DecodeHintType,
    GlobalHistogramBinarizer,
    HybridBinarizer,
    MultiFormatReader,
    type Result,
} from '@zxing/library';
import { rgbaToGray } from './enhance';
import { decodeHarder, describeSteps } from './tryHarder';

/**
 * The zxing decoder for the free scanner tools.
 *
 * This module is ~400 KB of decoder, so the scanner component imports it
 * with `await import()` only when someone starts the camera or picks an
 * image. Keep every zxing import in this file.
 *
 * Supports QR Code, Data Matrix, Aztec, PDF417 (2D) and UPC-A/E, EAN-8/13,
 * Code 39, Code 93, Code 128, ITF, Codabar, RSS-14 (1D).
 */

export type DecodedCode = {
    text: string;
    /** Human-readable format name, e.g. "QR Code", "EAN-13". */
    format: string;
    /**
     * Set when the code only read after clean-up, e.g. "Read after inverting
     * the colors and evening out the lighting."
     */
    enhancement?: string;
};

/**
 * Thrown when an image opened fine but no code could be read from it, even
 * after the clean-up pass. The UI shows retake advice for this case.
 */
export class NoCodeFoundError extends Error {
    constructor() {
        super('No code found, even after cleaning up the photo.');
        this.name = 'NoCodeFoundError';
    }
}

export type DecodeImageOptions = {
    /** Called once when the normal read fails and the clean-up pass starts. */
    onTryHarder?: () => void;
};

/** Time the clean-up pass may take per image, on top of the normal read. */
const TRY_HARDER_BUDGET_MS = 2500;
/** Cap on clean-up attempts, so a fast machine doesn't grind through every variant for nothing. */
const TRY_HARDER_MAX_ATTEMPTS = 40;
/** Longest side of the grayscale copy the clean-up pass works from. */
const TRY_HARDER_MAX_SIDE = 2000;

const FORMAT_NAMES: Partial<Record<BarcodeFormat, string>> = {
    [BarcodeFormat.AZTEC]: 'Aztec',
    [BarcodeFormat.CODABAR]: 'Codabar',
    [BarcodeFormat.CODE_39]: 'Code 39',
    [BarcodeFormat.CODE_93]: 'Code 93',
    [BarcodeFormat.CODE_128]: 'Code 128',
    [BarcodeFormat.DATA_MATRIX]: 'Data Matrix',
    [BarcodeFormat.EAN_8]: 'EAN-8',
    [BarcodeFormat.EAN_13]: 'EAN-13',
    [BarcodeFormat.ITF]: 'ITF',
    [BarcodeFormat.MAXICODE]: 'MaxiCode',
    [BarcodeFormat.PDF_417]: 'PDF417',
    [BarcodeFormat.QR_CODE]: 'QR Code',
    [BarcodeFormat.RSS_14]: 'RSS-14',
    [BarcodeFormat.RSS_EXPANDED]: 'RSS Expanded',
    [BarcodeFormat.UPC_A]: 'UPC-A',
    [BarcodeFormat.UPC_E]: 'UPC-E',
    [BarcodeFormat.UPC_EAN_EXTENSION]: 'UPC/EAN extension',
};

function toDecoded(result: Result): DecodedCode {
    const format = result.getBarcodeFormat();
    return {
        text: result.getText(),
        format: FORMAT_NAMES[format] ?? BarcodeFormat[format] ?? 'Unknown',
    };
}

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('image-load'));
        img.src = url;
    });
}

const yieldToUi = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function drawScaled(img: HTMLImageElement, scale: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('canvas');
    // Transparent PNGs would otherwise turn into black-on-black.
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
}

/**
 * Decodes one barcode (1D or 2D) from an image file.
 * Throws `NoCodeFoundError` when the image opened but nothing could be read,
 * and a plain Error with a user-facing message when the image won't open.
 *
 * zxing's QR detector misses some perfectly valid codes at one particular
 * size or threshold and finds them at another, so a still image gets a few
 * attempts: as-is, then rescaled, each with the default (hybrid) and the
 * global-histogram binarizer. Images are cheap to retry; the camera simply
 * tries the next frame.
 *
 * Between the as-is attempt and the rescaled ones sits the "try harder"
 * pass (`tryHarder.ts`): inverted, contrast-stretched, locally thresholded
 * and sharpened variants for blurry, dark, light-on-dark or unevenly lit
 * 2D codes. It is time-boxed and only runs when the as-is read failed.
 */
export async function decodeBarcodeFromImage(source: File | string, options: DecodeImageOptions = {}): Promise<DecodedCode> {
    // Still images can afford the slower, more thorough search; it noticeably
    // helps with small or slightly skewed 1D barcodes in phone photos.
    const hints = new Map<DecodeHintType, unknown>([[DecodeHintType.TRY_HARDER, true]]);
    const reader = new MultiFormatReader();
    reader.setHints(hints);

    const url = typeof source === 'string' ? source : URL.createObjectURL(source);
    let img: HTMLImageElement;
    try {
        img = await loadImage(url);
    } catch {
        throw new Error('Could not open this image. It may be corrupted or in a format your browser cannot show.');
    } finally {
        if (typeof source !== 'string') URL.revokeObjectURL(url);
    }

    const longest = Math.max(img.naturalWidth, img.naturalHeight);
    // Very large phone photos are slow to search at full size; very small
    // screenshots read better enlarged.
    const scales = [1, 0.5, 0.75, 1.5].filter((s) => longest * s <= 4000 && longest * s >= 100);
    if (scales.length === 0) scales.push(Math.min(1, 4000 / longest));

    const tryScale = (scale: number): DecodedCode | null => {
        const canvas = drawScaled(img, scale);
        const luminance = new HTMLCanvasElementLuminanceSource(canvas);
        for (const binarizer of [new HybridBinarizer(luminance), new GlobalHistogramBinarizer(luminance)]) {
            try {
                return toDecoded(reader.decodeWithState(new BinaryBitmap(binarizer)));
            } catch {
                // Not found with this combination; try the next one.
            } finally {
                reader.reset();
            }
        }
        return null;
    };

    const [first, ...rest] = scales;
    try {
        const found = tryScale(first);
        if (found) return found;
    } catch {
        // Canvas unavailable or out of memory at this size; the pass below may still fit.
    }

    try {
        const harder = await tryHarder(img, options);
        if (harder) return harder;
    } catch {
        // Clean-up is a bonus; fall through to the remaining plain attempts.
    }

    for (const scale of rest) {
        await yieldToUi();
        try {
            const found = tryScale(scale);
            if (found) return found;
        } catch {
            break;
        }
    }

    throw new NoCodeFoundError();
}

async function tryHarder(img: HTMLImageElement, options: DecodeImageOptions): Promise<DecodedCode | null> {
    options.onTryHarder?.();
    await yieldToUi();
    const started = Date.now();
    const longest = Math.max(img.naturalWidth, img.naturalHeight);
    const canvas = drawScaled(img, Math.min(1, TRY_HARDER_MAX_SIDE / longest));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const found = await decodeHarder(rgbaToGray(data, width, height), {
        deadline: started + TRY_HARDER_BUDGET_MS,
        maxAttempts: TRY_HARDER_MAX_ATTEMPTS,
        yieldToUi,
    });
    if (!found) return null;
    return { ...toDecoded(found.result), enhancement: describeSteps(found.steps) || undefined };
}

/** How often the camera loop also tries a color-inverted frame. */
const INVERTED_FRAME_INTERVAL_MS = 450;
/** Longest side of the frame copy used for the inverted attempt. */
const INVERTED_FRAME_MAX_SIDE = 960;

/**
 * Starts continuous decoding from a camera stream shown in `video`.
 * The caller owns the stream (it asked for camera permission itself, so it
 * can explain a refusal); `controls.stop()` ends the loop and stops the tracks.
 * `onCode` fires for every frame that contains a code, so de-duplication is
 * the caller's job.
 *
 * zxing only looks for dark-on-light codes, so a light-on-dark code (laser
 * engraved metal, white-on-black stickers) never reads from the camera on its
 * own. Every few frames a second, cheap loop decodes an inverted copy of the
 * current frame, 2D formats only, so those codes scan live too.
 */
export async function startLiveScan(
    stream: MediaStream,
    video: HTMLVideoElement,
    onCode: (code: DecodedCode) => void,
): Promise<IScannerControls> {
    const codeReader = new BrowserMultiFormatReader(undefined, {
        delayBetweenScanAttempts: 150,
        delayBetweenScanSuccess: 300,
    });
    const controls = await codeReader.decodeFromStream(stream, video, (result) => {
        if (result) onCode(toDecoded(result));
    });

    const invertedReader = new MultiFormatReader();
    invertedReader.setHints(
        new Map<DecodeHintType, unknown>([
            [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX, BarcodeFormat.AZTEC]],
        ]),
    );
    const frame = document.createElement('canvas');
    let stopped = false;
    const timer = setInterval(() => {
        if (stopped || video.readyState < 2 || !video.videoWidth) return;
        try {
            const scale = Math.min(1, INVERTED_FRAME_MAX_SIDE / Math.max(video.videoWidth, video.videoHeight));
            frame.width = Math.round(video.videoWidth * scale);
            frame.height = Math.round(video.videoHeight * scale);
            const ctx = frame.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;
            ctx.drawImage(video, 0, 0, frame.width, frame.height);
            const inverted = new HTMLCanvasElementLuminanceSource(frame).invert();
            onCode(toDecoded(invertedReader.decodeWithState(new BinaryBitmap(new HybridBinarizer(inverted)))));
        } catch {
            // No inverted code in this frame.
        } finally {
            invertedReader.reset();
        }
    }, INVERTED_FRAME_INTERVAL_MS);

    return {
        ...controls,
        stop: () => {
            stopped = true;
            clearInterval(timer);
            controls.stop();
        },
    };
}
