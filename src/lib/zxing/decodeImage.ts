import { BrowserMultiFormatReader } from '@zxing/browser';

/**
 * Decodes a barcode (1D or 2D) from a strictly provided image file or URL.
 * Supports QR Code, Data Matrix, Aztec, PDF417 (2D) and UPC-A/E, EAN-8/13,
 * Code 39, Code 93, Code 128, ITF, Codabar, RSS-14 (1D).
 * Returns the decoded text or throws a specific error.
 */
export async function decodeBarcodeFromImage(source: File | string): Promise<string> {
    const codeReader = new BrowserMultiFormatReader();

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

        throw new Error("No barcode found");
    } catch (error) {
        // ZXing throws generic errors; refine for the UI
        console.error("Barcode Decode Error:", error);
        if (error instanceof Error) {
            // Common ZXing "not found" errors or general failures
            if (
                error.message.includes("No MultiFormat Readers") ||
                error.message.includes("No barcode found") ||
                error.message.includes("NotFoundException") ||
                error.message.toLowerCase().includes("not found")
            ) {
                throw new Error("No barcode detected. Please ensure the image is clear and contains a valid 1D or 2D barcode (QR, UPC, Code 128, EAN, etc.).");
            }
        }
        throw new Error("Could not decode image. It might be corrupted or the barcode is not readable.");
    }
}
