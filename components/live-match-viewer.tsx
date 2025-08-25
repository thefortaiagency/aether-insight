'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { 
  Trophy, Users, Activity, Clock, Radio, Eye, 
  Bell, BellOff, Maximize2, Minimize2
} from 'lucide-react'

interface LiveMatchViewerProps {
  matchId?: string
  onSelectMatch?: (matchId: string) => void
}

interface LiveMatch {
  id: string
  wrestler1_name: string
  wrestler1_team: string
  wrestler1_score: number
  wrestler2_name: string
  wrestler2_team: string
  wrestler2_score: number
  weight_class: number
  mat_number: string
  period: number
  match_time: number
  status: string
  lastUpdate?: string
}

export default function LiveMatchViewer({ matchId, onSelectMatch }: LiveMatchViewerProps) {
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([])
  const [selectedMatch, setSelectedMatch] = useState<LiveMatch | null>(null)
  const [notifications, setNotifications] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    // Fetch initial live matches
    fetchLiveMatches()

    // Set up real-time subscription for matches table only
    const channel = supabase
      .channel('live-matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: 'status=eq.in_progress'
        },
        (payload: any) => {
          handleRealtimeUpdate(payload)
        }
      )
      .subscribe()

    setSubscription(channel)

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [])

  useEffect(() => {
    if (matchId) {
      // Subscribe to specific match updates
      const channel = supabase
        .channel(`match-${matchId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'matches',
            filter: `id=eq.${matchId}`
          },
          (payload: any) => {
            handleSpecificMatchUpdate(payload)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [matchId])

  const fetchLiveMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })

    if (data && !error) {
      setLiveMatches(data.map((match: any) => ({
        id: match.id,
        wrestler1_name: match.wrestler_name || match.wrestler1_name || 'Wrestler 1',
        wrestler1_team: match.wrestler_team || match.wrestler1_team || '',
        wrestler1_score: match.final_score_for || 0,
        wrestler2_name: match.opponent_name || match.wrestler2_name || 'Wrestler 2',
        wrestler2_team: match.opponent_team || match.wrestler2_team || '',
        wrestler2_score: match.final_score_against || 0,
        weight_class: match.weight_class,
        mat_number: match.mat_number || '1',
        period: 1,
        match_time: 120,
        status: match.status || 'in_progress'
      })))
    }
  }

  const handleRealtimeUpdate = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      // New match started
      const newMatch: LiveMatch = {
        id: payload.new.id,
        wrestler1_name: payload.new.wrestler_name || 'Wrestler 1',
        wrestler1_team: payload.new.wrestler_team || '',
        wrestler1_score: 0,
        wrestler2_name: payload.new.opponent_name || 'Wrestler 2',
        wrestler2_team: payload.new.opponent_team || '',
        wrestler2_score: 0,
        weight_class: payload.new.weight_class,
        mat_number: payload.new.mat_number || '1',
        period: 1,
        match_time: 120,
        status: 'in_progress'
      }
      
      setLiveMatches(prev => [newMatch, ...prev])
      
      if (notifications) {
        showNotification(`New match started: ${newMatch.wrestler1_name} vs ${newMatch.wrestler2_name}`)
      }
    } else if (payload.eventType === 'UPDATE') {
      // Match updated
      setLiveMatches(prev => prev.map(match => {
        if (match.id === payload.new.id) {
          return {
            ...match,
            wrestler1_score: payload.new.final_score_for || match.wrestler1_score,
            wrestler2_score: payload.new.final_score_against || match.wrestler2_score,
            status: payload.new.status || match.status
          }
        }
        return match
      }))
    } else if (payload.eventType === 'DELETE') {
      // Match ended
      setLiveMatches(prev => prev.filter(match => match.id !== payload.old.id))
    }
  }

  const handleMatchUpdate = (payload: any) => {
    // This function is no longer needed since we're not using match_updates table
    // Updates will come through handleRealtimeUpdate instead for the matches table
  }

  const handleSpecificMatchUpdate = (payload: any) => {
    if (selectedMatch && selectedMatch.id === matchId) {
      // Update selected match with new data from matches table
      const newData = payload.new
      setSelectedMatch(prev => ({
        ...prev!,
        wrestler1_score: newData.final_score_for || prev!.wrestler1_score,
        wrestler2_score: newData.final_score_against || prev!.wrestler2_score,
        status: newData.status || prev!.status,
        lastUpdate: new Date().toISOString()
      }))
    }
  }

  const showNotification = (message: string) => {
    // You could integrate with a toast library here
    console.log('Notification:', message)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPeriodDisplay = (period: number) => {
    const periods: Record<number, string> = {
      1: 'P1',
      2: 'P2',
      3: 'P3',
      4: 'SV',
      5: 'TB',
      6: 'UTB'
    }
    return periods[period] || `P${period}`
  }

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
        <CardHeader className="border-b border-[#D4AF38]/30">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-[#D4AF38] flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-500 animate-pulse" />
              Live Matches ({liveMatches.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => setNotifications(!notifications)}
                variant="outline"
                size="sm"
                className="bg-black/60 border-[#D4AF38]/30 text-white hover:bg-[#D4AF38]/20"
              >
                {notifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </Button>
              <Button
                onClick={() => setFullscreen(!fullscreen)}
                variant="outline"
                size="sm"
                className="bg-black/60 border-[#D4AF38]/30 text-white hover:bg-[#D4AF38]/20"
              >
                {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          {liveMatches.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Radio className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No live matches at the moment</p>
              <p className="text-sm mt-2">Matches will appear here as they start</p>
            </div>
          ) : (
            <div className="space-y-3">
              {liveMatches.map(match => (
                <div
                  key={match.id}
                  className={`bg-black/60 rounded-lg p-4 border ${
                    selectedMatch?.id === match.id 
                      ? 'border-[#D4AF38] shadow-lg shadow-[#D4AF38]/20' 
                      : 'border-[#D4AF38]/20 hover:border-[#D4AF38]/40'
                  } cursor-pointer transition-all`}
                  onClick={() => {
                    setSelectedMatch(match)
                    if (onSelectMatch) onSelectMatch(match.id)
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                      <Badge className="bg-[#D4AF38]/20 text-[#D4AF38] border-[#D4AF38]/30">
                        {match.weight_class} lbs
                      </Badge>
                      <Badge className="bg-black/60 text-white border-gray-600">
                        Mat {match.mat_number}
                      </Badge>
                      <Badge className="bg-green-900/50 text-green-400 border-green-600">
                        {getPeriodDisplay(match.period)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-white font-mono">
                        {formatTime(match.match_time)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-left">
                      <p className="text-white font-semibold">
                        {match.wrestler1_name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {match.wrestler1_team}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        <span className={match.wrestler1_score > match.wrestler2_score ? 'text-green-400' : 'text-white'}>
                          {match.wrestler1_score}
                        </span>
                        <span className="text-gray-500 mx-2">-</span>
                        <span className={match.wrestler2_score > match.wrestler1_score ? 'text-green-400' : 'text-white'}>
                          {match.wrestler2_score}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-white font-semibold">
                        {match.wrestler2_name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {match.wrestler2_team}
                      </p>
                    </div>
                  </div>

                  {match.lastUpdate && (
                    <div className="mt-2 text-center">
                      <p className="text-xs text-yellow-400">
                        {match.lastUpdate}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 flex justify-center">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onSelectMatch) onSelectMatch(match.id)
                      }}
                      size="sm"
                      className="bg-[#D4AF38]/20 hover:bg-[#D4AF38]/30 text-[#D4AF38] border border-[#D4AF38]/30"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Watch Live
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}