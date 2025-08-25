'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Play, Pause, SkipBack, SkipForward, Clock, Activity,
  Trophy, Flag, AlertCircle, ChevronLeft, ChevronRight,
  Video, List, BarChart3, Loader2
} from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'
import { supabase } from '@/lib/supabase'

const CloudflarePlayer = dynamic(() => import('@/components/cloudflare-player'), { 
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
      <p className="text-gray-400">Loading player...</p>
    </div>
  )
})

interface ScoringEvent {
  id: string
  timestamp: number
  videoTime: number // Seconds from video start
  type: string
  wrestler: 'wrestler1' | 'wrestler2'
  wrestlerName: string
  points: number
  description: string
  period: number
}

interface MatchVideo {
  id: string
  matchId: string
  videoId: string // Cloudflare Stream ID
  startTime: number
  duration: number
  events: ScoringEvent[]
}

export default function VideoReviewPage() {
  const [matches, setMatches] = useState<any[]>([])
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [matchVideo, setMatchVideo] = useState<MatchVideo | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<ScoringEvent | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<any>(null)

  // Fetch matches with videos
  const fetchMatches = async () => {
    setLoading(true)
    try {
      // Get matches from database
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (matchesError) throw matchesError

      // Get videos from Cloudflare
      const videosResponse = await fetch('/api/videos/list')
      const videosData = await videosResponse.json()

      // Match videos with matches by matchId
      const matchesWithVideos = matchesData?.map((match: any) => {
        const video = videosData.videos?.find((v: any) => 
          v.meta?.matchId === match.id || 
          v.title?.includes(match.id)
        )
        return {
          ...match,
          hasVideo: !!video,
          videoId: video?.id,
          videoDuration: video?.duration
        }
      }).filter((m: any) => m.hasVideo) // Only show matches with videos

      setMatches(matchesWithVideos || [])
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [])

  // Load match video and scoring data
  const loadMatchVideo = async (match: any) => {
    setSelectedMatch(match)
    
    // Get match events from database
    const { data: events, error } = await supabase
      .from('match_events')
      .select('*')
      .eq('match_id', match.id)
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('Error fetching match events:', error)
      return
    }

    // Convert events to scoring timeline
    const scoringEvents: ScoringEvent[] = events?.map((event: any, index: number) => {
      // Calculate video time based on event timestamp and match start
      const videoTime = Math.floor((event.timestamp - match.created_at) / 1000)
      
      return {
        id: event.id,
        timestamp: event.timestamp,
        videoTime: videoTime > 0 ? videoTime : index * 10, // Fallback to 10s intervals
        type: event.event_type,
        wrestler: event.wrestler_id,
        wrestlerName: event.wrestler_name || (event.wrestler_id === 'wrestler1' ? match.wrestler_name : match.opponent_name),
        points: event.points || 0,
        description: event.description || `${event.event_type} +${event.points}`,
        period: event.period || 1
      }
    }) || []

    setMatchVideo({
      id: match.id,
      matchId: match.id,
      videoId: match.videoId,
      startTime: match.created_at,
      duration: parseInt(match.videoDuration) || 0,
      events: scoringEvents
    })
  }

  // Jump to specific event time in video
  const jumpToEvent = (event: ScoringEvent) => {
    setSelectedEvent(event)
    
    // Jump to time in video
    if (playerRef.current) {
      // For Cloudflare Stream player
      playerRef.current.currentTime = event.videoTime
    } else if (videoRef.current) {
      // For HTML5 video
      videoRef.current.currentTime = event.videoTime
    }
    
    // Highlight the event
    setTimeout(() => setSelectedEvent(null), 3000)
  }

  // Format time for display
  const formatVideoTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get event color based on type
  const getEventColor = (type: string) => {
    switch(type.toLowerCase()) {
      case 'takedown': return 'bg-green-600'
      case 'escape': return 'bg-blue-600'
      case 'reversal': return 'bg-purple-600'
      case 'near_fall': return 'bg-yellow-600'
      case 'penalty': return 'bg-red-600'
      case 'pin': return 'bg-gold'
      default: return 'bg-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      <WrestlingStatsBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gold mb-2 flex items-center gap-3">
            <Video className="w-8 h-8" />
            Video Review & Analysis
          </h1>
          <p className="text-gray-400">
            Review match videos with synchronized scoring events
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-gold" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Match List */}
            <div className="lg:col-span-3">
              <Card className="bg-black/80 backdrop-blur-sm border-gold/30">
                <CardHeader>
                  <CardTitle className="text-gold flex items-center gap-2">
                    <List className="w-5 h-5" />
                    Matches with Video
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                  {matches.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No matches with video found</p>
                  ) : (
                    matches.map(match => (
                      <button
                        key={match.id}
                        onClick={() => loadMatchVideo(match)}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          selectedMatch?.id === match.id
                            ? 'bg-gold/20 border border-gold'
                            : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <Badge className="bg-green-600 text-xs">Has Video</Badge>
                          <span className="text-xs text-gray-400">
                            {new Date(match.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-white font-medium">
                          {match.wrestler_name || 'Wrestler 1'}
                        </p>
                        <p className="text-gray-400 text-sm">vs</p>
                        <p className="text-white font-medium">
                          {match.opponent_name || 'Wrestler 2'}
                        </p>
                        <div className="mt-2 flex justify-between text-lg font-bold">
                          <span className="text-green-500">{match.final_score_for || 0}</span>
                          <span className="text-gray-500">-</span>
                          <span className="text-red-500">{match.final_score_against || 0}</span>
                        </div>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Video Player and Timeline */}
            <div className="lg:col-span-6">
              {matchVideo ? (
                <div className="space-y-4">
                  {/* Video Player */}
                  <Card className="bg-black/80 backdrop-blur-sm border-gold/30">
                    <CardContent className="p-4">
                      <CloudflarePlayer 
                        videoId={matchVideo.videoId}
                        ref={playerRef}
                      />
                      
                      {/* Video Controls */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => jumpToEvent(matchVideo.events[0])}
                            disabled={!matchVideo.events.length}
                          >
                            <SkipBack className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsPlaying(!isPlaying)}
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const lastEvent = matchVideo.events[matchVideo.events.length - 1]
                              if (lastEvent) jumpToEvent(lastEvent)
                            }}
                            disabled={!matchVideo.events.length}
                          >
                            <SkipForward className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatVideoTime(currentTime)} / {matchVideo.duration}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Event Timeline */}
                  <Card className="bg-black/80 backdrop-blur-sm border-gold/30">
                    <CardHeader>
                      <CardTitle className="text-gold flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Scoring Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        {/* Timeline bar */}
                        <div className="absolute top-0 left-8 right-0 h-1 bg-gray-700 rounded"></div>
                        
                        {/* Events on timeline */}
                        <div className="space-y-2 mt-4">
                          {matchVideo.events.map((event, index) => (
                            <button
                              key={event.id}
                              onClick={() => jumpToEvent(event)}
                              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-gold/10 ${
                                selectedEvent?.id === event.id ? 'bg-gold/20 border border-gold' : ''
                              }`}
                            >
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getEventColor(event.type)}`}>
                                +{event.points}
                              </div>
                              <div className="flex-1 text-left">
                                <p className="text-white font-medium">{event.description}</p>
                                <p className="text-gray-400 text-sm">{event.wrestlerName}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-gold text-sm">{formatVideoTime(event.videoTime)}</p>
                                <p className="text-gray-500 text-xs">Period {event.period}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-black/80 backdrop-blur-sm border-gold/30">
                  <CardContent className="py-16">
                    <div className="text-center">
                      <Video className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Select a match to review</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Stats Panel */}
            <div className="lg:col-span-3">
              {matchVideo && (
                <Card className="bg-black/80 backdrop-blur-sm border-gold/30">
                  <CardHeader>
                    <CardTitle className="text-gold flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Match Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Score Summary */}
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <p className="text-gray-400 text-sm mb-2">Final Score</p>
                      <div className="flex justify-around text-2xl font-bold">
                        <span className="text-green-500">{selectedMatch?.final_score_for || 0}</span>
                        <span className="text-gray-500">-</span>
                        <span className="text-red-500">{selectedMatch?.final_score_against || 0}</span>
                      </div>
                    </div>

                    {/* Event Breakdown */}
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">Scoring Breakdown</p>
                      {Object.entries(
                        matchVideo.events.reduce((acc, event) => {
                          acc[event.type] = (acc[event.type] || 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                      ).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-gray-300 capitalize">{type.replace('_', ' ')}</span>
                          <Badge className={getEventColor(type)}>{count}</Badge>
                        </div>
                      ))}
                    </div>

                    {/* Period Summary */}
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">Period Scores</p>
                      {[1, 2, 3].map(period => {
                        const periodEvents = matchVideo.events.filter(e => e.period === period)
                        const periodScore = periodEvents.reduce((sum, e) => 
                          sum + (e.wrestler === 'wrestler1' ? e.points : -e.points), 0
                        )
                        return (
                          <div key={period} className="flex justify-between items-center">
                            <span className="text-gray-300">Period {period}</span>
                            <span className={`font-bold ${periodScore > 0 ? 'text-green-500' : periodScore < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                              {periodScore > 0 ? '+' : ''}{periodScore}
                            </span>
                          </div>
                        )
                      })}
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