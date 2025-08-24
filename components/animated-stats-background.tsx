'use client'

import { useEffect, useState } from 'react'

interface FloatingStatProps {
  label: string
  value: string | number
  x: number
  y: number
  delay: number
  duration: number
}

const FloatingStat = ({ label, value, x, y, delay, duration }: FloatingStatProps) => {
  return (
    <div
      className="absolute text-gold/40 font-mono text-sm animate-float-slow pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      <div className="bg-white/5 backdrop-blur-sm border border-gold/20 rounded-lg p-3">
        <div className="text-xs text-gold/60 uppercase tracking-wider">{label}</div>
        <div className="text-2xl font-bold text-gold/80">{value}</div>
      </div>
    </div>
  )
}

const AnimatedStatsBackground = () => {
  const [stats, setStats] = useState<FloatingStatProps[]>([])

  useEffect(() => {
    // Generate random wrestling stats
    const wrestlingStats = [
      { label: 'Total Pins', value: '342', x: 10, y: 15, delay: 0, duration: 25 },
      { label: 'Win Rate', value: '87%', x: 75, y: 20, delay: 2, duration: 30 },
      { label: 'Takedowns', value: '1,249', x: 15, y: 60, delay: 4, duration: 28 },
      { label: 'Team Score', value: '245.5', x: 70, y: 70, delay: 1, duration: 32 },
      { label: 'Reversals', value: '89', x: 85, y: 45, delay: 3, duration: 26 },
      { label: 'Near Falls', value: '156', x: 5, y: 35, delay: 5, duration: 29 },
      { label: 'Tech Falls', value: '67', x: 45, y: 10, delay: 6, duration: 31 },
      { label: 'Major Dec', value: '124', x: 30, y: 80, delay: 7, duration: 27 },
      { label: 'Escapes', value: '203', x: 60, y: 50, delay: 8, duration: 33 },
      { label: 'Riding Time', value: '48:32', x: 25, y: 25, delay: 9, duration: 28 },
      { label: 'Dual Wins', value: '12-3', x: 50, y: 85, delay: 10, duration: 30 },
      { label: 'Tournament Pts', value: '189', x: 80, y: 10, delay: 11, duration: 29 },
    ]
    setStats(wrestlingStats)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient overlay - MUCH BRIGHTER */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 via-gray-700/30 to-gray-800/50" />
      
      {/* Animated grid pattern - MORE VISIBLE */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(212, 175, 56, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(212, 175, 56, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'scan 15s linear infinite',
        }} />
      </div>

      {/* Floating stats */}
      {stats.map((stat, index) => (
        <FloatingStat key={index} {...stat} />
      ))}

      {/* Animated circles - BRIGHTER */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full border-2 border-gold/30 animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full border-2 border-gold/20 animate-spin-slow" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border-2 border-gold/25 animate-pulse" style={{ animationDuration: '4s' }} />

      {/* Data visualization elements - BRIGHTER */}
      <svg className="absolute top-1/3 right-20 w-48 h-48 opacity-40" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(212, 175, 56, 0.4)" strokeWidth="2" />
        <circle 
          cx="50" 
          cy="50" 
          r="40" 
          fill="none" 
          stroke="rgba(212, 175, 56, 0.6)" 
          strokeWidth="2"
          strokeDasharray="251.2"
          strokeDashoffset="62.8"
          transform="rotate(-90 50 50)"
          className="animate-pulse"
        />
      </svg>

      {/* Bar chart visualization - BRIGHTER */}
      <div className="absolute bottom-1/4 left-1/4 flex items-end gap-2 opacity-40">
        {[65, 45, 80, 55, 70, 40, 75].map((height, i) => (
          <div
            key={i}
            className="w-3 bg-gradient-to-t from-gold/60 to-gold/20 rounded-t"
            style={{
              height: `${height}px`,
              animation: `float ${20 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* Line graph visualization */}
      <svg className="absolute top-2/3 right-1/3 w-64 h-32 opacity-15" viewBox="0 0 200 100">
        <polyline
          points="0,80 30,60 60,65 90,40 120,50 150,30 180,35 200,20"
          fill="none"
          stroke="rgba(212, 175, 56, 0.4)"
          strokeWidth="2"
          className="animate-shimmer"
        />
        <polyline
          points="0,80 30,60 60,65 90,40 120,50 150,30 180,35 200,20"
          fill="url(#goldGradient)"
          fillOpacity="0.1"
        />
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(212, 175, 56, 0.3)" />
            <stop offset="100%" stopColor="rgba(212, 175, 56, 0)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Trophy icons floating */}
      <div className="absolute top-1/4 left-3/4 text-gold/10 text-6xl animate-float" style={{ animationDuration: '35s' }}>
        🏆
      </div>
      <div className="absolute bottom-1/3 left-1/6 text-gold/10 text-4xl animate-float-delayed" style={{ animationDuration: '40s' }}>
        🥇
      </div>
      <div className="absolute top-3/4 right-1/4 text-gold/10 text-5xl animate-float" style={{ animationDuration: '30s', animationDelay: '5s' }}>
        🏅
      </div>

      {/* Hex pattern */}
      <div className="absolute bottom-10 right-1/4 opacity-10">
        <svg width="150" height="150" viewBox="0 0 150 150">
          {[0, 1, 2].map(row => (
            [0, 1, 2].map(col => (
              <polygon
                key={`${row}-${col}`}
                points="25,10 45,10 55,25 45,40 25,40 15,25"
                fill="none"
                stroke="rgba(212, 175, 56, 0.3)"
                strokeWidth="1"
                transform={`translate(${col * 35}, ${row * 35})`}
                className="animate-pulse"
                style={{ animationDelay: `${(row + col) * 0.2}s` }}
              />
            ))
          ))}
        </svg>
      </div>

      {/* Wrestling weight classes floating */}
      <div className="absolute top-10 right-1/3 flex flex-col gap-2 opacity-15">
        {['106', '113', '120', '126', '132'].map((weight, i) => (
          <div
            key={weight}
            className="text-gold/40 font-bold text-lg animate-float"
            style={{
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${25 + i * 2}s`,
            }}
          >
            {weight} lbs
          </div>
        ))}
      </div>

      {/* Scanning lines */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-gold to-transparent animate-scan" />
        <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-gold to-transparent animate-scan" style={{ animationDelay: '4s' }} />
      </div>

      {/* Particle effects */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-gold/20 rounded-full animate-float-slow"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${20 + Math.random() * 20}s`,
          }}
        />
      ))}
    </div>
  )
}

export default AnimatedStatsBackground