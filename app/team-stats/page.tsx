'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, Users, TrendingUp, Award, Target, Activity, 
  BarChart3, PieChart, Calendar, Clock, User, Home,
  ChevronUp, ChevronDown, Minus, Star
} from 'lucide-react'
// import PageBackground from "@/components/background/page-background"
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'

interface WrestlerStats {
  name: string
  team: string
  grade: number
  record: { wins: number; losses: number }
  winTypes: {
    pins: number
    techfalls: number
    majors: number
    decisions: number
  }
  points: {
    scored: number
    allowed: number
  }
  takedowns: number
  reversals: number
  escapes: number
  nearfalls: number
  ridingTime: number
  matches: number
}

interface TeamStats {
  name: string
  dualRecord: { wins: number; losses: number }
  tournamentPoints: number
  wrestlers: number
  topPerformers: WrestlerStats[]
}

export default function AnalyticsPage() {
  const [wrestlers, setWrestlers] = useState<WrestlerStats[]>([])
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('season')
  const [selectedWeight, setSelectedWeight] = useState('all')

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = () => {
    // Load matches from localStorage and calculate stats
    const matchKeys = Object.keys(localStorage).filter(key => key.startsWith('match-'))
    const wrestlerStatsMap: { [key: string]: WrestlerStats } = {}
    
    matchKeys.forEach(key => {
      try {
        const match = JSON.parse(localStorage.getItem(key) || '{}')
        
        // Process home wrestler
        if (match.homeWrestler) {
          const wrestlerKey = match.homeWrestler.name
          if (!wrestlerStatsMap[wrestlerKey]) {
            wrestlerStatsMap[wrestlerKey] = createEmptyWrestlerStats(
              match.homeWrestler.name,
              match.homeWrestler.team || 'Fort Wayne North',
              match.homeWrestler.grade || 12
            )
          }
          updateWrestlerStats(wrestlerStatsMap[wrestlerKey], match, 'home')
        }
        
        // Process away wrestler
        if (match.awayWrestler) {
          const wrestlerKey = match.awayWrestler.name
          if (!wrestlerStatsMap[wrestlerKey]) {
            wrestlerStatsMap[wrestlerKey] = createEmptyWrestlerStats(
              match.awayWrestler.name,
              match.awayWrestler.team || 'Opponent',
              match.awayWrestler.grade || 12
            )
          }
          updateWrestlerStats(wrestlerStatsMap[wrestlerKey], match, 'away')
        }
      } catch (e) {
        console.error('Error processing match:', e)
      }
    })
    
    const wrestlersList = Object.values(wrestlerStatsMap)
    setWrestlers(wrestlersList)
    
    // Calculate team stats for Fort Wayne North
    const fwnWrestlers = wrestlersList.filter(w => w.team === 'Fort Wayne North')
    const teamWins = fwnWrestlers.reduce((acc, w) => acc + w.record.wins, 0)
    const teamLosses = fwnWrestlers.reduce((acc, w) => acc + w.record.losses, 0)
    
    setTeamStats({
      name: 'Fort Wayne North',
      dualRecord: { wins: 12, losses: 3 }, // Mock data
      tournamentPoints: 245.5, // Mock data
      wrestlers: fwnWrestlers.length,
      topPerformers: fwnWrestlers.sort((a, b) => b.record.wins - a.record.wins).slice(0, 5)
    })
  }

  const createEmptyWrestlerStats = (name: string, team: string, grade: number): WrestlerStats => ({
    name,
    team,
    grade,
    record: { wins: 0, losses: 0 },
    winTypes: {
      pins: 0,
      techfalls: 0,
      majors: 0,
      decisions: 0
    },
    points: {
      scored: 0,
      allowed: 0
    },
    takedowns: 0,
    reversals: 0,
    escapes: 0,
    nearfalls: 0,
    ridingTime: 0,
    matches: 0
  })

  const updateWrestlerStats = (stats: WrestlerStats, match: any, side: 'home' | 'away') => {
    const isWinner = match.winner === side
    const wrestler = side === 'home' ? match.homeWrestler : match.awayWrestler
    const opponent = side === 'home' ? match.awayWrestler : match.homeWrestler
    
    // Update record
    if (isWinner) {
      stats.record.wins++
      
      // Update win type
      switch(match.winType) {
        case 'pin':
        case 'fall':
          stats.winTypes.pins++
          break
        case 'techfall':
        case 'tech':
          stats.winTypes.techfalls++
          break
        case 'major':
          stats.winTypes.majors++
          break
        case 'decision':
        default:
          stats.winTypes.decisions++
          break
      }
    } else {
      stats.record.losses++
    }
    
    // Update points
    stats.points.scored += wrestler.score || 0
    stats.points.allowed += opponent.score || 0
    
    // Update match count
    stats.matches++
    
    // Count scoring events
    if (match.events) {
      match.events.forEach((event: any) => {
        if (event.wrestler === side) {
          switch(event.type) {
            case 'takedown':
            case 'takedown2':
            case 'takedown3':
              stats.takedowns++
              break
            case 'reversal':
              stats.reversals++
              break
            case 'escape':
              stats.escapes++
              break
            case 'nearfall2':
            case 'nearfall3':
              stats.nearfalls++
              break
          }
        }
      })
    }
    
    // Update riding time
    if (match.ridingTime && match.ridingTime[side]) {
      stats.ridingTime += match.ridingTime[side]
    }
  }

  const getWinPercentage = (wins: number, losses: number) => {
    const total = wins + losses
    return total > 0 ? Math.round((wins / total) * 100) : 0
  }

  const weights = ['106', '113', '120', '126', '132', '138', '145', '152', '160', '170', '182', '195', '220', '285', 'all']

  return (
    <>
      {/* <PageBackground /> */}
      <div className="p-4 md:p-6 relative">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#D4AF38]">Wrestling Analytics</h1>
            <p className="text-gray-400">Comprehensive team and wrestler statistics</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="border-gray-600 text-gray-400">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Team Overview */}
        {teamStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-[#D4AF38]" />
                  <div>
                    <p className="text-sm text-gray-400">Dual Record</p>
                    <p className="text-xl font-bold text-white">
                      {teamStats.dualRecord.wins}-{teamStats.dualRecord.losses}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-[#D4AF38]" />
                  <div>
                    <p className="text-sm text-gray-400">Tournament Points</p>
                    <p className="text-xl font-bold text-white">{teamStats.tournamentPoints}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-[#D4AF38]" />
                  <div>
                    <p className="text-sm text-gray-400">Active Wrestlers</p>
                    <p className="text-xl font-bold text-white">{teamStats.wrestlers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-[#D4AF38]" />
                  <div>
                    <p className="text-sm text-gray-400">Win Rate</p>
                    <p className="text-xl font-bold text-white">
                      {getWinPercentage(teamStats.dualRecord.wins, teamStats.dualRecord.losses)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="wrestlers" className="space-y-4">
          <TabsList className="bg-black/80 border border-[#D4AF38]/30">
            <TabsTrigger value="wrestlers" className="data-[state=active]:bg-[#D4AF38] data-[state=active]:text-black">
              Individual Stats
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-[#D4AF38] data-[state=active]:text-black">
              Team Analysis
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-[#D4AF38] data-[state=active]:text-black">
              Trends
            </TabsTrigger>
            <TabsTrigger value="scoring" className="data-[state=active]:bg-[#D4AF38] data-[state=active]:text-black">
              Scoring Breakdown
            </TabsTrigger>
          </TabsList>

          {/* Individual Stats Tab */}
          <TabsContent value="wrestlers">
            <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
              <CardHeader>
                <CardTitle className="text-[#D4AF38]">Wrestler Statistics</CardTitle>
                <CardDescription>Individual performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left p-2 text-gray-400">Wrestler</th>
                        <th className="text-center p-2 text-gray-400">Record</th>
                        <th className="text-center p-2 text-gray-400">Win %</th>
                        <th className="text-center p-2 text-gray-400 hidden md:table-cell">Pins</th>
                        <th className="text-center p-2 text-gray-400 hidden md:table-cell">TF</th>
                        <th className="text-center p-2 text-gray-400 hidden md:table-cell">MD</th>
                        <th className="text-center p-2 text-gray-400">Points</th>
                        <th className="text-center p-2 text-gray-400 hidden lg:table-cell">TD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wrestlers.filter(w => w.team === 'Fort Wayne North').map((wrestler, index) => (
                        <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                          <td className="p-2">
                            <div>
                              <p className="text-white font-medium">{wrestler.name}</p>
                              <p className="text-xs text-gray-500">Grade {wrestler.grade}</p>
                            </div>
                          </td>
                          <td className="text-center p-2 text-white">
                            {wrestler.record.wins}-{wrestler.record.losses}
                          </td>
                          <td className="text-center p-2">
                            <Badge className={
                              getWinPercentage(wrestler.record.wins, wrestler.record.losses) >= 70 
                                ? 'bg-green-600' 
                                : getWinPercentage(wrestler.record.wins, wrestler.record.losses) >= 50
                                ? 'bg-yellow-600'
                                : 'bg-red-600'
                            }>
                              {getWinPercentage(wrestler.record.wins, wrestler.record.losses)}%
                            </Badge>
                          </td>
                          <td className="text-center p-2 text-gray-400 hidden md:table-cell">
                            {wrestler.winTypes.pins}
                          </td>
                          <td className="text-center p-2 text-gray-400 hidden md:table-cell">
                            {wrestler.winTypes.techfalls}
                          </td>
                          <td className="text-center p-2 text-gray-400 hidden md:table-cell">
                            {wrestler.winTypes.majors}
                          </td>
                          <td className="text-center p-2 text-gray-400">
                            <span className="text-green-500">{wrestler.points.scored}</span>
                            {' - '}
                            <span className="text-red-500">{wrestler.points.allowed}</span>
                          </td>
                          <td className="text-center p-2 text-gray-400 hidden lg:table-cell">
                            {wrestler.takedowns}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Analysis Tab */}
          <TabsContent value="team">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
                <CardHeader>
                  <CardTitle className="text-[#D4AF38]">Weight Class Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['106', '113', '120', '126', '132', '138', '145', '152', '160', '170', '182', '195', '220', '285'].map(weight => {
                      const hasWrestler = Math.random() > 0.3 // Mock data
                      return (
                        <div key={weight} className="flex items-center justify-between">
                          <span className="text-gray-400">{weight} lbs</span>
                          {hasWrestler ? (
                            <Badge className="bg-green-600">Filled</Badge>
                          ) : (
                            <Badge className="bg-red-600">Open</Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
                <CardHeader>
                  <CardTitle className="text-[#D4AF38]">Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamStats?.topPerformers.map((wrestler, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-[#D4AF38] font-bold text-lg">#{index + 1}</div>
                          <div>
                            <p className="text-white font-medium">{wrestler.name}</p>
                            <p className="text-xs text-gray-500">
                              {wrestler.record.wins}-{wrestler.record.losses}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Win Rate</p>
                          <p className="text-lg font-bold text-[#D4AF38]">
                            {getWinPercentage(wrestler.record.wins, wrestler.record.losses)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
              <CardHeader>
                <CardTitle className="text-[#D4AF38]">Performance Trends</CardTitle>
                <CardDescription>Season progression and patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Win/Loss Trend */}
                  <div>
                    <h3 className="text-white font-medium mb-3">Monthly Performance</h3>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'].map(month => (
                        <div key={month} className="text-center">
                          <p className="text-xs text-gray-400 mb-1">{month}</p>
                          <div className="bg-gray-900/50 rounded p-2">
                            <p className="text-green-500 font-bold">{Math.floor(Math.random() * 10) + 5}</p>
                            <p className="text-red-500 text-sm">{Math.floor(Math.random() * 5)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scoring Trends */}
                  <div>
                    <h3 className="text-white font-medium mb-3">Scoring Efficiency</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Average Points Scored</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">8.4</span>
                          <ChevronUp className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                      <Progress value={84} className="h-2" />
                      
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-gray-400">Average Points Allowed</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">4.2</span>
                          <ChevronDown className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                      <Progress value={42} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scoring Breakdown Tab */}
          <TabsContent value="scoring">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
                <CardHeader>
                  <CardTitle className="text-[#D4AF38]">Scoring Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded">
                      <span className="text-gray-400">Takedowns</span>
                      <span className="text-white font-bold">342</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded">
                      <span className="text-gray-400">Reversals</span>
                      <span className="text-white font-bold">89</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded">
                      <span className="text-gray-400">Escapes</span>
                      <span className="text-white font-bold">156</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded">
                      <span className="text-gray-400">Near Falls (2pt)</span>
                      <span className="text-white font-bold">67</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded">
                      <span className="text-gray-400">Near Falls (3pt)</span>
                      <span className="text-white font-bold">45</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
                <CardHeader>
                  <CardTitle className="text-[#D4AF38]">Win Types Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Pins/Falls</span>
                        <span className="text-white">35%</span>
                      </div>
                      <Progress value={35} className="h-3" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Tech Falls</span>
                        <span className="text-white">15%</span>
                      </div>
                      <Progress value={15} className="h-3" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Major Decisions</span>
                        <span className="text-white">20%</span>
                      </div>
                      <Progress value={20} className="h-3" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Decisions</span>
                        <span className="text-white">30%</span>
                      </div>
                      <Progress value={30} className="h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/wrestling-matches">
            <Button variant="outline" className="border-[#D4AF38] text-[#D4AF38]">
              View Matches
            </Button>
          </Link>
          <Link href="/team-stats">
            <Button variant="outline" className="border-[#D4AF38] text-[#D4AF38]">
              Team Stats
            </Button>
          </Link>
          <Link href="/test-data">
            <Button variant="outline" className="border-blue-600 text-blue-600">
              Manage Test Data
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}