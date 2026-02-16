import { BrowserQRCodeReader } from '@zxing/browser';

/**
 * Decodes a QR code from a strictly provided image file or URL.
 * Returns the decoded text or throws a specific error.
 */
export async function decodeQrFromImage(source: File | string): Promise<string> {
    const codeReader = new BrowserQRCodeReader();

    try {
        let result;

        if (typeof source === 'string') {
            // If string, assume it's an image URL
            result = await codeReader.decodeFromImageUrl(source);
        } else {
            // If File object, create object URL
            const url = URL.createObjectURL(source);
            try {
                result = await codeReader.decodeFromImageUrl(url);
            } finally {
                URL.revokeObjectURL(url);
            }
        }

        if (result) {
            return result.getText();
        }

        throw new Error("No QR code found");
    } catch (error) {
        // ZXing throws generic errors, refine them for the UI
        console.error("QR Decode Error:", error);
        if (error instanceof Error) {
            // Common ZXing "not found" errors or just general failures
            if (error.message.includes("No MultiFormat Readers") || error.message.includes("No QR code found")) {
                throw new Error("No QR code detected. Please ensure the image is clear and contains a valid QR code.");
            }
        }
        throw new Error("Could not decode image. It might be corrupted or the QR code is not readable.");
    }
}
