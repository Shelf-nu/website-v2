/**
 * Image clean-up steps for the scanners' "try harder" pass.
 *
 * Plain functions on 8-bit grayscale buffers, with no DOM and no zxing, so
 * they are cheap to reason about and easy to run outside a browser. The
 * decoder (`decodeImage.ts`) chains them into variants and stops at the
 * first one zxing can read.
 *
 * None of this recovers detail a photo never captured. It removes the things
 * that stop a decoder from seeing detail that is there: reversed colors,
 * uneven light, low contrast, mild blur, and a code that is too small or too
 * large in the frame.
 */

export type GrayImage = {
    data: Uint8ClampedArray;
    width: number;
    height: number;
};

/** RGBA pixels (from canvas `getImageData`) to luminance, with transparency read as white. */
export function rgbaToGray(rgba: Uint8ClampedArray, width: number, height: number): GrayImage {
    const data = new Uint8ClampedArray(width * height);
    for (let i = 0, p = 0; i < data.length; i++, p += 4) {
        const a = rgba[p + 3] / 255;
        const lum = 0.299 * rgba[p] + 0.587 * rgba[p + 1] + 0.114 * rgba[p + 2];
        data[i] = lum * a + 255 * (1 - a);
    }
    return { data, width, height };
}

export function invert(img: GrayImage): GrayImage {
    const data = new Uint8ClampedArray(img.data.length);
    for (let i = 0; i < data.length; i++) data[i] = 255 - img.data[i];
    return { data, width: img.width, height: img.height };
}

/**
 * Resamples to a new size: area averaging when shrinking (it also smooths
 * JPEG noise), bilinear when enlarging.
 */
export function resize(img: GrayImage, width: number, height: number): GrayImage {
    const { data: src, width: sw, height: sh } = img;
    const data = new Uint8ClampedArray(width * height);
    const fx = sw / width;
    const fy = sh / height;

    if (fx >= 1 && fy >= 1) {
        for (let y = 0; y < height; y++) {
            const y0 = Math.floor(y * fy);
            const y1 = Math.max(y0 + 1, Math.min(sh, Math.floor((y + 1) * fy)));
            for (let x = 0; x < width; x++) {
                const x0 = Math.floor(x * fx);
                const x1 = Math.max(x0 + 1, Math.min(sw, Math.floor((x + 1) * fx)));
                let sum = 0;
                for (let yy = y0; yy < y1; yy++) {
                    const row = yy * sw;
                    for (let xx = x0; xx < x1; xx++) sum += src[row + xx];
                }
                data[y * width + x] = sum / ((y1 - y0) * (x1 - x0));
            }
        }
        return { data, width, height };
    }

    for (let y = 0; y < height; y++) {
        const sy = Math.min(sh - 1, Math.max(0, (y + 0.5) * fy - 0.5));
        const y0 = Math.floor(sy);
        const y1 = Math.min(sh - 1, y0 + 1);
        const wy = sy - y0;
        for (let x = 0; x < width; x++) {
            const sx = Math.min(sw - 1, Math.max(0, (x + 0.5) * fx - 0.5));
            const x0 = Math.floor(sx);
            const x1 = Math.min(sw - 1, x0 + 1);
            const wx = sx - x0;
            const top = src[y0 * sw + x0] * (1 - wx) + src[y0 * sw + x1] * wx;
            const bottom = src[y1 * sw + x0] * (1 - wx) + src[y1 * sw + x1] * wx;
            data[y * width + x] = top * (1 - wy) + bottom * wy;
        }
    }
    return { data, width, height };
}

/**
 * Contrast stretch: the darkest `lowPct` percent of pixels go to black, the
 * brightest `highPct` percent to white, and everything between is spread
 * over the full range.
 */
export function stretchContrast(img: GrayImage, lowPct = 1, highPct = 1): GrayImage {
    const hist = new Uint32Array(256);
    for (let i = 0; i < img.data.length; i++) hist[img.data[i]]++;
    const total = img.data.length;
    const lowCount = (total * lowPct) / 100;
    const highCount = (total * highPct) / 100;

    let lo = 0;
    for (let acc = 0; lo < 255; lo++) {
        acc += hist[lo];
        if (acc > lowCount) break;
    }
    let hi = 255;
    for (let acc = 0; hi > 0; hi--) {
        acc += hist[hi];
        if (acc > highCount) break;
    }
    if (hi - lo < 2) return img;

    const scale = 255 / (hi - lo);
    const data = new Uint8ClampedArray(img.data.length);
    for (let i = 0; i < data.length; i++) data[i] = (img.data[i] - lo) * scale;
    return { data, width: img.width, height: img.height };
}

/** Summed-area table with a zero row and column, so any box sum is four lookups. */
function integral(img: GrayImage): Float64Array {
    const { data, width, height } = img;
    const w1 = width + 1;
    const table = new Float64Array(w1 * (height + 1));
    for (let y = 0; y < height; y++) {
        let rowSum = 0;
        for (let x = 0; x < width; x++) {
            rowSum += data[y * width + x];
            table[(y + 1) * w1 + x + 1] = table[y * w1 + x + 1] + rowSum;
        }
    }
    return table;
}

/** Mean of the (2r+1)-square box around each pixel, clipped at the edges. */
export function boxBlur(img: GrayImage, radius: number): GrayImage {
    const { width, height } = img;
    const table = integral(img);
    const w1 = width + 1;
    const data = new Uint8ClampedArray(width * height);
    for (let y = 0; y < height; y++) {
        const y0 = Math.max(0, y - radius);
        const y1 = Math.min(height, y + radius + 1);
        for (let x = 0; x < width; x++) {
            const x0 = Math.max(0, x - radius);
            const x1 = Math.min(width, x + radius + 1);
            const sum = table[y1 * w1 + x1] - table[y0 * w1 + x1] - table[y1 * w1 + x0] + table[y0 * w1 + x0];
            data[y * width + x] = sum / ((y1 - y0) * (x1 - x0));
        }
    }
    return { data, width, height };
}

/**
 * Unsharp mask: adds back `amount` times the difference between the image
 * and a blurred copy, which steepens soft edges between modules.
 */
export function unsharpMask(img: GrayImage, radius: number, amount: number): GrayImage {
    const blurred = boxBlur(img, radius);
    const data = new Uint8ClampedArray(img.data.length);
    for (let i = 0; i < data.length; i++) {
        data[i] = img.data[i] + amount * (img.data[i] - blurred.data[i]);
    }
    return { data, width: img.width, height: img.height };
}

/**
 * Local (adaptive) threshold: each pixel is compared with the mean of the
 * `window`-wide square around it, so a code that is bright on one side and
 * shadowed on the other still splits cleanly into dark and light modules.
 * `offset` keeps flat areas (plain background) from turning into noise.
 */
export function adaptiveThreshold(img: GrayImage, window: number, offset = 4): GrayImage {
    const { width, height } = img;
    const radius = Math.max(1, Math.floor(window / 2));
    const table = integral(img);
    const w1 = width + 1;
    const data = new Uint8ClampedArray(width * height);
    for (let y = 0; y < height; y++) {
        const y0 = Math.max(0, y - radius);
        const y1 = Math.min(height, y + radius + 1);
        for (let x = 0; x < width; x++) {
            const x0 = Math.max(0, x - radius);
            const x1 = Math.min(width, x + radius + 1);
            const sum = table[y1 * w1 + x1] - table[y0 * w1 + x1] - table[y1 * w1 + x0] + table[y0 * w1 + x0];
            const mean = sum / ((y1 - y0) * (x1 - x0));
            data[y * width + x] = img.data[y * width + x] < mean - offset ? 0 : 255;
        }
    }
    return { data, width, height };
}
