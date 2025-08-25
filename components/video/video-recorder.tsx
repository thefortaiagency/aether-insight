'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Video, Circle, Square, Upload, Download, 
  Loader2, AlertCircle, Camera, CameraOff,
  Mic, MicOff, Settings, X
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface VideoRecorderProps {
  matchId?: string
  onRecordingComplete?: (blob: Blob, videoUrl: string) => void
  onUploadComplete?: (cloudflareId: string) => void
  className?: string
  autoStart?: boolean
  autoUpload?: boolean
  chunkDuration?: number // in seconds, default 300 (5 minutes)
  maxFileSize?: number // in MB, default 100
}

export function VideoRecorder({ 
  matchId, 
  onRecordingComplete,
  onUploadComplete,
  className = '',
  autoStart = false,
  autoUpload = true,
  chunkDuration = 300, // 5 minutes default
  maxFileSize = 100 // 100MB default
}: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('')
  const [showSettings, setShowSettings] = useState(false)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [chunkNumber, setChunkNumber] = useState(0)
  const [uploadedChunks, setUploadedChunks] = useState<string[]>([])
  const [isProcessingChunk, setIsProcessingChunk] = useState(false)
  const [totalRecordedSize, setTotalRecordedSize] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const chunkTimerRef = useRef<NodeJS.Timeout | null>(null)
  const autoStartedRef = useRef(false)

  // Get available devices
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const videoDevices = devices.filter(d => d.kind === 'videoinput')
      const audioDevices = devices.filter(d => d.kind === 'audioinput')
      setDevices(devices)
      
      if (videoDevices.length > 0 && !selectedCamera) {
        setSelectedCamera(videoDevices[0].deviceId)
      }
      if (audioDevices.length > 0 && !selectedMicrophone) {
        setSelectedMicrophone(audioDevices[0].deviceId)
      }
    })
  }, [])

  // Auto-start recording when component mounts if enabled
  useEffect(() => {
    if (autoStart && !autoStartedRef.current && selectedCamera && selectedMicrophone) {
      autoStartedRef.current = true
      // Small delay to ensure devices are ready
      setTimeout(() => {
        startRecording()
      }, 1000)
    }
  }, [autoStart, selectedCamera, selectedMicrophone])

  // Format time display
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Process and upload chunk
  const processChunk = async () => {
    if (isProcessingChunk || chunksRef.current.length === 0) return
    
    setIsProcessingChunk(true)
    
    try {
      // Create blob from current chunks
      const chunkBlob = new Blob(chunksRef.current, { 
        type: mediaRecorderRef.current?.mimeType || 'video/webm' 
      })
      
      // Update total size
      setTotalRecordedSize(prev => prev + chunkBlob.size)
      
      // Check if we should upload (size or duration based)
      const shouldUpload = autoUpload && (
        chunkBlob.size > maxFileSize * 1024 * 1024 || // Size limit
        recordingTime % chunkDuration === 0 // Time limit
      )
      
      if (shouldUpload) {
        const currentChunk = chunkNumber
        setChunkNumber(prev => prev + 1)
        
        // Upload chunk
        const formData = new FormData()
        formData.append('file', chunkBlob, `match-${matchId}-chunk-${currentChunk}.webm`)
        formData.append('meta', JSON.stringify({
          matchId,
          chunkNumber: currentChunk,
          isChunk: true,
          recordedAt: new Date().toISOString()
        }))
        
        const response = await fetch('/api/videos/upload', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          const data = await response.json()
          setUploadedChunks(prev => [...prev, data.videoId])
          console.log(`Chunk ${currentChunk} uploaded:`, data.videoId)
        }
        
        // Clear chunks after successful upload
        chunksRef.current = []
      }
    } catch (err) {
      console.error('Error processing chunk:', err)
    } finally {
      setIsProcessingChunk(false)
    }
  }

  // Start recording
  const startRecording = async () => {
    try {
      setError(null)
      chunksRef.current = []

      const constraints: MediaStreamConstraints = {
        video: videoEnabled ? {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        } : false,
        audio: audioEnabled ? {
          deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined,
          echoCancellation: true,
          noiseSuppression: true
        } : false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      // Show preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
        ? 'video/webm;codecs=vp9' 
        : 'video/webm'

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000 // 2.5 Mbps
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        // Process final chunk if auto-upload is enabled
        if (autoUpload && chunksRef.current.length > 0) {
          await processChunk()
          
          // If we have uploaded chunks, merge them
          if (uploadedChunks.length > 0 && matchId) {
            try {
              const response = await fetch('/api/videos/merge-chunks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  matchId,
                  chunkIds: uploadedChunks
                })
              })
              
              if (response.ok) {
                console.log('Video chunks merged successfully')
                if (onUploadComplete && uploadedChunks[0]) {
                  onUploadComplete(uploadedChunks[0])
                }
              }
            } catch (err) {
              console.error('Error merging chunks:', err)
            }
          }
        } else {
          // Normal completion for non-chunked recording
          const blob = new Blob(chunksRef.current, { type: mimeType })
          const url = URL.createObjectURL(blob)
          setRecordedBlob(blob)
          setRecordedUrl(url)
          
          if (onRecordingComplete) {
            onRecordingComplete(blob, url)
          }
        }
      }

      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setRecordingTime(0)
      setChunkNumber(0)
      setUploadedChunks([])
      setTotalRecordedSize(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      // Start chunk processing timer if auto-upload is enabled
      if (autoUpload) {
        chunkTimerRef.current = setInterval(() => {
          processChunk()
        }, chunkDuration * 1000) // Process chunk every chunkDuration seconds
      }

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

      // Clear timers
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (chunkTimerRef.current) {
        clearInterval(chunkTimerRef.current)
      }

      // Clear preview
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }

  // Pause/Resume recording
  const togglePause = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
        
        // Resume timer
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
        
        // Pause timer
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
  }

  // Toggle video track
  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setVideoEnabled(videoTrack.enabled)
      }
    }
  }

  // Toggle audio track
  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setAudioEnabled(audioTrack.enabled)
      }
    }
  }

  // Upload to Cloudflare
  const uploadToCloudflare = async () => {
    if (!recordedBlob) return

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', recordedBlob, `match-${matchId || Date.now()}.webm`)
      
      if (matchId) {
        formData.append('meta', JSON.stringify({
          matchId,
          recordedAt: new Date().toISOString()
        }))
      }

      // TODO: Replace with actual Cloudflare Stream upload endpoint
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      
      if (onUploadComplete) {
        onUploadComplete(data.videoId)
      }

      setUploadProgress(100)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload video. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  // Download recorded video
  const downloadVideo = () => {
    if (recordedUrl) {
      const a = document.createElement('a')
      a.href = recordedUrl
      a.download = `match-${matchId || Date.now()}.webm`
      a.click()
    }
  }

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
    <Card className={`bg-black/80 backdrop-blur-sm border-gold/30 p-4 ${className}`}>
      {/* Preview/Playback */}
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          controls={!!recordedUrl}
          src={recordedUrl || undefined}
          className="w-full h-full object-contain"
        />
        
        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Circle className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                <Circle className="absolute inset-0 w-4 h-4 text-red-500 animate-ping" />
              </div>
              <Badge className="bg-red-600 text-white">
                {isPaused ? 'PAUSED' : 'REC'} • {formatTime(recordingTime)}
              </Badge>
            </div>
            {autoUpload && (
              <div className="flex items-center gap-2">
                {isProcessingChunk && (
                  <Badge className="bg-blue-600 text-white animate-pulse">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Uploading Chunk {chunkNumber}
                  </Badge>
                )}
                {uploadedChunks.length > 0 && (
                  <Badge className="bg-green-600 text-white">
                    {uploadedChunks.length} Chunks Uploaded
                  </Badge>
                )}
                {totalRecordedSize > 0 && (
                  <Badge className="bg-gray-700 text-white">
                    {formatFileSize(totalRecordedSize)}
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Settings overlay */}
        {showSettings && (
          <div className="absolute inset-0 bg-black/90 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Recording Settings</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSettings(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Camera</label>
                <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.filter(d => d.kind === 'videoinput').map(device => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || 'Camera'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Microphone</label>
                <Select value={selectedMicrophone} onValueChange={setSelectedMicrophone}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.filter(d => d.kind === 'audioinput').map(device => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || 'Microphone'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <Alert className="mb-4 border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-500">{error}</AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <div className="space-y-4">
        {/* Recording controls */}
        {!recordedBlob ? (
          <div className="flex gap-2">
            {!isRecording ? (
              <>
                <Button
                  onClick={startRecording}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Circle className="w-4 h-4 mr-2" />
                  Start Recording
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={stopRecording}
                  className="flex-1 bg-gray-600 hover:bg-gray-700"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
                <Button
                  onClick={togglePause}
                  variant="outline"
                  className="flex-1"
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleVideo}
                  className={!videoEnabled ? 'text-red-500' : ''}
                >
                  {videoEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleAudio}
                  className={!audioEnabled ? 'text-red-500' : ''}
                >
                  {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                onClick={uploadToCloudflare}
                disabled={isUploading}
                className="flex-1 bg-gold hover:bg-gold/90 text-black"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload to Cloud
                  </>
                )}
              </Button>
              <Button
                onClick={downloadVideo}
                variant="outline"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
            <Button
              onClick={() => {
                setRecordedBlob(null)
                setRecordedUrl(null)
                setRecordingTime(0)
              }}
              variant="outline"
              className="w-full"
            >
              Record New Video
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}