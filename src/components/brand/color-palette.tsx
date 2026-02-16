"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Color {
    name: string;
    hex: string;
    description: string;
    twClass: string;
}

const COLORS: Color[] = [
    { name: "Brand Orange", hex: "#EA580C", description: "Primary Action", twClass: "bg-orange-600" },
    { name: "Zinc 900", hex: "#18181B", description: "Headings", twClass: "bg-zinc-900" },
    { name: "Zinc 500", hex: "#71717A", description: "Secondary Text", twClass: "bg-zinc-500" },
    { name: "Zinc 100", hex: "#F4F4F5", description: "Backgrounds", twClass: "bg-zinc-100 border" },
];

export function ColorPalette() {
    const [copiedHex, setCopiedHex] = useState<string | null>(null);

    const handleCopy = (hex: string) => {
        navigator.clipboard.writeText(hex);
        setCopiedHex(hex);
        setTimeout(() => setCopiedHex(null), 2000);
    };

    return (
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {COLORS.map((color) => (
                <button
                    key={color.hex}
                    onClick={() => handleCopy(color.hex)}
                    className="group text-left space-y-3 focus:outline-none"
                    aria-label={`Copy ${color.name} hex code`}
                >
                    <div className={cn("h-24 rounded-lg shadow-sm relative transition-transform group-hover:scale-[1.02]", color.twClass)}>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-lg">
                            {copiedHex === color.hex ? (
                                <span className="bg-black/75 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-xl flex items-center gap-1.5 backdrop-blur-sm">
                                    <Check className="w-3 h-3" /> Copied!
                                </span>
                            ) : (
                                <span className="bg-white/90 text-black px-3 py-1.5 rounded-full text-xs font-semibold shadow-xl flex items-center gap-1.5 backdrop-blur-sm">
                                    <Copy className="w-3 h-3" /> Copy Hex
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="font-semibold flex items-center gap-2">
                            {color.name}
                        </div>
                        <div className="text-sm text-muted-foreground font-mono flex items-center gap-2">
                            {color.hex}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{color.description}</div>
                    </div>
                </button>
            ))}
        </div>
    );
}
