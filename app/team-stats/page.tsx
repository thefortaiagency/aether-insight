'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Trophy, TrendingUp, Users, Target, Award, BarChart3,
  Activity, Zap, Shield, Star, Loader2
} from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { supabase } from '@/lib/supabase'

interface Wrestler {
  id: string
  first_name: string
  last_name: string
  weight_class: number | null
  wins: number
  losses: number
  pins: number
  tech_falls: number
  major_decisions: number
}

interface Match {
  id: string
  wrestler_id: string
  result: string
  win_type: string
  weight_class: number
  match_date: string | null
  opponent_team: string | null
  takedowns_for: number
  takedowns_against: number
  escapes_for: number
  escapes_against: number
  reversals_for: number
  reversals_against: number
  nearfall_2_for: number
  nearfall_2_against: number
  nearfall_3_for: number
  nearfall_3_against: number
  nearfall_4_for: number
  nearfall_4_against: number
  final_score_for: number
  final_score_against: number
}

interface Event {
  id: string
  name: string
  date: string
  matchCount: number
}

export default function TeamStatsPage() {
  const [loading, setLoading] = useState(true)
  const [teamId, setTeamId] = useState<string | null>(null)
  const [teamName, setTeamName] = useState<string>('')
  const [wrestlers, setWrestlers] = useState<Wrestler[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>('all')
  const [events, setEvents] = useState<Event[]>([])

  // Get team ID from session
  useEffect(() => {
    const session = localStorage.getItem('aether-session')
    if (session) {
      try {
        const parsed = JSON.parse(session)
        if (parsed.team?.id) {
          setTeamId(parsed.team.id)
          setTeamName(parsed.team.name || '')
        } else {
          window.location.href = '/login'
        }
      } catch (e) {
        window.location.href = '/login'
      }
    } else {
      window.location.href = '/login'
    }
  }, [])

  // Load data when teamId is available
  useEffect(() => {
    if (teamId) {
      loadData()
    }
  }, [teamId])

  const loadData = async () => {
    if (!teamId) return
    setLoading(true)
    try {
      // Load wrestlers
      const { data: wrestlersData } = await supabase
        .from('wrestlers')
        .select('*')
        .eq('team_id', teamId)

      if (wrestlersData) {
        setWrestlers(wrestlersData as Wrestler[])

        // Load matches for all wrestlers
        const wrestlerIds = (wrestlersData as Wrestler[]).map((w: Wrestler) => w.id)
        if (wrestlerIds.length > 0) {
          const { data: matchesData } = await supabase
            .from('matches')
            .select('*')
            .in('wrestler_id', wrestlerIds)
            .order('match_date', { ascending: false })

          if (matchesData) {
            const typedMatches = matchesData as Match[]
            setMatches(typedMatches)

            // Extract unique events (opponent_team + date combinations)
            const eventMap = new Map<string, Event>()
            typedMatches.forEach(m => {
              if (m.opponent_team) {
                const eventId = `${m.opponent_team}-${m.match_date || 'unknown'}`
                if (!eventMap.has(eventId)) {
                  eventMap.set(eventId, {
                    id: eventId,
                    name: m.opponent_team,
                    date: m.match_date || 'Unknown Date',
                    matchCount: 1
                  })
                } else {
                  const existing = eventMap.get(eventId)!
                  existing.matchCount++
                }
              }
            })
            // Sort events by date (most recent first)
            const sortedEvents = Array.from(eventMap.values()).sort((a, b) =>
              (b.date || '').localeCompare(a.date || '')
            )
            setEvents(sortedEvents)
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
    setLoading(false)
  }

  // Filter matches based on selected event
  const filteredMatches = selectedEvent === 'all'
    ? matches
    : matches.filter(m => `${m.opponent_team}-${m.match_date || 'unknown'}` === selectedEvent)

  // Calculate ALL stats from matches table for accuracy
  const isEventView = selectedEvent !== 'all'

  // Calculate stats from filtered matches (works for both event view and overall)
  const totalWins = filteredMatches.filter(m => m.result === 'win').length
  const totalLosses = filteredMatches.filter(m => m.result === 'loss').length
  const totalMatches = totalWins + totalLosses
  const winRate = totalMatches > 0 ? ((totalWins / totalMatches) * 100).toFixed(1) : '0.0'

  // Victory types from matches - check multiple possible values
  const totalPins = filteredMatches.filter(m =>
    m.result === 'win' && (m.win_type === 'pin' || m.win_type === 'fall' || m.win_type === 'Pin' || m.win_type === 'Fall')
  ).length
  const totalTechFalls = filteredMatches.filter(m =>
    m.result === 'win' && (m.win_type === 'tech_fall' || m.win_type === 'Tech Fall' || m.win_type === 'TF')
  ).length
  const totalMajorDecisions = filteredMatches.filter(m =>
    m.result === 'win' && (m.win_type === 'major' || m.win_type === 'Major Decision' || m.win_type === 'MD')
  ).length
  const totalDecisions = filteredMatches.filter(m =>
    m.result === 'win' && (m.win_type === 'decision' || m.win_type === 'Decision' || m.win_type === 'Dec' || !m.win_type)
  ).length
  const totalForfeits = filteredMatches.filter(m =>
    m.result === 'win' && (m.win_type === 'forfeit' || m.win_type === 'Forfeit' || m.win_type === 'FF')
  ).length

  const pinRate = totalWins > 0 ? ((totalPins / totalWins) * 100).toFixed(1) : '0.0'

  // Calculate scoring breakdown from filtered matches
  const totalTakedowns = filteredMatches.reduce((sum, m) => sum + (m.takedowns_for || 0), 0)
  const totalEscapes = filteredMatches.reduce((sum, m) => sum + (m.escapes_for || 0), 0)
  const totalReversals = filteredMatches.reduce((sum, m) => sum + (m.reversals_for || 0), 0)
  const totalNF2 = filteredMatches.reduce((sum, m) => sum + (m.nearfall_2_for || 0), 0)
  const totalNF3 = filteredMatches.reduce((sum, m) => sum + (m.nearfall_3_for || 0), 0)
  const totalNF4 = filteredMatches.reduce((sum, m) => sum + (m.nearfall_4_for || 0), 0)
  const totalNearFalls = totalNF2 + totalNF3 + totalNF4

  // Calculate points against
  const totalTDAgainst = filteredMatches.reduce((sum, m) => sum + (m.takedowns_against || 0), 0)
  const totalEscAgainst = filteredMatches.reduce((sum, m) => sum + (m.escapes_against || 0), 0)
  const totalRevAgainst = filteredMatches.reduce((sum, m) => sum + (m.reversals_against || 0), 0)

  const totalPoints = (totalTakedowns * 2) + totalEscapes + (totalReversals * 2) +
                      (totalNF2 * 2) + (totalNF3 * 3) + (totalNF4 * 4)

  const scoringBreakdown = [
    { type: 'Takedowns', count: totalTakedowns, percentage: totalPoints > 0 ? Math.round((totalTakedowns * 2 / totalPoints) * 100) : 0 },
    { type: 'Escapes', count: totalEscapes, percentage: totalPoints > 0 ? Math.round((totalEscapes / totalPoints) * 100) : 0 },
    { type: 'Reversals', count: totalReversals, percentage: totalPoints > 0 ? Math.round((totalReversals * 2 / totalPoints) * 100) : 0 },
    { type: 'Near Falls', count: totalNearFalls, percentage: totalPoints > 0 ? Math.round(((totalNF2 * 2 + totalNF3 * 3 + totalNF4 * 4) / totalPoints) * 100) : 0 },
  ].filter(s => s.count > 0)

  // Weight class performance from filtered matches
  const weightClasses = [106, 113, 120, 126, 132, 138, 144, 150, 157, 165, 175, 190, 215, 285]
  const weightClassPerformance = weightClasses.map(wc => {
    const wcMatches = filteredMatches.filter(m => m.weight_class === wc)
    const wins = wcMatches.filter(m => m.result === 'win').length
    const losses = wcMatches.filter(m => m.result === 'loss').length
    const total = wins + losses
    return {
      weight: wc.toString(),
      wins,
      losses,
      winRate: total > 0 ? Math.round((wins / total) * 100) : 0
    }
  }).filter(wc => wc.wins > 0 || wc.losses > 0)

  // Get selected event details
  const selectedEventDetails = events.find(e => e.id === selectedEvent)

  // Top performers - calculate from filtered matches
  const wrestlerStats = wrestlers.map(w => {
    const wMatches = filteredMatches.filter(m => m.wrestler_id === w.id)
    const wins = wMatches.filter(m => m.result === 'win').length
    const pins = wMatches.filter(m =>
      m.result === 'win' && (m.win_type === 'pin' || m.win_type === 'fall' || m.win_type === 'Pin' || m.win_type === 'Fall')
    ).length
    const takedowns = wMatches.reduce((sum, m) => sum + (m.takedowns_for || 0), 0)
    return { ...w, calculatedWins: wins, calculatedPins: pins, calculatedTakedowns: takedowns }
  })

  const topWins = [...wrestlerStats].sort((a, b) => b.calculatedWins - a.calculatedWins)[0]
  const topPins = [...wrestlerStats].sort((a, b) => b.calculatedPins - a.calculatedPins)[0]
  const topTakedowns = [...wrestlerStats].sort((a, b) => b.calculatedTakedowns - a.calculatedTakedowns)[0]

  const COLORS = ['#D4AF38', '#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1']

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto mb-4" />
          <p className="text-gray-400">Loading team statistics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative">
      <WrestlingStatsBackground />

      <div className="relative z-10 p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gold mb-1">
                {teamName || 'Team Statistics'}
              </h1>
              <p className="text-gray-400">
                {isEventView && selectedEventDetails
                  ? `vs ${selectedEventDetails.name} • ${selectedEventDetails.date}`
                  : 'Season Overview'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Event Dropdown */}
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="bg-black/60 border border-gold/30 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gold"
              >
                <option value="all">All Events (Season)</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    vs {event.name} ({event.date}) - {event.matchCount} matches
                  </option>
                ))}
              </select>
              {/* Season Badge */}
              <div className="flex items-center gap-2 bg-black/60 border border-gold/30 rounded-lg px-4 py-2">
                <Trophy className="w-4 h-4 text-gold" />
                <span className="text-white font-semibold text-sm">2025-26 Season</span>
              </div>
            </div>
          </div>
        </div>

        {wrestlers.length === 0 ? (
          <Card className="bg-black/80 backdrop-blur-sm border border-gold/30">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gold/30 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">No Data Yet</h2>
              <p className="text-gray-400">Add wrestlers and matches to see team statistics.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-black/80 backdrop-blur-sm border border-gold/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Win Rate</p>
                      <p className="text-2xl font-bold text-gold">{winRate}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-gold/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/80 backdrop-blur-sm border border-gold/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Total Record</p>
                      <p className="text-2xl font-bold">
                        <span className="text-green-400">{totalWins}</span>
                        <span className="text-gray-500">-</span>
                        <span className="text-red-400">{totalLosses}</span>
                      </p>
                    </div>
                    <Trophy className="w-8 h-8 text-green-400/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/80 backdrop-blur-sm border border-gold/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Pin Rate</p>
                      <p className="text-2xl font-bold text-orange-400">{pinRate}%</p>
                    </div>
                    <Zap className="w-8 h-8 text-orange-400/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/80 backdrop-blur-sm border border-gold/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Wrestlers</p>
                      <p className="text-2xl font-bold text-purple-400">{wrestlers.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-400/50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Victory Types */}
            <Card className="bg-black/80 backdrop-blur-sm border border-gold/30 mb-6">
              <CardHeader>
                <CardTitle className="text-gold flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Victory Types ({totalWins} wins)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-black/30 rounded-lg">
                    <Zap className="w-8 h-8 text-gold mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{totalPins}</p>
                    <p className="text-sm text-gray-400">Pins</p>
                  </div>
                  <div className="text-center p-4 bg-black/30 rounded-lg">
                    <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{totalTechFalls}</p>
                    <p className="text-sm text-gray-400">Tech Falls</p>
                  </div>
                  <div className="text-center p-4 bg-black/30 rounded-lg">
                    <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{totalMajorDecisions}</p>
                    <p className="text-sm text-gray-400">Majors</p>
                  </div>
                  <div className="text-center p-4 bg-black/30 rounded-lg">
                    <Award className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{totalDecisions}</p>
                    <p className="text-sm text-gray-400">Decisions</p>
                  </div>
                  <div className="text-center p-4 bg-black/30 rounded-lg">
                    <Star className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{totalForfeits}</p>
                    <p className="text-sm text-gray-400">Forfeits</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weight Class Performance */}
            {weightClassPerformance.length > 0 && (
              <Card className="bg-black/80 backdrop-blur-sm border border-gold/30 mb-6">
                <CardHeader>
                  <CardTitle className="text-gold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Weight Class Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weightClassPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="weight" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #D4AF38' }}
                        labelStyle={{ color: '#D4AF38' }}
                      />
                      <Legend />
                      <Bar dataKey="wins" fill="#10B981" name="Wins" />
                      <Bar dataKey="losses" fill="#EF4444" name="Losses" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Scoring Breakdown & Top Performers */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {scoringBreakdown.length > 0 && (
                <Card className="bg-black/80 backdrop-blur-sm border border-gold/30">
                  <CardHeader>
                    <CardTitle className="text-gold flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Scoring Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={scoringBreakdown}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ type, count }) => `${type}: ${count}`}
                        >
                          {scoringBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-black/80 backdrop-blur-sm border border-gold/30">
                <CardHeader>
                  <CardTitle className="text-gold flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topWins && topWins.calculatedWins > 0 && (
                      <div className="p-3 bg-gold/10 rounded-lg border border-gold/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-400">Most Wins</p>
                            <p className="text-lg font-bold text-white">{topWins.first_name} {topWins.last_name}</p>
                          </div>
                          <Badge className="bg-gold/20 text-gold border-gold">
                            {topWins.calculatedWins} Wins
                          </Badge>
                        </div>
                      </div>
                    )}

                    {topPins && topPins.calculatedPins > 0 && (
                      <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-400">Most Pins</p>
                            <p className="text-lg font-bold text-white">{topPins.first_name} {topPins.last_name}</p>
                          </div>
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500">
                            {topPins.calculatedPins} Pins
                          </Badge>
                        </div>
                      </div>
                    )}

                    {topTakedowns && topTakedowns.calculatedTakedowns > 0 && (
                      <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-400">Most Takedowns</p>
                            <p className="text-lg font-bold text-white">{topTakedowns.first_name} {topTakedowns.last_name}</p>
                          </div>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500">
                            {topTakedowns.calculatedTakedowns} TDs
                          </Badge>
                        </div>
                      </div>
                    )}

                    {(!topWins || topWins.calculatedWins === 0) && (!topPins || topPins.calculatedPins === 0) && (
                      <p className="text-gray-400 text-center py-4">No match data yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Scoring Stats */}
            <Card className="bg-black/80 backdrop-blur-sm border border-gold/30">
              <CardHeader>
                <CardTitle className="text-gold flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Team Scoring Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gold">{totalTakedowns}</p>
                    <p className="text-xs text-gray-400">Takedowns</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{totalEscapes}</p>
                    <p className="text-xs text-gray-400">Escapes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{totalReversals}</p>
                    <p className="text-xs text-gray-400">Reversals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">{totalNF2}</p>
                    <p className="text-xs text-gray-400">NF2</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-400">{totalNF3}</p>
                    <p className="text-xs text-gray-400">NF3</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-400">{totalNF4}</p>
                    <p className="text-xs text-gray-400">NF4</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
