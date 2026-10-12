/**
 * CSV export for the scanner's result list.
 *
 * RFC 4180: CRLF line endings, a field is quoted when it holds a comma,
 * quote or line break, and quotes inside it are doubled. The file starts
 * with a UTF-8 byte order mark so Excel opens non-ASCII codes correctly
 * instead of guessing a legacy code page.
 */

export type CsvScanRow = {
    code: string;
    format: string;
    scannedAt: Date;
};

/**
 * A scanned code is untrusted input. A QR code holding `=HYPERLINK(...)`
 * would run as a formula when the CSV is opened in a spreadsheet, so a
 * leading formula character gets an apostrophe (OWASP's CSV-injection
 * advice). Plain numbers and phone numbers such as "+44 20 7946 0958" or
 * "-12.5" are left alone, because they cannot call a function.
 */
function neutraliseFormula(value: string): string {
    if (/^[=@\t\r]/.test(value)) return `'${value}`;
    if (/^[+-]/.test(value) && !/^[+-][\d\s().-]*$/.test(value)) return `'${value}`;
    return value;
}

export function csvField(value: string): string {
    const safe = neutraliseFormula(value);
    return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function buildScanCsv(rows: CsvScanRow[]): string {
    const lines = [
        "code,format,scanned_at",
        ...rows.map((row) =>
            [csvField(row.code), csvField(row.format), row.scannedAt.toISOString()].join(","),
        ),
    ];
    return `﻿${lines.join("\r\n")}\r\n`;
}
