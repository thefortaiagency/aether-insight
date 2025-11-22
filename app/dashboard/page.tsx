'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Trophy, Users, BarChart3, Activity,
  TrendingUp, Award, Calendar,
  ChevronRight, Zap, Target, Star, Loader2
} from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'
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
  takedowns: number
  escapes: number
  reversals: number
}

interface Session {
  coach?: { first_name?: string; last_name?: string }
  team?: { id: string; name: string }
}

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [wrestlers, setWrestlers] = useState<Wrestler[]>([])
  const [stats, setStats] = useState({
    totalMatches: 0,
    activeWrestlers: 0,
    winRate: 0,
    totalWins: 0,
    totalLosses: 0,
    totalPins: 0
  })

  // Load session from localStorage
  useEffect(() => {
    const storedSession = localStorage.getItem('aether-session')
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession)
        if (parsed.team?.id) {
          setSession(parsed)
        } else {
          window.location.href = '/login'
        }
      } catch {
        window.location.href = '/login'
      }
    } else {
      window.location.href = '/login'
    }
  }, [])

  // Load real team data
  useEffect(() => {
    const loadTeamData = async () => {
      if (!session?.team?.id) return

      try {
        const { data: wrestlersData, error } = await supabase
          .from('wrestlers')
          .select('*')
          .eq('team_id', session.team.id)
          .order('weight_class', { ascending: true })

        if (error) throw error

        if (wrestlersData) {
          setWrestlers(wrestlersData)

          // Calculate real stats
          const totalWins = wrestlersData.reduce((sum: number, w: Wrestler) => sum + (w.wins || 0), 0)
          const totalLosses = wrestlersData.reduce((sum: number, w: Wrestler) => sum + (w.losses || 0), 0)
          const totalMatches = totalWins + totalLosses
          const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0
          const totalPins = wrestlersData.reduce((sum: number, w: Wrestler) => sum + (w.pins || 0), 0)

          setStats({
            totalMatches,
            activeWrestlers: wrestlersData.length,
            winRate,
            totalWins,
            totalLosses,
            totalPins
          })
        }
      } catch (error) {
        console.error('Error loading team data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.team?.id) {
      loadTeamData()
    }
  }, [session])

  const quickActions = [
    {
      title: 'Mat Ops AI',
      description: 'Ask your AI wrestling coach',
      icon: <Zap className="w-6 h-6 text-gold" />,
      href: '/ai',
      color: 'bg-gold/20 hover:bg-gold/30 border-gold',
      iconBg: 'bg-gold/20 border border-gold/30'
    },
    {
      title: 'View Roster',
      description: 'Manage your wrestlers',
      icon: <Users className="w-6 h-6 text-blue-400" />,
      href: '/roster',
      color: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500',
      iconBg: 'bg-blue-500/20 border border-blue-500/30'
    },
    {
      title: 'Team Stats',
      description: 'Analytics and performance',
      icon: <BarChart3 className="w-6 h-6 text-purple-400" />,
      href: '/team-stats',
      color: 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500',
      iconBg: 'bg-purple-500/20 border border-purple-500/30'
    },
    {
      title: 'Calendar',
      description: 'Schedule and events',
      icon: <Calendar className="w-6 h-6 text-orange-400" />,
      href: '/calendar',
      color: 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-500',
      iconBg: 'bg-orange-500/20 border border-orange-500/30'
    }
  ]

  // Get top performers from real data
  const topPerformers = wrestlers
    .filter(w => (w.wins || 0) + (w.losses || 0) > 0)
    .map(w => ({
      ...w,
      totalMatches: (w.wins || 0) + (w.losses || 0),
      winPct: ((w.wins || 0) / ((w.wins || 0) + (w.losses || 0))) * 100
    }))
    .sort((a, b) => b.winPct - a.winPct)
    .slice(0, 5)

  // Show loading state
  if (!session || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative">
      <WrestlingStatsBackground />

      <div className="relative z-10 p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gold mb-1">
                {session.team?.name || 'Mat Ops Dashboard'}
              </h1>
              <p className="text-gray-400">
                Welcome back, {session.coach?.first_name || 'Coach'}!
              </p>
            </div>
            <div className="flex items-center gap-2 bg-black/60 border border-gold/30 rounded-lg px-4 py-2">
              <Trophy className="w-5 h-5 text-gold" />
              <span className="text-white font-semibold">2025-26 Season</span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-5 h-5 text-gold" />
                <span className="text-xs text-green-400">{stats.totalWins}W</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalMatches}</p>
              <p className="text-xs text-gray-400">Total Matches</p>
            </CardContent>
          </Card>

          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-gold" />
                <span className="text-xs text-green-400">Active</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.activeWrestlers}</p>
              <p className="text-xs text-gray-400">Wrestlers</p>
            </CardContent>
          </Card>

          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-gold" />
                {stats.winRate >= 50 ? (
                  <span className="text-xs text-green-400">Good</span>
                ) : (
                  <span className="text-xs text-red-400">Improve</span>
                )}
              </div>
              <p className="text-2xl font-bold text-white">{stats.winRate}%</p>
              <p className="text-xs text-gray-400">Win Rate</p>
            </CardContent>
          </Card>

          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-5 h-5 text-gold" />
                <Star className="w-4 h-4 text-gold" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalWins}</p>
              <p className="text-xs text-gray-400">Total Wins</p>
            </CardContent>
          </Card>

          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-gold" />
                <span className="text-xs text-green-400">Bonus</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalPins}</p>
              <p className="text-xs text-gray-400">Total Pins</p>
            </CardContent>
          </Card>

          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-gold" />
                <span className="text-xs text-red-400">{stats.totalLosses}L</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalLosses}</p>
              <p className="text-xs text-gray-400">Total Losses</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className={`${action.color} backdrop-blur border cursor-pointer hover:scale-105 transition-all`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 ${action.iconBg} rounded-lg`}>
                      {action.icon}
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/50" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-300">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardHeader>
              <CardTitle className="text-gold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Top Performers
                </span>
                <Link href="/roster">
                  <Button size="sm" variant="ghost" className="text-gold hover:text-gold/80">
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topPerformers.length > 0 ? (
                <div className="space-y-3">
                  {topPerformers.map((wrestler, idx) => (
                    <div key={wrestler.id} className="flex items-center justify-between p-3 bg-black/80 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-gold font-bold">#{idx + 1}</span>
                        <div>
                          <p className="text-white font-medium">{wrestler.first_name} {wrestler.last_name}</p>
                          <p className="text-sm text-gray-400">{wrestler.weight_class || '?'} lbs</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500">
                          {wrestler.wins}-{wrestler.losses}
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">
                          {wrestler.winPct.toFixed(0)}% • {wrestler.pins || 0} pins
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No wrestlers with matches yet</p>
                  <Link href="/roster">
                    <Button className="mt-4 bg-gold hover:bg-gold/90 text-black">
                      Add Wrestlers
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Roster Overview */}
          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardHeader>
              <CardTitle className="text-gold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Roster Overview
                </span>
                <Badge className="bg-gold/20 text-gold border-gold">
                  {wrestlers.length} Wrestlers
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {wrestlers.length > 0 ? (
                <div className="space-y-3">
                  {wrestlers.slice(0, 5).map(wrestler => (
                    <div key={wrestler.id} className="flex items-center justify-between p-3 bg-black/80 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{wrestler.first_name} {wrestler.last_name}</p>
                        <p className="text-sm text-gray-400">{wrestler.weight_class || '?'} lbs</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{wrestler.wins || 0}-{wrestler.losses || 0}</p>
                        <p className="text-xs text-gray-400">
                          TD: {wrestler.takedowns || 0} • E: {wrestler.escapes || 0}
                        </p>
                      </div>
                    </div>
                  ))}
                  {wrestlers.length > 5 && (
                    <Link href="/roster">
                      <Button variant="ghost" className="w-full text-gold hover:text-gold/80">
                        View all {wrestlers.length} wrestlers
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No wrestlers on roster yet</p>
                  <Link href="/roster">
                    <Button className="mt-4 bg-gold hover:bg-gold/90 text-black">
                      Add Wrestlers
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feature Card */}
        <div className="grid md:grid-cols-1 gap-4 mt-6 max-w-md">
          <Card className="bg-gradient-to-br from-green-500/20 to-green-500/10 backdrop-blur border border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-8 h-8 text-green-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">Training Plans</h3>
                  <p className="text-sm text-gray-300">Coming Soon</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                AI-powered training recommendations based on performance data.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
