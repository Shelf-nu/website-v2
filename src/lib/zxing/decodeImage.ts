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
};

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
 * Throws an Error with a user-facing message when nothing readable is found.
 *
 * zxing's QR detector misses some perfectly valid codes at one particular
 * size or threshold and finds them at another, so a still image gets a few
 * attempts: as-is, then rescaled, each with the default (hybrid) and the
 * global-histogram binarizer. Images are cheap to retry; the camera simply
 * tries the next frame.
 */
export async function decodeBarcodeFromImage(source: File | string): Promise<DecodedCode> {
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

    for (const scale of scales) {
        let canvas: HTMLCanvasElement;
        try {
            canvas = drawScaled(img, scale);
        } catch {
            break;
        }
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
    }

    throw new Error('No barcode detected. Make sure the image is sharp and the whole code is visible.');
}

/**
 * Starts continuous decoding from a camera stream shown in `video`.
 * The caller owns the stream (it asked for camera permission itself, so it
 * can explain a refusal); `controls.stop()` ends the loop and stops the tracks.
 * `onCode` fires for every frame that contains a code, so de-duplication is
 * the caller's job.
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
    return codeReader.decodeFromStream(stream, video, (result) => {
        if (result) onCode(toDecoded(result));
    });
}
