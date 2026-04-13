"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"

interface InlineVideoProps {
  mp4: string
  webm?: string
  alt: string
  poster?: string
  /** Aspect ratio to reserve space before video loads (prevents CLS). Default: "16/10" (1440x900 captures). */
  aspectRatio?: string
}

const INTRINSIC_WIDTH = 1440

function computeHeight(ratio: string): number {
  const parts = ratio.split("/")
  if (parts.length === 2) {
    const w = parseFloat(parts[0])
    const h = parseFloat(parts[1])
    if (w > 0 && h > 0) return Math.round(INTRINSIC_WIDTH * (h / w))
  }
  return 900 // fallback for 16/10
}

export function InlineVideo({ mp4, webm, alt, poster, aspectRatio = "16/10" }: InlineVideoProps) {
  const intrinsicHeight = computeHeight(aspectRatio)
  const [paused, setPaused] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLSpanElement | null>(null)

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }, [])

  const handleCollapse = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.style.transform = ""
      containerRef.current.style.zIndex = ""
    }
    if (overlayRef.current) {
      overlayRef.current.style.opacity = "0"
      overlayRef.current.style.pointerEvents = "none"
    }
    setExpanded(false)
  }, [])

  const getOverlay = useCallback(() => {
    if (!overlayRef.current) {
      const el = document.createElement("span")
      el.style.cssText =
        "position:fixed;inset:0;z-index:50;display:block;background:rgba(0,0,0,0.85);backdrop-filter:blur(4px);opacity:0;transition:opacity 300ms;pointer-events:none;"
      el.setAttribute("aria-hidden", "true")
      document.body.appendChild(el)
      el.addEventListener("click", () => {
        handleCollapse()
      })
      overlayRef.current = el
    }
    return overlayRef.current
  }, [handleCollapse])

  const handleExpand = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const margin = 40
      const scaleX = (window.innerWidth - margin * 2) / rect.width
      const scaleY = (window.innerHeight - margin * 2) / rect.height
      const scale = Math.min(scaleX, scaleY, 2.5)

      const translateX =
        window.innerWidth / 2 - (rect.left + rect.width / 2)
      const translateY =
        window.innerHeight / 2 - (rect.top + rect.height / 2)

      container.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
      container.style.zIndex = "51"

      const overlay = getOverlay()
      overlay.style.opacity = "1"
      overlay.style.pointerEvents = "auto"

      setExpanded(true)
    },
    [getOverlay]
  )

  // Close on scroll
  useEffect(() => {
    if (!expanded) return
    const onScroll = () => handleCollapse()
    window.addEventListener("scroll", onScroll, { once: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [expanded, handleCollapse])

  // Close on Escape
  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCollapse()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [expanded, handleCollapse])

  // Cleanup overlay on unmount
  useEffect(() => {
    return () => {
      if (overlayRef.current) {
        overlayRef.current.remove()
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative my-8 transition-transform duration-300 ease-out",
        expanded ? "cursor-zoom-out" : ""
      )}
    >
      {/* Video element */}
      <div
        role="button"
        tabIndex={0}
        className={expanded ? "" : "cursor-pointer"}
        onClick={expanded ? (e) => e.stopPropagation() : togglePlay}
        onKeyDown={(e) => {
          if (!expanded && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault()
            togglePlay()
          }
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={!expanded}
          playsInline
          controls={expanded}
          poster={poster}
          aria-label={alt}
          width={INTRINSIC_WIDTH}
          height={intrinsicHeight}
          style={{ aspectRatio }}
          className={cn(
            "rounded-xl border border-border/50 bg-muted shadow-sm w-full h-auto",
            expanded && "!rounded-lg !border-0 !shadow-2xl"
          )}
          onPause={() => setPaused(true)}
          onPlay={() => setPaused(false)}
        >
          {/* MP4 first — Safari doesn't support WebM and the fallback causes a reflow */}
          <source src={mp4} type="video/mp4" />
          {webm && <source src={webm} type="video/webm" />}
        </video>
      </div>

      {/* Close button when expanded */}
      {expanded && (
        <button
          onClick={(e) => { e.stopPropagation(); handleCollapse(); }}
          className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg hover:bg-white"
          aria-label="Close expanded video"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Play overlay when paused */}
      {paused && !expanded && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/20 transition-opacity pointer-events-none"
        >
          <svg
            className="h-16 w-16 text-white/80 drop-shadow-lg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      )}

      {/* Expand button — bottom right */}
      {!expanded && (
        <button
          onClick={handleExpand}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs font-medium text-white/90 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-black/80"
          aria-label="Expand video"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
            />
          </svg>
          Expand
        </button>
      )}
    </div>
  )
}
