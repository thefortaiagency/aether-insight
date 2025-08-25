'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

interface CloudflareVideoPlayerProps {
  videoId: string
  onTimeUpdate?: (time: number) => void
  onReady?: (player: any) => void
  className?: string
}

export function CloudflareVideoPlayer({
  videoId,
  onTimeUpdate,
  onReady,
  className = ''
}: CloudflareVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)

  useEffect(() => {
    // Initialize Cloudflare Stream player when script loads
    if (typeof window !== 'undefined' && (window as any).Stream && containerRef.current) {
      const stream = (window as any).Stream(containerRef.current as any)
      playerRef.current = stream
      
      // Set up event listeners
      if (onTimeUpdate) {
        stream.addEventListener('timeupdate', () => {
          onTimeUpdate(stream.currentTime)
        })
      }
      
      if (onReady) {
        stream.addEventListener('loadedmetadata', () => {
          onReady(stream)
        })
      }
    }
  }, [videoId, onTimeUpdate, onReady])

  // Fallback to HTML5 video if Cloudflare Stream is not available
  const fallbackVideoUrl = `https://customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN || ''}.cloudflarestream.com/${videoId}/manifest/video.m3u8`

  if (!process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN) {
    return (
      <div className={`relative ${className}`}>
        <video
          controls
          className="w-full h-full"
          src={fallbackVideoUrl}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    )
  }

  return (
    <>
      <Script
        src="https://embed.cloudflarestream.com/embed/sdk.latest.js"
        strategy="afterInteractive"
      />
      <div
        ref={containerRef}
        className={`relative ${className}`}
        data-cfstream={videoId}
      >
        {/* Cloudflare Stream will replace this div with the player */}
      </div>
    </>
  )
}