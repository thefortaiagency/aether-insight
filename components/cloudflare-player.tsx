'use client'

import { Stream } from '@cloudflare/stream-react'

interface CloudflarePlayerProps {
  videoId: string
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  className?: string
}

export default function CloudflarePlayer({ 
  videoId, 
  autoplay = false,
  muted = false,
  loop = false,
  preload = 'metadata',
  className = ''
}: CloudflarePlayerProps) {
  // Following Cloudflare Stream best practices
  const playerOptions = {
    src: videoId,
    controls: true,
    autoplay,
    muted,
    loop,
    preload,
    responsive: true,
    // Optimize bandwidth hint for better reliability
    clientBandwidthHint: 1.0,
    // Additional recommended settings
    primaryColor: '#D4AF38', // Gold theme
    posterTimestamp: '2s', // Show poster at 2 seconds
    defaultTextTrack: 'en'
  }

  return (
    <div className={`w-full aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
      <Stream {...playerOptions} />
    </div>
  )
}