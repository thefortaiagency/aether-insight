'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface VideoWatermarkProps {
  videoUrl: string
  watermarkImageUrl?: string
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  opacity?: number
  scale?: number
  onProcessed?: (blob: Blob) => void
}

export function VideoWatermark({ 
  videoUrl, 
  watermarkImageUrl = '/aether-logo.png',
  position = 'top-right',
  opacity = 0.7,
  scale = 0.15,
  onProcessed
}: VideoWatermarkProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const processVideo = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setProcessing(true)
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    // Load watermark image
    const watermark = new Image()
    watermark.crossOrigin = 'anonymous'
    await new Promise((resolve) => {
      watermark.onload = resolve
      watermark.src = watermarkImageUrl
    })

    // Set canvas dimensions
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Calculate watermark position and size
    const watermarkWidth = canvas.width * scale
    const watermarkHeight = (watermark.height / watermark.width) * watermarkWidth
    
    let x = 0, y = 0
    const padding = canvas.width * 0.02 // 2% padding

    switch (position) {
      case 'top-left':
        x = padding
        y = padding
        break
      case 'top-right':
        x = canvas.width - watermarkWidth - padding
        y = padding
        break
      case 'bottom-left':
        x = padding
        y = canvas.height - watermarkHeight - padding
        break
      case 'bottom-right':
        x = canvas.width - watermarkWidth - padding
        y = canvas.height - watermarkHeight - padding
        break
    }

    // Process video frame by frame
    const stream = canvas.captureStream(30) // 30 fps
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000
    })

    const chunks: Blob[] = []
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      if (onProcessed) onProcessed(blob)
      setProcessing(false)
    }

    mediaRecorder.start()

    // Draw video frames with watermark
    const drawFrame = () => {
      if (video.paused || video.ended) {
        mediaRecorder.stop()
        return
      }

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Draw watermark with opacity
      ctx.globalAlpha = opacity
      ctx.drawImage(watermark, x, y, watermarkWidth, watermarkHeight)
      ctx.globalAlpha = 1.0

      // Update progress
      setProgress((video.currentTime / video.duration) * 100)

      requestAnimationFrame(drawFrame)
    }

    video.play()
    drawFrame()
  }

  return (
    <div className="space-y-4">
      <video 
        ref={videoRef}
        src={videoUrl}
        className="hidden"
        crossOrigin="anonymous"
      />
      <canvas 
        ref={canvasRef}
        className="w-full rounded-lg"
      />
      
      {processing && (
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-[#D4AF38]" />
          <div className="flex-1">
            <div className="bg-gray-700 rounded-full h-2">
              <div 
                className="bg-[#D4AF38] h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  )
}