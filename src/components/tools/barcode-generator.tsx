"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Info, ListOrdered, Loader2, ShieldCheck, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import {
    buildSequence,
    checkLayout,
    csvToItems,
    detectDelimiter,
    fileStem,
    getSymbology,
    guessValueColumn,
    looksLikeHeader,
    MAX_BULK,
    PAGE_SIZES,
    parseCsv,
    parseList,
    SHEET_TEMPLATES,
    singlePerPageLayout,
    SYMBOLOGIES,
    validateValue,
    type BulkItem,
    type Delimiter,
    type PageSize,
    type SequenceOptions,
    type SheetLayout,
    type SymbologyId,
    type TemplateId,
} from "@/lib/barcode-generator";
import type * as Render from "@/lib/barcode-render";

type RenderModule = typeof Render;
type Bwip = Awaited<ReturnType<RenderModule["loadBwip"]>>;
type Engine = { bwip: Bwip; render: RenderModule };

const TOOL = "barcode_generator";
const DEFAULT_SYMBOLOGY: SymbologyId = "code128";
const DEFAULT_VALUE = "ASSET-0001";
const PREVIEW_LIMIT = 60;

const selectClass =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const DEFAULT_CUSTOM: SheetLayout = {
    page: "letter",
    columns: 3,
    rows: 10,
    labelWidth: 66.7,
    labelHeight: 25.4,
    marginLeft: 4.8,
    marginTop: 12.7,
    gapX: 3.2,
    gapY: 0,
};

interface CsvState {
    fileName: string;
    rows: string[][];
    delimiter: Delimiter;
    hasHeader: boolean;
    valueColumn: number;
    extraColumn: number | null;
}

function Segmented<T extends string>({
    value,
    options,
    onChange,
    label,
}: {
    value: T;
    options: { id: T; label: string; icon?: React.ElementType }[];
    onChange: (v: T) => void;
    label: string;
}) {
    return (
        <div role="tablist" aria-label={label} className="inline-flex w-full sm:w-auto rounded-lg border bg-muted/40 p-1 gap-1">
            {options.map((o) => (
                <button
                    key={o.id}
                    type="button"
                    role="tab"
                    aria-selected={value === o.id}
                    onClick={() => onChange(o.id)}
                    className={cn(
                        "flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                        value === o.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                    )}
                >
                    {o.icon && <o.icon className="h-4 w-4 shrink-0" />}
                    {o.label}
                </button>
            ))}
        </div>
    );
}

function NumberField({
    id,
    label,
    value,
    onChange,
    min,
    max,
    step,
}: {
    id: string;
    label: string;
    value: number;
    onChange: (n: number) => void;
    min?: number;
    max?: number;
    step?: number;
}) {
    return (
        <div className="space-y-1">
            <Label htmlFor={id} className="text-xs">{label}</Label>
            <Input
                id={id}
                type="number"
                inputMode="decimal"
                min={min}
                max={max}
                step={step}
                value={Number.isFinite(value) ? value : ""}
                onChange={(e) => onChange(e.target.value === "" ? NaN : Number(e.target.value))}
            />
        </div>
    );
}

function BarcodeImage({ svg, alt, className }: { svg: string; alt: string; className?: string }) {
    const src = useMemo(() => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, [svg]);
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={cn("max-w-full h-auto", className)} />;
}

export function BarcodeGenerator({ initialSvg }: { initialSvg?: string }) {
    // --- Lazy engine -------------------------------------------------------
    // bwip-js (~1 MB) loads on the first interaction with the tool, not with the page.
    const [engine, setEngine] = useState<Engine | null>(null);
    const [engineError, setEngineError] = useState<string | null>(null);
    const engineRef = useRef<Promise<Engine> | null>(null);

    const getEngine = useCallback((): Promise<Engine> => {
        if (!engineRef.current) {
            setEngineError(null);
            const loading = import("@/lib/barcode-render").then(async (render) => {
                const loaded = { bwip: await render.loadBwip(), render };
                setEngine(loaded);
                return loaded;
            });
            loading.catch(() => {
                engineRef.current = null;
                setEngineError("The barcode engine didn't load. Check your connection and try again.");
            });
            engineRef.current = loading;
        }
        return engineRef.current;
    }, []);

    const ensureEngine = useCallback(() => {
        getEngine().catch(() => undefined);
    }, [getEngine]);

    // --- Shared settings ---------------------------------------------------
    const [mode, setMode] = useState<"single" | "bulk">("single");
    const [symbology, setSymbology] = useState<SymbologyId>(DEFAULT_SYMBOLOGY);
    const [showText, setShowText] = useState(true);
    const sym = getSymbology(symbology);
    const settings = useMemo(() => ({ symbology, showText }), [symbology, showText]);

    // --- Single --------------------------------------------------------------
    const [value, setValue] = useState(DEFAULT_VALUE);
    const isDefaultView = mode === "single" && symbology === DEFAULT_SYMBOLOGY && showText && value === DEFAULT_VALUE;

    useEffect(() => {
        // The build-time preview covers the default view; anything else needs the engine.
        if (!isDefaultView) ensureEngine();
    }, [isDefaultView, ensureEngine]);

    const singleCheck = useMemo(() => validateValue(symbology, value), [symbology, value]);

    const single = useMemo((): { svg: string | null; error: string | null } => {
        if (!singleCheck.ok) return { svg: null, error: singleCheck.error };
        if (!engine) return { svg: isDefaultView && initialSvg ? initialSvg : null, error: null };
        try {
            return { svg: engine.render.renderSvg(engine.bwip, settings, singleCheck.value), error: null };
        } catch (err) {
            return { svg: null, error: engine.render.cleanError(err) };
        }
    }, [singleCheck, engine, settings, isDefaultView, initialSvg]);

    const changeSymbology = (next: SymbologyId) => {
        // Swap in the new type's example if the box still holds the old example.
        if (!value.trim() || value === sym.example || value === DEFAULT_VALUE) {
            setValue(getSymbology(next).example);
        }
        setSymbology(next);
    };

    // --- Bulk ------------------------------------------------------------------
    const [source, setSource] = useState<"paste" | "csv" | "sequence">("paste");
    const [pasteText, setPasteText] = useState("");
    const [csv, setCsv] = useState<CsvState | null>(null);
    const [csvError, setCsvError] = useState<string | null>(null);
    const [sequence, setSequence] = useState<SequenceOptions>({ prefix: "ASSET-", start: 1, count: 30, padding: 4, suffix: "" });

    const sourceItems: BulkItem[] = useMemo(() => {
        if (source === "paste") return parseList(pasteText);
        if (source === "sequence") return buildSequence(sequence);
        if (!csv) return [];
        return csvToItems(csv.rows, csv);
    }, [source, pasteText, sequence, csv]);

    const overCap = sourceItems.length > MAX_BULK;
    const bulkChecked = useMemo(
        () => sourceItems.slice(0, MAX_BULK).map((item) => ({ ...item, result: validateValue(symbology, item.raw) })),
        [sourceItems, symbology],
    );
    const bulkValid = useMemo(
        () =>
            bulkChecked.flatMap((item) =>
                item.result.ok ? [{ value: item.result.value, extra: item.extra, note: item.result.note }] : [],
            ),
        [bulkChecked],
    );
    const bulkInvalid = bulkChecked.filter((item) => !item.result.ok);
    const checkDigitsAdded = bulkValid.filter((v) => v.note).length;
    const duplicateCount = useMemo(() => {
        const seen = new Set<string>();
        let dups = 0;
        for (const v of bulkValid) {
            if (seen.has(v.value)) dups++;
            seen.add(v.value);
        }
        return dups;
    }, [bulkValid]);

    const previews = useMemo(() => {
        if (!engine || mode !== "bulk") return [];
        return bulkValid.slice(0, PREVIEW_LIMIT).map((v) => {
            try {
                return { value: v.value, svg: engine.render.renderSvg(engine.bwip, settings, v.value), error: null };
            } catch (err) {
                return { value: v.value, svg: null, error: engine.render.cleanError(err) };
            }
        });
    }, [engine, mode, bulkValid, settings]);

    const handleFile = async (file: File | undefined) => {
        setCsvError(null);
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setCsvError("That file is over 5 MB. Split it, or keep only the column you need.");
            return;
        }
        try {
            const text = await file.text();
            const delimiter = detectDelimiter(text);
            const rows = parseCsv(text, delimiter);
            if (rows.length === 0) {
                setCsvError("No rows found in that file.");
                setCsv(null);
                return;
            }
            const hasHeader = looksLikeHeader(rows[0]);
            setCsv({
                fileName: file.name,
                rows,
                delimiter,
                hasHeader,
                valueColumn: hasHeader ? guessValueColumn(rows[0]) : 0,
                extraColumn: null,
            });
            trackEvent("tool_interact", { tool: TOOL, action: "upload_csv", rows: String(rows.length) });
        } catch {
            setCsvError("Couldn't read that file. Save it as CSV (comma or semicolon) or plain text and try again.");
        }
    };

    const csvColumns = useMemo(() => {
        if (!csv) return [];
        const width = Math.max(...csv.rows.slice(0, 50).map((r) => r.length));
        return Array.from({ length: width }, (_, i) => {
            const header = csv.hasHeader ? csv.rows[0][i]?.trim() : "";
            const sample = csv.rows[csv.hasHeader ? 1 : 0]?.[i]?.trim();
            return {
                index: i,
                label: `Column ${i + 1}${header ? ` · ${header}` : ""}${sample ? ` (e.g. ${sample.slice(0, 24)})` : ""}`,
            };
        });
    }, [csv]);

    // --- Sheet output -------------------------------------------------------------
    const [template, setTemplate] = useState<TemplateId>("avery5160");
    const [singlePage, setSinglePage] = useState<PageSize>("letter");
    const [custom, setCustom] = useState<SheetLayout>(DEFAULT_CUSTOM);
    const [extraLine, setExtraLine] = useState<"none" | "fixed" | "column">("none");
    const [fixedText, setFixedText] = useState("");
    const [outlines, setOutlines] = useState(false);
    const [skip, setSkip] = useState(0);
    const [busy, setBusy] = useState<string | null>(null);
    const [outputMessage, setOutputMessage] = useState<string | null>(null);

    const layout: SheetLayout = useMemo(() => {
        if (template === "single") return singlePerPageLayout(singlePage);
        if (template === "custom") return custom;
        return SHEET_TEMPLATES.find((t) => t.id === template)!.layout!;
    }, [template, singlePage, custom]);
    const layoutError = template === "custom" ? checkLayout(layout) : null;
    const perPage = layout.columns * layout.rows;
    const skipClamped = Math.max(0, Math.min(Number.isFinite(skip) ? Math.floor(skip) : 0, perPage - 1));
    const pageCount = bulkValid.length ? Math.ceil((bulkValid.length + skipClamped) / perPage) : 0;

    // "From a CSV column" only means something while the CSV source is active.
    const extraMode = extraLine === "column" && (source !== "csv" || !csv) ? "none" : extraLine;

    const labelItems = useMemo(
        () =>
            bulkValid.map((v) => ({
                value: v.value,
                extra: extraMode === "fixed" ? fixedText.trim() || undefined : extraMode === "column" ? v.extra || undefined : undefined,
            })),
        [bulkValid, extraMode, fixedText],
    );

    // Warn when the narrowest bar or cell gets too small to scan.
    const density = useMemo(() => {
        if (!engine || layoutError || labelItems.length === 0) return null;
        const longest = labelItems.reduce((a, b) => (b.value.length > a.value.length ? b : a));
        try {
            const mm = engine.render.estimateModuleMm(engine.bwip, settings, longest, layout);
            const min = sym.dimension === "1d" ? 0.19 : 0.25;
            return { mm, tooSmall: mm < min, min };
        } catch {
            return null;
        }
    }, [engine, layoutError, labelItems, settings, layout, sym.dimension]);

    // --- Analytics (debounced, once per type / source per page view) -----------
    const firedRef = useRef(new Set<string>());
    useEffect(() => {
        if (mode !== "single" || !single.svg || isDefaultView) return;
        const key = `single:${symbology}`;
        if (firedRef.current.has(key)) return;
        const t = setTimeout(() => {
            firedRef.current.add(key);
            trackEvent("tool_interact", { tool: TOOL, action: "generate_single", symbology });
        }, 1500);
        return () => clearTimeout(t);
    }, [mode, single.svg, symbology, isDefaultView]);

    useEffect(() => {
        if (mode !== "bulk" || bulkValid.length === 0) return;
        const key = `bulk:${source}:${symbology}`;
        if (firedRef.current.has(key)) return;
        const t = setTimeout(() => {
            firedRef.current.add(key);
            trackEvent("tool_interact", { tool: TOOL, action: "generate_bulk", symbology, source, count: String(bulkValid.length) });
        }, 1500);
        return () => clearTimeout(t);
    }, [mode, bulkValid.length, source, symbology]);

    // --- Downloads --------------------------------------------------------------
    const downloadSingle = async (format: "png" | "svg" | "pdf") => {
        if (!singleCheck.ok || !single.svg) return;
        const name = `barcode-${fileStem(singleCheck.value)}`;
        try {
            const { render, bwip } = engine ?? (await getEngine());
            if (format === "svg") {
                const svg = render.renderSvg(bwip, settings, singleCheck.value);
                render.downloadBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), `${name}.svg`);
            } else if (format === "png") {
                render.downloadBlob(await render.renderPng(bwip, settings, singleCheck.value), `${name}.png`);
            } else {
                render.downloadBlob(await render.renderSinglePdf(bwip, settings, singleCheck.value), `${name}.pdf`);
            }
            trackEvent("tool_interact", { tool: TOOL, action: `download_${format}`, symbology, mode: "single" });
        } catch (err) {
            console.error("Barcode download failed:", err);
        }
    };

    const downloadOne = async (v: string, format: "png" | "svg") => {
        if (!engine) return;
        const { render, bwip } = engine;
        const name = `barcode-${fileStem(v)}`;
        const blob =
            format === "svg"
                ? new Blob([render.renderSvg(bwip, settings, v)], { type: "image/svg+xml;charset=utf-8" })
                : await render.renderPng(bwip, settings, v);
        render.downloadBlob(blob, `${name}.${format}`);
        trackEvent("tool_interact", { tool: TOOL, action: `download_${format}`, symbology, mode: "bulk" });
    };

    const downloadSheet = async () => {
        if (!engine || labelItems.length === 0 || layoutError || busy) return;
        setOutputMessage(null);
        setBusy(`Building PDF… 0 / ${labelItems.length}`);
        try {
            const { blob, pages } = await engine.render.renderSheetPdf(
                engine.bwip,
                labelItems,
                { ...settings, layout, outlines, skip: skipClamped },
                (done) => setBusy(`Building PDF… ${done} / ${labelItems.length}`),
            );
            engine.render.downloadBlob(blob, `barcode-labels-${template}-${labelItems.length}.pdf`);
            setOutputMessage(
                `PDF ready: ${labelItems.length.toLocaleString("en-US")} label${labelItems.length === 1 ? "" : "s"} on ${pages} page${pages === 1 ? "" : "s"}. Print at 100% / “Actual size”.`,
            );
            trackEvent("tool_interact", {
                tool: TOOL,
                action: "download_pdf_sheet",
                symbology,
                template,
                count: String(labelItems.length),
            });
        } catch (err) {
            console.error("PDF sheet failed:", err);
            setOutputMessage(`Couldn't build the PDF: ${engine.render.cleanError(err)}`);
        } finally {
            setBusy(null);
        }
    };

    const downloadZip = async (format: "png" | "svg") => {
        if (!engine || bulkValid.length === 0 || busy) return;
        setOutputMessage(null);
        setBusy(`Building ZIP… 0 / ${bulkValid.length}`);
        try {
            const blob = await engine.render.renderZip(
                engine.bwip,
                settings,
                bulkValid.map((v, i) => ({ value: v.value, name: fileStem(v.value, i) })),
                format,
                (done) => setBusy(`Building ZIP… ${done} / ${bulkValid.length}`),
            );
            engine.render.downloadBlob(blob, `barcodes-${format}-${bulkValid.length}.zip`);
            trackEvent("tool_interact", { tool: TOOL, action: "download_zip", symbology, format, count: String(bulkValid.length) });
        } catch (err) {
            console.error("ZIP failed:", err);
            setOutputMessage(`Couldn't build the ZIP: ${engine.render.cleanError(err)}`);
        } finally {
            setBusy(null);
        }
    };

    // --- UI -------------------------------------------------------------------------
    const typePicker = (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="bg-symbology">Barcode type</Label>
                <select
                    id="bg-symbology"
                    value={symbology}
                    onChange={(e) => changeSymbology(e.target.value as SymbologyId)}
                    className={selectClass}
                >
                    <optgroup label="1D (linear)">
                        {SYMBOLOGIES.filter((s) => s.dimension === "1d").map((s) => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                    </optgroup>
                    <optgroup label="2D">
                        {SYMBOLOGIES.filter((s) => s.dimension === "2d").map((s) => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                    </optgroup>
                </select>
                <p className="text-xs text-muted-foreground">{sym.hint}</p>
            </div>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <Label htmlFor="bg-show-text">Show text under the barcode</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                        {sym.dimension === "1d"
                            ? "Prints the value in human-readable digits below the bars."
                            : "QR and Data Matrix: the value is printed under each code on label sheets."}
                    </p>
                </div>
                <Switch id="bg-show-text" checked={showText} onCheckedChange={setShowText} />
            </div>
            {(symbology === "ean13" || symbology === "upca" || symbology === "ean8") && (
                <p className="flex gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
                    <Info className="h-4 w-4 shrink-0 text-orange-600" />
                    <span>
                        Selling in stores? Retail EAN/UPC numbers must be licensed from GS1. This tool draws any number you
                        give it, but drawing the barcode doesn&apos;t register the number.
                    </span>
                </p>
            )}
        </div>
    );

    return (
        <div
            className="space-y-8"
            onPointerDownCapture={ensureEngine}
            onFocusCapture={ensureEngine}
            onKeyDownCapture={ensureEngine}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Segmented
                    label="Mode"
                    value={mode}
                    onChange={(m) => {
                        setMode(m);
                        trackEvent("tool_interact", { tool: TOOL, action: `mode_${m}` });
                    }}
                    options={[
                        { id: "single", label: "Single barcode" },
                        { id: "bulk", label: "Bulk & label sheets" },
                    ]}
                />
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-orange-600 shrink-0" />
                    Runs in your browser. Nothing is uploaded.
                </p>
            </div>

            {engineError && (
                <p role="alert" className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {engineError}
                </p>
            )}

            {mode === "single" ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-5 space-y-6 min-w-0">
                        {typePicker}
                        <div className="space-y-2">
                            <Label htmlFor="bg-value">Value</Label>
                            <Input
                                id="bg-value"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={sym.example}
                                className="font-mono"
                                autoComplete="off"
                                spellCheck={false}
                                aria-invalid={!singleCheck.ok}
                                aria-describedby="bg-value-msg"
                            />
                            <div id="bg-value-msg" aria-live="polite" className="min-h-5 text-xs">
                                {single.error ? (
                                    <span className="flex items-start gap-1.5 text-red-600">
                                        <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {single.error}
                                    </span>
                                ) : singleCheck.ok && singleCheck.note ? (
                                    <span className="text-muted-foreground">
                                        {singleCheck.note} Encoded as <span className="font-mono">{singleCheck.value}</span>.
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7 min-w-0">
                        <Card className="p-4 sm:p-8 flex flex-col items-center justify-center min-h-[320px] bg-muted/30 border-dashed">
                            {single.svg ? (
                                <div className="flex flex-col items-center gap-6 w-full">
                                    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border w-full flex justify-center">
                                        <BarcodeImage
                                            svg={single.svg}
                                            alt={`${sym.label} barcode for ${singleCheck.ok ? singleCheck.value : value}`}
                                            className={sym.dimension === "2d" ? "w-48 sm:w-56" : "w-full sm:max-w-md max-h-56 object-contain"}
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-md">
                                        {(["png", "svg", "pdf"] as const).map((f) => (
                                            <Button
                                                key={f}
                                                onClick={() => downloadSingle(f)}
                                                variant={f === "png" ? "default" : "outline"}
                                                className="w-full px-2"
                                            >
                                                <Download className="mr-1.5 h-4 w-4" />
                                                {f.toUpperCase()}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    {singleCheck.ok && !engineError ? (
                                        <Loader2 className="h-8 w-8 mx-auto animate-spin opacity-40" />
                                    ) : (
                                        <p className="text-sm max-w-xs">Enter a valid value to see the barcode.</p>
                                    )}
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Input */}
                        <div className="lg:col-span-5 space-y-6 min-w-0">
                            {typePicker}
                            <div className="space-y-3">
                                <Label>Values</Label>
                                <Segmented
                                    label="Input source"
                                    value={source}
                                    onChange={setSource}
                                    options={[
                                        { id: "paste", label: "Paste", icon: ListOrdered },
                                        { id: "csv", label: "CSV", icon: FileSpreadsheet },
                                        { id: "sequence", label: "Sequence", icon: ListOrdered },
                                    ]}
                                />

                                {source === "paste" && (
                                    <Textarea
                                        aria-label="Barcode values, one per line"
                                        value={pasteText}
                                        onChange={(e) => setPasteText(e.target.value)}
                                        placeholder={`One value per line, e.g.\n${sym.example}\n…`}
                                        className="h-48 font-mono text-sm"
                                        spellCheck={false}
                                    />
                                )}

                                {source === "csv" && (
                                    <div className="space-y-3">
                                        <label className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-5 text-center cursor-pointer hover:bg-muted/40 transition-colors">
                                            <Upload className="h-5 w-5 text-orange-600" />
                                            <span className="text-sm font-medium break-all">{csv ? csv.fileName : "Choose a CSV or TXT file"}</span>
                                            <span className="text-xs text-muted-foreground">Comma, semicolon or tab separated. Read on your device.</span>
                                            <input
                                                type="file"
                                                accept=".csv,.txt,.tsv,text/csv,text/plain"
                                                className="sr-only"
                                                onChange={(e) => handleFile(e.target.files?.[0])}
                                            />
                                        </label>
                                        {csvError && <p className="text-xs text-red-600">{csvError}</p>}
                                        {csv && (
                                            <div className="space-y-3">
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={csv.hasHeader}
                                                        onChange={(e) => setCsv({ ...csv, hasHeader: e.target.checked })}
                                                        className="h-4 w-4 rounded border-border accent-orange-600"
                                                    />
                                                    First row is a header
                                                </label>
                                                <div className="space-y-1">
                                                    <Label htmlFor="bg-col" className="text-xs">Barcode column</Label>
                                                    <select
                                                        id="bg-col"
                                                        value={csv.valueColumn}
                                                        onChange={(e) => setCsv({ ...csv, valueColumn: Number(e.target.value) })}
                                                        className={selectClass}
                                                    >
                                                        {csvColumns.map((c) => (
                                                            <option key={c.index} value={c.index}>{c.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label htmlFor="bg-col2" className="text-xs">Second line on labels (optional)</Label>
                                                    <select
                                                        id="bg-col2"
                                                        value={csv.extraColumn ?? ""}
                                                        onChange={(e) => {
                                                            const v = e.target.value === "" ? null : Number(e.target.value);
                                                            setCsv({ ...csv, extraColumn: v });
                                                            setExtraLine(v === null ? "none" : "column");
                                                        }}
                                                        className={selectClass}
                                                    >
                                                        <option value="">None</option>
                                                        {csvColumns.map((c) => (
                                                            <option key={c.index} value={c.index}>{c.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {source === "sequence" && (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label htmlFor="bg-prefix" className="text-xs">Prefix</Label>
                                                <Input
                                                    id="bg-prefix"
                                                    value={sequence.prefix}
                                                    onChange={(e) => setSequence({ ...sequence, prefix: e.target.value })}
                                                    className="font-mono"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="bg-suffix" className="text-xs">Suffix</Label>
                                                <Input
                                                    id="bg-suffix"
                                                    value={sequence.suffix}
                                                    onChange={(e) => setSequence({ ...sequence, suffix: e.target.value })}
                                                    className="font-mono"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <NumberField id="bg-start" label="Start at" min={0} value={sequence.start} onChange={(n) => setSequence({ ...sequence, start: n })} />
                                            <NumberField id="bg-count" label="How many" min={1} max={MAX_BULK} value={sequence.count} onChange={(n) => setSequence({ ...sequence, count: n })} />
                                            <NumberField id="bg-pad" label="Digits" min={0} max={12} value={sequence.padding} onChange={(n) => setSequence({ ...sequence, padding: n })} />
                                        </div>
                                        {sourceItems.length > 0 && (
                                            <p className="text-xs text-muted-foreground break-all">
                                                <span className="font-mono">{sourceItems[0].raw}</span>
                                                {sourceItems.length > 1 && (
                                                    <> … <span className="font-mono">{sourceItems[sourceItems.length - 1].raw}</span></>
                                                )}
                                            </p>
                                        )}
                                        {sequence.count > MAX_BULK && (
                                            <p className="text-xs text-orange-700">Up to {MAX_BULK.toLocaleString("en-US")} at a time.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Results */}
                        <div className="lg:col-span-7 min-w-0 space-y-4">
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm" aria-live="polite">
                                <span className="font-semibold">{bulkChecked.length.toLocaleString("en-US")} values</span>
                                <span className="flex items-center gap-1 text-green-700 dark:text-green-500">
                                    <CheckCircle2 className="h-4 w-4" /> {bulkValid.length.toLocaleString("en-US")} valid
                                </span>
                                {bulkInvalid.length > 0 && (
                                    <span className="flex items-center gap-1 text-red-600">
                                        <AlertCircle className="h-4 w-4" /> {bulkInvalid.length.toLocaleString("en-US")} invalid
                                    </span>
                                )}
                            </div>
                            {overCap && (
                                <p className="text-xs text-orange-700">
                                    {sourceItems.length.toLocaleString("en-US")} values found. Only the first {MAX_BULK.toLocaleString("en-US")} are used; split larger lists into batches.
                                </p>
                            )}
                            {(checkDigitsAdded > 0 || duplicateCount > 0) && (
                                <p className="text-xs text-muted-foreground">
                                    {checkDigitsAdded > 0 && `Check digit added to ${checkDigitsAdded}. `}
                                    {duplicateCount > 0 && `${duplicateCount} duplicate value${duplicateCount === 1 ? "" : "s"} (kept, so you get as many labels as rows).`}
                                </p>
                            )}
                            {bulkInvalid.length > 0 && (
                                <details className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-3 text-sm" open={bulkInvalid.length <= 5}>
                                    <summary className="cursor-pointer font-medium text-red-700 dark:text-red-400">
                                        {bulkInvalid.length === 1 ? "1 value" : `${bulkInvalid.length} values`} skipped
                                    </summary>
                                    <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                                        {bulkInvalid.slice(0, 100).map((item) => (
                                            <li key={item.line} className="text-xs break-all">
                                                <span className="text-muted-foreground">{source === "csv" ? "Row" : "Line"} {item.line}: </span>
                                                <span className="font-mono">{item.raw.slice(0, 60)}</span>
                                                <span className="text-red-700 dark:text-red-400"> — {!item.result.ok && item.result.error}</span>
                                            </li>
                                        ))}
                                        {bulkInvalid.length > 100 && (
                                            <li className="text-xs text-muted-foreground">…and {bulkInvalid.length - 100} more.</li>
                                        )}
                                    </ul>
                                </details>
                            )}

                            <Card className="p-3 sm:p-4 bg-muted/30 border-dashed min-h-[200px]">
                                {bulkValid.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-16">
                                        {source === "csv" && !csv ? "Upload a file to see your barcodes." : "Add values to see your barcodes."}
                                    </p>
                                ) : !engine ? (
                                    <div className="flex justify-center py-16">
                                        <Loader2 className="h-8 w-8 animate-spin opacity-40" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-h-[540px] overflow-y-auto">
                                            {previews.map((p, i) => (
                                                <div key={`${i}-${p.value}`} className="bg-white rounded-lg border p-2 flex flex-col items-center gap-1.5 min-w-0">
                                                    {p.svg ? (
                                                        <BarcodeImage svg={p.svg} alt={`${sym.label} barcode for ${p.value}`} className={sym.dimension === "2d" ? "w-20" : "w-full max-h-24 object-contain"} />
                                                    ) : (
                                                        <p className="text-xs text-red-600">{p.error}</p>
                                                    )}
                                                    <span className="text-[11px] font-mono text-neutral-600 truncate max-w-full">{p.value}</span>
                                                    {p.svg && (
                                                        <div className="flex gap-1">
                                                            <button type="button" onClick={() => downloadOne(p.value, "png")} className="text-[11px] font-medium text-orange-700 hover:underline px-1">PNG</button>
                                                            <button type="button" onClick={() => downloadOne(p.value, "svg")} className="text-[11px] font-medium text-orange-700 hover:underline px-1">SVG</button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {bulkValid.length > PREVIEW_LIMIT && (
                                            <p className="text-xs text-muted-foreground text-center mt-3">
                                                Showing the first {PREVIEW_LIMIT}. All {bulkValid.length.toLocaleString("en-US")} go into the PDF and ZIP.
                                            </p>
                                        )}
                                    </>
                                )}
                            </Card>
                        </div>
                    </div>

                    {/* Output */}
                    <div className="rounded-2xl border bg-muted/20 p-4 sm:p-6 space-y-6">
                        <div>
                            <h3 className="font-semibold text-lg">Print on a label sheet</h3>
                            <p className="text-sm text-muted-foreground">One PDF, vector barcodes, laid out for the sheet you pick.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2" role="radiogroup" aria-label="Label sheet">
                            {SHEET_TEMPLATES.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={template === t.id}
                                    onClick={() => setTemplate(t.id)}
                                    className={cn(
                                        "text-left rounded-lg border p-3 transition-colors",
                                        template === t.id ? "border-orange-500 bg-orange-50/60 dark:bg-orange-950/20" : "hover:border-orange-200 bg-background",
                                    )}
                                >
                                    <div className="text-sm font-semibold">{t.label}</div>
                                    <div className="text-xs text-muted-foreground">{t.detail}</div>
                                </button>
                            ))}
                        </div>

                        {template === "single" && (
                            <div className="max-w-xs space-y-1">
                                <Label htmlFor="bg-page" className="text-xs">Paper</Label>
                                <select id="bg-page" value={singlePage} onChange={(e) => setSinglePage(e.target.value as PageSize)} className={selectClass}>
                                    {(Object.keys(PAGE_SIZES) as PageSize[]).map((p) => (
                                        <option key={p} value={p}>{PAGE_SIZES[p].label}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {template === "custom" && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                    <div className="space-y-1 col-span-2 sm:col-span-1">
                                        <Label htmlFor="bg-cpage" className="text-xs">Paper</Label>
                                        <select id="bg-cpage" value={custom.page} onChange={(e) => setCustom({ ...custom, page: e.target.value as PageSize })} className={selectClass}>
                                            <option value="letter">US Letter</option>
                                            <option value="a4">A4</option>
                                        </select>
                                    </div>
                                    <NumberField id="bg-ccols" label="Columns" min={1} max={20} value={custom.columns} onChange={(n) => setCustom({ ...custom, columns: Math.floor(n) })} />
                                    <NumberField id="bg-crows" label="Rows" min={1} max={40} value={custom.rows} onChange={(n) => setCustom({ ...custom, rows: Math.floor(n) })} />
                                    <NumberField id="bg-cw" label="Label width (mm)" min={5} step={0.1} value={custom.labelWidth} onChange={(n) => setCustom({ ...custom, labelWidth: n })} />
                                    <NumberField id="bg-ch" label="Label height (mm)" min={5} step={0.1} value={custom.labelHeight} onChange={(n) => setCustom({ ...custom, labelHeight: n })} />
                                    <NumberField id="bg-cml" label="Left margin (mm)" min={0} step={0.1} value={custom.marginLeft} onChange={(n) => setCustom({ ...custom, marginLeft: n })} />
                                    <NumberField id="bg-cmt" label="Top margin (mm)" min={0} step={0.1} value={custom.marginTop} onChange={(n) => setCustom({ ...custom, marginTop: n })} />
                                    <NumberField id="bg-cgx" label="Column gap (mm)" min={0} step={0.1} value={custom.gapX} onChange={(n) => setCustom({ ...custom, gapX: n })} />
                                    <NumberField id="bg-cgy" label="Row gap (mm)" min={0} step={0.1} value={custom.gapY} onChange={(n) => setCustom({ ...custom, gapY: n })} />
                                </div>
                                {layoutError && <p className="text-xs text-red-600">{layoutError}</p>}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="bg-extra" className="text-xs">Extra text line</Label>
                                <select
                                    id="bg-extra"
                                    value={extraMode}
                                    onChange={(e) => setExtraLine(e.target.value as typeof extraLine)}
                                    className={selectClass}
                                >
                                    <option value="none">None</option>
                                    <option value="fixed">Same text on every label</option>
                                    {source === "csv" && csv && <option value="column">From a CSV column</option>}
                                </select>
                                {extraMode === "fixed" && (
                                    <Input
                                        aria-label="Text for every label"
                                        value={fixedText}
                                        onChange={(e) => setFixedText(e.target.value)}
                                        placeholder="e.g. Property of Acme IT"
                                        maxLength={60}
                                        className="mt-2"
                                    />
                                )}
                                {extraMode === "column" && csv && csv.extraColumn === null && (
                                    <p className="text-xs text-orange-700 mt-1">Pick the column under “Second line on labels” above.</p>
                                )}
                            </div>
                            <NumberField
                                id="bg-skip"
                                label={`Skip used labels (0–${perPage - 1})`}
                                min={0}
                                max={perPage - 1}
                                value={skip}
                                onChange={setSkip}
                            />
                            <div className="flex items-center justify-between gap-3 md:pt-5">
                                <Label htmlFor="bg-outlines" className="text-sm">Draw label outlines (for a test print)</Label>
                                <Switch id="bg-outlines" checked={outlines} onCheckedChange={setOutlines} />
                            </div>
                        </div>

                        {density?.tooSmall && (
                            <p className="flex gap-2 text-xs text-orange-800 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 rounded-md p-3">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>
                                    On this label the longest value prints with {sym.dimension === "1d" ? "bars" : "cells"} {density.mm.toFixed(2)} mm wide.
                                    Below about {density.min} mm many scanners struggle: use a bigger label, shorter values{sym.dimension === "1d" ? ", or a Data Matrix / QR Code" : ""}.
                                </span>
                            </p>
                        )}

                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                            <Button
                                onClick={downloadSheet}
                                disabled={!engine || bulkValid.length === 0 || !!layoutError || !!busy}
                                className="w-full sm:w-auto"
                            >
                                {busy?.startsWith("Building PDF") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                Download PDF labels
                                {bulkValid.length > 0 && !layoutError && (
                                    <span className="ml-1 opacity-80">({bulkValid.length.toLocaleString("en-US")} · {pageCount} {pageCount === 1 ? "page" : "pages"})</span>
                                )}
                            </Button>
                            <Button variant="outline" onClick={() => downloadZip("png")} disabled={!engine || bulkValid.length === 0 || !!busy} className="w-full sm:w-auto">
                                <Download className="mr-2 h-4 w-4" /> ZIP of PNGs
                            </Button>
                            <Button variant="outline" onClick={() => downloadZip("svg")} disabled={!engine || bulkValid.length === 0 || !!busy} className="w-full sm:w-auto">
                                <Download className="mr-2 h-4 w-4" /> ZIP of SVGs
                            </Button>
                        </div>
                        <div aria-live="polite" className="text-sm">
                            {busy && <p className="text-muted-foreground">{busy}</p>}
                            {!busy && outputMessage && <p className="text-foreground">{outputMessage}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
