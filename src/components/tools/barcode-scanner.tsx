"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
    Upload,
    Copy,
    Check,
    Info,
    Loader2,
    Camera,
    CameraOff,
    ImagePlus,
    Download,
    ExternalLink,
    Trash2,
    Wifi,
    Contact,
    Mail,
    Phone,
    MapPin,
    MessageSquare,
    Eye,
    EyeOff,
    ShieldAlert,
    Sparkles,
    Lightbulb,
} from "lucide-react";
import type { IScannerControls } from "@zxing/browser";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { parsePayload, payloadLabel, type ParsedPayload } from "@/lib/zxing/parsePayload";
import { buildScanCsv } from "@/lib/zxing/scanCsv";
// Type-only: the decoder itself is loaded with `import()` on first use so
// zxing never lands in the page's initial JavaScript.
import type { DecodedCode } from "@/lib/zxing/decodeImage";

type Variant = "barcode" | "qr" | "blurry";
type Mode = "camera" | "image";
type CameraState = "idle" | "starting" | "running" | "paused" | "denied" | "error";
type AddResult = "added" | "duplicate" | "ignored";

type ScanItem = {
    id: string;
    text: string;
    format: string;
    scannedAt: Date;
    payload: ParsedPayload;
};

type ImageSummary = {
    total: number;
    found: number;
    duplicates: number;
    failures: { name: string; message: string }[];
    /** Images that only read after clean-up, with what was done. */
    enhanced: { name: string; message: string }[];
    /** At least one image opened fine but had no readable code: show retake tips. */
    showTips: boolean;
};

/** Same code seen again within this window (camera only) is the same scan. */
const REPEAT_WINDOW_MS = 2000;

const COPY: Record<
    Variant,
    { tool: string; cameraHint: string; emptyResults: string; csvName: string; dropTitle: string; dropHint: string }
> = {
    barcode: {
        tool: "barcode_scanner",
        cameraHint: "Point your camera at a barcode or QR code. Each new code is added to the list.",
        emptyResults: "Scanned codes appear here. Use your camera, or add one or more images.",
        csvName: "barcode-scans",
        dropTitle: "Drag & drop images here",
        dropHint: "One or more PNG, JPG or WebP files",
    },
    qr: {
        tool: "qr_code_scanner",
        cameraHint: "Point your camera at a QR code. Links, Wi-Fi details and contacts are laid out for you.",
        emptyResults: "Scanned QR codes appear here. Links are shown, never opened automatically.",
        csvName: "qr-code-scans",
        dropTitle: "Drag & drop images here",
        dropHint: "One or more PNG, JPG or WebP files",
    },
    blurry: {
        tool: "blurry_qr_code_reader",
        cameraHint: "Hold the code steady and fill the square with it. Light-on-dark and engraved codes work too.",
        emptyResults: "Add a photo of the code that won't scan. The result appears here, and links are never opened automatically.",
        csvName: "qr-code-scans",
        dropTitle: "Drop a photo of the code",
        dropHint: "Blurry, dark, low-contrast or engraved codes get an extra clean-up pass",
    },
};

const codeKey = (code: DecodedCode) => `${code.format}\u0000${code.text}`;

async function copyText(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Clipboard API unavailable (older browser or permission policy).
        try {
            const area = document.createElement("textarea");
            area.value = text;
            area.setAttribute("readonly", "");
            area.style.position = "fixed";
            area.style.opacity = "0";
            document.body.appendChild(area);
            area.select();
            const ok = document.execCommand("copy");
            document.body.removeChild(area);
            return ok;
        } catch {
            return false;
        }
    }
}

function loadDecoder() {
    return import("@/lib/zxing/decodeImage");
}

function isImageFile(file: File) {
    return file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp|avif|heic|heif)$/i.test(file.name);
}

export function BarcodeScanner({ variant = "barcode" }: { variant?: Variant }) {
    const copy = COPY[variant];

    // The blurry reader is for photos people already took, so it opens on Image.
    const [mode, setMode] = useState<Mode>(variant === "blurry" ? "image" : "camera");
    const [cameraState, setCameraState] = useState<CameraState>("idle");
    const [cameraMessage, setCameraMessage] = useState<string | null>(null);
    const [noCameraNotice, setNoCameraNotice] = useState<string | null>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [activeDeviceId, setActiveDeviceId] = useState<string>("");

    const [items, setItems] = useState<ScanItem[]>([]);
    const [skipDuplicates, setSkipDuplicates] = useState(true);
    const [isDecoding, setIsDecoding] = useState(false);
    const [decodingLabel, setDecodingLabel] = useState("Decoding...");
    const [imageSummary, setImageSummary] = useState<ImageSummary | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [flash, setFlash] = useState<{ id: number; kind: "added" | "duplicate"; text: string } | null>(null);
    const [announcement, setAnnouncement] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const controlsRef = useRef<IScannerControls | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const startTokenRef = useRef(0);
    const lastSeenRef = useRef(new Map<string, number>());
    const listKeysRef = useRef(new Set<string>());
    const skipDuplicatesRef = useRef(skipDuplicates);
    const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        skipDuplicatesRef.current = skipDuplicates;
    }, [skipDuplicates]);

    // Keep the duplicate index in step with deletes and clears.
    useEffect(() => {
        listKeysRef.current = new Set(items.map((item) => codeKey(item)));
    }, [items]);

    // Browsers without camera access (old browsers, plain-HTTP previews) start on image upload.
    useEffect(() => {
        if (typeof navigator !== "undefined" && !navigator.mediaDevices?.getUserMedia) {
            setMode("image");
        }
    }, []);

    const showFlash = useCallback((kind: "added" | "duplicate", text: string) => {
        if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
        setFlash({ id: Date.now(), kind, text });
        flashTimerRef.current = setTimeout(() => setFlash(null), kind === "added" ? 1500 : 1200);
    }, []);

    const addCode = useCallback(
        (code: DecodedCode, source: "camera" | "image"): AddResult => {
            const key = codeKey(code);
            const now = Date.now();

            if (source === "camera") {
                // The camera reports the same code on every frame it stays in view.
                const last = lastSeenRef.current.get(key);
                lastSeenRef.current.set(key, now);
                if (last !== undefined && now - last < REPEAT_WINDOW_MS) return "ignored";
            }

            if (skipDuplicatesRef.current && listKeysRef.current.has(key)) {
                if (source === "camera") showFlash("duplicate", code.text);
                return "duplicate";
            }

            listKeysRef.current.add(key);
            const item: ScanItem = {
                id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
                text: code.text,
                format: code.format,
                scannedAt: new Date(now),
                payload: parsePayload(code.text),
            };
            setItems((prev) => [item, ...prev]);
            setAnnouncement(`Scanned ${code.format}: ${code.text}`);

            if (source === "camera") {
                showFlash("added", code.text);
                if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                    try {
                        navigator.vibrate(80);
                    } catch {
                        // Vibration is a nicety; some browsers throw without a user gesture.
                    }
                }
                trackEvent("tool_interact", { tool: copy.tool, action: "scan", format: code.format });
            }
            return "added";
        },
        [copy.tool, showFlash],
    );

    const stopCamera = useCallback(() => {
        // Invalidates any start that is still waiting on permission.
        startTokenRef.current += 1;
        controlsRef.current?.stop();
        controlsRef.current = null;
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
    }, []);

    const startCamera = useCallback(
        async (deviceId?: string) => {
            stopCamera();
            setCameraMessage(null);
            setNoCameraNotice(null);

            if (!navigator.mediaDevices?.getUserMedia) {
                setNoCameraNotice(
                    window.isSecureContext
                        ? "This browser can't use a camera here, so add a photo of the code instead."
                        : "The camera only works over a secure (HTTPS) connection, so add a photo of the code instead.",
                );
                setMode("image");
                setCameraState("idle");
                return;
            }

            const token = startTokenRef.current;
            setCameraState("starting");

            const video: MediaTrackConstraints = deviceId
                ? { deviceId: { exact: deviceId } }
                : { facingMode: { ideal: "environment" } };
            // A sharper frame matters for thin 1D bars; browsers fall back if the camera can't do it.
            video.width = { ideal: 1280 };
            video.height = { ideal: 720 };

            let stream: MediaStream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video, audio: false });
            } catch (err) {
                if (token !== startTokenRef.current) return;
                const name = err instanceof Error ? err.name : "";
                if (name === "NotAllowedError" || name === "SecurityError" || name === "PermissionDeniedError") {
                    setCameraState("denied");
                } else if (name === "NotFoundError" || name === "DevicesNotFoundError" || name === "OverconstrainedError") {
                    setCameraState("idle");
                    setNoCameraNotice("No camera was found on this device, so add a photo of the code instead.");
                    setMode("image");
                } else if (name === "NotReadableError" || name === "TrackStartError" || name === "AbortError") {
                    setCameraState("error");
                    setCameraMessage("The camera is in use by another app or tab. Close it there and try again.");
                } else {
                    setCameraState("error");
                    setCameraMessage("The camera could not be started. Try again, or add a photo of the code instead.");
                }
                return;
            }

            if (token !== startTokenRef.current || !videoRef.current) {
                stream.getTracks().forEach((track) => track.stop());
                return;
            }
            streamRef.current = stream;

            try {
                const { startLiveScan } = await loadDecoder();
                if (token !== startTokenRef.current || !videoRef.current) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }
                const controls = await startLiveScan(stream, videoRef.current, (code) => addCode(code, "camera"));
                if (token !== startTokenRef.current) {
                    controls.stop();
                    return;
                }
                controlsRef.current = controls;
            } catch {
                if (token !== startTokenRef.current) return;
                stopCamera();
                setCameraState("error");
                setCameraMessage("The scanner could not load. Check your connection and try again.");
                return;
            }

            setCameraState("running");
            trackEvent("tool_interact", { tool: copy.tool, action: "camera_start" });

            const track = stream.getVideoTracks()[0];
            setActiveDeviceId(track?.getSettings().deviceId ?? "");
            track?.addEventListener("ended", () => {
                // Camera unplugged or taken by the OS.
                if (streamRef.current === stream) {
                    stopCamera();
                    setCameraState("idle");
                }
            });

            // Labels are only filled in after permission is granted, so list cameras now.
            try {
                const all = await navigator.mediaDevices.enumerateDevices();
                setDevices(all.filter((d) => d.kind === "videoinput"));
            } catch {
                setDevices([]);
            }
        },
        [addCode, copy.tool, stopCamera],
    );

    // Stop the camera when the tab is hidden; the user resumes it with a click.
    useEffect(() => {
        const onVisibility = () => {
            if (document.hidden && (streamRef.current || controlsRef.current)) {
                stopCamera();
                setCameraState("paused");
            }
        };
        document.addEventListener("visibilitychange", onVisibility);
        return () => document.removeEventListener("visibilitychange", onVisibility);
    }, [stopCamera]);

    // Release the camera and timers when the component unmounts.
    useEffect(
        () => () => {
            stopCamera();
            if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
            if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
        },
        [stopCamera],
    );

    const switchMode = (next: Mode) => {
        if (next === mode) return;
        if (next === "image") {
            stopCamera();
            setCameraState("idle");
        }
        setMode(next);
    };

    const handleFiles = async (fileList: FileList | File[]) => {
        const files = Array.from(fileList);
        if (files.length === 0) return;
        if (mode !== "image") switchMode("image");

        const images = files.filter(isImageFile);
        if (images.length === 0) {
            setImageSummary({
                total: files.length,
                found: 0,
                duplicates: 0,
                failures: files.map((f) => ({ name: f.name, message: "Not an image file." })),
                enhanced: [],
                showTips: false,
            });
            return;
        }

        setIsDecoding(true);
        setDecodingLabel("Decoding...");
        setImageSummary(null);
        const summary: ImageSummary = {
            total: images.length,
            found: 0,
            duplicates: 0,
            failures: [],
            enhanced: [],
            showTips: false,
        };

        try {
            const { decodeBarcodeFromImage } = await loadDecoder();
            for (const file of images) {
                setDecodingLabel("Decoding...");
                try {
                    const code = await decodeBarcodeFromImage(file, {
                        onTryHarder: () => setDecodingLabel("Trying harder: cleaning up the photo..."),
                    });
                    const result = addCode(code, "image");
                    summary.found += 1;
                    if (result === "duplicate") summary.duplicates += 1;
                    if (code.enhancement) summary.enhanced.push({ name: file.name, message: code.enhancement });
                    trackEvent("tool_interact", {
                        tool: copy.tool,
                        action: "image_decode",
                        format: code.format,
                        enhanced: code.enhancement ? "yes" : "no",
                    });
                } catch (err) {
                    const notFound = err instanceof Error && err.name === "NoCodeFoundError";
                    if (notFound) summary.showTips = true;
                    summary.failures.push({
                        name: file.name,
                        message: err instanceof Error ? err.message : "Could not read this image.",
                    });
                    if (notFound) trackEvent("tool_interact", { tool: copy.tool, action: "image_no_code" });
                }
            }
        } catch {
            summary.failures = images.map((f) => ({
                name: f.name,
                message: "The scanner could not load. Check your connection and try again.",
            }));
        } finally {
            setIsDecoding(false);
            setImageSummary(summary);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const markCopied = (id: string) => {
        setCopiedId(id);
        if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
        copiedTimerRef.current = setTimeout(() => setCopiedId(null), 2000);
    };

    const handleCopyOne = async (item: ScanItem) => {
        if (await copyText(item.text)) markCopied(item.id);
    };

    const handleCopyAll = async () => {
        if (items.length === 0) return;
        if (await copyText(items.map((i) => i.text).join("\n"))) markCopied("__all__");
        trackEvent("tool_interact", { tool: copy.tool, action: "copy_all" });
    };

    const handleDelete = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setAnnouncement("Removed from the list.");
    };

    const handleClear = () => {
        setItems([]);
        lastSeenRef.current.clear();
        setImageSummary(null);
        setAnnouncement("List cleared.");
    };

    const handleDownloadCsv = () => {
        if (items.length === 0) return;
        // Oldest first reads naturally in a spreadsheet.
        const csv = buildScanCsv(
            [...items].reverse().map((i) => ({ code: i.text, format: i.format, scannedAt: i.scannedAt })),
        );
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${copy.csvName}-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        trackEvent("tool_interact", { tool: copy.tool, action: "csv_download" });
    };

    const cameraActive = cameraState === "starting" || cameraState === "running";

    return (
        <Container className="max-w-5xl">
            <div aria-live="polite" role="status" className="sr-only">
                {announcement}
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-start -mt-20 relative z-10">
                {/* Input Card */}
                <div
                    className="bg-card border border-border rounded-2xl p-2 shadow-sm min-w-0"
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    <div className="grid grid-cols-2 gap-1 p-1 mb-2 bg-muted/50 rounded-xl" role="group" aria-label="Scan method">
                        <button
                            type="button"
                            onClick={() => switchMode("camera")}
                            aria-pressed={mode === "camera"}
                            className={cn(
                                "flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors",
                                mode === "camera" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            <Camera className="h-4 w-4" /> Camera
                        </button>
                        <button
                            type="button"
                            onClick={() => switchMode("image")}
                            aria-pressed={mode === "image"}
                            className={cn(
                                "flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors",
                                mode === "image" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            <ImagePlus className="h-4 w-4" /> Image
                        </button>
                    </div>

                    {mode === "camera" ? (
                        <div className="space-y-2">
                            <div
                                className={cn(
                                    "relative w-full aspect-[4/3] min-h-[360px] overflow-hidden rounded-xl bg-neutral-950 transition-shadow duration-200",
                                    flash?.kind === "added" && "ring-4 ring-green-500",
                                )}
                            >
                                <video
                                    ref={videoRef}
                                    className={cn("absolute inset-0 h-full w-full object-cover", !cameraActive && "invisible")}
                                    playsInline
                                    muted
                                    autoPlay
                                    aria-label="Camera preview"
                                />

                                {cameraState === "running" && (
                                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                        <div
                                            className={cn(
                                                "border-2 border-white/80 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]",
                                                variant === "barcode" ? "w-3/4 h-1/2" : "w-1/2 aspect-square",
                                            )}
                                        />
                                    </div>
                                )}

                                {cameraState === "starting" && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-background rounded-lg p-3 flex items-center gap-2 shadow-lg text-sm font-medium">
                                            <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
                                            Starting camera...
                                        </div>
                                    </div>
                                )}

                                {flash && cameraState === "running" && (
                                    <div
                                        key={flash.id}
                                        className={cn(
                                            "absolute bottom-3 inset-x-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium shadow-lg animate-in fade-in duration-150",
                                            flash.kind === "added" ? "bg-green-600 text-white" : "bg-background/95 text-foreground",
                                        )}
                                    >
                                        {flash.kind === "added" ? <Check className="h-4 w-4 shrink-0" /> : <Info className="h-4 w-4 shrink-0" />}
                                        <span className="truncate">
                                            {flash.kind === "added" ? "Added: " : "Already in the list: "}
                                            {flash.text}
                                        </span>
                                    </div>
                                )}

                                {!cameraActive && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center bg-muted dark:bg-neutral-900">
                                        {cameraState === "denied" ? (
                                            <>
                                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                                    <CameraOff className="h-6 w-6 text-red-600" />
                                                </div>
                                                <div className="space-y-2 max-w-sm">
                                                    <p className="font-semibold text-foreground">Camera access is blocked</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        To allow it, open this site&apos;s settings from the address bar (the
                                                        &ldquo;aA&rdquo; menu in Safari on iPhone, the icon left of the address in
                                                        Chrome), set Camera to Allow, then try again.
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap justify-center gap-2">
                                                    <Button size="sm" onClick={() => startCamera()} className="rounded-full">
                                                        Try again
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => switchMode("image")} className="rounded-full">
                                                        Use an image instead
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                                                    <Camera className="h-8 w-8 text-orange-600" />
                                                </div>
                                                <div className="space-y-1 max-w-sm">
                                                    <p className="text-lg font-semibold text-foreground">
                                                        {cameraState === "paused" ? "Camera paused" : "Scan with your camera"}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {cameraState === "paused"
                                                            ? "The camera stopped while this tab was in the background."
                                                            : cameraMessage ?? copy.cameraHint}
                                                    </p>
                                                </div>
                                                <Button onClick={() => startCamera()} className="rounded-full gap-2">
                                                    <Camera className="h-4 w-4" />
                                                    {cameraState === "paused" ? "Resume camera" : cameraState === "error" ? "Try again" : "Start camera"}
                                                </Button>
                                                <p className="text-xs text-muted-foreground max-w-xs">
                                                    Your browser asks for camera access first. The video is read on your device and never uploaded.
                                                </p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {cameraActive && (
                                <div className="flex flex-wrap items-center gap-2 px-1 pb-1">
                                    <Button variant="outline" size="sm" onClick={() => { stopCamera(); setCameraState("idle"); }} className="gap-2">
                                        <CameraOff className="h-4 w-4" /> Stop camera
                                    </Button>
                                    {devices.length > 1 && (
                                        <label className="flex items-center gap-2 text-sm text-muted-foreground min-w-0 flex-1">
                                            <span className="shrink-0">Camera</span>
                                            <select
                                                value={activeDeviceId}
                                                onChange={(e) => startCamera(e.target.value)}
                                                className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-sm text-foreground"
                                            >
                                                {!devices.some((d) => d.deviceId === activeDeviceId) && <option value="">Current camera</option>}
                                                {devices.map((d, i) => (
                                                    <option key={d.deviceId || i} value={d.deviceId}>
                                                        {d.label || `Camera ${i + 1}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div
                            className={cn(
                                "flex flex-col items-center justify-center p-6 md:p-10 border-2 border-dashed rounded-xl transition-all duration-200 text-center min-h-[320px]",
                                isDragging ? "border-orange-500 bg-orange-50/50" : "border-border/60 hover:border-orange-200 hover:bg-muted/30",
                            )}
                        >
                            {isDecoding ? (
                                <div className="flex items-center gap-3 text-sm font-medium">
                                    <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
                                    {decodingLabel}
                                </div>
                            ) : (
                                <div className="space-y-4 w-full">
                                    {noCameraNotice && (
                                        <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">{noCameraNotice}</p>
                                    )}
                                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto">
                                        <Upload className="h-8 w-8 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-foreground mb-1">{copy.dropTitle}</p>
                                        <p className="text-sm text-muted-foreground">{copy.dropHint}</p>
                                    </div>
                                    <div className="pt-2">
                                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-full">
                                            Choose images
                                        </Button>
                                    </div>
                                    {imageSummary && (
                                        <div className="text-left text-sm rounded-lg border border-border/60 p-3 space-y-1">
                                            <p className="font-medium text-foreground">
                                                {imageSummary.found} of {imageSummary.total} {imageSummary.total === 1 ? "image" : "images"} decoded
                                                {imageSummary.duplicates > 0 &&
                                                    ` (${imageSummary.duplicates} already in the list, skipped)`}
                                            </p>
                                            {imageSummary.enhanced.map((f, i) => (
                                                <p key={`e${i}`} className="flex items-start gap-1.5 text-muted-foreground break-words">
                                                    <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-orange-600" aria-hidden="true" />
                                                    <span>
                                                        <span className="font-medium text-foreground">{f.name}:</span> {f.message}
                                                    </span>
                                                </p>
                                            ))}
                                            {imageSummary.failures.map((f, i) => (
                                                <p key={i} className="text-muted-foreground break-words">
                                                    <span className="font-medium text-foreground">{f.name}:</span> {f.message}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                    {imageSummary?.showTips && <RetakeTips />}
                                </div>
                            )}
                        </div>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => e.target.files && handleFiles(e.target.files)}
                        className="hidden"
                        accept="image/*"
                        multiple
                        aria-label="Choose images to scan"
                    />
                </div>

                {/* Result Card */}
                <div className="bg-card border border-border rounded-2xl shadow-sm h-full flex flex-col min-w-0">
                    <div className="p-4 sm:p-6 border-b border-border/50 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="font-semibold text-lg">
                                Results{items.length > 0 && <span className="text-muted-foreground font-normal"> ({items.length})</span>}
                            </h2>
                            <div className="flex items-center gap-2">
                                <label htmlFor={`skip-dupes-${variant}`} className="text-sm text-muted-foreground cursor-pointer">
                                    Skip duplicates
                                </label>
                                <Switch id={`skip-dupes-${variant}`} checked={skipDuplicates} onCheckedChange={setSkipDuplicates} />
                            </div>
                        </div>
                        {items.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                <Button size="sm" onClick={handleDownloadCsv} className="gap-2">
                                    <Download className="h-4 w-4" /> Download CSV
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleCopyAll} className="gap-2">
                                    {copiedId === "__all__" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    {copiedId === "__all__" ? "Copied" : "Copy all"}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={handleClear} className="text-muted-foreground hover:text-foreground">
                                    Clear
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-h-[300px]">
                        {items.length > 0 ? (
                            <ol className="divide-y divide-border/50 max-h-[520px] overflow-y-auto" aria-label="Scanned codes">
                                {items.map((item) => (
                                    <ResultRow
                                        key={item.id}
                                        item={item}
                                        copied={copiedId === item.id}
                                        onCopy={() => handleCopyOne(item)}
                                        onDelete={() => handleDelete(item.id)}
                                    />
                                ))}
                            </ol>
                        ) : (
                            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground/70 p-6">
                                <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="max-w-xs">{copy.emptyResults}</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-muted/20 border-t border-border/50 rounded-b-2xl text-sm text-muted-foreground">
                        Tracking equipment? In Shelf, every asset gets its own QR code, and existing barcodes can be added with the{" "}
                        <Link href="/knowledge-base/alternative-barcodes" className="font-medium text-orange-600 hover:text-orange-700 hover:underline">
                            Alternative Barcodes add-on
                        </Link>
                        .
                    </div>
                </div>
            </div>
        </Container>
    );
}

/** Shown when a photo opened but no code could be read from it, even after clean-up. */
function RetakeTips() {
    return (
        <div className="text-left text-sm rounded-lg bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/60 p-3 space-y-2">
            <p className="flex items-center gap-2 font-medium text-foreground">
                <Lightbulb className="h-4 w-4 shrink-0 text-orange-600" aria-hidden="true" /> How to take a photo that reads
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Move closer, or switch on your phone&apos;s macro or close-up mode. A sharp small code beats a big blurry one.</li>
                <li>Fill the frame with the code, or crop out everything else before you upload.</li>
                <li>Light it from the side to avoid glare. On engraved or metal tags, tilt the tag until the code stands out from the background.</li>
                <li>Hold steady and tap the code on screen so the camera focuses on it.</li>
                <li>Wipe the surface clean. Dust, grease or a scuffed cover can hide parts of the code.</li>
            </ul>
            <p className="text-muted-foreground">
                If a photo doesn&apos;t hold enough detail, no tool can recover it. A new photo is the fix.
            </p>
        </div>
    );
}

function ResultRow({
    item,
    copied,
    onCopy,
    onDelete,
}: {
    item: ScanItem;
    copied: boolean;
    onCopy: () => void;
    onDelete: () => void;
}) {
    const label = payloadLabel(item.payload);
    const time = item.scannedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    return (
        <li className="p-4 sm:px-6 space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <span className="rounded-full bg-orange-50 text-orange-800 dark:bg-orange-950 dark:text-orange-200 px-2 py-0.5 font-medium">
                    {item.format}
                </span>
                {label && <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-foreground">{label}</span>}
                <time dateTime={item.scannedAt.toISOString()}>{time}</time>
            </div>

            <PayloadDetails payload={item.payload} text={item.text} />

            <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={onCopy} className={cn("gap-2", copied && "text-green-700 border-green-300")} aria-label={`Copy ${item.text}`}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                </Button>
                <PayloadAction payload={item.payload} />
                <Button size="sm" variant="ghost" onClick={onDelete} className="gap-2 text-muted-foreground hover:text-red-600" aria-label={`Delete ${item.text}`}>
                    <Trash2 className="h-4 w-4" /> Delete
                </Button>
            </div>
        </li>
    );
}

function DetailLine({ label, value }: { label: string; value: string }) {
    if (!value) return null;
    return (
        <div className="flex gap-2 text-sm min-w-0">
            <span className="text-muted-foreground shrink-0 w-20">{label}</span>
            <span className="font-medium text-foreground break-all min-w-0">{value}</span>
        </div>
    );
}

function PayloadDetails({ payload, text }: { payload: ParsedPayload; text: string }) {
    const raw = <div className="bg-muted/50 rounded-lg p-3 border border-border/50 font-mono text-sm break-all whitespace-pre-wrap">{text}</div>;

    switch (payload.kind) {
        case "url":
            return (
                <div className="space-y-2">
                    <div className="text-base font-semibold text-foreground break-all">{payload.host}</div>
                    <div className="bg-muted/50 rounded-lg p-3 border border-border/50 font-mono text-sm break-all">{payload.url}</div>
                    {payload.isPunycode && (
                        <p className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
                            <ShieldAlert className="h-4 w-4 shrink-0" />
                            This domain is written with international characters, which can imitate a familiar site. Check it carefully.
                        </p>
                    )}
                </div>
            );
        case "wifi":
            return (
                <div className="space-y-1.5 rounded-lg border border-border/50 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Wifi className="h-4 w-4 text-orange-600" /> Wi-Fi network
                    </div>
                    <DetailLine label="Network" value={payload.ssid} />
                    <DetailLine label="Security" value={payload.security} />
                    {payload.hidden && <DetailLine label="Hidden" value="Yes" />}
                    {payload.password && <WifiPassword password={payload.password} />}
                </div>
            );
        case "contact":
            return (
                <div className="space-y-1.5 rounded-lg border border-border/50 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Contact className="h-4 w-4 text-orange-600" /> Contact
                    </div>
                    <DetailLine label="Name" value={payload.name} />
                    <DetailLine label="Company" value={payload.org} />
                    {payload.phones.map((p, i) => <DetailLine key={`p${i}`} label="Phone" value={p} />)}
                    {payload.emails.map((e, i) => <DetailLine key={`e${i}`} label="Email" value={e} />)}
                    {payload.urls.map((u, i) => <DetailLine key={`u${i}`} label="Website" value={u} />)}
                </div>
            );
        case "email":
            return (
                <div className="space-y-1.5 rounded-lg border border-border/50 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Mail className="h-4 w-4 text-orange-600" /> Email
                    </div>
                    <DetailLine label="To" value={payload.address} />
                    <DetailLine label="Subject" value={payload.subject} />
                    <DetailLine label="Message" value={payload.body} />
                </div>
            );
        case "phone":
            return (
                <div className="flex items-center gap-2 text-base font-semibold text-foreground break-all">
                    <Phone className="h-4 w-4 text-orange-600 shrink-0" /> {payload.number}
                </div>
            );
        case "sms":
            return (
                <div className="space-y-1.5 rounded-lg border border-border/50 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <MessageSquare className="h-4 w-4 text-orange-600" /> Text message
                    </div>
                    <DetailLine label="To" value={payload.number} />
                    <DetailLine label="Message" value={payload.message} />
                </div>
            );
        case "geo":
            return (
                <div className="space-y-1.5 rounded-lg border border-border/50 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <MapPin className="h-4 w-4 text-orange-600" /> Location
                    </div>
                    <DetailLine label="Latitude" value={payload.lat} />
                    <DetailLine label="Longitude" value={payload.lon} />
                    <DetailLine label="Place" value={payload.query} />
                </div>
            );
        default:
            return raw;
    }
}

function WifiPassword({ password }: { password: string }) {
    const [visible, setVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (await copyText(password)) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="flex items-center gap-2 text-sm min-w-0 flex-wrap">
            <span className="text-muted-foreground shrink-0 w-20">Password</span>
            <span className="font-mono font-medium text-foreground break-all min-w-0">
                {visible ? password : "•".repeat(Math.min(password.length, 12))}
            </span>
            <span className="flex gap-1 ml-auto">
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? "Hide Wi-Fi password" : "Show Wi-Fi password"}
                >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="ghost" className="h-8 px-2" onClick={handleCopy} aria-label="Copy Wi-Fi password">
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
            </span>
        </div>
    );
}

/** The one explicit "go" button for a row. Only http(s), mailto and tel ever become links. */
function PayloadAction({ payload }: { payload: ParsedPayload }) {
    if (payload.kind === "url") {
        return (
            <Button size="sm" variant="secondary" className="gap-2" asChild>
                <a href={payload.url} target="_blank" rel="noopener noreferrer nofollow">
                    Open link <ExternalLink className="h-4 w-4" />
                </a>
            </Button>
        );
    }
    if (payload.kind === "email" && payload.address) {
        const params = new URLSearchParams();
        if (payload.subject) params.set("subject", payload.subject);
        if (payload.body) params.set("body", payload.body);
        const query = params.toString().replace(/\+/g, "%20");
        return (
            <Button size="sm" variant="secondary" className="gap-2" asChild>
                <a href={`mailto:${encodeURIComponent(payload.address).replace(/%40/g, "@")}${query ? `?${query}` : ""}`}>
                    Write email <Mail className="h-4 w-4" />
                </a>
            </Button>
        );
    }
    if (payload.kind === "phone") {
        return (
            <Button size="sm" variant="secondary" className="gap-2" asChild>
                <a href={`tel:${payload.number.replace(/[^\d+*#,;]/g, "")}`}>
                    Call <Phone className="h-4 w-4" />
                </a>
            </Button>
        );
    }
    return null;
}
