"use client"

import { useState } from "react"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

interface VideoLightboxProps {
    videoId: string
    children: React.ReactNode
}

export function VideoLightbox({ videoId, children }: VideoLightboxProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="p-0 border-0 bg-transparent shadow-none">
                {/* Visually hidden but required for a11y */}
                <DialogTitle className="sr-only">Product video</DialogTitle>
                <DialogDescription className="sr-only">
                    Watch a short video explaining what Shelf is and how it works.
                </DialogDescription>

                {/* 16:9 responsive iframe — only mounted when open */}
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                    {open && (
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                            title="Product video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
