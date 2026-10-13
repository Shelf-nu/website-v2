/**
 * Pure logic for the free barcode generator (/tools/barcode-generator):
 * symbologies, per-type validation and check digits, list / CSV / sequence
 * input parsing, and label-sheet templates.
 *
 * No browser APIs and no rendering here, so it stays out of the lazily
 * loaded bwip-js / jsPDF chunk and can be tested in plain Node.
 */

export type SymbologyId =
    | "code128"
    | "code39"
    | "ean13"
    | "upca"
    | "ean8"
    | "itf14"
    | "datamatrix"
    | "qrcode";

export interface Symbology {
    id: SymbologyId;
    /** bwip-js encoder name. */
    bcid: string;
    label: string;
    dimension: "1d" | "2d";
    /** One-line hint shown under the type picker. */
    hint: string;
    example: string;
}

export const SYMBOLOGIES: Symbology[] = [
    {
        id: "code128",
        bcid: "code128",
        label: "Code 128",
        dimension: "1d",
        hint: "Letters, digits and punctuation. The usual choice for asset tags and internal labels.",
        example: "ASSET-0001",
    },
    {
        id: "code39",
        bcid: "code39",
        label: "Code 39",
        dimension: "1d",
        hint: "Capital letters A–Z, digits 0–9 and - . space $ / + %. Wider than Code 128; read by older scanners.",
        example: "ASSET-0001",
    },
    {
        id: "ean13",
        bcid: "ean13",
        label: "EAN-13",
        dimension: "1d",
        hint: "12 digits (check digit added) or 13 digits (check digit verified). Retail products outside North America.",
        example: "590123412345",
    },
    {
        id: "upca",
        bcid: "upca",
        label: "UPC-A",
        dimension: "1d",
        hint: "11 digits (check digit added) or 12 digits (check digit verified). Retail products in the US and Canada.",
        example: "03600029145",
    },
    {
        id: "ean8",
        bcid: "ean8",
        label: "EAN-8",
        dimension: "1d",
        hint: "7 digits (check digit added) or 8 digits (check digit verified). Small retail packs.",
        example: "9638507",
    },
    {
        id: "itf14",
        bcid: "itf14",
        label: "ITF-14",
        dimension: "1d",
        hint: "13 digits (check digit added) or 14 digits (check digit verified). Outer cartons and cases.",
        example: "1540014128876",
    },
    {
        id: "datamatrix",
        bcid: "datamatrix",
        label: "Data Matrix",
        dimension: "2d",
        hint: "Any text in a tiny square. Good for small parts and electronics.",
        example: "ASSET-0001",
    },
    {
        id: "qrcode",
        bcid: "qrcode",
        label: "QR Code",
        dimension: "2d",
        hint: "Any text or a URL. Any phone camera can read it.",
        example: "https://www.shelf.nu",
    },
];

export function getSymbology(id: SymbologyId): Symbology {
    return SYMBOLOGIES.find((s) => s.id === id) ?? SYMBOLOGIES[0];
}

export type ValidationResult =
    | { ok: true; value: string; note?: string }
    | { ok: false; error: string };

/** Practical caps, so a label stays printable and scannable. */
const MAX_LENGTH: Record<SymbologyId, number> = {
    code128: 80,
    code39: 43,
    ean13: 13,
    upca: 12,
    ean8: 8,
    itf14: 14,
    datamatrix: 1000,
    qrcode: 1000,
};

const CODE39_CHARS = /^[A-Z0-9 .$/+%-]+$/;
// Printable ASCII (space to tilde). Code 128 can reach Latin-1 through FNC4,
// but scanner support for that is patchy, so we refuse it with a clear message.
const PRINTABLE_ASCII = /^[\x20-\x7E]+$/;

/**
 * GS1 mod-10 check digit for EAN-8, UPC-A, EAN-13 and ITF-14.
 * Weights run 3,1,3,1… from the rightmost data digit.
 */
export function gs1CheckDigit(data: string): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        const digit = data.charCodeAt(data.length - 1 - i) - 48;
        sum += digit * (i % 2 === 0 ? 3 : 1);
    }
    return (10 - (sum % 10)) % 10;
}

function validateGs1(raw: string, name: string, dataLength: number): ValidationResult {
    const digits = raw.replace(/[\s-]/g, "");
    if (!/^\d+$/.test(digits)) {
        return { ok: false, error: `${name} takes digits only.` };
    }
    if (digits.length === dataLength) {
        const check = gs1CheckDigit(digits);
        return { ok: true, value: digits + check, note: `Check digit ${check} added.` };
    }
    if (digits.length === dataLength + 1) {
        const expected = gs1CheckDigit(digits.slice(0, dataLength));
        const given = Number(digits[dataLength]);
        if (expected !== given) {
            return {
                ok: false,
                error: `Check digit should be ${expected}, not ${given}. Enter ${dataLength} digits to have it calculated.`,
            };
        }
        return { ok: true, value: digits };
    }
    return {
        ok: false,
        error: `${name} needs ${dataLength} digits (or ${dataLength + 1} with the check digit); this has ${digits.length}.`,
    };
}

export function validateValue(symbology: SymbologyId, input: string): ValidationResult {
    const value = input.trim();
    if (!value) return { ok: false, error: "Empty value." };

    switch (symbology) {
        case "ean13":
            return validateGs1(value, "EAN-13", 12);
        case "upca":
            return validateGs1(value, "UPC-A", 11);
        case "ean8":
            return validateGs1(value, "EAN-8", 7);
        case "itf14":
            return validateGs1(value, "ITF-14", 13);
        case "code39": {
            if (value.length > MAX_LENGTH.code39) {
                return { ok: false, error: `Too long for Code 39 (max ${MAX_LENGTH.code39} characters). Try Code 128, which is more compact.` };
            }
            if (/[a-z]/.test(value) && CODE39_CHARS.test(value.toUpperCase())) {
                return { ok: false, error: "Code 39 has no lowercase letters. Use capitals, or pick Code 128." };
            }
            if (!CODE39_CHARS.test(value)) {
                const bad = [...value].find((c) => !CODE39_CHARS.test(c));
                return { ok: false, error: `Code 39 can't encode “${bad}”. Allowed: A–Z, 0–9, space and - . $ / + %.` };
            }
            return { ok: true, value };
        }
        case "code128": {
            if (value.length > MAX_LENGTH.code128) {
                return { ok: false, error: `Too long to scan reliably as Code 128 (max ${MAX_LENGTH.code128} characters). Use a QR Code or Data Matrix for long text.` };
            }
            if (!PRINTABLE_ASCII.test(value)) {
                const bad = [...value].find((c) => !PRINTABLE_ASCII.test(c));
                return { ok: false, error: `Code 128 can't reliably encode “${bad}”. Use plain letters, digits and punctuation, or a QR Code.` };
            }
            return { ok: true, value };
        }
        case "datamatrix":
        case "qrcode": {
            // Counted in UTF-8 bytes: accented or non-Latin characters take 2–4 each.
            if (new TextEncoder().encode(value).length > MAX_LENGTH[symbology]) {
                return { ok: false, error: `Too long (max ${MAX_LENGTH[symbology].toLocaleString("en-US")} characters of plain text).` };
            }
            return { ok: true, value };
        }
    }
}

// --- Bulk input ---------------------------------------------------------

export const MAX_BULK = 1000;

export interface BulkItem {
    /** 1-based position in the source (line or row), for error messages. */
    line: number;
    raw: string;
    /** Optional second text line for the label (from a CSV column). */
    extra?: string;
}

export interface CheckedItem extends BulkItem {
    result: ValidationResult;
}

/** One value per non-empty line. */
export function parseList(text: string): BulkItem[] {
    const items: BulkItem[] = [];
    text.split(/\r?\n/).forEach((line, i) => {
        const raw = line.trim();
        if (raw) items.push({ line: i + 1, raw });
    });
    return items;
}

export interface SequenceOptions {
    prefix: string;
    start: number;
    count: number;
    padding: number;
    suffix: string;
}

export function buildSequence({ prefix, start, count, padding, suffix }: SequenceOptions): BulkItem[] {
    const items: BulkItem[] = [];
    const n = Math.max(0, Math.min(Math.floor(count) || 0, MAX_BULK));
    const first = Math.max(0, Math.floor(start) || 0);
    const pad = Math.max(0, Math.min(Math.floor(padding) || 0, 12));
    for (let i = 0; i < n; i++) {
        const num = String(first + i).padStart(pad, "0");
        items.push({ line: i + 1, raw: `${prefix}${num}${suffix}` });
    }
    return items;
}

export type Delimiter = "," | ";" | "\t";

/** Pick the delimiter that appears most in the first line, ignoring quoted text. */
export function detectDelimiter(text: string): Delimiter {
    const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
    const unquoted = firstLine.replace(/"[^"]*"/g, "");
    const counts: [Delimiter, number][] = [",", ";", "\t"].map((d) => [
        d as Delimiter,
        unquoted.split(d).length - 1,
    ]);
    counts.sort((a, b) => b[1] - a[1]);
    return counts[0][1] > 0 ? counts[0][0] : ",";
}

/** Small RFC 4180 parser: quoted fields, "" escapes, newlines inside quotes. */
export function parseCsv(input: string, delimiter: Delimiter): string[][] {
    const text = input.replace(/^﻿/, "");
    const rows: string[][] = [];
    let row: string[] = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (inQuotes) {
            if (c === '"') {
                if (text[i + 1] === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                field += c;
            }
        } else if (c === '"' && field === "") {
            inQuotes = true;
        } else if (c === delimiter) {
            row.push(field);
            field = "";
        } else if (c === "\n" || c === "\r") {
            if (c === "\r" && text[i + 1] === "\n") i++;
            row.push(field);
            rows.push(row);
            row = [];
            field = "";
        } else {
            field += c;
        }
    }
    if (field !== "" || row.length > 0) {
        row.push(field);
        rows.push(row);
    }
    // Drop fully empty rows (blank lines, trailing newline).
    return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

/** A first row with no digits at all ("Asset ID, Name") is probably a header. */
export function looksLikeHeader(firstRow: string[] | undefined): boolean {
    if (!firstRow || firstRow.length === 0) return false;
    return firstRow.every((cell) => !/\d/.test(cell)) && firstRow.some((cell) => /[a-z]/i.test(cell));
}

/** Prefer a column whose header looks like an identifier. */
export function guessValueColumn(header: string[] | undefined): number {
    if (!header) return 0;
    const idx = header.findIndex((h) => /barcode|code|asset|tag|sku|serial|\bid\b|number/i.test(h));
    return idx >= 0 ? idx : 0;
}

export function csvToItems(
    rows: string[][],
    { hasHeader, valueColumn, extraColumn }: { hasHeader: boolean; valueColumn: number; extraColumn: number | null },
): BulkItem[] {
    const items: BulkItem[] = [];
    rows.forEach((row, i) => {
        if (hasHeader && i === 0) return;
        const raw = (row[valueColumn] ?? "").trim();
        if (!raw) return;
        const extra = extraColumn !== null ? (row[extraColumn] ?? "").trim() : undefined;
        items.push({ line: i + 1, raw, extra });
    });
    return items;
}

// --- Label sheets ---------------------------------------------------------

export type PageSize = "letter" | "a4";

export const PAGE_SIZES: Record<PageSize, { label: string; width: number; height: number }> = {
    letter: { label: "US Letter (8.5 × 11 in)", width: 215.9, height: 279.4 },
    a4: { label: "A4 (210 × 297 mm)", width: 210, height: 297 },
};

/** All dimensions in millimetres. */
export interface SheetLayout {
    page: PageSize;
    columns: number;
    rows: number;
    labelWidth: number;
    labelHeight: number;
    /** Distance from the page's left edge to the first label. */
    marginLeft: number;
    /** Distance from the page's top edge to the first label. */
    marginTop: number;
    /** Gap between columns / rows (pitch minus label size). */
    gapX: number;
    gapY: number;
}

export type TemplateId = "avery5160" | "avery5163" | "averyL7160" | "averyL7651" | "single" | "custom";

export interface SheetTemplate {
    id: TemplateId;
    label: string;
    detail: string;
    layout?: SheetLayout;
}

const IN = 25.4;

/*
 * Avery sheet geometry. Source: LibreOffice's label database
 * (core/extras/source/labels/labels.xml, values in 1/100 mm), cross-checked
 * against the glabels-qt Avery templates (templates/avery-us-templates.xml and
 * avery-iso-templates.xml) and against the page size: margins + labels + gaps
 * add up to 215.9 × 279.4 mm (Letter) or 210 × 297 mm (A4).
 *
 *   5160 / 8160  Letter  3 × 10  2.625 × 1 in  left 0.1875 in  top 0.5 in  pitch 2.75 × 1 in
 *   5163         Letter  2 × 5   4 × 2 in      left 0.156 in   top 0.5 in  pitch 4.1875 × 2 in
 *   L7160        A4      3 × 7   63.5 × 38.1   left 7.2        top 15.15   pitch 66.04 × 38.1
 *   L7651        A4      5 × 13  38.1 × 21.2   left 4.67       top 10.9    pitch 40.64 × 21.2
 */
export const SHEET_TEMPLATES: SheetTemplate[] = [
    {
        id: "avery5160",
        label: "Avery 5160 / 8160",
        detail: "US Letter · 30 per sheet · 2.625 × 1 in",
        layout: {
            page: "letter",
            columns: 3,
            rows: 10,
            labelWidth: 2.625 * IN,
            labelHeight: 1 * IN,
            marginLeft: 0.1875 * IN,
            marginTop: 0.5 * IN,
            gapX: 0.125 * IN,
            gapY: 0,
        },
    },
    {
        id: "avery5163",
        label: "Avery 5163",
        detail: "US Letter · 10 per sheet · 4 × 2 in",
        layout: {
            page: "letter",
            columns: 2,
            rows: 5,
            labelWidth: 4 * IN,
            labelHeight: 2 * IN,
            marginLeft: 0.15625 * IN,
            marginTop: 0.5 * IN,
            gapX: 0.1875 * IN,
            gapY: 0,
        },
    },
    {
        id: "averyL7160",
        label: "Avery L7160",
        detail: "A4 · 21 per sheet · 63.5 × 38.1 mm",
        layout: {
            page: "a4",
            columns: 3,
            rows: 7,
            labelWidth: 63.5,
            labelHeight: 38.1,
            marginLeft: 7.2,
            marginTop: 15.15,
            gapX: 2.54,
            gapY: 0,
        },
    },
    {
        id: "averyL7651",
        label: "Avery L7651",
        detail: "A4 · 65 per sheet · 38.1 × 21.2 mm",
        layout: {
            page: "a4",
            columns: 5,
            rows: 13,
            labelWidth: 38.1,
            labelHeight: 21.2,
            marginLeft: 4.67,
            marginTop: 10.9,
            gapX: 2.54,
            gapY: 0,
        },
    },
    {
        id: "single",
        label: "One barcode per page",
        detail: "Letter or A4 · large, centred",
    },
    {
        id: "custom",
        label: "Custom grid",
        detail: "Your own columns, rows and label size",
    },
];

/** A full page with a 12.7 mm (0.5 in) margin, used by "one barcode per page". */
export function singlePerPageLayout(page: PageSize): SheetLayout {
    const { width, height } = PAGE_SIZES[page];
    const margin = 12.7;
    return {
        page,
        columns: 1,
        rows: 1,
        labelWidth: width - margin * 2,
        labelHeight: height - margin * 2,
        marginLeft: margin,
        marginTop: margin,
        gapX: 0,
        gapY: 0,
    };
}

/** Returns an error message if the grid doesn't fit on the page, otherwise null. */
export function checkLayout(layout: SheetLayout): string | null {
    const { width, height } = PAGE_SIZES[layout.page];
    const nums = [layout.columns, layout.rows, layout.labelWidth, layout.labelHeight];
    if (nums.some((n) => !Number.isFinite(n) || n <= 0)) {
        return "Columns, rows and label size must be greater than zero.";
    }
    if ([layout.marginLeft, layout.marginTop, layout.gapX, layout.gapY].some((n) => !Number.isFinite(n) || n < 0)) {
        return "Margins and gaps can't be negative.";
    }
    if (layout.columns > 20 || layout.rows > 40) {
        return "Up to 20 columns and 40 rows.";
    }
    const usedW = layout.marginLeft + layout.columns * layout.labelWidth + (layout.columns - 1) * layout.gapX;
    const usedH = layout.marginTop + layout.rows * layout.labelHeight + (layout.rows - 1) * layout.gapY;
    if (usedW > width + 0.01) {
        return `The grid is ${usedW.toFixed(1)} mm wide but the page is ${width} mm.`;
    }
    if (usedH > height + 0.01) {
        return `The grid is ${usedH.toFixed(1)} mm tall but the page is ${height} mm.`;
    }
    return null;
}

/** Top-left corner of label `index` (0-based, row by row) on its page, in mm. */
export function labelPosition(layout: SheetLayout, index: number) {
    const perPage = layout.columns * layout.rows;
    const page = Math.floor(index / perPage);
    const slot = index % perPage;
    const col = slot % layout.columns;
    const row = Math.floor(slot / layout.columns);
    return {
        page,
        x: layout.marginLeft + col * (layout.labelWidth + layout.gapX),
        y: layout.marginTop + row * (layout.labelHeight + layout.gapY),
    };
}

/** Safe file name stem from a barcode value. */
export function fileStem(value: string, index?: number): string {
    const stem = value.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60) || "barcode";
    return index === undefined ? stem : `${String(index + 1).padStart(4, "0")}-${stem}`;
}
