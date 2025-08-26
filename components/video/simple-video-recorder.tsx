'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Square, 
  Circle,
  Download,
  Pause,
  Play
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SimpleVideoRecorderProps {
  matchId?: string
  autoStart?: boolean
  onRecordingComplete?: (blob: Blob, url: string) => void
  className?: string
}

export function SimpleVideoRecorder({
  matchId,
  autoStart = false,
  onRecordingComplete,
  className
}: SimpleVideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Start recording
  const startRecording = async () => {
    try {
      setError(null)
      chunksRef.current = []
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      streamRef.current = stream
      
      // Show preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Setup MediaRecorder with codec that Cloudflare supports
      let options = { mimeType: 'video/webm' }
      
      // Try to use VP8 codec which has better compatibility
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        options = { mimeType: 'video/webm;codecs=vp8' }
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        options = { mimeType: 'video/webm;codecs=vp9' }
      }
      
      const mediaRecorder = new MediaRecorder(stream, options)
      
      mediaRecorderRef.current = mediaRecorder

      // Collect data chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setRecordedBlob(blob)
        setRecordedUrl(url)
        
        // Save to offline storage system (uses IndexedDB)
        if (matchId) {
          try {
            // Import offlineStorage dynamically to avoid circular dependencies
            const { offlineStorage } = await import('@/lib/offline-storage')
            
            // Save video using the offline storage system
            const videoId = await offlineStorage.saveVideo(matchId, blob)
            
            console.log(`Video saved to offline storage (${(blob.size / 1024 / 1024).toFixed(1)}MB) with ID: ${videoId}`)
          } catch (err) {
            console.error('Failed to save video to offline storage:', err)
          }
        }
        
        if (onRecordingComplete) {
          onRecordingComplete(blob, url)
        }
      }

      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Failed to start recording. Please check camera permissions.')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Clear preview
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }

  // Toggle pause
  const togglePause = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
  }

  // Download recorded video
  const downloadVideo = () => {
    if (recordedUrl) {
      const a = document.createElement('a')
      a.href = recordedUrl
      a.download = `match-${matchId || 'recording'}-${Date.now()}.webm`
      a.click()
    }
  }

  // Auto-start if requested
  useEffect(() => {
    if (autoStart && !isRecording) {
      startRecording()
    }
  }, [autoStart])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl)
      }
    }
  }, [recordedUrl])

  return (
    <Card className={cn("bg-black/80 backdrop-blur-sm border-gray-700", className)}>
      <CardContent className="p-4">
        {/* Video Preview */}
        <div className="relative mb-4 bg-gray-900 rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          
          {!isRecording && !recordedUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Video className="w-12 h-12 mx-auto mb-2" />
                <p>Click record to start</p>
              </div>
            </div>
          )}

          {recordedUrl && !isRecording && (
            <video
              src={recordedUrl}
              controls
              className="w-full h-full object-contain"
            />
          )}

          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <Badge className={cn(
                "px-2 py-1",
                isPaused ? "bg-yellow-600" : "bg-red-600 animate-pulse"
              )}>
                <Circle className="w-3 h-3 mr-1 fill-current" />
                {isPaused ? 'Paused' : 'Recording'}
              </Badge>
              <Badge className="bg-black/60 text-white">
                {formatTime(recordingTime)}
              </Badge>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          {!isRecording && !recordedBlob && (
            <Button
              onClick={startRecording}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Circle className="w-4 h-4 mr-2" />
              Record
            </Button>
          )}

          {isRecording && (
            <>
              <Button
                onClick={togglePause}
                variant="outline"
                className="text-gray-300 border-gray-600"
              >
                {isPaused ? (
                  <><Play className="w-4 h-4 mr-2" /> Resume</>
                ) : (
                  <><Pause className="w-4 h-4 mr-2" /> Pause</>
                )}
              </Button>
              <Button
                onClick={stopRecording}
                className="bg-gray-700 hover:bg-gray-600 text-white"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </>
          )}

          {recordedBlob && !isRecording && (
            <>
              <Button
                onClick={startRecording}
                variant="outline"
                className="text-gray-300 border-gray-600"
              >
                <Circle className="w-4 h-4 mr-2" />
                New Recording
              </Button>
              <Button
                onClick={downloadVideo}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 bg-red-900/50 text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Status message */}
        {recordedBlob && (
          <div className="mt-4 p-3 bg-green-900/50 text-green-300 rounded-lg text-sm">
            Video saved locally ({(recordedBlob.size / 1024 / 1024).toFixed(1)} MB)
          </div>
        )}
      </CardContent>
    </Card>
  )
}