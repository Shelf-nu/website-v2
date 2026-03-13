"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface ImageZoomProps {
    src?: string
    alt?: string
    className?: string
}

export function ImageZoom({ src, alt, className }: ImageZoomProps) {
    const [zoomed, setZoomed] = useState(false)
    const imgRef = useRef<HTMLImageElement>(null)
    const overlayRef = useRef<HTMLSpanElement | null>(null)

    const getOverlay = useCallback(() => {
        if (!overlayRef.current) {
            const el = document.createElement("span")
            el.style.cssText = "position:fixed;inset:0;z-index:50;display:block;background:rgba(0,0,0,0.8);backdrop-filter:blur(4px);opacity:0;transition:opacity 300ms;pointer-events:none;"
            el.setAttribute("aria-hidden", "true")
            document.body.appendChild(el)
            el.addEventListener("click", () => {
                if (imgRef.current) {
                    imgRef.current.style.transform = ""
                    imgRef.current.style.zIndex = ""
                }
                el.style.opacity = "0"
                el.style.pointerEvents = "none"
                setZoomed(false)
            })
            overlayRef.current = el
        }
        return overlayRef.current
    }, [])

    const handleZoom = useCallback(() => {
        if (!imgRef.current) return
        const img = imgRef.current
        const rect = img.getBoundingClientRect()

        const margin = 40
        const scaleX = (window.innerWidth - margin * 2) / rect.width
        const scaleY = (window.innerHeight - margin * 2) / rect.height
        const scale = Math.min(scaleX, scaleY, 1.5)

        const translateX = window.innerWidth / 2 - (rect.left + rect.width / 2)
        const translateY = window.innerHeight / 2 - (rect.top + rect.height / 2)

        img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
        img.style.zIndex = "51"

        const overlay = getOverlay()
        overlay.style.opacity = "1"
        overlay.style.pointerEvents = "auto"

        setZoomed(true)
    }, [getOverlay])

    const handleClose = useCallback(() => {
        if (imgRef.current) {
            imgRef.current.style.transform = ""
            imgRef.current.style.zIndex = ""
        }
        if (overlayRef.current) {
            overlayRef.current.style.opacity = "0"
            overlayRef.current.style.pointerEvents = "none"
        }
        setZoomed(false)
    }, [])

    // Close on scroll
    useEffect(() => {
        if (!zoomed) return
        const onScroll = () => handleClose()
        window.addEventListener("scroll", onScroll, { once: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [zoomed, handleClose])

    // Close on Escape
    useEffect(() => {
        if (!zoomed) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [zoomed, handleClose])

    // Cleanup overlay on unmount
    useEffect(() => {
        return () => {
            if (overlayRef.current) {
                overlayRef.current.remove()
            }
        }
    }, [])

    if (!src) return null

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            ref={imgRef}
            src={src}
            alt={alt || ""}
            className={`${className || "rounded-xl border border-border/50 bg-muted shadow-sm w-full"} my-8 transition-transform duration-300 ease-out ${
                zoomed ? "cursor-zoom-out relative !rounded-lg !border-0 !shadow-2xl" : "cursor-zoom-in"
            }`}
            onClick={zoomed ? handleClose : handleZoom}
        />
    )
}
