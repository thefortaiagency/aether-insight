'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, Users, Video, BarChart3, Activity, Clock,
  TrendingUp, Award, Calendar, PlayCircle, Settings,
  ChevronRight, Zap, Shield, Target, Star
} from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalMatches: 342,
    activeWrestlers: 24,
    winRate: 84,
    upcomingMatches: 3,
    recentVideos: 12,
    teamRanking: 2
  })

  const quickActions = [
    {
      title: 'Start Live Match',
      description: 'Score a match in real-time',
      icon: <Activity className="w-6 h-6 text-green-400" />,
      href: '/matches/live-scoring',
      color: 'bg-green-500/20 hover:bg-green-500/30 border-green-500',
      iconBg: 'bg-green-500/20 border border-green-500/30'
    },
    {
      title: 'View Team Stats',
      description: 'Analytics and performance',
      icon: <BarChart3 className="w-6 h-6 text-purple-400" />,
      href: '/team-stats',
      color: 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500',
      iconBg: 'bg-purple-500/20 border border-purple-500/30'
    },
    {
      title: 'Manage Roster',
      description: 'Team and wrestler management',
      icon: <Users className="w-6 h-6 text-blue-400" />,
      href: '/teams',
      color: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500',
      iconBg: 'bg-blue-500/20 border border-blue-500/30'
    },
    {
      title: 'Watch Videos',
      description: 'Review match recordings',
      icon: <Video className="w-6 h-6 text-orange-400" />,
      href: '/wrestling-videos',
      color: 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-500',
      iconBg: 'bg-orange-500/20 border border-orange-500/30'
    }
  ]

  const recentMatches = [
    { id: 1, wrestler: 'Jackson Martinez', opponent: 'Ryan Smith', result: 'W', type: 'Pin', time: '2:47' },
    { id: 2, wrestler: 'Alex Thompson', opponent: 'Mike Johnson', result: 'W', type: 'Dec', score: '8-3' },
    { id: 3, wrestler: 'Ryan Chen', opponent: 'Tom Wilson', result: 'L', type: 'Dec', score: '5-7' }
  ]

  const upcomingEvents = [
    { id: 1, name: 'Dual Meet vs Central', date: 'Tomorrow, 6:00 PM', type: 'dual' },
    { id: 2, name: 'Regional Tournament', date: 'Saturday, 9:00 AM', type: 'tournament' },
    { id: 3, name: 'Practice Match', date: 'Monday, 4:00 PM', type: 'practice' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      <WrestlingStatsBackground />
      
      <div className="relative z-10 p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gold mb-2">Mat Ops Dashboard</h1>
          <p className="text-gray-400">Welcome back, Coach! Here's your team overview.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-5 h-5 text-gold" />
                <span className="text-xs text-green-400">+12%</span>
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
                <span className="text-xs text-green-400">+5%</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.winRate}%</p>
              <p className="text-xs text-gray-400">Win Rate</p>
            </CardContent>
          </Card>

          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-5 h-5 text-gold" />
                <Badge className="bg-red-500/20 text-red-400 text-xs">Soon</Badge>
              </div>
              <p className="text-2xl font-bold text-white">{stats.upcomingMatches}</p>
              <p className="text-xs text-gray-400">Upcoming</p>
            </CardContent>
          </Card>

          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Video className="w-5 h-5 text-gold" />
                <span className="text-xs text-blue-400">New</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.recentVideos}</p>
              <p className="text-xs text-gray-400">Videos</p>
            </CardContent>
          </Card>

          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-5 h-5 text-gold" />
                <Star className="w-4 h-4 text-gold" />
              </div>
              <p className="text-2xl font-bold text-white">#{stats.teamRanking}</p>
              <p className="text-xs text-gray-400">State Rank</p>
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
          {/* Recent Matches */}
          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardHeader>
              <CardTitle className="text-gold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Recent Matches
                </span>
                <Link href="/matches">
                  <Button size="sm" variant="ghost" className="text-gold hover:text-gold/80">
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMatches.map(match => (
                  <div key={match.id} className="flex items-center justify-between p-3 bg-black/80 rounded-lg">
                    <div className="flex-1">
                      <p className="text-white font-medium">{match.wrestler}</p>
                      <p className="text-sm text-gray-400">vs {match.opponent}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={match.result === 'W' 
                        ? 'bg-green-500/20 text-green-400 border-green-500' 
                        : 'bg-red-500/20 text-red-400 border-red-500'
                      }>
                        {match.result} - {match.type}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">
                        {match.score || match.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardHeader>
              <CardTitle className="text-gold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Events
                </span>
                <Badge className="bg-gold/20 text-gold border-gold">
                  {upcomingEvents.length} Events
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-black/80 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{event.name}</p>
                      <p className="text-sm text-gray-400">{event.date}</p>
                    </div>
                    <Badge className={
                      event.type === 'dual' 
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500'
                        : event.type === 'tournament'
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500'
                    }>
                      {event.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <Card className="bg-gradient-to-br from-gold/20 to-gold/10 backdrop-blur border border-gold/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-8 h-8 text-gold" />
                <div>
                  <h3 className="text-lg font-bold text-white">AI Video Analysis</h3>
                  <p className="text-sm text-gray-300">Coming Soon</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Automatic move detection and scoring from video recordings.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/10 backdrop-blur border border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-8 h-8 text-purple-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">Tournament Mode</h3>
                  <p className="text-sm text-gray-300">Coming Soon</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Complete bracket management and live tournament scoring.
              </p>
            </CardContent>
          </Card>

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