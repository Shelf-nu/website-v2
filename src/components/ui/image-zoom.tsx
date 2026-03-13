"use client"

import { useState } from "react"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { ZoomIn } from "lucide-react"

interface ImageZoomProps {
    src?: string
    alt?: string
    className?: string
}

export function ImageZoom({ src, alt, className }: ImageZoomProps) {
    const [open, setOpen] = useState(false)

    if (!src) return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <span className="group relative block cursor-zoom-in my-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={src}
                        alt={alt || ""}
                        className={className || "rounded-xl border border-border/50 bg-muted shadow-sm w-full"}
                    />
                    <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1.5 text-[11px] font-medium text-white/80 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                        <ZoomIn className="h-3.5 w-3.5" />
                        Click to enlarge
                    </span>
                </span>
            </DialogTrigger>
            <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-[95vw] max-h-[95vh]">
                <DialogTitle className="sr-only">{alt || "Image"}</DialogTitle>
                <DialogDescription className="sr-only">
                    Enlarged view. Click outside or press Escape to close.
                </DialogDescription>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt={alt || ""}
                    className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg"
                />
            </DialogContent>
        </Dialog>
    )
}
