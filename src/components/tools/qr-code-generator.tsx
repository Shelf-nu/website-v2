"use client";

import { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { Download, RefreshCcw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface QrOptions {
    size: number;
    margin: number;
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
    color: {
        dark: string;
        light: string;
    };
}

const DEFAULT_OPTIONS: QrOptions = {
    size: 512,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: {
        dark: '#000000',
        light: '#ffffff'
    }
};

export function QrCodeGenerator() {
    const [value, setValue] = useState("");
    const [options, setOptions] = useState<QrOptions>(DEFAULT_OPTIONS);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [qrSvgString, setQrSvgString] = useState<string | null>(null);
    const [, setError] = useState<string | null>(null);
    const [, setIsGenerating] = useState(false);

    // Debounced Generation
    useEffect(() => {
        if (!value.trim()) {
            setQrDataUrl(null);
            setQrSvgString(null);
            setError(null);
            return;
        }

        setIsGenerating(true);
        const timer = setTimeout(async () => {
            try {
                // Generate PNG Data URL
                const dataUrl = await QRCode.toDataURL(value, {
                    width: options.size,
                    margin: options.margin,
                    errorCorrectionLevel: options.errorCorrectionLevel,
                    color: options.color
                });

                // Generate SVG String
                const svgString = await QRCode.toString(value, {
                    type: 'svg',
                    width: options.size,
                    margin: options.margin,
                    errorCorrectionLevel: options.errorCorrectionLevel,
                    color: options.color
                });

                setQrDataUrl(dataUrl);
                setQrSvgString(svgString);
                setError(null);
            } catch (err) {
                console.error("QR Generation Error:", err);
                setError("Failed to generate QR code. Text might be too long.");
            } finally {
                setIsGenerating(false);
            }
        }, 200); // 200ms debounce

        return () => clearTimeout(timer);
    }, [value, options]);

    // Helper: Convert Base64 Data URL to Blob (Synchronous & Safe)
    const base64DataUrlToBlob = (dataUrl: string): Blob => {
        const parts = dataUrl.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], { type: contentType });
    };

    // Helper: Trigger Download from Blob
    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Revoke after a short delay to allow the download to start
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
    };

    const handleDownload = useCallback((format: 'png' | 'svg') => {
        if (!qrDataUrl || !qrSvgString) return;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `shelf-asset-${timestamp}.${format}`;

        try {
            if (format === 'png') {
                const blob = base64DataUrlToBlob(qrDataUrl);
                downloadBlob(blob, filename);
            } else {
                // Creates a Blob with distinct charset for maximum compatibility
                const blob = new Blob([qrSvgString], { type: 'image/svg+xml;charset=utf-8' });
                downloadBlob(blob, filename);
            }
        } catch (err) {
            console.error("Download failed:", err);
        }
    }, [qrDataUrl, qrSvgString]);

    const resetToDefaults = () => {
        setOptions(DEFAULT_OPTIONS);
    };

    return (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Inputs */}
            <div className="lg:col-span-5 space-y-8">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="content">QR Content</Label>
                        <Textarea
                            id="content"
                            placeholder="Enter text, URL, or asset ID..."
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="h-32 resize-none font-mono text-sm"
                        />
                        {value.length > 500 && (
                            <p className="text-xs text-orange-600 font-medium">
                                Warning: High data density. Use &quot;High&quot; error correction for labels.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ecc">Error Correction</Label>
                            <select
                                id="ecc"
                                value={options.errorCorrectionLevel}
                                onChange={(e) => setOptions(prev => ({ ...prev, errorCorrectionLevel: e.target.value as QrOptions['errorCorrectionLevel'] }))}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="L">Low (7%)</option>
                                <option value="M">Medium (15%)</option>
                                <option value="Q">Quartile (25%)</option>
                                <option value="H">High (30%)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="margin">Quiet Zone (Margin)</Label>
                            <Input
                                id="margin"
                                type="number"
                                min={0}
                                max={10}
                                value={options.margin}
                                onChange={(e) => setOptions(prev => ({ ...prev, margin: Math.max(0, parseInt(e.target.value) || 0) }))}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Size (px)</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                type="range"
                                min={128}
                                max={2048}
                                step={32}
                                value={options.size}
                                onChange={(e) => setOptions(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                                className="flex-1"
                            />
                            <span className="w-16 text-sm font-mono text-right">{options.size}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fg">Foreground</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="fg"
                                    type="color"
                                    value={options.color.dark}
                                    onChange={(e) => setOptions(prev => ({ ...prev, color: { ...prev.color, dark: e.target.value } }))}
                                    className="w-12 h-9 p-1 px-1 cursor-pointer"
                                />
                                <Input
                                    value={options.color.dark}
                                    onChange={(e) => setOptions(prev => ({ ...prev, color: { ...prev.color, dark: e.target.value } }))}
                                    className="flex-1 font-mono uppercase"
                                    maxLength={7}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bg">Background</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="bg"
                                    type="color"
                                    value={options.color.light}
                                    onChange={(e) => setOptions(prev => ({ ...prev, color: { ...prev.color, light: e.target.value } }))}
                                    className="w-12 h-9 p-1 px-1 cursor-pointer"
                                />
                                <Input
                                    value={options.color.light}
                                    onChange={(e) => setOptions(prev => ({ ...prev, color: { ...prev.color, light: e.target.value } }))}
                                    className="flex-1 font-mono uppercase"
                                    maxLength={7}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button variant="ghost" size="sm" onClick={resetToDefaults} className="h-8 px-2 text-muted-foreground hover:text-foreground">
                            <RefreshCcw className="mr-2 h-3 w-3" />
                            Reset to Defaults
                        </Button>
                    </div>
                </div>

                {/* Label Tips Callout */}
                <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-4 text-sm">
                    <div className="flex items-center gap-2 font-medium text-orange-900 mb-2">
                        <Info className="h-4 w-4" />
                        <span>Asset Labeling Tips</span>
                    </div>
                    <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                        <li><strong>Size:</strong> Use at least 25px (printed) or 256px (download) for clarity.</li>
                        <li><strong>Damage:</strong> Use <strong>High (H)</strong> error correction for industrial environments where codes might get scratched.</li>
                        <li><strong>Margin:</strong> Keep sufficient whitespace (margin ≥ 2) so scanners can detect the code.</li>
                    </ul>
                </div>
            </div>

            {/* Right Column: Preview */}
            <div className="lg:col-span-7">
                <Card className="p-8 flex flex-col items-center justify-center min-h-[400px] bg-muted/30 border-dashed relative overflow-hidden">
                    {qrDataUrl ? (
                        <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm">
                            <div className="bg-white p-4 rounded-xl shadow-sm border">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={qrDataUrl}
                                    alt="Generated QR Code"
                                    className="w-64 h-64 object-contain"
                                    style={{ imageRendering: 'pixelated' }}
                                />
                            </div>

                            <div className="w-full text-center space-y-4">
                                <div className="text-xs font-mono text-muted-foreground break-all px-4 py-2 bg-background rounded-md border truncate max-w-full">
                                    {value}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button onClick={() => handleDownload('png')} className="w-full" variant="default">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download PNG
                                    </Button>
                                    <Button onClick={() => handleDownload('svg')} className="w-full" variant="outline">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download SVG
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                <RefreshCcw className="h-8 w-8 opacity-20" />
                            </div>
                            <h3 className="text-lg font-medium">Ready to Generate</h3>
                            <p className="text-sm opacity-60 max-w-xs mx-auto mt-2">
                                Enter text or a URL to create your high-resolution QR code.
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
