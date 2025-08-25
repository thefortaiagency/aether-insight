'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, TrendingUp, Users, Target, Award, BarChart3, 
  Activity, Zap, Shield, Star, ChevronUp, ChevronDown,
  Calendar, Clock, Percent, Hash
} from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface TeamStats {
  totalMatches: number
  wins: number
  losses: number
  pins: number
  techFalls: number
  majorDecisions: number
  teamPoints: number
  dualMeetRecord: { wins: number; losses: number }
  tournamentPlacements: { first: number; second: number; third: number }
  averageMatchTime: string
  fastestPin: string
  mostWins: { wrestler: string; count: number }
  mostPins: { wrestler: string; count: number }
  weightClassPerformance: Array<{
    weight: string
    wins: number
    losses: number
    winRate: number
  }>
  monthlyProgress: Array<{
    month: string
    wins: number
    losses: number
    teamPoints: number
  }>
  scoringBreakdown: Array<{
    type: string
    count: number
    percentage: number
  }>
}

export default function TeamStatsPage() {
  const [stats, setStats] = useState<TeamStats>({
    totalMatches: 342,
    wins: 287,
    losses: 55,
    pins: 89,
    techFalls: 34,
    majorDecisions: 45,
    teamPoints: 1847,
    dualMeetRecord: { wins: 18, losses: 3 },
    tournamentPlacements: { first: 5, second: 8, third: 12 },
    averageMatchTime: '4:23',
    fastestPin: '0:17',
    mostWins: { wrestler: 'Jackson Martinez', count: 38 },
    mostPins: { wrestler: 'Ryan Thompson', count: 22 },
    weightClassPerformance: [
      { weight: '106', wins: 18, losses: 4, winRate: 81.8 },
      { weight: '113', wins: 22, losses: 3, winRate: 88.0 },
      { weight: '120', wins: 19, losses: 6, winRate: 76.0 },
      { weight: '126', wins: 24, losses: 2, winRate: 92.3 },
      { weight: '132', wins: 21, losses: 5, winRate: 80.8 },
      { weight: '138', wins: 20, losses: 4, winRate: 83.3 },
      { weight: '145', wins: 23, losses: 3, winRate: 88.5 },
      { weight: '152', wins: 18, losses: 7, winRate: 72.0 },
      { weight: '160', wins: 25, losses: 1, winRate: 96.2 },
      { weight: '170', wins: 19, losses: 5, winRate: 79.2 },
      { weight: '182', wins: 22, losses: 4, winRate: 84.6 },
      { weight: '195', wins: 20, losses: 5, winRate: 80.0 },
      { weight: '220', wins: 18, losses: 3, winRate: 85.7 },
      { weight: '285', wins: 18, losses: 3, winRate: 85.7 }
    ],
    monthlyProgress: [
      { month: 'Nov', wins: 42, losses: 8, teamPoints: 287 },
      { month: 'Dec', wins: 58, losses: 11, teamPoints: 412 },
      { month: 'Jan', wins: 73, losses: 14, teamPoints: 523 },
      { month: 'Feb', wins: 67, losses: 12, teamPoints: 445 },
      { month: 'Mar', wins: 47, losses: 10, teamPoints: 180 }
    ],
    scoringBreakdown: [
      { type: 'Takedowns', count: 892, percentage: 45 },
      { type: 'Escapes', count: 356, percentage: 18 },
      { type: 'Reversals', count: 198, percentage: 10 },
      { type: 'Near Falls', count: 297, percentage: 15 },
      { type: 'Penalties', count: 158, percentage: 8 },
      { type: 'Riding Time', count: 79, percentage: 4 }
    ]
  })

  const winRate = ((stats.wins / stats.totalMatches) * 100).toFixed(1)
  const pinRate = ((stats.pins / stats.wins) * 100).toFixed(1)

  const COLORS = ['#D4AF38', '#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1']

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      <WrestlingStatsBackground />
      
      <div className="relative z-10 p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gold mb-2">Team Statistics</h1>
          <p className="text-gray-400">Fort Wayne North Warriors - 2024-25 Season</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-black/40 backdrop-blur border border-gold/20">
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

          <Card className="bg-black/40 backdrop-blur border border-gold/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Total Wins</p>
                  <p className="text-2xl font-bold text-green-400">{stats.wins}</p>
                </div>
                <Trophy className="w-8 h-8 text-green-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur border border-gold/20">
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

          <Card className="bg-black/40 backdrop-blur border border-gold/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Team Points</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.teamPoints}</p>
                </div>
                <Star className="w-8 h-8 text-purple-400/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dual Meet & Tournament Records */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="bg-black/40 backdrop-blur border border-gold/20">
            <CardHeader>
              <CardTitle className="text-gold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Dual Meet Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  <span className="text-green-400">{stats.dualMeetRecord.wins}</span>
                  <span className="text-gray-500 mx-2">-</span>
                  <span className="text-red-400">{stats.dualMeetRecord.losses}</span>
                </div>
                <div className="flex justify-center gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Conference:</span>
                    <span className="text-white ml-1">8-1</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Non-Conf:</span>
                    <span className="text-white ml-1">10-2</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur border border-gold/20">
            <CardHeader>
              <CardTitle className="text-gold flex items-center gap-2">
                <Award className="w-5 h-5" />
                Tournament Placements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-around">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mb-2">
                    <span className="text-gold font-bold">1st</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{stats.tournamentPlacements.first}</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-400/20 rounded-full flex items-center justify-center mb-2">
                    <span className="text-gray-300 font-bold">2nd</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{stats.tournamentPlacements.second}</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center mb-2">
                    <span className="text-orange-400 font-bold">3rd</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{stats.tournamentPlacements.third}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weight Class Performance */}
        <Card className="bg-black/40 backdrop-blur border border-gold/20 mb-6">
          <CardHeader>
            <CardTitle className="text-gold flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Weight Class Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.weightClassPerformance}>
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

        {/* Monthly Progress */}
        <Card className="bg-black/40 backdrop-blur border border-gold/20 mb-6">
          <CardHeader>
            <CardTitle className="text-gold flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Season Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #D4AF38' }}
                  labelStyle={{ color: '#D4AF38' }}
                />
                <Legend />
                <Line type="monotone" dataKey="wins" stroke="#10B981" strokeWidth={2} name="Wins" />
                <Line type="monotone" dataKey="losses" stroke="#EF4444" strokeWidth={2} name="Losses" />
                <Line type="monotone" dataKey="teamPoints" stroke="#D4AF38" strokeWidth={2} name="Team Points" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Scoring Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="bg-black/40 backdrop-blur border border-gold/20">
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
                    data={stats.scoringBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="percentage"
                    label={({ type, percentage }) => `${type}: ${percentage}%`}
                  >
                    {stats.scoringBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur border border-gold/20">
            <CardHeader>
              <CardTitle className="text-gold flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-gold/10 rounded-lg border border-gold/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-400">Most Wins</p>
                      <p className="text-lg font-bold text-white">{stats.mostWins.wrestler}</p>
                    </div>
                    <Badge className="bg-gold/20 text-gold border-gold">
                      {stats.mostWins.count} Wins
                    </Badge>
                  </div>
                </div>
                
                <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-400">Most Pins</p>
                      <p className="text-lg font-bold text-white">{stats.mostPins.wrestler}</p>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500">
                      {stats.mostPins.count} Pins
                    </Badge>
                  </div>
                </div>

                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-400">Fastest Pin</p>
                      <p className="text-lg font-bold text-white">Alex Thompson</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500">
                      {stats.fastestPin}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Match Type Breakdown */}
        <Card className="bg-black/40 backdrop-blur border border-gold/20">
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
                <p className="text-2xl font-bold text-white">{stats.pins}</p>
                <p className="text-sm text-gray-400">Pins</p>
              </div>
              <div className="text-center p-4 bg-black/30 rounded-lg">
                <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.techFalls}</p>
                <p className="text-sm text-gray-400">Tech Falls</p>
              </div>
              <div className="text-center p-4 bg-black/30 rounded-lg">
                <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.majorDecisions}</p>
                <p className="text-sm text-gray-400">Major Decisions</p>
              </div>
              <div className="text-center p-4 bg-black/30 rounded-lg">
                <Award className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">119</p>
                <p className="text-sm text-gray-400">Decisions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}