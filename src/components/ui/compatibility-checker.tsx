"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, Upload, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface CompatibilityCheckerProps {
    competitor: string;
}

type TabType = "scan" | "upload";
type ScanResult = {
    success: boolean;
    format: string;
    value: string;
} | null;

const SUPPORTED_FORMATS = [
    "Code128",
    "Code39",
    "QR Code",
    "DataMatrix",
    "EAN-13",
    "EAN-8",
    "UPC-A",
    "UPC-E",
    "ITF",
    "Code93",
];

export function CompatibilityChecker({ competitor }: CompatibilityCheckerProps) {
    const [activeTab, setActiveTab] = useState<TabType>("scan");
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<ScanResult>(null);
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<HTMLDivElement>(null);
    const html5QrCodeRef = useRef<unknown>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const stopScanner = useCallback(async () => {
        try {
            const scanner = html5QrCodeRef.current as { stop?: () => Promise<void>; clear?: () => void } | null;
            if (scanner && typeof scanner.stop === "function") {
                await scanner.stop();
                scanner.clear?.();
            }
        } catch {
            // Scanner may already be stopped
        }
        html5QrCodeRef.current = null;
        setScanning(false);
    }, []);

    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, [stopScanner]);

    const handleScanSuccess = useCallback(
        (decodedText: string, decodedResult: { result?: { format?: { formatName?: string } } }) => {
            const format = decodedResult?.result?.format?.formatName || "Barcode";
            setResult({
                success: true,
                format: format,
                value: decodedText,
            });
            stopScanner();
        },
        [stopScanner]
    );

    const startScanning = async () => {
        setResult(null);
        setError(null);

        try {
            const { Html5Qrcode } = await import("html5-qrcode");

            if (!scannerRef.current) return;

            const scannerId = "compatibility-scanner";
            // Ensure the container has the right ID
            scannerRef.current.id = scannerId;

            const html5QrCode = new Html5Qrcode(scannerId);
            html5QrCodeRef.current = html5QrCode;

            setScanning(true);

            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 150 },
                    aspectRatio: 1.5,
                },
                handleScanSuccess,
                () => {
                    // Ignore scan failures (e.g., no barcode in frame)
                }
            );
        } catch (err) {
            setScanning(false);
            const message = err instanceof Error ? err.message : String(err);
            if (message.includes("Permission")) {
                setError("Camera access denied. Please allow camera access and try again.");
            } else {
                setError("Could not start camera. Try uploading an image instead.");
            }
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setResult(null);
        setError(null);

        try {
            const { Html5Qrcode } = await import("html5-qrcode");
            const html5QrCode = new Html5Qrcode("compatibility-file-scanner");

            const decodedResult = await html5QrCode.scanFile(file, true);

            setResult({
                success: true,
                format: "Barcode",
                value: decodedResult,
            });

            html5QrCode.clear();
        } catch {
            setError(
                "No barcode detected. Try a clearer image or adjust the angle."
            );
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleTabSwitch = async (tab: TabType) => {
        if (tab !== activeTab) {
            await stopScanner();
            setResult(null);
            setError(null);
            setActiveTab(tab);
        }
    };

    return (
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            {/* Header */}
            <div className="text-center px-6 pt-8 pb-4">
                <p className="text-sm font-semibold text-orange-600 uppercase tracking-widest mb-2">
                    Compatibility Checker
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                    Will your {competitor} Barcodes
                    <br />
                    Work with Shelf?
                </h3>
            </div>

            {/* Scanner card */}
            <div className="px-6 pb-6">
                <div className="rounded-xl border border-border/40 bg-muted/30 p-5 sm:p-6">
                    {/* Tabs */}
                    <div className="flex rounded-lg bg-muted/60 p-1 mb-5">
                        <button
                            onClick={() => handleTabSwitch("scan")}
                            className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${
                                activeTab === "scan"
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Camera className="h-4 w-4" />
                            Scan
                        </button>
                        <button
                            onClick={() => handleTabSwitch("upload")}
                            className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${
                                activeTab === "upload"
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Upload className="h-4 w-4" />
                            Upload
                        </button>
                    </div>

                    {/* Scanner / Upload area */}
                    {activeTab === "scan" ? (
                        <div>
                            <div
                                ref={scannerRef}
                                className="relative rounded-lg overflow-hidden bg-zinc-900 aspect-video mb-4"
                            >
                                {!scanning && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <Camera className="h-10 w-10 text-zinc-600 mx-auto mb-2" />
                                            <p className="text-xs text-zinc-500">
                                                Camera preview
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {/* Scan frame overlay */}
                                {scanning && (
                                    <div className="absolute inset-4 border-2 border-orange-500/40 rounded-lg pointer-events-none z-10" />
                                )}
                            </div>
                            <Button
                                onClick={scanning ? stopScanner : startScanning}
                                className={`w-full ${
                                    scanning
                                        ? "bg-zinc-700 hover:bg-zinc-600 text-white"
                                        : "bg-orange-600 hover:bg-orange-700 text-white"
                                }`}
                            >
                                {scanning ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                        Stop Scanning
                                    </>
                                ) : (
                                    "Start Scanning"
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <label
                                htmlFor="barcode-upload"
                                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/60 bg-muted/20 aspect-video mb-4 cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 dark:hover:bg-orange-950/10 transition-all"
                            >
                                <Upload className="h-10 w-10 text-muted-foreground/40 mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    Drop an image or click to upload
                                </p>
                                <p className="text-xs text-muted-foreground/60 mt-1">
                                    PNG, JPG, or WebP
                                </p>
                            </label>
                            <input
                                ref={fileInputRef}
                                id="barcode-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </div>
                    )}

                    {/* Hidden container for file scanning */}
                    <div id="compatibility-file-scanner" className="hidden" />

                    {/* Result */}
                    {result && (
                        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900/40 p-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-green-800 dark:text-green-300 text-sm">
                                        Compatible with Shelf!
                                    </p>
                                    <p className="text-xs text-green-700/80 dark:text-green-400/70 mt-1">
                                        {result.format} detected: <code className="bg-green-100 dark:bg-green-900/40 px-1 rounded">{result.value}</code>
                                    </p>
                                    <p className="text-xs text-green-600/70 dark:text-green-400/60 mt-2">
                                        Your existing labels will work seamlessly with Shelf.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/40 p-4">
                            <div className="flex items-start gap-3">
                                <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border/30 px-6 py-4 bg-muted/20">
                <p className="text-xs text-muted-foreground text-center">
                    <span className="font-medium">Supported barcode types:</span>{" "}
                    {SUPPORTED_FORMATS.join(", ")}.
                    <br className="sm:hidden" />
                    <span className="text-muted-foreground/60">
                        {" "}If your barcode doesn&apos;t scan, it may be due to camera focus, lighting, or barcode quality. This doesn&apos;t necessarily mean your code isn&apos;t supported — try again or upload a clearer image.
                    </span>
                </p>
            </div>

            {/* Shelf logo trust mark */}
            <div className="flex items-center justify-center gap-2 pb-5">
                <Image src="/logo-light.png" alt="Shelf" width={60} height={20} className="h-5 w-auto opacity-40 dark:hidden" />
                <Image src="/logo-dark.png" alt="Shelf" width={60} height={20} className="h-5 w-auto opacity-40 hidden dark:block" />
            </div>
        </div>
    );
}
