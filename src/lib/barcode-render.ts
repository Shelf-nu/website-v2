/**
 * Rendering for the barcode generator: SVG / PNG / PDF / ZIP.
 *
 * bwip-js (~1 MB), jsPDF and fflate are loaded with dynamic import() on first
 * use, so none of them is in the page's initial JavaScript.
 *
 * PDFs are vector: bwip-js draws the barcode as SVG, we parse that SVG (it
 * only ever contains stroked straight lines for bars and filled M/L/Q/C/Z
 * paths for 2D modules and text glyphs) and replay it with jsPDF's path API.
 * Bars stay razor sharp at any printer resolution and a 1,000-label PDF
 * stays small.
 */

import {
    getSymbology,
    labelPosition,
    PAGE_SIZES,
    type SheetLayout,
    type SymbologyId,
} from "@/lib/barcode-generator";

type BwipModule = typeof import("bwip-js/browser");
type Bwip = Pick<BwipModule, "toSVG" | "toCanvas">;
type BwipOptions = Parameters<Bwip["toSVG"]>[0];
type JsPdf = import("jspdf").jsPDF;

let bwipPromise: Promise<Bwip> | null = null;

export function loadBwip(): Promise<Bwip> {
    if (!bwipPromise) {
        bwipPromise = import("bwip-js/browser").then((mod) => {
            const m = mod as Bwip & { default?: Bwip };
            return typeof m.toSVG === "function" ? m : (m.default as Bwip);
        });
        bwipPromise.catch(() => {
            bwipPromise = null;
        });
    }
    return bwipPromise;
}

/**
 * Scale used for vector output. bwip-js rounds bar positions and widths to
 * whole units; at scale 2 the 2.25:1 wide bars of ITF-14 landed up to half a
 * module off and some labels would not scan. At 8, every ratio BWIPP uses
 * (multiples of 1/8 module) is a whole number, so the geometry is exact.
 */
const VECTOR_SCALE = 8;
/** bwip-js measures bar height in millimetres where one module is one PostScript point. */
const UNITS_PER_MM = (72 / 25.4) * VECTOR_SCALE;

/** Bar heights (bwip-js mm) for single downloads, roughly the standard 100% proportions. */
const DEFAULT_HEIGHT: Partial<Record<SymbologyId, number>> = {
    code128: 15,
    code39: 15,
    ean13: 22,
    upca: 22,
    ean8: 18,
    itf14: 20,
};

export interface RenderSettings {
    symbology: SymbologyId;
    /** Human-readable text under 1D barcodes. */
    showText: boolean;
}

function bwipOptions(
    { symbology, showText }: RenderSettings,
    value: string,
    scale: number,
    heightMm?: number,
): BwipOptions {
    const sym = getSymbology(symbology);
    const opts: BwipOptions = {
        bcid: sym.bcid,
        // bwip-js encodes non-ASCII text as UTF-8 itself; pre-encoding it double-encodes.
        text: value,
        scale,
        backgroundcolor: "FFFFFF",
    };
    if (sym.dimension === "1d") {
        opts.height = heightMm ?? DEFAULT_HEIGHT[symbology] ?? 15;
        opts.includetext = showText;
        opts.textxalign = "center";
        // Quiet zone: 10 modules each side (one module = one unit before scaling).
        opts.paddingwidth = 10;
        opts.paddingheight = 2;
        if (symbology === "itf14") {
            // Quiet zone inside the bearer box: GS1's minimum is 10 modules
            // (BWIPP's default). Readers that check for exactly 10 failed on
            // our test prints once anti-aliasing shaved a fraction off it.
            opts.borderleft = 12;
            opts.borderright = 12;
        }
    } else {
        // QR needs 4 modules of quiet zone, Data Matrix 1; a module is 2 units here.
        opts.padding = symbology === "qrcode" ? 8 : 4;
    }
    return opts;
}

/** Strip bwip-js' "bwipp.ean13badCheckDigit#6915: " prefix from errors. */
export function cleanError(err: unknown): string {
    const msg = err instanceof Error ? err.message : String(err);
    return msg.replace(/^bwip(p|-js)\.[\w]+#?\d*:\s*/i, "").trim() || "Could not draw this barcode.";
}

export function renderSvg(bwip: Pick<Bwip, "toSVG">, settings: RenderSettings, value: string, heightMm?: number): string {
    return bwip.toSVG(bwipOptions(settings, value, VECTOR_SCALE, heightMm));
}

export function svgDataUrl(svg: string): string {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function renderPng(bwip: Bwip, settings: RenderSettings, value: string): Promise<Blob> {
    const canvas = document.createElement("canvas");
    bwip.toCanvas(canvas, bwipOptions(settings, value, 4));
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed"))), "image/png");
    });
}

// --- SVG -> jsPDF -----------------------------------------------------------

type Seg =
    | { op: "M" | "L"; x: number; y: number }
    | { op: "Q"; cx: number; cy: number; x: number; y: number }
    | { op: "C"; c1x: number; c1y: number; c2x: number; c2y: number; x: number; y: number }
    | { op: "Z" };

export interface ParsedSvg {
    width: number;
    height: number;
    /** Bars: [x, y, w, h] in SVG units. */
    rects: [number, number, number, number][];
    /** Filled shapes (2D modules, text glyphs), even-odd. */
    paths: Seg[][];
}

export function parseBwipSvg(svg: string): ParsedSvg {
    const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    const parsed: ParsedSvg = {
        width: vb ? Number(vb[1]) : 0,
        height: vb ? Number(vb[2]) : 0,
        rects: [],
        paths: [],
    };
    for (const m of svg.matchAll(/<path ([^>]*?)\/>/g)) {
        const attrs = m[1];
        const d = attrs.match(/\bd="([^"]*)"/)?.[1] ?? "";
        const sw = attrs.match(/stroke-width="([\d.]+)"/);
        const nums = (s: string) => (s.match(/-?[\d.]+/g) ?? []).map(Number);
        const cmds = [...d.matchAll(/([MLQCZ])([^MLQCZ]*)/g)];

        if (sw) {
            const lw = Number(sw[1]);
            for (let i = 0; i + 1 < cmds.length; i += 2) {
                const [x0, y0] = nums(cmds[i][2]);
                const [x1, y1] = nums(cmds[i + 1][2]);
                if (x0 === x1) {
                    parsed.rects.push([x0 - lw / 2, Math.min(y0, y1), lw, Math.abs(y1 - y0)]);
                } else {
                    parsed.rects.push([Math.min(x0, x1), y0 - lw / 2, Math.abs(x1 - x0), lw]);
                }
            }
        } else {
            const segs: Seg[] = [];
            for (const [, op, args] of cmds) {
                const n = nums(args);
                if (op === "M" || op === "L") segs.push({ op, x: n[0], y: n[1] });
                else if (op === "Q") segs.push({ op, cx: n[0], cy: n[1], x: n[2], y: n[3] });
                else if (op === "C") segs.push({ op, c1x: n[0], c1y: n[1], c2x: n[2], c2y: n[3], x: n[4], y: n[5] });
                else segs.push({ op: "Z" });
            }
            if (segs.length) parsed.paths.push(segs);
        }
    }
    return parsed;
}

/** Draw a parsed barcode with its top-left at (x, y) mm, `k` mm per SVG unit. */
function drawParsed(pdf: JsPdf, parsed: ParsedSvg, x: number, y: number, k: number) {
    pdf.setFillColor(0, 0, 0);
    for (const [rx, ry, rw, rh] of parsed.rects) {
        pdf.rect(x + rx * k, y + ry * k, rw * k, rh * k, "F");
    }
    for (const segs of parsed.paths) {
        let cx = 0;
        let cy = 0;
        for (const s of segs) {
            if (s.op === "M") {
                pdf.moveTo(x + s.x * k, y + s.y * k);
                cx = s.x;
                cy = s.y;
            } else if (s.op === "L") {
                pdf.lineTo(x + s.x * k, y + s.y * k);
                cx = s.x;
                cy = s.y;
            } else if (s.op === "Q") {
                // Quadratic -> cubic Bézier.
                const c1x = cx + (2 / 3) * (s.cx - cx);
                const c1y = cy + (2 / 3) * (s.cy - cy);
                const c2x = s.x + (2 / 3) * (s.cx - s.x);
                const c2y = s.y + (2 / 3) * (s.cy - s.y);
                pdf.curveTo(x + c1x * k, y + c1y * k, x + c2x * k, y + c2y * k, x + s.x * k, y + s.y * k);
                cx = s.x;
                cy = s.y;
            } else if (s.op === "C") {
                pdf.curveTo(x + s.c1x * k, y + s.c1y * k, x + s.c2x * k, y + s.c2y * k, x + s.x * k, y + s.y * k);
                cx = s.x;
                cy = s.y;
            } else {
                pdf.close();
            }
        }
        pdf.fillEvenOdd();
    }
}

/**
 * Decimal places for PDF coordinates (in points). 0.001 pt is far finer than
 * any printer dot; jsPDF's default of 16 digits made a 1,000-label sheet
 * several times bigger for no visible gain.
 */
const PDF_PRECISION = 3;

async function loadJsPdf() {
    const { jsPDF } = await import("jspdf");
    return jsPDF;
}

/** Single barcode as a PDF page the size of the barcode (1D at 0.33 mm bars, 2D at 30 mm square). */
export async function renderSinglePdf(bwip: Bwip, settings: RenderSettings, value: string): Promise<Blob> {
    const parsed = parseBwipSvg(renderSvg(bwip, settings, value));
    const is1d = getSymbology(settings.symbology).dimension === "1d";
    const k = is1d ? 0.33 / VECTOR_SCALE : 30 / parsed.width;
    const w = parsed.width * k;
    const h = parsed.height * k;
    const jsPDF = await loadJsPdf();
    const pdf = new jsPDF({ unit: "mm", format: [w, h], orientation: w > h ? "landscape" : "portrait", compress: true, floatPrecision: PDF_PRECISION });
    drawParsed(pdf, parsed, 0, 0, k);
    return pdf.output("blob");
}

// --- Label sheets ---------------------------------------------------------

export interface LabelItem {
    value: string;
    /** Extra text line printed under the barcode. */
    extra?: string;
}

export interface SheetOptions extends RenderSettings {
    layout: SheetLayout;
    /** Draw thin label outlines, for test prints on plain paper. */
    outlines: boolean;
    /** Skip this many label positions on the first sheet (partly used sheets). */
    skip: number;
}

interface LabelGeometry {
    parsed: ParsedSvg;
    /** Top-left of the barcode and mm per SVG unit. */
    x: number;
    y: number;
    k: number;
    /** Text lines under the code: centre x, baseline-middle y, max width, font size (pt). */
    lines: { text: string; cx: number; cy: number; maxWidth: number; fontPt: number }[];
    /** Width of one module (narrowest bar or 2D cell) in mm. */
    moduleMm: number;
}

/** Work out where the barcode and text go inside one label at (lx, ly). */
function layoutLabel(
    bwip: Bwip,
    settings: RenderSettings,
    item: LabelItem,
    lw: number,
    lh: number,
    lx: number,
    ly: number,
): LabelGeometry {
    const is1d = getSymbology(settings.symbology).dimension === "1d";
    const pad = Math.min(4, Math.max(1, Math.min(lw, lh) * 0.08));
    const innerW = lw - pad * 2;
    const innerH = lh - pad * 2;

    const texts: string[] = [];
    if (!is1d && settings.showText) texts.push(item.value);
    if (item.extra) texts.push(item.extra);
    const lineH = Math.min(6, Math.max(2.2, innerH * 0.16));
    const textBlock = texts.length ? texts.length * lineH + 0.5 : 0;
    const boxW = innerW;
    const boxH = Math.max(2, innerH - textBlock);

    let parsed: ParsedSvg;
    let k: number;
    if (is1d) {
        // Size the bar height so the barcode's shape matches the space, then fit.
        // A 1D code never needs to be taller than 60% of its width.
        const targetH = Math.min(boxH, boxW * 0.6);
        const probeMm = 10;
        const probe = parseBwipSvg(renderSvg(bwip, settings, item.value, probeMm));
        const nonBar = probe.height - probeMm * UNITS_PER_MM;
        const wantUnits = (probe.width * targetH) / boxW;
        const barUnits = Math.max(4 * UNITS_PER_MM, wantUnits - nonBar);
        parsed = parseBwipSvg(renderSvg(bwip, settings, item.value, barUnits / UNITS_PER_MM));
        k = Math.min(boxW / parsed.width, targetH / parsed.height);
    } else {
        parsed = parseBwipSvg(renderSvg(bwip, settings, item.value));
        k = Math.min(boxW / parsed.width, boxH / parsed.height);
    }

    const drawnW = parsed.width * k;
    const drawnH = parsed.height * k;
    const contentH = drawnH + textBlock;
    const top = ly + pad + Math.max(0, (innerH - contentH) / 2);
    const x = lx + pad + (innerW - drawnW) / 2;

    const fontPt = (lineH * 0.72) / 0.3528;
    const lines = texts.map((text, i) => ({
        text,
        cx: lx + lw / 2,
        cy: top + drawnH + 0.5 + lineH * (i + 0.5),
        maxWidth: innerW,
        fontPt,
    }));

    // A 1D module is one unit before scaling; a QR / Data Matrix cell is two.
    return { parsed, x, y: top, k, lines, moduleMm: k * VECTOR_SCALE * (is1d ? 1 : 2) };
}

/** Narrowest bar / module that the longest value would get on this layout, in mm. */
export function estimateModuleMm(bwip: Bwip, settings: RenderSettings, item: LabelItem, layout: SheetLayout): number {
    return layoutLabel(bwip, settings, item, layout.labelWidth, layout.labelHeight, 0, 0).moduleMm;
}

/** jsPDF's built-in Helvetica covers WinAnsi only; replace anything else. */
function pdfSafe(text: string): string {
    return text.replace(/[^\x20-\x7E\xA0-\xFF…]/g, "?");
}

function drawTextLine(pdf: JsPdf, line: LabelGeometry["lines"][number]) {
    let size = line.fontPt;
    let text = pdfSafe(line.text);
    pdf.setFontSize(size);
    while (pdf.getTextWidth(text) > line.maxWidth && size > 5) {
        size -= 0.5;
        pdf.setFontSize(size);
    }
    if (pdf.getTextWidth(text) > line.maxWidth) {
        while (text.length > 1 && pdf.getTextWidth(`${text}…`) > line.maxWidth) {
            text = text.slice(0, -1);
        }
        text = `${text}…`;
    }
    pdf.text(text, line.cx, line.cy, { align: "center", baseline: "middle" });
}

export async function renderSheetPdf(
    bwip: Bwip,
    items: LabelItem[],
    options: SheetOptions,
    onProgress?: (done: number) => void,
): Promise<{ blob: Blob; pages: number }> {
    const { layout } = options;
    const jsPDF = await loadJsPdf();
    const page = PAGE_SIZES[layout.page];
    const pdf = new jsPDF({ unit: "mm", format: [page.width, page.height], orientation: "portrait", compress: true, floatPrecision: PDF_PRECISION });
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);

    const perPage = layout.columns * layout.rows;
    const skip = Math.max(0, Math.min(Math.floor(options.skip) || 0, perPage - 1));
    let currentPage = 0;

    for (let i = 0; i < items.length; i++) {
        const pos = labelPosition(layout, i + skip);
        while (pos.page > currentPage) {
            pdf.addPage([page.width, page.height], "portrait");
            currentPage++;
        }
        if (options.outlines) {
            pdf.setDrawColor(190, 190, 190);
            pdf.setLineWidth(0.15);
            pdf.rect(pos.x, pos.y, layout.labelWidth, layout.labelHeight, "S");
        }
        const g = layoutLabel(bwip, options, items[i], layout.labelWidth, layout.labelHeight, pos.x, pos.y);
        drawParsed(pdf, g.parsed, g.x, g.y, g.k);
        for (const line of g.lines) drawTextLine(pdf, line);

        if (i % 25 === 24) {
            onProgress?.(i + 1);
            // Let the browser paint the progress text.
            await new Promise((r) => setTimeout(r, 0));
        }
    }
    onProgress?.(items.length);
    return { blob: pdf.output("blob"), pages: currentPage + 1 };
}

// --- ZIP --------------------------------------------------------------------

export async function renderZip(
    bwip: Bwip,
    settings: RenderSettings,
    values: { value: string; name: string }[],
    format: "png" | "svg",
    onProgress?: (done: number) => void,
): Promise<Blob> {
    const { zipSync, strToU8 } = await import("fflate");
    const files: Record<string, Uint8Array | [Uint8Array, { level: 0 }]> = {};
    for (let i = 0; i < values.length; i++) {
        const { value, name } = values[i];
        if (format === "svg") {
            files[`${name}.svg`] = strToU8(renderSvg(bwip, settings, value));
        } else {
            const png = await renderPng(bwip, settings, value);
            // PNGs are already compressed: store them as-is.
            files[`${name}.png`] = [new Uint8Array(await png.arrayBuffer()), { level: 0 }];
        }
        if (i % 25 === 24) {
            onProgress?.(i + 1);
            await new Promise((r) => setTimeout(r, 0));
        }
    }
    onProgress?.(values.length);
    const zipped = zipSync(files);
    return new Blob([zipped as BlobPart], { type: "application/zip" });
}

export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
