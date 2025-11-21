'use client'

import { useState, useEffect } from 'react'
import { VideoRecorder } from '@/components/video/video-recorder'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'
import { OfflineIndicator } from '@/components/offline-indicator'
import { supabase } from '@/lib/supabase'
import { 
  Video, Settings, Info, CheckCircle, AlertCircle, 
  Wifi, WifiOff, Upload, Download, Trash2, RefreshCw,
  Trophy, Users, Plus, Minus, Clock, Play, Pause,
  Target, Flag, Activity, ChevronUp, ChevronDown,
  Award, Shield, Zap
} from 'lucide-react'

export default function VideoRecorderTestPage() {
  const [recordingMode, setRecordingMode] = useState<'manual' | 'auto'>('manual')
  const [autoStart, setAutoStart] = useState(false)
  const [autoUpload, setAutoUpload] = useState(false)
  const [chunkDuration, setChunkDuration] = useState(300) // 5 minutes
  const [maxFileSize, setMaxFileSize] = useState(50) // 50MB
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([])
  const [testMatchId, setTestMatchId] = useState(`test-${Date.now()}`)
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true)
  
  // Match state
  const [matchCreated, setMatchCreated] = useState(false)
  const [matchStartTime, setMatchStartTime] = useState<number>(0)
  const [wrestlerName, setWrestlerName] = useState('Test Wrestler')
  const [opponentName, setOpponentName] = useState('Test Opponent')
  const [wrestlerScore, setWrestlerScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [currentPeriod, setCurrentPeriod] = useState(1)
  const [periodTime, setPeriodTime] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [scoringEvents, setScoringEvents] = useState<any[]>([])
  const [showMatchForm, setShowMatchForm] = useState(false)
  const [showScoring, setShowScoring] = useState(false)

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

  // Create a test match
  const createTestMatch = async () => {
    try {
      const matchData = {
        id: testMatchId,
        wrestler_name: wrestlerName,
        opponent_name: opponentName,
        event_name: 'Test Event',
        weight_class: 'Test',
        match_type: 'Regular',
        final_score_for: 0,
        final_score_against: 0,
        status: 'in_progress',
        video_start_time: new Date().toISOString(),
        has_video: true
      }

      const { data, error } = await supabase
        .from('matches')
        .insert(matchData)
        .select()
        .single()

      if (error) {
        console.error('Error creating match:', error)
        // Continue anyway for testing
      }

      setMatchCreated(true)
      setMatchStartTime(Date.now())
      setShowMatchForm(false)
      setShowScoring(true)
      
      // Don't start recording automatically - keep it manual
      // setAutoStart(true)
      
      console.log('Test match created:', matchData)
    } catch (error) {
      console.error('Error creating test match:', error)
    }
  }

  // Add scoring event
  const addScoringEvent = async (type: string, points: number, wrestler: 'wrestler1' | 'wrestler2') => {
    const isWrestler1 = wrestler === 'wrestler1'
    const videoTimestamp = matchStartTime ? Math.floor((Date.now() - matchStartTime) / 1000) : 0
    
    const event = {
      id: `event-${Date.now()}`,
      match_id: testMatchId,
      timestamp: Date.now(),
      video_timestamp: videoTimestamp,
      event_type: type,
      wrestler_id: wrestler,
      wrestler_name: isWrestler1 ? wrestlerName : opponentName,
      points: points,
      description: `${isWrestler1 ? wrestlerName : opponentName} - ${type} +${points}`,
      period: currentPeriod,
      event_time: periodTime
    }

    // Update scores
    if (isWrestler1) {
      setWrestlerScore(prev => prev + points)
    } else {
      setOpponentScore(prev => prev + points)
    }

    // Add to local events
    setScoringEvents(prev => [...prev, event])

    // Save to database
    try {
      const response = await fetch('/api/matches/live/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      })
      
      if (!response.ok) {
        console.error('Failed to save event')
      }
    } catch (error) {
      console.error('Error saving event:', error)
    }
  }

  // Period timer
  useEffect(() => {
    if (matchCreated && isRecording) {
      const timer = setInterval(() => {
        setPeriodTime(prev => prev + 1)
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [matchCreated, isRecording])

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
            Match ID: {testMatchId.substring(0, 15)}...
          </Badge>
          {matchCreated && (
            <Badge className="bg-gold/50 text-gold border-gold">
              <Trophy className="w-3 h-3 mr-1" />
              Match Active
            </Badge>
          )}
          {uploadedVideos.length > 0 && (
            <Badge className="bg-purple-900/50 text-purple-400 border-purple-600">
              {uploadedVideos.length} Videos Uploaded
            </Badge>
          )}
        </div>

        {/* Match Creation Card */}
        {!matchCreated && (
          <Card className="bg-black/80 backdrop-blur-sm border-gold/30 mb-6">
            <CardHeader>
              <CardTitle className="text-gold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Create Test Match
                </span>
                <Button
                  size="sm"
                  onClick={() => setShowMatchForm(!showMatchForm)}
                  className="bg-gold text-black hover:bg-gold/80"
                >
                  {showMatchForm ? 'Cancel' : 'Create Match'}
                </Button>
              </CardTitle>
            </CardHeader>
            {showMatchForm && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Wrestler Name</Label>
                    <Input
                      value={wrestlerName}
                      onChange={(e) => setWrestlerName(e.target.value)}
                      className="bg-gray-900/50 border-gray-700"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Opponent Name</Label>
                    <Input
                      value={opponentName}
                      onChange={(e) => setOpponentName(e.target.value)}
                      className="bg-gray-900/50 border-gray-700"
                    />
                  </div>
                </div>
                <Button
                  onClick={createTestMatch}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Create Match (Manual Recording)
                </Button>
              </CardContent>
            )}
          </Card>
        )}

        {/* Scoring Controls */}
        {matchCreated && showScoring && (
          <Card className="bg-black/80 backdrop-blur-sm border-gold/30 mb-6">
            <CardHeader>
              <CardTitle className="text-gold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Live Scoring
                </span>
                <div className="flex items-center gap-4">
                  <Badge className="bg-blue-900/50 text-blue-400">
                    Period {currentPeriod} - {formatTime(periodTime)}
                  </Badge>
                  <Badge className="bg-gray-700/50 text-gray-300">
                    {wrestlerScore} - {opponentScore}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {/* Wrestler 1 Controls */}
                <div className="space-y-3">
                  <h3 className="text-green-500 font-bold text-center">{wrestlerName}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={() => addScoringEvent('takedown', 2, 'wrestler1')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Target className="w-4 h-4 mr-1" />
                      Takedown +2
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => addScoringEvent('escape', 1, 'wrestler1')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Escape +1
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => addScoringEvent('reversal', 2, 'wrestler1')}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Shield className="w-4 h-4 mr-1" />
                      Reversal +2
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => addScoringEvent('near_fall', 3, 'wrestler1')}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Near Fall +3
                    </Button>
                  </div>
                </div>

                {/* Wrestler 2 Controls */}
                <div className="space-y-3">
                  <h3 className="text-red-500 font-bold text-center">{opponentName}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={() => addScoringEvent('takedown', 2, 'wrestler2')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Target className="w-4 h-4 mr-1" />
                      Takedown +2
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => addScoringEvent('escape', 1, 'wrestler2')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Escape +1
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => addScoringEvent('reversal', 2, 'wrestler2')}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Shield className="w-4 h-4 mr-1" />
                      Reversal +2
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => addScoringEvent('near_fall', 3, 'wrestler2')}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Near Fall +3
                    </Button>
                  </div>
                </div>
              </div>

              {/* Period Controls */}
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCurrentPeriod(prev => Math.max(1, prev - 1))
                    setPeriodTime(0)
                  }}
                  disabled={currentPeriod === 1}
                >
                  Previous Period
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCurrentPeriod(prev => Math.min(3, prev + 1))
                    setPeriodTime(0)
                  }}
                  disabled={currentPeriod === 3}
                >
                  Next Period
                </Button>
              </div>

              {/* Recent Events */}
              {scoringEvents.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h4 className="text-sm text-gray-400 mb-2">Recent Events</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {scoringEvents.slice(-5).reverse().map((event: any) => (
                      <div key={event.id} className="text-xs flex justify-between">
                        <span className={event.wrestler_id === 'wrestler1' ? 'text-green-400' : 'text-red-400'}>
                          {event.description}
                        </span>
                        <span className="text-gray-500">
                          @ {event.video_timestamp}s
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
              onRecordingStart={() => setIsRecording(true)}
              onRecordingStop={() => setIsRecording(false)}
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
                        // Keep auto-start disabled
                        // setAutoStart(true)
                      }}
                      className={recordingMode === 'auto' ? 'bg-gold text-black' : ''}
                      disabled
                    >
                      Auto (Disabled)
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