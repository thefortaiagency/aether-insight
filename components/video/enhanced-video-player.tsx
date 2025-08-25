'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize, Minimize, ChevronLeft, ChevronRight, Settings,
  Rewind, FastForward, Camera, Download, Share2, Zap
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface EnhancedVideoPlayerProps {
  videoUrl: string
  matchId?: string
  onTimeUpdate?: (time: number) => void
  onEventMarked?: (time: number, event: string) => void
  markers?: Array<{
    time: number
    label: string
    color?: string
  }>
}

export function EnhancedVideoPlayer({
  videoUrl,
  matchId,
  onTimeUpdate,
  onEventMarked,
  markers = []
}: EnhancedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [frameRate] = useState(30) // Assuming 30fps
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      setShowControls(true)
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false)
        }, 3000)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', resetControlsTimeout)
      container.addEventListener('mouseenter', () => setShowControls(true))
      container.addEventListener('mouseleave', () => {
        if (isPlaying) setShowControls(false)
      })
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', resetControlsTimeout)
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.volume = value[0]
      setVolume(value[0])
      setIsMuted(value[0] === 0)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
      setPlaybackRate(rate)
    }
  }

  const skipFrames = (frames: number) => {
    if (videoRef.current) {
      const frameTime = 1 / frameRate
      videoRef.current.currentTime += frameTime * frames
    }
  }

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const captureFrame = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `frame-${currentTime.toFixed(2)}.png`
            a.click()
            URL.revokeObjectURL(url)
          }
        })
      }
    }
  }

  const markEvent = (eventType: string) => {
    if (onEventMarked) {
      onEventMarked(currentTime, eventType)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          togglePlayPause()
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (e.shiftKey) {
            skipFrames(-1)
          } else {
            skip(-5)
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (e.shiftKey) {
            skipFrames(1)
          } else {
            skip(5)
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          handleVolumeChange([Math.min(1, volume + 0.1)])
          break
        case 'ArrowDown':
          e.preventDefault()
          handleVolumeChange([Math.max(0, volume - 0.1)])
          break
        case 'f':
          toggleFullscreen()
          break
        case 'm':
          toggleMute()
          break
        case '1':
          changePlaybackRate(0.25)
          break
        case '2':
          changePlaybackRate(0.5)
          break
        case '3':
          changePlaybackRate(1)
          break
        case '4':
          changePlaybackRate(1.5)
          break
        case '5':
          changePlaybackRate(2)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isPlaying, volume, isMuted])

  return (
    <div ref={containerRef} className="relative w-full bg-black rounded-lg overflow-hidden group">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full"
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime)
          if (onTimeUpdate) {
            onTimeUpdate(e.currentTarget.currentTime)
          }
        }}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration)
        }}
        onClick={togglePlayPause}
      />

      {/* Event Markers on Timeline */}
      <div className="absolute bottom-20 left-0 right-0 h-2 pointer-events-none">
        {markers.map((marker, idx) => (
          <div
            key={idx}
            className="absolute w-1 h-full"
            style={{
              left: `${(marker.time / duration) * 100}%`,
              backgroundColor: marker.color || '#D4AF38'
            }}
            title={marker.label}
          />
        ))}
      </div>

      {/* Controls Overlay */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-white mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <Button
              onClick={togglePlayPause}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            {/* Skip Back/Forward */}
            <Button
              onClick={() => skip(-10)}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => skip(10)}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            {/* Frame by Frame */}
            <div className="flex items-center gap-1 border-l border-white/20 pl-2 ml-2">
              <Button
                onClick={() => skipFrames(-1)}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 px-2"
                title="Previous frame (Shift+Left)"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-white px-1">Frame</span>
              <Button
                onClick={() => skipFrames(1)}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 px-2"
                title="Next frame (Shift+Right)"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2 border-l border-white/20 pl-2 ml-2">
              <Button
                onClick={toggleMute}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="w-20"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed Control */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  {playbackRate}x
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/90 text-white border-gold/20">
                <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                  <DropdownMenuItem
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    className={playbackRate === rate ? 'bg-gold/20' : ''}
                  >
                    {rate}x {rate === 1 && '(Normal)'}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Quick Mark */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Mark
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/90 text-white border-gold/20">
                <DropdownMenuLabel>Mark Event</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => markEvent('takedown')}>
                  Takedown
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => markEvent('escape')}>
                  Escape
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => markEvent('reversal')}>
                  Reversal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => markEvent('nearfall')}>
                  Near Fall
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => markEvent('pin')}>
                  Pin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => markEvent('stalling')}>
                  Stalling
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Capture Frame */}
            <Button
              onClick={captureFrame}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              title="Capture frame"
            >
              <Camera className="w-4 h-4" />
            </Button>

            {/* Fullscreen */}
            <Button
              onClick={toggleFullscreen}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Keyboard Shortcuts Info */}
        <div className="text-xs text-gray-400 mt-2 text-center">
          Space: Play/Pause | ←→: Skip 5s | Shift+←→: Frame | ↑↓: Volume | F: Fullscreen | M: Mute | 1-5: Speed
        </div>
      </div>
    </div>
  )
}