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
  takedowns_for: number
  escapes_for: number
  reversals_for: number
  nearfall_2_for: number
  nearfall_3_for: number
  nearfall_4_for: number
}

export default function TeamStatsPage() {
  const [loading, setLoading] = useState(true)
  const [teamId, setTeamId] = useState<string | null>(null)
  const [teamName, setTeamName] = useState<string>('')
  const [wrestlers, setWrestlers] = useState<Wrestler[]>([])
  const [matches, setMatches] = useState<Match[]>([])

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

          if (matchesData) {
            setMatches(matchesData as Match[])
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
    setLoading(false)
  }

  // Calculate stats from real data
  const totalWins = wrestlers.reduce((sum, w) => sum + (w.wins || 0), 0)
  const totalLosses = wrestlers.reduce((sum, w) => sum + (w.losses || 0), 0)
  const totalMatches = totalWins + totalLosses
  const winRate = totalMatches > 0 ? ((totalWins / totalMatches) * 100).toFixed(1) : '0.0'

  const totalPins = wrestlers.reduce((sum, w) => sum + (w.pins || 0), 0)
  const totalTechFalls = wrestlers.reduce((sum, w) => sum + (w.tech_falls || 0), 0)
  const totalMajorDecisions = wrestlers.reduce((sum, w) => sum + (w.major_decisions || 0), 0)
  const pinRate = totalWins > 0 ? ((totalPins / totalWins) * 100).toFixed(1) : '0.0'

  // Calculate scoring breakdown from matches
  const totalTakedowns = matches.reduce((sum, m) => sum + (m.takedowns_for || 0), 0)
  const totalEscapes = matches.reduce((sum, m) => sum + (m.escapes_for || 0), 0)
  const totalReversals = matches.reduce((sum, m) => sum + (m.reversals_for || 0), 0)
  const totalNF2 = matches.reduce((sum, m) => sum + (m.nearfall_2_for || 0), 0)
  const totalNF3 = matches.reduce((sum, m) => sum + (m.nearfall_3_for || 0), 0)
  const totalNF4 = matches.reduce((sum, m) => sum + (m.nearfall_4_for || 0), 0)
  const totalNearFalls = totalNF2 + totalNF3 + totalNF4

  const totalPoints = (totalTakedowns * 2) + totalEscapes + (totalReversals * 2) +
                      (totalNF2 * 2) + (totalNF3 * 3) + (totalNF4 * 4)

  const scoringBreakdown = [
    { type: 'Takedowns', count: totalTakedowns, percentage: totalPoints > 0 ? Math.round((totalTakedowns * 2 / totalPoints) * 100) : 0 },
    { type: 'Escapes', count: totalEscapes, percentage: totalPoints > 0 ? Math.round((totalEscapes / totalPoints) * 100) : 0 },
    { type: 'Reversals', count: totalReversals, percentage: totalPoints > 0 ? Math.round((totalReversals * 2 / totalPoints) * 100) : 0 },
    { type: 'Near Falls', count: totalNearFalls, percentage: totalPoints > 0 ? Math.round(((totalNF2 * 2 + totalNF3 * 3 + totalNF4 * 4) / totalPoints) * 100) : 0 },
  ].filter(s => s.count > 0)

  // Weight class performance
  const weightClasses = [106, 113, 120, 126, 132, 138, 144, 150, 157, 165, 175, 190, 215, 285]
  const weightClassPerformance = weightClasses.map(wc => {
    const wcWrestlers = wrestlers.filter(w => w.weight_class === wc)
    const wins = wcWrestlers.reduce((sum, w) => sum + (w.wins || 0), 0)
    const losses = wcWrestlers.reduce((sum, w) => sum + (w.losses || 0), 0)
    const total = wins + losses
    return {
      weight: wc.toString(),
      wins,
      losses,
      winRate: total > 0 ? Math.round((wins / total) * 100) : 0
    }
  }).filter(wc => wc.wins > 0 || wc.losses > 0)

  // Top performers
  const topWins = [...wrestlers].sort((a, b) => (b.wins || 0) - (a.wins || 0))[0]
  const topPins = [...wrestlers].sort((a, b) => (b.pins || 0) - (a.pins || 0))[0]

  const COLORS = ['#D4AF38', '#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1']

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto mb-4" />
          <p className="text-gray-400">Loading team statistics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      <WrestlingStatsBackground />

      <div className="relative z-10 p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gold mb-2">Team Statistics</h1>
          <p className="text-gray-400">{teamName || 'Your Team'}</p>
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
                  Victory Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <p className="text-sm text-gray-400">Major Decisions</p>
                  </div>
                  <div className="text-center p-4 bg-black/30 rounded-lg">
                    <Award className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{totalWins - totalPins - totalTechFalls - totalMajorDecisions}</p>
                    <p className="text-sm text-gray-400">Decisions</p>
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
                    {topWins && topWins.wins > 0 && (
                      <div className="p-3 bg-gold/10 rounded-lg border border-gold/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-400">Most Wins</p>
                            <p className="text-lg font-bold text-white">{topWins.first_name} {topWins.last_name}</p>
                          </div>
                          <Badge className="bg-gold/20 text-gold border-gold">
                            {topWins.wins} Wins
                          </Badge>
                        </div>
                      </div>
                    )}

                    {topPins && topPins.pins > 0 && (
                      <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-400">Most Pins</p>
                            <p className="text-lg font-bold text-white">{topPins.first_name} {topPins.last_name}</p>
                          </div>
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500">
                            {topPins.pins} Pins
                          </Badge>
                        </div>
                      </div>
                    )}

                    {(!topWins || topWins.wins === 0) && (!topPins || topPins.pins === 0) && (
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
