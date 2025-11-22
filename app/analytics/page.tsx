'use client'

import { useState, useEffect } from 'react'
import { 
  Trophy, Users, TrendingUp, Award, Target, Activity, 
  BarChart3, PieChart, Calendar, Clock, User, Home,
  ChevronUp, ChevronDown, Minus, Star
} from 'lucide-react'
import Link from 'next/link'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'

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
  const [activeTab, setActiveTab] = useState('wrestlers')

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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative">
      <WrestlingStatsBackground />
      
      <div className="relative z-10 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#D4AF38]">Wrestling Analytics</h1>
          <p className="text-gray-400">Comprehensive team and wrestler statistics</p>
        </div>
        <Link href="/dashboard">
          <button className="px-4 py-2 border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
            <Home className="h-4 w-4" />
            Dashboard
          </button>
        </Link>
      </div>

      {/* Team Overview */}
      {teamStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-[#D4AF38]" />
              <div>
                <p className="text-sm text-gray-400">Dual Record</p>
                <p className="text-xl font-bold text-white">
                  {teamStats.dualRecord.wins}-{teamStats.dualRecord.losses}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-[#D4AF38]" />
              <div>
                <p className="text-sm text-gray-400">Tournament Points</p>
                <p className="text-xl font-bold text-white">{teamStats.tournamentPoints}</p>
              </div>
            </div>
          </div>

          <div className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-[#D4AF38]" />
              <div>
                <p className="text-sm text-gray-400">Active Wrestlers</p>
                <p className="text-xl font-bold text-white">{teamStats.wrestlers}</p>
              </div>
            </div>
          </div>

          <div className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-[#D4AF38]" />
              <div>
                <p className="text-sm text-gray-400">Win Rate</p>
                <p className="text-xl font-bold text-white">
                  {getWinPercentage(teamStats.dualRecord.wins, teamStats.dualRecord.losses)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30 rounded-lg">
        <div className="flex gap-4 p-4 border-b border-[#D4AF38]/30">
          <button
            onClick={() => setActiveTab('wrestlers')}
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'wrestlers' 
                ? 'bg-[#D4AF38] text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Individual Stats
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'team' 
                ? 'bg-[#D4AF38] text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Team Analysis
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'trends' 
                ? 'bg-[#D4AF38] text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Trends
          </button>
          <button
            onClick={() => setActiveTab('scoring')}
            className={`px-4 py-2 rounded transition-colors ${
              activeTab === 'scoring' 
                ? 'bg-[#D4AF38] text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Scoring Breakdown
          </button>
        </div>

        <div className="p-6">
          {/* Individual Stats Tab */}
          {activeTab === 'wrestlers' && (
            <div>
              <h2 className="text-[#D4AF38] text-xl font-bold mb-4">Wrestler Statistics</h2>
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
                          <span className={`px-2 py-1 rounded text-xs ${
                            getWinPercentage(wrestler.record.wins, wrestler.record.losses) >= 70 
                              ? 'bg-green-600' 
                              : getWinPercentage(wrestler.record.wins, wrestler.record.losses) >= 50
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }`}>
                            {getWinPercentage(wrestler.record.wins, wrestler.record.losses)}%
                          </span>
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
            </div>
          )}

          {/* Team Analysis Tab */}
          {activeTab === 'team' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-[#D4AF38] text-lg font-bold mb-4">Weight Class Coverage</h3>
                <div className="space-y-3">
                  {['106', '113', '120', '126', '132', '138', '145', '152', '160', '170', '182', '195', '220', '285'].map(weight => {
                    const hasWrestler = Math.random() > 0.3 // Mock data
                    return (
                      <div key={weight} className="flex items-center justify-between p-2 bg-black/80 rounded">
                        <span className="text-gray-400">{weight} lbs</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          hasWrestler ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {hasWrestler ? 'Filled' : 'Open'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-[#D4AF38] text-lg font-bold mb-4">Top Performers</h3>
                <div className="space-y-4">
                  {teamStats?.topPerformers.map((wrestler, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-black/80 rounded-lg">
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
              </div>
            </div>
          )}

          {/* Trends Tab */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-medium mb-3">Monthly Performance</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'].map(month => (
                    <div key={month} className="text-center">
                      <p className="text-xs text-gray-400 mb-1">{month}</p>
                      <div className="bg-black/80 rounded p-2">
                        <p className="text-green-500 font-bold">{Math.floor(Math.random() * 10) + 5}</p>
                        <p className="text-red-500 text-sm">{Math.floor(Math.random() * 5)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium mb-3">Scoring Efficiency</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Average Points Scored</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">8.4</span>
                        <ChevronUp className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-[#D4AF38] h-2 rounded-full" style={{ width: '84%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Average Points Allowed</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">4.2</span>
                        <ChevronDown className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-[#D4AF38] h-2 rounded-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scoring Breakdown Tab */}
          {activeTab === 'scoring' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-[#D4AF38] text-lg font-bold mb-4">Scoring Methods</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-black/80 rounded">
                    <span className="text-gray-400">Takedowns</span>
                    <span className="text-white font-bold">342</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-black/80 rounded">
                    <span className="text-gray-400">Reversals</span>
                    <span className="text-white font-bold">89</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-black/80 rounded">
                    <span className="text-gray-400">Escapes</span>
                    <span className="text-white font-bold">156</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-black/80 rounded">
                    <span className="text-gray-400">Near Falls (2pt)</span>
                    <span className="text-white font-bold">67</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-black/80 rounded">
                    <span className="text-gray-400">Near Falls (3pt)</span>
                    <span className="text-white font-bold">45</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[#D4AF38] text-lg font-bold mb-4">Win Types Distribution</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Pins/Falls</span>
                      <span className="text-white">35%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3">
                      <div className="bg-[#D4AF38] h-3 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Tech Falls</span>
                      <span className="text-white">15%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3">
                      <div className="bg-[#D4AF38] h-3 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Major Decisions</span>
                      <span className="text-white">20%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3">
                      <div className="bg-[#D4AF38] h-3 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Decisions</span>
                      <span className="text-white">30%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3">
                      <div className="bg-[#D4AF38] h-3 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/wrestling-matches">
          <button className="px-4 py-2 border border-[#D4AF38] text-[#D4AF38] rounded-lg hover:bg-[#D4AF38]/10 transition-colors">
            View Matches
          </button>
        </Link>
        <Link href="/team-stats">
          <button className="px-4 py-2 border border-[#D4AF38] text-[#D4AF38] rounded-lg hover:bg-[#D4AF38]/10 transition-colors">
            Team Stats
          </button>
        </Link>
      </div>
      </div>
    </div>
  )
}