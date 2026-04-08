"use client"

import { useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

interface InlineVideoProps {
  mp4: string
  webm?: string
  alt: string
  poster?: string
}

export function InlineVideo({ mp4, webm, alt, poster }: InlineVideoProps) {
  const [paused, setPaused] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }, [])

  return (
    <div
      role="button"
      tabIndex={0}
      className="group relative my-8 cursor-pointer"
      onClick={togglePlay}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          togglePlay()
        }
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        poster={poster}
        aria-label={alt}
        className={cn("rounded-xl border border-border/50 bg-muted shadow-sm w-full")}
        onPause={() => setPaused(true)}
        onPlay={() => setPaused(false)}
      >
        {webm && <source src={webm} type="video/webm" />}
        <source src={mp4} type="video/mp4" />
      </video>
      {paused && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/20 transition-opacity">
          <svg
            className="h-16 w-16 text-white/80 drop-shadow-lg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      )}
    </div>
  )
}
