'use client'

import { Stream } from '@cloudflare/stream-react'

interface CloudflarePlayerProps {
  videoId: string
}

export default function CloudflarePlayer({ videoId }: CloudflarePlayerProps) {
  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
      <Stream 
        src={videoId}
        controls={true}
        autoplay={false}
        muted={false}
        preload="metadata"
        responsive={true}
      />
    </div>
  )
}