"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Upload, X, Copy, Check, Info, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { decodeQrFromImage } from "@/lib/zxing/decodeImage";

export function QrCodeDecoder() {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [decodedText, setDecodedText] = useState<string | null>(null);
    const [isDecoding, setIsDecoding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [copied, setCopied] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDecode = async (file: File) => {
        setIsDecoding(true);
        setError(null);
        setDecodedText(null);

        // Create preview URL
        const url = URL.createObjectURL(file);
        setImageSrc(url);

        try {
            const text = await decodeQrFromImage(file);
            setDecodedText(text);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to decode QR code");
        } finally {
            setIsDecoding(false);
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleDecode(e.target.files[0]);
        }
    };

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleDecode(e.dataTransfer.files[0]);
        }
    }, []);

    const handleReset = () => {
        if (imageSrc) URL.revokeObjectURL(imageSrc);
        setImageSrc(null);
        setDecodedText(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleCopy = () => {
        if (decodedText) {
            navigator.clipboard.writeText(decodedText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const isUrl = (text: string) => {
        try {
            new URL(text);
            return true;
        } catch {
            return false;
        }
    };

    return (
        <Container className="max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8 items-start -mt-20 relative z-10">
                {/* Input Card */}
                <div className="bg-card border border-border rounded-2xl p-2 shadow-sm">
                    <div
                        className={cn(
                            "flex flex-col items-center justify-center p-8 md:p-12 border-2 border-dashed rounded-xl transition-all duration-200 text-center min-h-[320px]",
                            isDragging ? "border-orange-500 bg-orange-50/50" : "border-border/60 hover:border-orange-200 hover:bg-muted/30",
                            imageSrc ? "border-none bg-black/5 p-0 overflow-hidden relative" : ""
                        )}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                    >
                        {imageSrc ? (
                            <div className="relative w-full h-full flex items-center justify-center bg-black">
                                <div className="relative w-full aspect-square max-h-[400px]">
                                    <Image
                                        src={imageSrc}
                                        alt="Uploaded QR Code"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-20"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                {isDecoding && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                        <div className="bg-background rounded-lg p-4 flex items-center gap-3 shadow-lg">
                                            <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
                                            <span className="font-medium">Decoding...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                                    <Upload className="h-8 w-8 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-foreground mb-1">
                                        Drag & drop image here
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Supports PNG, JPG, WebP
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-full">
                                        Upload Image
                                    </Button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={onFileChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Result Card */}
                <div className="bg-card border border-border rounded-2xl shadow-sm h-full flex flex-col">
                    <div className="p-6 border-b border-border/50 flex items-center justify-between">
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            Result
                        </h2>
                        {decodedText && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                className="text-muted-foreground hover:text-foreground h-8"
                            >
                                Clear
                            </Button>
                        )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-center min-h-[300px]">
                        {decodedText ? (
                            <div className="space-y-6 w-full animate-in fade-in duration-300">
                                <div className="space-y-2">
                                    <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                                        Decoded Content
                                    </div>
                                    <div className="bg-muted/50 rounded-xl p-4 border border-border/50 font-mono text-sm break-all relative group">
                                        {decodedText}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button onClick={handleCopy} className={cn("flex-1 gap-2", copied ? "bg-green-600 hover:bg-green-700" : "")}>
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        {copied ? "Copied" : "Copy text"}
                                    </Button>

                                    {isUrl(decodedText) && (
                                        <Button variant="secondary" className="flex-1 gap-2" asChild>
                                            <a href={decodedText} target="_blank" rel="noopener noreferrer">
                                                Open Link <ArrowRight className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ) : error ? (
                            <div className="text-center space-y-3 animate-in fade-in duration-300">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground">Decoding Failed</h3>
                                    <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                                        {error}
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleReset} className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                                    Try another image
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center space-y-2 text-muted-foreground/60">
                                <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>Upload an image to see the decoded result here.</p>
                            </div>
                        )}
                    </div>

                    {/* Soft CTA - Bottom of card */}
                    <div className="p-4 bg-muted/20 border-t border-border/50 rounded-b-2xl">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                            <span className="text-muted-foreground">Used by modern asset teams</span>
                            <div className="flex items-center gap-4">
                                <Link href="/case-studies" className="font-medium text-orange-600 hover:text-orange-700 hover:underline">
                                    View case studies
                                </Link>
                                <div className="h-3 w-px bg-border" />
                                <Link href="/pricing" className="font-medium text-muted-foreground hover:text-foreground">
                                    View pricing
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>

    );
}
