'use client'

import { useState, useEffect } from 'react'
import { EnhancedVideoPlayer } from '@/components/video/enhanced-video-player'
import { VideoTimeline } from '@/components/video/video-timeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'
import {
  Video, Trophy, Clock, TrendingUp, Users, Award,
  Upload, Link, Save, Share2, Download, Settings
} from 'lucide-react'

// Mock data for demonstration
const mockEvents = [
  { id: '1', time: 15, period: 1, periodTime: '1:45', wrestler: 'Smith, John', action: 'Takedown', points: 2, score: { wrestler1: 2, wrestler2: 0 } },
  { id: '2', time: 45, period: 1, periodTime: '1:15', wrestler: 'Johnson, Mike', action: 'Escape', points: 1, score: { wrestler1: 2, wrestler2: 1 } },
  { id: '3', time: 78, period: 1, periodTime: '0:42', wrestler: 'Smith, John', action: 'Takedown', points: 2, score: { wrestler1: 4, wrestler2: 1 } },
  { id: '4', time: 140, period: 2, periodTime: '1:40', wrestler: 'Johnson, Mike', action: 'Reversal', points: 2, score: { wrestler1: 4, wrestler2: 3 } },
  { id: '5', time: 180, period: 2, periodTime: '1:00', wrestler: 'Smith, John', action: 'Near Fall', points: 3, score: { wrestler1: 7, wrestler2: 3 } },
  { id: '6', time: 250, period: 3, periodTime: '1:30', wrestler: 'Johnson, Mike', action: 'Escape', points: 1, score: { wrestler1: 7, wrestler2: 4 } },
  { id: '7', time: 290, period: 3, periodTime: '0:50', wrestler: 'Smith, John', action: 'Takedown', points: 2, score: { wrestler1: 9, wrestler2: 4 } },
  { id: '8', time: 320, period: 3, periodTime: '0:20', wrestler: 'Johnson, Mike', action: 'Stalling', points: 1, score: { wrestler1: 10, wrestler2: 4 } },
]

export default function VideoAnalysisPage() {
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [currentVideoTime, setCurrentVideoTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(360) // 6 minutes
  const [matchData, setMatchData] = useState<any>(null)
  const [events, setEvents] = useState(mockEvents)
  const [newMarkers, setNewMarkers] = useState<any[]>([])

  const handleVideoSeek = (time: number) => {
    // This would be connected to the video player ref
    setCurrentVideoTime(time)
  }

  const handleEventMarked = (time: number, eventType: string) => {
    const newMarker = {
      time,
      label: eventType,
      color: '#D4AF38'
    }
    setNewMarkers([...newMarkers, newMarker])
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setVideoUrl(url)
    }
  }

  const handleVideoLink = () => {
    const url = prompt('Enter video URL (YouTube, Cloudflare Stream, etc.):')
    if (url) {
      setVideoUrl(url)
    }
  }

  const exportAnalysis = () => {
    const analysis = {
      match: matchData,
      events,
      markers: newMarkers,
      videoDuration,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `match-analysis-${Date.now()}.json`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      <WrestlingStatsBackground />
      
      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gold mb-2">Video Analysis</h1>
          <p className="text-gray-400">Sync video with match scoring for detailed analysis</p>
        </div>

        {/* Video Upload/Link Section */}
        {!videoUrl && (
          <Card className="bg-black/80 backdrop-blur-sm border-gold/30 mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-gold">Load Video</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="block">
                    <div className="w-full bg-gold hover:bg-gold/90 text-black cursor-pointer px-4 py-2 rounded-md font-medium flex items-center justify-center">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Video
                    </div>
                  </label>
                </div>
                <div className="flex-1">
                  <Button
                    onClick={handleVideoLink}
                    className="w-full"
                    variant="outline"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Link Video URL
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {videoUrl && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Video Player - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-black/80 backdrop-blur-sm border-gold/30">
                <CardContent className="p-0">
                  <EnhancedVideoPlayer
                    videoUrl={videoUrl}
                    onTimeUpdate={setCurrentVideoTime}
                    onEventMarked={handleEventMarked}
                    markers={[
                      ...events.map(e => ({
                        time: e.time,
                        label: `${e.wrestler} - ${e.action}`,
                        color: e.points > 0 ? '#10B981' : '#EF4444'
                      })),
                      ...newMarkers
                    ]}
                  />
                </CardContent>
              </Card>

              {/* Video Timeline */}
              <VideoTimeline
                events={events}
                currentTime={currentVideoTime}
                duration={videoDuration}
                onSeek={handleVideoSeek}
                wrestler1Name="Smith, John"
                wrestler2Name="Johnson, Mike"
              />
            </div>

            {/* Right Sidebar - Analysis Tools */}
            <div className="space-y-4">
              {/* Match Info */}
              <Card className="bg-black/80 backdrop-blur-sm border-gold/30">
                <CardHeader>
                  <CardTitle className="text-lg text-gold flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Match Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400">Weight Class</p>
                      <p className="text-white font-bold">132 lbs</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Final Score</p>
                      <p className="text-2xl font-bold text-white">10 - 4</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Badge className="bg-green-600 text-white w-full justify-center">
                          Smith, John
                        </Badge>
                        <p className="text-xs text-gray-400 text-center mt-1">Winner</p>
                      </div>
                      <div>
                        <Badge className="bg-red-600 text-white w-full justify-center">
                          Johnson, Mike
                        </Badge>
                        <p className="text-xs text-gray-400 text-center mt-1">Opponent</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-black/80 backdrop-blur-sm border-gold/30">
                <CardHeader>
                  <CardTitle className="text-lg text-gold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Takedowns</span>
                      <span className="text-white font-bold">4 - 0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Escapes</span>
                      <span className="text-white font-bold">0 - 2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reversals</span>
                      <span className="text-white font-bold">0 - 1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Near Falls</span>
                      <span className="text-white font-bold">1 - 0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Riding Time</span>
                      <span className="text-white font-bold">2:15 - 0:45</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Tools */}
              <Card className="bg-black/80 backdrop-blur-sm border-gold/30">
                <CardHeader>
                  <CardTitle className="text-lg text-gold flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-gold hover:bg-gold/90 text-black"
                      onClick={exportAnalysis}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Analysis
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Video
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Save className="w-4 h-4 mr-2" />
                      Save Markers
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* New Markers */}
              {newMarkers.length > 0 && (
                <Card className="bg-black/80 backdrop-blur-sm border-gold/30">
                  <CardHeader>
                    <CardTitle className="text-lg text-gold">New Markers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {newMarkers.map((marker, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-400">
                            {Math.floor(marker.time / 60)}:{String(Math.floor(marker.time % 60)).padStart(2, '0')}
                          </span>
                          <span className="text-white">{marker.label}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}