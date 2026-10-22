/**
 * Turns the raw text of a scanned code into something a person can read.
 *
 * Pure string parsing, no zxing import, so it can ship in the page bundle
 * while the decoder itself stays lazy-loaded. Covers the payloads people
 * actually find in QR codes: web links, Wi-Fi logins, contact cards
 * (vCard and MECARD), email, phone and map locations. Anything else is
 * shown as plain text.
 *
 * Nothing here opens anything. The UI decides what is safe to link, and
 * only http(s), mailto and tel ever become clickable, on an explicit click.
 */

export type ParsedPayload =
    | { kind: "url"; url: string; host: string; isPunycode: boolean }
    | { kind: "wifi"; ssid: string; security: string; password: string; hidden: boolean }
    | { kind: "contact"; name: string; org: string; phones: string[]; emails: string[]; urls: string[] }
    | { kind: "email"; address: string; subject: string; body: string }
    | { kind: "phone"; number: string }
    | { kind: "sms"; number: string; message: string }
    | { kind: "geo"; lat: string; lon: string; query: string }
    | { kind: "text" };

/** Splits `KEY:value;KEY:value;;` while honouring backslash escapes (Wi-Fi, MECARD). */
function splitEscaped(input: string, separator: string): string[] {
    const parts: string[] = [];
    let current = "";
    for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === "\\" && i + 1 < input.length) {
            current += input[i + 1];
            i++;
        } else if (ch === separator) {
            parts.push(current);
            current = "";
        } else {
            current += ch;
        }
    }
    parts.push(current);
    return parts;
}

/** Parses the `K:v;K:v` body of a WIFI: or MECARD: payload into key → values. */
function parseFields(body: string): Map<string, string[]> {
    const fields = new Map<string, string[]>();
    // Walk the raw string so that escaped separators survive until splitEscaped.
    const raw: string[] = [];
    let current = "";
    for (let i = 0; i < body.length; i++) {
        const ch = body[i];
        if (ch === "\\" && i + 1 < body.length) {
            current += ch + body[i + 1];
            i++;
        } else if (ch === ";") {
            raw.push(current);
            current = "";
        } else {
            current += ch;
        }
    }
    raw.push(current);

    for (const part of raw) {
        const colon = part.indexOf(":");
        if (colon <= 0) continue;
        const key = part.slice(0, colon).trim().toUpperCase();
        const value = splitEscaped(part.slice(colon + 1), "\u0000").join("");
        const list = fields.get(key) ?? [];
        list.push(value);
        fields.set(key, list);
    }
    return fields;
}

function describeWifiSecurity(type: string): string {
    const t = type.trim().toUpperCase();
    if (!t || t === "NOPASS") return "None (open network)";
    if (t === "WEP") return "WEP";
    if (t === "SAE" || t === "WPA3") return "WPA3";
    if (t.startsWith("WPA")) return "WPA/WPA2";
    return type;
}

function parseWifi(text: string): ParsedPayload | null {
    if (!/^WIFI:/i.test(text)) return null;
    const fields = parseFields(text.slice(5));
    const ssid = fields.get("S")?.[0] ?? "";
    if (!ssid) return null;
    return {
        kind: "wifi",
        ssid,
        security: describeWifiSecurity(fields.get("T")?.[0] ?? ""),
        password: fields.get("P")?.[0] ?? "",
        hidden: (fields.get("H")?.[0] ?? "").toLowerCase() === "true",
    };
}

function parseMecard(text: string): ParsedPayload | null {
    if (!/^MECARD:/i.test(text)) return null;
    const fields = parseFields(text.slice(7));
    // MECARD names are "Last,First".
    const rawName = fields.get("N")?.[0] ?? "";
    const [last, first] = rawName.split(",");
    const name = [first, last].filter(Boolean).map((s) => s.trim()).join(" ");
    return {
        kind: "contact",
        name,
        org: fields.get("ORG")?.[0] ?? "",
        phones: fields.get("TEL") ?? [],
        emails: fields.get("EMAIL") ?? [],
        urls: fields.get("URL") ?? [],
    };
}

function unescapeVcard(value: string): string {
    return value.replace(/\\n/gi, " ").replace(/\\([,;\\])/g, "$1").trim();
}

function parseVcard(text: string): ParsedPayload | null {
    if (!/^BEGIN:VCARD/i.test(text)) return null;
    // Unfold continuation lines (RFC 6350: a line starting with space/tab continues the previous one).
    const lines = text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "").split("\n");
    let fn = "";
    let n = "";
    let org = "";
    const phones: string[] = [];
    const emails: string[] = [];
    const urls: string[] = [];
    for (const line of lines) {
        const colon = line.indexOf(":");
        if (colon <= 0) continue;
        // "TEL;TYPE=cell" → "TEL"; "item1.EMAIL" → "EMAIL"
        const prop = line.slice(0, colon).split(";")[0].split(".").pop()!.toUpperCase();
        const value = line.slice(colon + 1);
        if (prop === "FN") fn = unescapeVcard(value);
        else if (prop === "N") {
            const [last = "", first = ""] = value.split(";");
            n = [first, last].map(unescapeVcard).filter(Boolean).join(" ");
        } else if (prop === "ORG") org = unescapeVcard(value.split(";")[0]);
        else if (prop === "TEL") phones.push(unescapeVcard(value.replace(/^tel:/i, "")));
        else if (prop === "EMAIL") emails.push(unescapeVcard(value));
        else if (prop === "URL") urls.push(unescapeVcard(value));
    }
    return { kind: "contact", name: fn || n, org, phones, emails, urls };
}

function safeDecode(value: string): string {
    try {
        return decodeURIComponent(value.replace(/\+/g, " "));
    } catch {
        return value;
    }
}

function parseMailto(text: string): ParsedPayload | null {
    if (/^mailto:/i.test(text)) {
        const rest = text.slice(7);
        const [address, query = ""] = rest.split("?");
        const params = new URLSearchParams(query);
        return {
            kind: "email",
            address: safeDecode(address),
            subject: params.get("subject") ?? "",
            body: params.get("body") ?? "",
        };
    }
    // MATMSG:TO:a@b.com;SUB:Hello;BODY:Text;;
    if (/^MATMSG:/i.test(text)) {
        const fields = parseFields(text.slice(7));
        const address = fields.get("TO")?.[0] ?? "";
        if (!address) return null;
        return {
            kind: "email",
            address,
            subject: fields.get("SUB")?.[0] ?? "",
            body: fields.get("BODY")?.[0] ?? "",
        };
    }
    return null;
}

function parseTel(text: string): ParsedPayload | null {
    if (!/^tel:/i.test(text)) return null;
    const number = text.slice(4).trim();
    return number ? { kind: "phone", number } : null;
}

function parseSms(text: string): ParsedPayload | null {
    const match = /^(?:smsto|sms):([^:?]*)(?:[:?](?:body=)?([\s\S]*))?$/i.exec(text);
    if (!match || !match[1]) return null;
    return { kind: "sms", number: match[1], message: safeDecode(match[2] ?? "") };
}

function parseGeo(text: string): ParsedPayload | null {
    const match = /^geo:\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)(?:,[^;?]*)?(?:;[^?]*)?(?:\?q=(.*))?$/i.exec(text);
    if (!match) return null;
    const lat = Number(match[1]);
    const lon = Number(match[2]);
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
    return { kind: "geo", lat: match[1], lon: match[2], query: safeDecode(match[3] ?? "") };
}

function parseUrl(text: string): ParsedPayload | null {
    if (!/^https?:\/\//i.test(text)) return null;
    try {
        const url = new URL(text);
        return {
            kind: "url",
            url: url.href,
            host: url.hostname,
            isPunycode: url.hostname.split(".").some((label) => label.startsWith("xn--")),
        };
    } catch {
        return null;
    }
}

export function parsePayload(rawText: string): ParsedPayload {
    const text = rawText.trim();
    return (
        parseUrl(text) ??
        parseWifi(text) ??
        parseVcard(text) ??
        parseMecard(text) ??
        parseMailto(text) ??
        parseTel(text) ??
        parseSms(text) ??
        parseGeo(text) ?? { kind: "text" }
    );
}

/** Short label for the row badge, e.g. "Link", "Wi-Fi". */
export function payloadLabel(payload: ParsedPayload): string | null {
    switch (payload.kind) {
        case "url":
            return "Link";
        case "wifi":
            return "Wi-Fi";
        case "contact":
            return "Contact";
        case "email":
            return "Email";
        case "phone":
            return "Phone";
        case "sms":
            return "SMS";
        case "geo":
            return "Location";
        default:
            return null;
    }
}
