'use client'

import Image from 'next/image'

const WrestlingStatsBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* DALL-E Generated Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/wrestling-stats-bg.png"
          alt="Wrestling Statistics Background"
          fill
          className="object-cover opacity-40"
          priority
          quality={100}
        />
      </div>
      
      {/* Gradient Overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
      
      {/* Additional gradient for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-black/60" />
      
      {/* Animated scanning line for extra effect */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-gold to-transparent animate-scan" />
      </div>
      
      {/* Subtle vignette effect */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.4) 100%)'
      }} />
    </div>
  )
}

export default WrestlingStatsBackground