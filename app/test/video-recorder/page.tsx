'use client'

import { useState, useEffect } from 'react'
import { VideoRecorder } from '@/components/video/video-recorder'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'
import { OfflineIndicator } from '@/components/offline-indicator'
import { 
  Video, Settings, Info, CheckCircle, AlertCircle, 
  Wifi, WifiOff, Upload, Download, Trash2, RefreshCw
} from 'lucide-react'

export default function VideoRecorderTestPage() {
  const [recordingMode, setRecordingMode] = useState<'manual' | 'auto'>('manual')
  const [autoStart, setAutoStart] = useState(false)
  const [autoUpload, setAutoUpload] = useState(true)
  const [chunkDuration, setChunkDuration] = useState(300) // 5 minutes
  const [maxFileSize, setMaxFileSize] = useState(50) // 50MB
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([])
  const [testMatchId] = useState(`test-${Date.now()}`)
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true)

  // Monitor online status
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    // Set initial state
    setIsOnline(navigator.onLine)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleUploadComplete = (videoId: string) => {
    console.log('Video uploaded:', videoId)
    setUploadedVideos(prev => [...prev, videoId])
  }

  const clearUploadedVideos = () => {
    setUploadedVideos([])
  }

  const toggleAutoStart = () => {
    setAutoStart(!autoStart)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      <WrestlingStatsBackground />
      <OfflineIndicator />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gold mb-2 flex items-center gap-3">
            <Video className="w-8 h-8" />
            Video Recorder Test Page
          </h1>
          <p className="text-gray-400">
            Test video recording functionality without creating a match
          </p>
        </div>

        {/* Status Bar */}
        <div className="mb-6 flex flex-wrap gap-4">
          <Badge className={isOnline ? "bg-green-900/50 text-green-400 border-green-600" : "bg-red-900/50 text-red-400 border-red-600"}>
            {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          <Badge className="bg-blue-900/50 text-blue-400 border-blue-600">
            Match ID: {testMatchId}
          </Badge>
          {uploadedVideos.length > 0 && (
            <Badge className="bg-purple-900/50 text-purple-400 border-purple-600">
              {uploadedVideos.length} Videos Uploaded
            </Badge>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Video Recorder */}
          <div className="lg:col-span-2">
            <VideoRecorder
              matchId={testMatchId}
              autoStart={autoStart}
              autoUpload={autoUpload}
              chunkDuration={chunkDuration}
              maxFileSize={maxFileSize}
              onRecordingComplete={(blob, url) => {
                console.log('Recording complete', { 
                  size: blob.size, 
                  sizeInMB: (blob.size / (1024 * 1024)).toFixed(2) + ' MB',
                  url 
                })
              }}
              onUploadComplete={handleUploadComplete}
            />
          </div>

          {/* Settings Panel */}
          <div className="space-y-4">
            {/* Recording Settings */}
            <Card className="bg-black/80 backdrop-blur-sm border-gold/30">
              <CardHeader>
                <CardTitle className="text-lg text-gold flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Recording Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Recording Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant={recordingMode === 'manual' ? 'default' : 'outline'}
                      onClick={() => setRecordingMode('manual')}
                      className={recordingMode === 'manual' ? 'bg-gold text-black' : ''}
                    >
                      Manual
                    </Button>
                    <Button
                      size="sm"
                      variant={recordingMode === 'auto' ? 'default' : 'outline'}
                      onClick={() => {
                        setRecordingMode('auto')
                        setAutoStart(true)
                      }}
                      className={recordingMode === 'auto' ? 'bg-gold text-black' : ''}
                    >
                      Auto
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">Auto-Start</label>
                  <Button
                    size="sm"
                    variant={autoStart ? 'default' : 'outline'}
                    onClick={toggleAutoStart}
                    className={`w-full ${autoStart ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  >
                    {autoStart ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">Auto-Upload</label>
                  <Button
                    size="sm"
                    variant={autoUpload ? 'default' : 'outline'}
                    onClick={() => setAutoUpload(!autoUpload)}
                    className={`w-full ${autoUpload ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  >
                    {autoUpload ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">
                    Chunk Duration: {chunkDuration}s ({Math.floor(chunkDuration / 60)} min)
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="600"
                    step="60"
                    value={chunkDuration}
                    onChange={(e) => setChunkDuration(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">
                    Max File Size: {maxFileSize} MB
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="10"
                    value={maxFileSize}
                    onChange={(e) => setMaxFileSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Upload Status */}
            <Card className="bg-black/80 backdrop-blur-sm border-gold/30">
              <CardHeader>
                <CardTitle className="text-lg text-gold flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {uploadedVideos.length > 0 ? (
                  <div className="space-y-2">
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {uploadedVideos.map((videoId, index) => (
                        <div key={videoId} className="text-xs flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-gray-400">Video {index + 1}:</span>
                          <span className="text-white font-mono text-xs truncate">
                            {videoId.substring(0, 12)}...
                          </span>
                        </div>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearUploadedVideos}
                      className="w-full mt-2"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear List
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No videos uploaded yet</p>
                )}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-black/80 backdrop-blur-sm border-gold/30">
              <CardHeader>
                <CardTitle className="text-lg text-gold flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Test Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert className="bg-blue-900/20 border-blue-600/50">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-xs text-blue-300">
                    This page is for testing video recording without creating a match.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
                    <span className="text-gray-400">Test camera and microphone settings</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
                    <span className="text-gray-400">Verify auto-upload functionality</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
                    <span className="text-gray-400">Test offline recording</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
                    <span className="text-gray-400">Check chunk upload timing</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-400">
                    Videos are uploaded to Cloudflare Stream. 
                    {isOnline ? ' Currently online.' : ' Currently offline - videos will be saved locally.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-black/80 backdrop-blur-sm border-gold/30">
              <CardHeader>
                <CardTitle className="text-lg text-gold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                      .then(() => alert('Camera and microphone access granted!'))
                      .catch(err => alert(`Permission error: ${err.message}`))
                  }}
                >
                  Test Permissions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}