"use client"

import { useState, useRef, useCallback } from "react"

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
      setPaused(false)
    } else {
      video.pause()
      setPaused(true)
    }
  }, [])

  return (
    <div className="group relative my-8 cursor-pointer" onClick={togglePlay}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        poster={poster}
        aria-label={alt}
        className="rounded-xl border border-border/50 bg-muted shadow-sm w-full"
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
