'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, Pause, SkipBack, SkipForward, Clock, Activity,
  Trophy, Video, BarChart3, Loader2, Target, Shield,
  ChevronUp, Zap, Award, Timer, TrendingUp, Flag
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
  video_timestamp: number
  event_type: string
  wrestler_id: string
  wrestler_name: string
  points: number
  description: string
  period: number
  event_time?: number
}

interface MatchData {
  id: string
  wrestler_name: string
  opponent_name: string
  final_score_for: number
  final_score_against: number
  video_id?: string
  video_url?: string
  cloudflare_video_id?: string
  created_at: string
  event_name?: string
  weight_class?: string
}

export default function ScoringBreakdownPage() {
  const params = useParams()
  const matchId = params.matchId as string
  
  const [match, setMatch] = useState<MatchData | null>(null)
  const [events, setEvents] = useState<ScoringEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<ScoringEvent | null>(null)
  const [periodScores, setPeriodScores] = useState<{[key: number]: {wrestler1: number, wrestler2: number}}>({})
  
  const playerRef = useRef<any>(null)

  // Fetch match and events data
  useEffect(() => {
    fetchMatchData()
  }, [matchId])

  const fetchMatchData = async () => {
    setLoading(true)
    try {
      // Get match details
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single()

      if (matchError) throw matchError
      
      console.log('Match data:', matchData)
      setMatch(matchData)

      // Get match events
      const { data: eventsData, error: eventsError } = await supabase
        .from('match_events')
        .select('*')
        .eq('match_id', matchId)
        .order('video_timestamp', { ascending: true })

      if (eventsError) {
        console.error('Error fetching events:', eventsError)
        setEvents([])
      } else {
        console.log('Events data:', eventsData)
        setEvents(eventsData || [])
        // Pass the match data to calculatePeriodScores
        calculatePeriodScores(eventsData || [], matchData)
      }
    } catch (error) {
      console.error('Error fetching match data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate scores by period
  const calculatePeriodScores = (events: ScoringEvent[], matchData?: MatchData) => {
    const scores: {[key: number]: {wrestler1: number, wrestler2: number}} = {
      1: { wrestler1: 0, wrestler2: 0 },
      2: { wrestler1: 0, wrestler2: 0 },
      3: { wrestler1: 0, wrestler2: 0 }
    }

    const currentMatch = matchData || match
    
    events.forEach(event => {
      const period = event.period || 1
      // Debug log
      console.log('Processing event:', {
        wrestler_id: event.wrestler_id,
        wrestler_name: event.wrestler_name,
        points: event.points,
        period: period,
        match_wrestler: currentMatch?.wrestler_name,
        match_opponent: currentMatch?.opponent_name
      })
      
      // Check if this event is for the main wrestler or opponent
      const isMainWrestler = 
        event.wrestler_id === 'wrestler1' || 
        event.wrestler_id === '1' ||
        event.wrestler_name === currentMatch?.wrestler_name ||
        (event.wrestler_name && currentMatch?.wrestler_name && 
         event.wrestler_name.toLowerCase().includes(currentMatch.wrestler_name.toLowerCase()))
      
      if (isMainWrestler) {
        scores[period].wrestler1 += event.points
      } else {
        scores[period].wrestler2 += event.points
      }
    })
    
    console.log('Period scores calculated:', scores)
    setPeriodScores(scores)
  }

  // Jump to specific event time in video
  const jumpToEvent = (event: ScoringEvent) => {
    setSelectedEvent(event)
    
    if (playerRef.current) {
      playerRef.current.currentTime = event.video_timestamp
    }
    
    // Highlight for 3 seconds
    setTimeout(() => setSelectedEvent(null), 3000)
  }

  // Format time for display
  const formatVideoTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get event icon
  const getEventIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'takedown': return <Target className="w-4 h-4" />
      case 'escape': return <ChevronUp className="w-4 h-4" />
      case 'reversal': return <Shield className="w-4 h-4" />
      case 'near_fall': return <Zap className="w-4 h-4" />
      case 'penalty': return <Flag className="w-4 h-4" />
      case 'pin': return <Award className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  // Get event color
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gold" />
      </div>
    )
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative flex items-center justify-center">
        <p className="text-gray-400">Match not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      <WrestlingStatsBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gold mb-2 flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            Match Scoring Breakdown
          </h1>
          <div className="flex items-center gap-4 text-gray-400">
            <span>{match.event_name || 'Match'}</span>
            {match.weight_class && <span>• {match.weight_class}</span>}
            <span>• {new Date(match.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Match Score Header */}
        <Card className="bg-black/80 backdrop-blur-sm border-gold/30 mb-6">
          <CardContent className="py-6">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <p className="text-gray-400 text-sm mb-1">Wrestler</p>
                <p className="text-white text-xl font-bold">{match.wrestler_name}</p>
                <p className="text-green-500 text-3xl font-bold mt-2">{match.final_score_for}</p>
              </div>
              <div className="text-gray-500 text-2xl">vs</div>
              <div className="text-center flex-1">
                <p className="text-gray-400 text-sm mb-1">Opponent</p>
                <p className="text-white text-xl font-bold">{match.opponent_name}</p>
                <p className="text-red-500 text-3xl font-bold mt-2">{match.final_score_against}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-7">
            {(() => {
              // Extract video ID from various possible fields
              let videoId = match.video_id || match.cloudflare_video_id
              let videoUrl = match.video_url
              
              // If we have a video_url, extract the ID from it
              if (!videoId && videoUrl) {
                // Extract ID from URLs like:
                // https://customer-xxx.cloudflarestream.com/VIDEO_ID/manifest/video.m3u8
                // https://videodelivery.net/VIDEO_ID/manifest/video.m3u8
                const urlMatch = videoUrl.match(/\/([a-f0-9]{32})\//)
                if (urlMatch) {
                  videoId = urlMatch[1]
                }
              }
              
              // Build proper video URLs
              if (videoId) {
                // Use the iframe embed URL for Cloudflare Stream
                const embedUrl = `https://iframe.videodelivery.net/${videoId}`
                const hlsUrl = `https://videodelivery.net/${videoId}/manifest/video.m3u8`
                
                return (
                  <Card className="bg-black/80 backdrop-blur-sm border-gold/30">
                    <CardContent className="p-4">
                      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                        <iframe
                          ref={playerRef}
                          src={embedUrl}
                          className="w-full h-full"
                          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Video ID: {videoId}
                      </div>
                    </CardContent>
                  </Card>
                )
              } else if (videoUrl) {
                // Fallback to direct video URL if available
                return (
                  <Card className="bg-black/80 backdrop-blur-sm border-gold/30">
                    <CardContent className="p-4">
                      <video
                        ref={playerRef}
                        src={videoUrl}
                        controls
                        className="w-full aspect-video bg-black rounded-lg"
                      />
                    </CardContent>
                  </Card>
                )
              } else {
                return (
                  <Card className="bg-black/80 backdrop-blur-sm border-gold/30">
                    <CardContent className="py-16">
                      <div className="text-center">
                        <Video className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">No video available for this match</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              }
            })()}

            {/* Period Breakdown */}
            <Card className="bg-black/80 backdrop-blur-sm border-gold/30 mt-4">
              <CardHeader>
                <CardTitle className="text-gold flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  Period Scoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map(period => (
                    <div key={period} className="text-center p-3 bg-gray-900/50 rounded-lg">
                      <p className="text-gray-400 text-sm mb-2">Period {period}</p>
                      <div className="flex justify-center items-center gap-2">
                        <span className="text-green-500 font-bold">
                          {periodScores[period]?.wrestler1 || 0}
                        </span>
                        <span className="text-gray-500">-</span>
                        <span className="text-red-500 font-bold">
                          {periodScores[period]?.wrestler2 || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scoring Timeline */}
          <div className="lg:col-span-5">
            <Card className="bg-black/80 backdrop-blur-sm border-gold/30">
              <CardHeader>
                <CardTitle className="text-gold flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Complete Scoring Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {events.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No scoring events recorded</p>
                  ) : (
                    events.map((event, index) => (
                      <button
                        key={event.id}
                        onClick={() => jumpToEvent(event)}
                        className={`w-full p-3 rounded-lg transition-all hover:bg-gold/10 ${
                          selectedEvent?.id === event.id ? 'bg-gold/20 border border-gold' : 'bg-gray-900/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Event Icon & Points */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getEventColor(event.event_type)}`}>
                            +{event.points}
                          </div>

                          {/* Event Details */}
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-1">
                              {getEventIcon(event.event_type)}
                              <span className="text-white font-medium capitalize">
                                {event.event_type.replace('_', ' ')}
                              </span>
                            </div>
                            <p className={`text-sm ${
                              event.wrestler_id === 'wrestler1' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {event.wrestler_name}
                            </p>
                          </div>

                          {/* Time & Period */}
                          <div className="text-right">
                            <p className="text-gold text-sm font-medium">
                              {formatVideoTime(event.video_timestamp)}
                            </p>
                            <p className="text-gray-500 text-xs">
                              Period {event.period}
                            </p>
                          </div>
                        </div>

                        {/* Running Score */}
                        <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between text-xs">
                          <span className="text-gray-400">After this:</span>
                          <span className="font-bold">
                            <span className="text-green-500">
                              {events.slice(0, index + 1)
                                .filter(e => e.wrestler_id === 'wrestler1')
                                .reduce((sum, e) => sum + e.points, 0)}
                            </span>
                            <span className="text-gray-500 mx-1">-</span>
                            <span className="text-red-500">
                              {events.slice(0, index + 1)
                                .filter(e => e.wrestler_id === 'wrestler2')
                                .reduce((sum, e) => sum + e.points, 0)}
                            </span>
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Statistics Summary */}
                {events.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h4 className="text-sm text-gray-400 mb-3">Move Statistics</h4>
                    <div className="space-y-2">
                      {Object.entries(
                        events.reduce((acc, event) => {
                          const key = event.event_type
                          if (!acc[key]) {
                            acc[key] = { count: 0, points: 0 }
                          }
                          acc[key].count++
                          acc[key].points += event.points
                          return acc
                        }, {} as Record<string, {count: number, points: number}>)
                      ).map(([type, stats]) => (
                        <div key={type} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {getEventIcon(type)}
                            <span className="text-gray-300 capitalize">
                              {type.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={getEventColor(type)}>
                              {stats.count}x
                            </Badge>
                            <span className="text-gray-400 text-sm">
                              {stats.points} pts
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}