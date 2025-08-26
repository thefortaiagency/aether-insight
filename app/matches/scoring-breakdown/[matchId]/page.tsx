'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, Pause, SkipBack, SkipForward, Clock, Activity,
  Trophy, Video, BarChart3, Loader2, Target, Shield,
  ChevronUp, Zap, Award, Timer, TrendingUp, Flag, AlertCircle
} from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'
import { supabase } from '@/lib/supabase'
// Removed CloudflarePlayer import - using iframe directly for better compatibility

interface ScoringEvent {
  id: string
  timestamp?: number
  video_timestamp?: number
  event_type: string
  wrestler_id: string
  wrestler_name?: string
  points?: number
  points_scored?: number  // Alternative field name
  description?: string
  period?: number
  event_time?: number
  notes?: string  // Alternative field for wrestler info
}

interface MatchData {
  id: string
  // Support both naming conventions
  wrestler1_name?: string
  wrestler2_name?: string
  wrestler1_team?: string
  wrestler2_team?: string
  wrestler1_score?: number
  wrestler2_score?: number
  // Alternative field names (from your actual data)
  wrestler_name?: string
  wrestler_id?: string | null
  opponent_name?: string
  opponent_wrestler_id?: string | null
  opponent_team?: string
  final_score_for?: number
  final_score_against?: number
  // Video fields
  video_id?: string
  video_url?: string
  cloudflare_video_id?: string | null
  has_video?: boolean
  created_at: string
  event_name?: string
  event_id?: string | null
  weight_class?: string | number
  match_date?: string
  match_type?: string
  referee_name?: string
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
  const [videoError, setVideoError] = useState<string | null>(null)

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

      if (matchError) {
        console.error('Match fetch error:', matchError)
        return
      }
      
      console.log('Raw match data from database:', matchData)
      
      // If no video_id in database, try to fetch from Cloudflare API
      let enhancedMatchData = { ...matchData }
      if (!matchData.video_id && !matchData.cloudflare_video_id) {
        try {
          const videosResponse = await fetch('/api/videos/list')
          const videosData = await videosResponse.json()
          
          // Try to find a video for this match
          const matchVideo = videosData.videos?.find((v: any) => 
            v.meta?.matchId === matchId || 
            v.meta?.match_id === matchId ||
            v.title?.includes(matchId)
          )
          
          if (matchVideo) {
            enhancedMatchData.video_id = matchVideo.id
            enhancedMatchData.has_video = true
            console.log('Found video from Cloudflare:', matchVideo.id)
          }
        } catch (error) {
          console.error('Error fetching videos from Cloudflare:', error)
        }
      }
      
      setMatch(enhancedMatchData)

      // Get match events
      const { data: eventsData, error: eventsError } = await supabase
        .from('match_events')
        .select('*')
        .eq('match_id', matchId)
        .order('video_timestamp', { ascending: true })

      console.log('Raw events data from database:', eventsData)

      if (!eventsError && eventsData) {
        // Process events to ensure we have proper wrestler names
        const processedEvents = eventsData.map((event: any) => {
          // Get points from either field
          const points = event.points || event.points_scored || 0
          
          // Fix wrestler_name if it's "wrestler1" or "wrestler2"
          let wrestlerName = event.wrestler_name
          if (wrestlerName === 'wrestler1' || wrestlerName === 'Wrestler 1') {
            // For the primary wrestler, we might not have a name stored
            wrestlerName = matchData.wrestler1_name || matchData.wrestler_name || 'Wrestler'
          } else if (wrestlerName === 'wrestler2' || wrestlerName === 'Wrestler 2') {
            wrestlerName = matchData.wrestler2_name || matchData.opponent_name || 'Opponent'
          }
          
          // If no wrestler_name, try to extract from notes
          if (!wrestlerName && event.notes) {
            const noteParts = event.notes.split(' - ')
            if (noteParts.length > 0) {
              wrestlerName = noteParts[0]
            }
          }
          
          return {
            ...event,
            wrestler_name: wrestlerName,
            points: points,
            video_timestamp: event.video_timestamp || 0
          }
        })
        
        setEvents(processedEvents)
        calculatePeriodScores(processedEvents, matchData)
      }
    } catch (error) {
      console.error('Error fetching match data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculatePeriodScores = (events: ScoringEvent[], matchData: MatchData) => {
    const scores: {[key: number]: {wrestler1: number, wrestler2: number}} = {
      1: { wrestler1: 0, wrestler2: 0 },
      2: { wrestler1: 0, wrestler2: 0 },
      3: { wrestler1: 0, wrestler2: 0 }
    }

    // Get the wrestler names from the match data - normalize to handle different formats
    const wrestler1Name = (matchData.wrestler1_name || matchData.wrestler_name || '').trim().toLowerCase()
    const wrestler2Name = (matchData.wrestler2_name || matchData.opponent_name || '').trim().toLowerCase()

    console.log('Match wrestlers:', { 
      wrestler1: matchData.wrestler1_name || matchData.wrestler_name,
      wrestler2: matchData.wrestler2_name || matchData.opponent_name
    })

    events.forEach(event => {
      const period = event.period || 1
      const points = event.points || event.points_scored || 0
      const eventWrestlerName = (event.wrestler_name || '').trim().toLowerCase()
      
      // Comprehensive matching logic
      let isWrestler1 = false
      
      // Check by ID first (most reliable)
      if (event.wrestler_id) {
        if (event.wrestler_id === 'wrestler1' || event.wrestler_id === '1') {
          isWrestler1 = true
        } else if (event.wrestler_id === 'wrestler2' || event.wrestler_id === '2') {
          isWrestler1 = false
        } else if (event.wrestler_id === matchData.id) {
          // Sometimes the ID might be the match owner's ID
          isWrestler1 = true
        }
      }
      
      // If no clear ID match, check by name
      if (event.wrestler_id === undefined || (event.wrestler_id !== 'wrestler1' && event.wrestler_id !== 'wrestler2' && event.wrestler_id !== '1' && event.wrestler_id !== '2')) {
        if (eventWrestlerName && wrestler1Name) {
          // Check if event wrestler matches wrestler1
          if (eventWrestlerName === wrestler1Name || 
              eventWrestlerName.includes(wrestler1Name) || 
              wrestler1Name.includes(eventWrestlerName)) {
            isWrestler1 = true
          } else if (wrestler2Name && 
                    (eventWrestlerName === wrestler2Name || 
                     eventWrestlerName.includes(wrestler2Name) || 
                     wrestler2Name.includes(eventWrestlerName))) {
            isWrestler1 = false
          }
        }
      }
      
      console.log('Event:', {
        type: event.event_type,
        wrestler: event.wrestler_name,
        wrestler_id: event.wrestler_id,
        points: event.points,
        period: period,
        assignedTo: isWrestler1 ? 'wrestler1' : 'wrestler2'
      })
      
      if (isWrestler1) {
        scores[period].wrestler1 += points
      } else {
        scores[period].wrestler2 += points
      }
    })
    
    // Calculate totals
    const totalWrestler1 = scores[1].wrestler1 + scores[2].wrestler1 + scores[3].wrestler1
    const totalWrestler2 = scores[1].wrestler2 + scores[2].wrestler2 + scores[3].wrestler2
    
    console.log('Period scores:', scores)
    console.log('Totals:', { wrestler1: totalWrestler1, wrestler2: totalWrestler2 })
    
    setPeriodScores(scores)
  }

  const jumpToEvent = (event: ScoringEvent) => {
    setSelectedEvent(event)
    
    // Jump to timestamp using Cloudflare iframe API
    if (playerRef.current) {
      const videoInfo = getVideoInfo()
      if (videoInfo?.videoId) {
        // Update the iframe src to jump to timestamp
        const timestamp = event.video_timestamp || 0
        playerRef.current.src = `https://iframe.videodelivery.net/${videoInfo.videoId}?muted=false&preload=true&autoplay=true&controls=true&primaryColor=D4AF38&currentTime=${timestamp}`
      }
    }
    
    setTimeout(() => setSelectedEvent(null), 3000)
  }

  const formatVideoTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getEventIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'takedown': return <Target className="w-4 h-4" />
      case 'escape': return <ChevronUp className="w-4 h-4" />
      case 'reversal': return <Shield className="w-4 h-4" />
      case 'near_fall': return <Zap className="w-4 h-4" />
      case 'penalty': return <Flag className="w-4 h-4" />
      default: return <Trophy className="w-4 h-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch(type.toLowerCase()) {
      case 'takedown': return 'bg-blue-600'
      case 'escape': return 'bg-green-600'
      case 'reversal': return 'bg-purple-600'
      case 'near_fall': return 'bg-orange-600'
      case 'penalty': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  // Get wrestler names with fallbacks - handle missing wrestler_name field
  const getWrestlerNames = () => {
    if (!match) return { wrestler1: 'Wrestler', wrestler2: 'Opponent' }
    
    // Based on the actual data structure, we may not have a wrestler_name field at all
    // The match seems to be recorded from one wrestler's perspective
    let wrestler1Name = match.wrestler1_name || match.wrestler_name
    let wrestler2Name = match.wrestler2_name || match.opponent_name
    
    // If no wrestler1 name at all, we might need to infer it
    if (!wrestler1Name || wrestler1Name === 'Wrestler 1' || wrestler1Name === 'wrestler1') {
      // Try to get from events or just use "Wrestler" as fallback
      wrestler1Name = 'Wrestler' // The primary wrestler's name might not be stored
    }
    
    if (!wrestler2Name || wrestler2Name === 'Wrestler 2' || wrestler2Name === 'wrestler2') {
      wrestler2Name = match.opponent_name || 'Opponent'
    }
    
    console.log('Resolved wrestler names:', { wrestler1: wrestler1Name, wrestler2: wrestler2Name })
    
    return {
      wrestler1: wrestler1Name,
      wrestler2: wrestler2Name
    }
  }

  // Get final scores with fallbacks
  const getFinalScores = () => {
    if (!match) return { score1: 0, score2: 0 }
    
    // If we have wrestler1_score and wrestler2_score, use those
    if (match.wrestler1_score !== undefined && match.wrestler2_score !== undefined) {
      return {
        score1: match.wrestler1_score,
        score2: match.wrestler2_score
      }
    }
    
    // Otherwise use final_score_for and final_score_against
    return {
      score1: match.final_score_for || 0,
      score2: match.final_score_against || 0
    }
  }

  // Extract video ID from various sources with better validation
  const getVideoInfo = () => {
    if (!match) return null
    
    // Debug log all video fields
    console.log('Match video fields:', {
      video_id: match.video_id,
      cloudflare_video_id: match.cloudflare_video_id,
      video_url: match.video_url,
      has_video: match.has_video,
      all_fields: Object.keys(match).filter(k => k.includes('video'))
    })
    
    let videoId = match.video_id || match.cloudflare_video_id
    let videoUrl = match.video_url
    
    // Extract ID from URL if needed
    if (!videoId && videoUrl) {
      // Try multiple patterns
      const patterns = [
        /videodelivery\.net\/([a-f0-9]{32})/,
        /cloudflarestream\.com\/([a-f0-9]{32})/,
        /\/([a-f0-9]{32})\//,
        /video_id=([a-f0-9]{32})/
      ]
      
      for (const pattern of patterns) {
        const urlMatch = videoUrl.match(pattern)
        if (urlMatch && urlMatch[1]) {
          videoId = urlMatch[1]
          console.log('Extracted video ID from URL:', videoId)
          break
        }
      }
    }
    
    // Validate the video ID format - allow different lengths for Cloudflare IDs
    if (videoId && !/^[a-f0-9-]+$/.test(videoId)) {
      console.warn('Invalid video ID format:', videoId)
      setVideoError('Invalid video ID format')
      return null
    }
    
    console.log('Final video info:', { videoId, videoUrl, hasVideo: match.has_video })
    return videoId ? { videoId, videoUrl } : null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gold animate-spin" />
      </div>
    )
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <p className="text-white">Match not found</p>
      </div>
    )
  }

  const { wrestler1, wrestler2 } = getWrestlerNames()
  const { score1, score2 } = getFinalScores()
  const videoInfo = getVideoInfo()
  
  // Log for debugging
  useEffect(() => {
    if (match) {
      console.log('Scoring breakdown - match data:', match)
      console.log('Scoring breakdown - video info:', videoInfo)
    }
  }, [match, videoInfo])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      <WrestlingStatsBackground />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gold mb-2">Match Breakdown</h1>
          <div className="flex items-center gap-4 text-gray-400">
            <span>{match.event_name || 'Match'}</span>
            {match.weight_class && <span>• {match.weight_class} lbs</span>}
            <span>• {new Date(match.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Match Score Header */}
        <Card className="bg-black/80 backdrop-blur-sm border-gold/30 mb-6">
          <CardContent className="py-6">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <p className="text-gray-400 text-sm mb-1">Wrestler</p>
                <p className="text-white text-xl font-bold">{wrestler1}</p>
                <p className="text-green-500 text-3xl font-bold mt-2">{score1}</p>
              </div>
              <div className="text-gray-500 text-2xl">vs</div>
              <div className="text-center flex-1">
                <p className="text-gray-400 text-sm mb-1">Opponent</p>
                <p className="text-white text-xl font-bold">{wrestler2}</p>
                <p className="text-red-500 text-3xl font-bold mt-2">{score2}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-7">
            {videoInfo?.videoId ? (
              <Card className="bg-black/80 backdrop-blur-sm border-gold/30">
                <CardContent className="p-4">
                  {/* Use iframe directly for better compatibility */}
                  <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      ref={playerRef as any}
                      src={`https://iframe.videodelivery.net/${videoInfo.videoId}?muted=false&preload=true&autoplay=false&controls=true&primaryColor=D4AF38`}
                      className="w-full h-full"
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Video ID: {videoInfo.videoId}
                    </div>
                    {match.has_video && (
                      <Badge variant="outline" className="text-green-500 border-green-500">
                        Video Available
                      </Badge>
                    )}
                  </div>
                  {videoError && (
                    <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded">
                      <p className="text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {videoError}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-black/80 backdrop-blur-sm border-gold/30">
                <CardContent className="py-16">
                  <div className="text-center">
                    <Video className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No video available for this match</p>
                    {match.has_video && (
                      <p className="text-yellow-400 text-sm">
                        Video marked as available but ID not found
                      </p>
                    )}
                    {videoError && (
                      <p className="text-red-400 text-sm mt-2">{videoError}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

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
                    events.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => jumpToEvent(event)}
                        className={`w-full p-3 rounded-lg transition-all hover:bg-gold/10 ${
                          selectedEvent?.id === event.id ? 'bg-gold/20 border border-gold' : 'bg-gray-900/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getEventColor(event.event_type)}`}>
                            +{event.points || event.points_scored || 0}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              {getEventIcon(event.event_type)}
                              <span className="text-white font-medium capitalize">
                                {event.event_type.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400">
                              {event.wrestler_name || 'Unknown'} • Period {event.period || 1}
                            </p>
                            {event.description && (
                              <p className="text-xs text-gray-500 mt-1">{event.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-gold text-sm">{formatVideoTime(event.video_timestamp || 0)}</p>
                            {videoInfo?.videoId && (
                              <p className="text-xs text-gray-500 mt-1">Click to jump</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}