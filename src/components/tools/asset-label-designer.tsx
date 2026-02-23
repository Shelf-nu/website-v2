"use client";

import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import { toPng, toSvg } from "html-to-image";
import { jsPDF } from "jspdf";
import { Download, Printer, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// --- Types & Constants ---

type SizePreset = 'small' | 'medium' | 'large';
type LayoutPreset = 'qr-only' | 'qr-id' | 'qr-id-name';

interface LabelConfig {
    assetId: string;
    assetName: string;
    qrValue: string;
    useCustomQr: boolean;
    size: SizePreset;
    layout: LayoutPreset;
}

const CONSTANTS = {
    sizes: {
        small: { mm: 25, px: 295, label: 'Small (25mm)', desc: 'For handheld gear, tools, mobile devices.' },   // ~300 DPI
        medium: { mm: 40, px: 472, label: 'Medium (40mm)', desc: 'Standard for laptops, monitors, furniture.' },
        large: { mm: 60, px: 708, label: 'Large (60mm)', desc: 'High visibility for cases, racks, machinery.' },
    },
    layouts: {
        'qr-only': { label: 'QR Code Only', desc: 'Minimalist.' },
        'qr-id': { label: 'QR + Asset ID', desc: 'Standard.' },
        'qr-id-name': { label: 'QR + ID + Name', desc: 'Descriptive.' },
    },
    defaultConfig: {
        assetId: "AST-001",
        assetName: "MacBook Pro 16",
        qrValue: "https://app.shelf.nu/login",
        useCustomQr: false,
        size: 'medium' as SizePreset,
        layout: 'qr-id' as LayoutPreset,
    }
};

// --- Helpers ---

// Robust Base64 to Blob conversion (fixes Chrome corruption issues)
const base64DataUrlToBlob = (dataUrl: string): Blob => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

// Force download via clean anchor click
const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Revoke after delay to allow mobile browsers to process
    setTimeout(() => URL.revokeObjectURL(url), 100);
};

// --- Component ---

export function AssetLabelDesigner() {
    const [config, setConfig] = useState<LabelConfig>(CONSTANTS.defaultConfig);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [isQrReady, setIsQrReady] = useState(false); // Gate exports until paint is confirmed
    const labelRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    // Watch for QrValue logic
    useEffect(() => {
        // Reset ready state immediately on change
        setIsQrReady(false);

        const valueToEncode = config.useCustomQr ? config.qrValue : config.assetId;

        let active = true;

        // Generate QR
        QRCode.toDataURL(valueToEncode, {
            width: 1024,
            margin: 1,
            errorCorrectionLevel: 'H', // Always high for labels
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        }).then((url) => {
            if (!active) return;
            setQrDataUrl(url);

            // Gate: Wait for 2 frames to ensure React render + DOM paint are complete
            // This fixes Safari issues where exports fired before visual update
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (active) setIsQrReady(true);
                });
            });
        });

        return () => { active = false; };
    }, [config.assetId, config.qrValue, config.useCustomQr, config.layout, config.size]);

    const handleExport = async (format: 'png' | 'svg' | 'pdf') => {
        if (!labelRef.current || !isQrReady) return;
        setIsExporting(true);

        const filename = `shelf-label-${config.assetId || 'template'}`;
        const sizeMm = CONSTANTS.sizes[config.size].mm;

        // Common options for html-to-image capture rigor
        const captureOptions = {
            cacheBust: true,
            pixelRatio: 2, // Higher density for print clarity
            backgroundColor: '#ffffff',
            useCORS: true, // Ensure any external assets are captured
        };

        try {
            if (format === 'png') {
                const dataUrl = await toPng(labelRef.current, captureOptions);
                const blob = base64DataUrlToBlob(dataUrl);
                downloadBlob(blob, `${filename}.png`);

            } else if (format === 'svg') {
                const svgDataUrl = await toSvg(labelRef.current, captureOptions);
                // Decode to get raw string
                const svgString = decodeURIComponent(svgDataUrl.split(',')[1]);
                const finalSvg = `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;
                const blob = new Blob([finalSvg], { type: "image/svg+xml;charset=utf-8" });
                downloadBlob(blob, `${filename}.svg`);

            } else if (format === 'pdf') {
                // Generate PNG first (safest cross-browser method for jsPDF embedding)
                const dataUrl = await toPng(labelRef.current, captureOptions);

                // Validate
                if (!dataUrl.startsWith('data:image/png;base64,')) {
                    throw new Error("Failed to generate valid PNG for PDF");
                }

                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: [sizeMm, sizeMm] // Single page, exact label fit
                });

                pdf.addImage(dataUrl, 'PNG', 0, 0, sizeMm, sizeMm);

                // Export as Blob -> Download (Avoid pdf.save() for reliability)
                const pdfBlob = pdf.output('blob');
                downloadBlob(pdfBlob, `${filename}.pdf`);
            }
        } catch (err) {
            console.error("Export failed:", err);
        } finally {
            setIsExporting(false);
        }
    };

    // Calculate dimensions for preview scaling (CSS transform)
    const exportPx = CONSTANTS.sizes[config.size].px;
    const previewScale = Math.min(1, 400 / exportPx); // Max 400px wide on screen

    return (
        <div className="grid lg:grid-cols-12 gap-8 items-start">

            {/* Controls */}
            <div className="lg:col-span-5 space-y-8">

                {/* Data Input */}
                <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        1. Asset Details
                    </h3>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label htmlFor="assetId">Asset ID (Required)</Label>
                            <Input
                                id="assetId"
                                value={config.assetId}
                                onChange={(e) => setConfig(prev => ({ ...prev, assetId: e.target.value }))}
                                placeholder="e.g. AST-1024"
                                maxLength={20}
                            />
                        </div>

                        {(config.layout === 'qr-id-name') && (
                            <div className="space-y-1">
                                <Label htmlFor="assetName">Asset Name</Label>
                                <Input
                                    id="assetName"
                                    value={config.assetName}
                                    onChange={(e) => setConfig(prev => ({ ...prev, assetName: e.target.value }))}
                                    placeholder="e.g. Dell XPS 15"
                                    maxLength={30}
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                            <Switch
                                id="customQr"
                                checked={config.useCustomQr}
                                onCheckedChange={(c) => setConfig(prev => ({ ...prev, useCustomQr: c }))}
                            />
                            <Label htmlFor="customQr" className="text-sm font-normal text-muted-foreground">
                                Use custom QR content
                            </Label>
                        </div>

                        {config.useCustomQr && (
                            <div className="space-y-1">
                                <Label htmlFor="qrValue">QR Value</Label>
                                <Input
                                    id="qrValue"
                                    value={config.qrValue}
                                    onChange={(e) => setConfig(prev => ({ ...prev, qrValue: e.target.value }))}
                                    placeholder="https://"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Layout Config */}
                <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        2. Configuration
                    </h3>

                    <div className="grid gap-3">
                        <Label>Layout Preset</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {(Object.keys(CONSTANTS.layouts) as LayoutPreset[]).map((key) => (
                                <button
                                    key={key}
                                    onClick={() => setConfig(prev => ({ ...prev, layout: key }))}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-3 rounded-lg border text-sm transition-all",
                                        config.layout === key
                                            ? "border-orange-600 bg-orange-50 text-orange-900 ring-1 ring-orange-600"
                                            : "border-border hover:border-orange-200 bg-card"
                                    )}
                                >
                                    <span className="font-medium">{CONSTANTS.layouts[key].label.split(' + ').map(s => <span key={s} className="block text-xs">{s}</span>)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-3">
                        <Label>Size Preset</Label>
                        <div className="space-y-2">
                            {(Object.keys(CONSTANTS.sizes) as SizePreset[]).map((key) => (
                                <div
                                    key={key}
                                    onClick={() => setConfig(prev => ({ ...prev, size: key }))}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-lg border text-sm cursor-pointer transition-all",
                                        config.size === key
                                            ? "border-orange-600 bg-orange-50 text-orange-900 ring-1 ring-orange-600"
                                            : "border-border hover:border-orange-200 bg-card"
                                    )}
                                >
                                    <span className="font-semibold">{CONSTANTS.sizes[key].label}</span>
                                    <span className="text-muted-foreground text-xs">{CONSTANTS.sizes[key].desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Warning States */}
                {(config.assetId.length > 15 && config.size === 'small') && (
                    <div className="bg-yellow-50 text-yellow-900 border border-yellow-200 p-3 rounded-md flex items-start gap-2 text-sm">
                        <TriangleAlert className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>Long IDs on small labels may effectively be unreadable. Consider a larger size or shorter ID.</p>
                    </div>
                )}
            </div>

            {/* Preview & Export */}
            <div className="lg:col-span-7 flex flex-col items-center">
                <div className="w-full bg-muted/30 border border-dashed rounded-xl p-8 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">

                    <p className="absolute top-4 right-4 text-xs font-mono text-muted-foreground uppercase tracking-widest">
                        Preview ({CONSTANTS.sizes[config.size].mm}mm)
                    </p>

                    {/* The Label Render Area */}
                    <div
                        style={{
                            transform: `scale(${previewScale})`,
                            transformOrigin: 'center center',
                            minWidth: exportPx,
                            minHeight: exportPx,
                        }}
                    >
                        <div
                            ref={labelRef}
                            className="bg-white text-black flex flex-col items-center justify-center text-center p-[5%]"
                            style={{
                                width: exportPx,
                                height: exportPx,
                                // Enforce high contrast black/white specifically
                                backgroundColor: '#ffffff',
                                color: '#000000',
                            }}
                        >
                            {/* Layout Logic */}
                            {qrDataUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={qrDataUrl}
                                    alt="QR"
                                    className="rendering-pixelated"
                                    style={{
                                        width: config.layout === 'qr-only' ? '90%' : config.layout === 'qr-id' ? '75%' : '65%',
                                        height: 'auto',
                                        marginBottom: config.layout === 'qr-only' ? 0 : '4%'
                                    }}
                                />
                            )}

                            {config.layout !== 'qr-only' && (
                                <div className="font-bold font-mono tracking-tight leading-none" style={{ fontSize: `${exportPx * 0.12}px` }}>
                                    {config.assetId || 'ID'}
                                </div>
                            )}

                            {config.layout === 'qr-id-name' && (
                                <div className="font-medium leading-tight mt-[2%]" style={{ fontSize: `${exportPx * 0.06}px`, maxWidth: '90%' }}>
                                    {config.assetName || 'Name'}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="absolute bottom-4 left-0 right-0 text-center">
                        <p className="text-xs text-muted-foreground">
                            Scale: {Math.round(previewScale * 100)}% (Actual export is 300dpi)
                        </p>
                    </div>
                </div>

                <div className="w-full mt-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                            size="lg"
                            onClick={() => handleExport('png')}
                            disabled={!isQrReady || isExporting}
                            className="w-full"
                        >
                            <Download className="mr-2 h-4 w-4" /> Download PNG
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => handleExport('svg')}
                            disabled={!isQrReady || isExporting}
                            className="w-full"
                        >
                            <Download className="mr-2 h-4 w-4" /> Download SVG
                        </Button>
                    </div>

                    <div className="pt-6 border-t border-border flex flex-col items-center text-center space-y-3">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleExport('pdf')}
                            disabled={!isQrReady || isExporting}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <Printer className="mr-2 h-4 w-4" /> Label Printer PDF
                        </Button>
                        <p className="text-xs text-muted-foreground max-w-xs">
                            For dedicated thermal printers (Dymo, Zebra, Brother). <br />
                            Outputs a 1:1, size-accurate {CONSTANTS.sizes[config.size].mm}mm page.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
