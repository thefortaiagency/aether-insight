'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, Calendar, Clock, MapPin, Video, 
  Plus, Search, Filter, PlayCircle, Users,
  TrendingUp, Target, Award, Activity
} from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'

// Mock match data
const RECENT_MATCHES = [
  {
    id: '1',
    date: '2024-01-20',
    time: '19:00',
    type: 'dual',
    opponent: 'Central High School',
    venue: 'Home',
    result: 'W',
    score: '42-24',
    videoAvailable: true,
    highlights: [
      { wrestler: 'Wyatt Hoppes', weight: 132, result: 'Pin', time: '1:45' },
      { wrestler: 'Jackson Webb', weight: 145, result: 'Tech Fall', score: '17-2' },
      { wrestler: 'Tanner Eppard', weight: 152, result: 'Decision', score: '8-5' }
    ]
  },
  {
    id: '2',
    date: '2024-01-18',
    time: '18:00',
    type: 'tournament',
    opponent: 'County Championship',
    venue: 'Lincoln High School',
    result: '2nd Place',
    score: null,
    videoAvailable: true,
    highlights: [
      { wrestler: 'Team', weight: null, result: '2nd Place', score: '185.5 pts' }
    ]
  },
  {
    id: '3',
    date: '2024-01-15',
    time: '19:00',
    type: 'dual',
    opponent: 'North High School',
    venue: 'Away',
    result: 'L',
    score: '28-36',
    videoAvailable: false,
    highlights: []
  }
]

const UPCOMING_MATCHES = [
  {
    id: '4',
    date: '2024-01-25',
    time: '19:00',
    type: 'dual',
    opponent: 'South High School',
    venue: 'Home',
    weigh_in: '17:00'
  },
  {
    id: '5',
    date: '2024-01-27',
    time: '09:00',
    type: 'tournament',
    opponent: 'State Qualifier',
    venue: 'State Arena',
    weigh_in: '07:00'
  }
]

// Live match simulation
const LIVE_MATCH = {
  wrestler1: { name: 'John Smith', team: 'Aether', score: 6 },
  wrestler2: { name: 'Mike Johnson', team: 'Central', score: 4 },
  weightClass: 132,
  period: 2,
  time: '1:45',
  moves: [
    { time: '5:23', wrestler: 'Smith', move: 'Takedown', points: 2 },
    { time: '4:45', wrestler: 'Johnson', move: 'Escape', points: 1 },
    { time: '3:12', wrestler: 'Smith', move: 'Takedown', points: 2 },
    { time: '2:30', wrestler: 'Johnson', move: 'Reversal', points: 2 },
    { time: '1:58', wrestler: 'Smith', move: 'Escape', points: 1 },
    { time: '1:45', wrestler: 'Smith', move: 'Takedown', points: 2 }
  ]
}

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState('live')
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 relative">
      <WrestlingStatsBackground />
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#D4AF38]">Match Center</h1>
          <p className="text-gray-200">Live Scoring & Match Management</p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-black/80 border border-[#D4AF38]/30">
            <TabsTrigger value="live" className="data-[state=active]:bg-[#D4AF38] data-[state=active]:text-black">
              Live Scoring
            </TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-[#D4AF38] data-[state=active]:text-black">
              Recent Matches
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-[#D4AF38] data-[state=active]:text-black">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-[#D4AF38] data-[state=active]:text-black">
              Statistics
            </TabsTrigger>
          </TabsList>

          {/* Live Scoring Tab */}
          <TabsContent value="live" className="space-y-6">
            <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
              <CardHeader className="border-b border-gold/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#D4AF38]">LIVE MATCH - {LIVE_MATCH.weightClass} lbs</CardTitle>
                  <div className="flex gap-2">
                    <Link href="/matches/live-scoring">
                      <Button className="bg-[#D4AF38] hover:bg-[#D4AF38]/90 text-black">
                        <Trophy className="h-4 w-4 mr-2" />
                        Advanced Scoring
                      </Button>
                    </Link>
                    <Badge className="bg-red-600 animate-pulse">LIVE</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Score Display */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-1">{LIVE_MATCH.wrestler1.team}</p>
                    <p className="text-2xl font-bold text-white mb-2">{LIVE_MATCH.wrestler1.name}</p>
                    <p className="text-5xl font-bold text-[#D4AF38]">{LIVE_MATCH.wrestler1.score}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-2">PERIOD {LIVE_MATCH.period}</p>
                    <div className="text-3xl font-mono text-white bg-black/80 rounded-lg py-2">
                      {LIVE_MATCH.time}
                    </div>
                    <p className="text-gray-400 text-sm mt-2">Riding Time: +0:45</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-1">{LIVE_MATCH.wrestler2.team}</p>
                    <p className="text-2xl font-bold text-white mb-2">{LIVE_MATCH.wrestler2.name}</p>
                    <p className="text-5xl font-bold text-white">{LIVE_MATCH.wrestler2.score}</p>
                  </div>
                </div>

                {/* Scoring Buttons */}
                <div className="grid grid-cols-5 gap-2 mb-6">
                  <Button className="bg-green-600 hover:bg-green-500 text-white">
                    Takedown<br/>+2
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                    Escape<br/>+1
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-500 text-white">
                    Reversal<br/>+2
                  </Button>
                  <Button className="bg-orange-600 hover:bg-orange-500 text-white">
                    Near Fall<br/>2|3|4
                  </Button>
                  <Button className="bg-yellow-600 hover:bg-yellow-500 text-white">
                    Penalty<br/>+1
                  </Button>
                </div>

                {/* Move Log */}
                <div className="bg-black/80 rounded-lg p-4">
                  <h3 className="text-[#D4AF38] font-semibold mb-3">Move Log</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {LIVE_MATCH.moves.map((move, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{move.time}</span>
                        <span className={`font-medium ${move.wrestler === 'Smith' ? 'text-[#D4AF38]' : 'text-white'}`}>
                          {move.wrestler}
                        </span>
                        <span className="text-white">{move.move}</span>
                        <span className="text-green-400">+{move.points}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-black/80 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Takedowns</p>
                    <p className="text-white font-semibold">Smith 3-1</p>
                  </div>
                  <div className="bg-black/80 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">First Takedown</p>
                    <p className="text-[#D4AF38] font-semibold">Smith</p>
                  </div>
                  <div className="bg-black/80 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">Escapes</p>
                    <p className="text-white font-semibold">Johnson 1-1</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Matches Tab */}
          <TabsContent value="recent" className="space-y-4">
            {RECENT_MATCHES.map((match) => (
              <Card key={match.id} className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30 hover:bg-black/70 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">{match.date}</p>
                        <p className="text-white text-sm">{match.time}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-white">{match.opponent}</h3>
                          {match.type === 'tournament' && <Badge className="bg-purple-600">Tournament</Badge>}
                          {match.type === 'dual' && <Badge className="bg-blue-600">Dual Meet</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {match.venue}
                          </span>
                          {match.videoAvailable && (
                            <span className="text-green-400 flex items-center gap-1">
                              <Video className="h-3 w-3" />
                              Video Available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {match.score ? (
                        <>
                          <Badge className={match.result === 'W' ? 'bg-green-600' : 'bg-red-600'}>
                            {match.result}
                          </Badge>
                          <p className="text-2xl font-bold text-white mt-1">{match.score}</p>
                        </>
                      ) : (
                        <Badge className="bg-[#D4AF38] text-black">{match.result}</Badge>
                      )}
                    </div>
                  </div>
                  
                  {match.highlights.length > 0 && (
                    <div className="pt-4 border-t border-gold/20">
                      <p className="text-gray-400 text-sm mb-2">Match Highlights</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {match.highlights.map((highlight, index) => (
                          <div key={index} className="bg-black/80 rounded p-2 text-sm">
                            <span className="text-[#D4AF38] font-medium">{highlight.wrestler}</span>
                            {highlight.weight && <span className="text-gray-400"> • {highlight.weight} lbs</span>}
                            <div className="text-white">{highlight.result} {('time' in highlight ? highlight.time : highlight.score)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="bg-[#D4AF38] hover:bg-[#D4AF38]/90 text-black">
                      <PlayCircle className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    {match.videoAvailable && (
                      <Button size="sm" variant="outline" className="border-gold/30 text-white hover:bg-white/10">
                        <Video className="h-4 w-4 mr-1" />
                        Watch Video
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Upcoming Matches Tab */}
          <TabsContent value="upcoming" className="space-y-4">
            {UPCOMING_MATCHES.map((match) => (
              <Card key={match.id} className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center bg-[#D4AF38]/20 rounded-lg p-3">
                        <p className="text-[#D4AF38] text-xs font-semibold">
                          {new Date(match.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                        </p>
                        <p className="text-2xl font-bold text-white">
                          {new Date(match.date).getDate()}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{match.opponent}</h3>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {match.time}
                          </span>
                          <span className="text-gray-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {match.venue}
                          </span>
                          {match.type === 'tournament' && <Badge className="bg-purple-600">Tournament</Badge>}
                          {match.type === 'dual' && <Badge className="bg-blue-600">Dual Meet</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Weigh-in</p>
                      <p className="text-white font-semibold">{match.weigh_in}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Season Record</p>
                      <p className="text-2xl font-bold text-white">18-4</p>
                      <p className="text-xs text-gray-400">Dual Meets</p>
                    </div>
                    <Trophy className="h-8 w-8 text-[#D4AF38]" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Tournament Wins</p>
                      <p className="text-2xl font-bold text-white">5</p>
                      <p className="text-xs text-gray-400">This Season</p>
                    </div>
                    <Award className="h-8 w-8 text-[#D4AF38]" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Team Points</p>
                      <p className="text-2xl font-bold text-white">908</p>
                      <p className="text-xs text-gray-400">Dual Meets</p>
                    </div>
                    <Target className="h-8 w-8 text-[#D4AF38]" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Bonus Rate</p>
                      <p className="text-2xl font-bold text-white">51.2%</p>
                      <p className="text-xs text-gray-400">Pins + Tech Falls</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-[#D4AF38]" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
              <CardHeader>
                <CardTitle className="text-[#D4AF38]">Weight Class Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { weight: 106, wrestler: 'Open', record: '0-0', points: 0 },
                    { weight: 113, wrestler: 'Open', record: '0-0', points: 0 },
                    { weight: 120, wrestler: 'Ben Bush', record: '21-8', points: 91 },
                    { weight: 126, wrestler: 'Open', record: '0-0', points: 0 },
                    { weight: 132, wrestler: 'Wyatt Hoppes', record: '30-1', points: 115 },
                    { weight: 138, wrestler: 'Jayden Cline', record: '19-12', points: 72 },
                    { weight: 145, wrestler: 'Jackson Webb', record: '25-6', points: 102 },
                    { weight: 152, wrestler: 'Tanner Eppard', record: '20-9', points: 92 },
                    { weight: 160, wrestler: 'Arell Sago', record: '18-11', points: 79 }
                  ].map((wc) => (
                    <div key={wc.weight} className="bg-black/80 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#D4AF38] font-bold">{wc.weight} lbs</span>
                        <span className="text-gray-400 text-sm">{wc.points} pts</span>
                      </div>
                      <p className="text-white font-medium">{wc.wrestler}</p>
                      <p className="text-gray-400 text-sm">{wc.record}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}