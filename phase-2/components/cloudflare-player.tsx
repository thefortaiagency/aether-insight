'use client'

import { forwardRef, useRef, useImperativeHandle, useEffect } from 'react'
import { Stream } from '@cloudflare/stream-react'

interface CloudflarePlayerProps {
  videoId: string
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  className?: string
}

const CloudflarePlayer = forwardRef<any, CloudflarePlayerProps>(({ 
  videoId, 
  autoplay = false,
  muted = false,
  loop = false,
  preload = 'metadata',
  className = ''
}, ref) => {
  const streamRef = useRef<any>(null)
  
  // Expose player controls via ref
  useImperativeHandle(ref, () => ({
    get currentTime() {
      return streamRef.current?.currentTime || 0
    },
    set currentTime(time: number) {
      if (streamRef.current) {
        streamRef.current.currentTime = time
      }
    },
    play: () => streamRef.current?.play(),
    pause: () => streamRef.current?.pause()
  }), [])
  
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
    defaultTextTrack: 'en',
    ref: streamRef
  }

  return (
    <div className={`w-full aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
      <Stream {...playerOptions} />
    </div>
  )
})

CloudflarePlayer.displayName = 'CloudflarePlayer'

export default CloudflarePlayer