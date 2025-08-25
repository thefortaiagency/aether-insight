'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Trophy, Clock, AlertCircle, Play, Pause, RotateCcw,
  ChevronUp, ChevronDown, Users, Activity, Award,
  TrendingUp, Shield, Zap, Flag, Circle, Square,
  Timer, Heart, Droplets, AlertTriangle, X, Check,
  ArrowUp, ArrowDown, RefreshCw, User, Settings
} from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'

interface Wrestler {
  name: string
  team: string
  score: number
  color: 'red' | 'green'
  stalls: number
  cautions: number
  warnings: number
  ridingTime: number
  position: 'neutral' | 'top' | 'bottom' | 'defer'
  takedowns: number
  reversals: number
  escapes: number
  nearFall2: number
  nearFall3: number
  nearFall4: number
  penalties: number
}

interface LiveMatch {
  id: string
  wrestler1: Wrestler
  wrestler2: Wrestler
  weightClass: number
  period: 1 | 2 | 3 | 'SV' | 'TB' | 'UTB'
  time: number
  isRunning: boolean
  lastAction: string
  bloodTime: boolean
  injuryTime: boolean
  currentPosition: 'neutral' | 'top1' | 'bottom1' | 'top2' | 'bottom2'
  ridingTimeActive: 'wrestler1' | 'wrestler2' | null
  matchType: 'dual' | 'tournament' | 'exhibition'
  referee: string
  mat: string
}

const PERIODS = {
  1: { name: 'Period 1', duration: 120 },
  2: { name: 'Period 2', duration: 120 },
  3: { name: 'Period 3', duration: 120 },
  'SV': { name: 'Sudden Victory', duration: 60 },
  'TB': { name: 'Tiebreaker', duration: 30 },
  'UTB': { name: 'Ultimate TB', duration: 30 }
}

export default function LiveScoringPage() {
  const [match, setMatch] = useState<LiveMatch>({
    id: 'match-1',
    wrestler1: {
      name: 'Smith, Frank',
      team: 'Aether',
      score: 0,
      color: 'red',
      stalls: 0,
      cautions: 0,
      warnings: 0,
      ridingTime: 0,
      position: 'neutral',
      takedowns: 0,
      reversals: 0,
      escapes: 0,
      nearFall2: 0,
      nearFall3: 0,
      nearFall4: 0,
      penalties: 0
    },
    wrestler2: {
      name: 'Johnson, Mike',
      team: 'Central',
      score: 0,
      color: 'green',
      stalls: 0,
      cautions: 0,
      warnings: 0,
      ridingTime: 0,
      position: 'neutral',
      takedowns: 0,
      reversals: 0,
      escapes: 0,
      nearFall2: 0,
      nearFall3: 0,
      nearFall4: 0,
      penalties: 0
    },
    weightClass: 126,
    period: 1,
    time: 120,
    isRunning: false,
    lastAction: 'Match Ready',
    bloodTime: false,
    injuryTime: false,
    currentPosition: 'neutral',
    ridingTimeActive: null,
    matchType: 'dual',
    referee: '',
    mat: '1'
  })

  const [timeRemaining, setTimeRemaining] = useState(120)
  const [showSetup, setShowSetup] = useState(true)

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (match.isRunning && !match.bloodTime && !match.injuryTime) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            // Period ended
            handlePeriodEnd()
            return 0
          }
          return prev - 1
        })

        // Update riding time
        if (match.ridingTimeActive) {
          setMatch(prev => ({
            ...prev,
            [match.ridingTimeActive]: {
              ...prev[match.ridingTimeActive as keyof typeof prev],
              ridingTime: (prev[match.ridingTimeActive as keyof typeof prev] as Wrestler).ridingTime + 1
            }
          }))
        }
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [match.isRunning, match.bloodTime, match.injuryTime, match.ridingTimeActive])

  const handlePeriodEnd = () => {
    setMatch(prev => ({
      ...prev,
      isRunning: false,
      lastAction: `End of ${PERIODS[prev.period].name}`
    }))
    
    // Auto-advance period
    if (match.period === 1) {
      setMatch(prev => ({ ...prev, period: 2 }))
      setTimeRemaining(120)
    } else if (match.period === 2) {
      setMatch(prev => ({ ...prev, period: 3 }))
      setTimeRemaining(120)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatRidingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const toggleMatch = () => {
    setMatch(prev => ({
      ...prev,
      isRunning: !prev.isRunning,
      lastAction: !prev.isRunning ? 'Match Started' : 'Match Paused'
    }))
  }

  const addScore = (wrestler: 'wrestler1' | 'wrestler2', points: number, action: string) => {
    setMatch(prev => ({
      ...prev,
      [wrestler]: {
        ...prev[wrestler],
        score: prev[wrestler].score + points
      },
      lastAction: `${prev[wrestler].name} - ${action} +${points}`
    }))
  }

  const addStall = (wrestler: 'wrestler1' | 'wrestler2') => {
    const currentStalls = match[wrestler].stalls
    let points = 0
    let penalty = 'Warning'
    
    if (currentStalls === 1) {
      points = 1
      penalty = 'Stalling +1'
    } else if (currentStalls === 2) {
      points = 1
      penalty = 'Stalling +1'
    } else if (currentStalls === 3) {
      points = 2
      penalty = 'Stalling +2'
    } else if (currentStalls >= 4) {
      // Disqualification
      penalty = 'Disqualification'
    }

    const opponent = wrestler === 'wrestler1' ? 'wrestler2' : 'wrestler1'
    
    setMatch(prev => ({
      ...prev,
      [wrestler]: {
        ...prev[wrestler],
        stalls: prev[wrestler].stalls + 1
      },
      [opponent]: points > 0 ? {
        ...prev[opponent],
        score: prev[opponent].score + points
      } : prev[opponent],
      lastAction: `${prev[wrestler].name} - ${penalty}`
    }))
  }

  const setPosition = (position: 'neutral' | 'top1' | 'bottom1' | 'top2' | 'bottom2') => {
    let ridingTimeActive = null
    
    if (position === 'top1') {
      ridingTimeActive = 'wrestler1'
    } else if (position === 'top2') {
      ridingTimeActive = 'wrestler2'
    }
    
    setMatch(prev => ({
      ...prev,
      currentPosition: position,
      ridingTimeActive: ridingTimeActive as any,
      lastAction: `Position: ${position === 'neutral' ? 'Neutral' : position.includes('1') ? `${prev.wrestler1.name} on top` : `${prev.wrestler2.name} on top`}`
    }))
  }

  // Penalty Management
  const addCaution = (wrestler: 'wrestler1' | 'wrestler2') => {
    setMatch(prev => ({
      ...prev,
      [wrestler]: {
        ...prev[wrestler],
        cautions: prev[wrestler].cautions + 1
      },
      lastAction: `${prev[wrestler].name} - Caution`
    }))
  }

  const addPenalty = (wrestler: 'wrestler1' | 'wrestler2', points: number) => {
    const opponent = wrestler === 'wrestler1' ? 'wrestler2' : 'wrestler1'
    
    setMatch(prev => ({
      ...prev,
      [wrestler]: {
        ...prev[wrestler],
        penalties: prev[wrestler].penalties + 1
      },
      [opponent]: {
        ...prev[opponent],
        score: prev[opponent].score + points
      },
      lastAction: `${prev[wrestler].name} - Penalty +${points} to opponent`
    }))
  }

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
        <WrestlingStatsBackground />
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
          <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
            <CardContent className="p-8">
              <h1 className="text-3xl font-bold text-gold mb-6">Match Setup</h1>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Red Wrestler</label>
                    <Input 
                      value={match.wrestler1.name}
                      onChange={(e) => setMatch(prev => ({
                        ...prev,
                        wrestler1: { ...prev.wrestler1, name: e.target.value }
                      }))}
                      className="bg-black/50 border-red-500/30 text-white"
                      placeholder="Last, First"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Green Wrestler</label>
                    <Input 
                      value={match.wrestler2.name}
                      onChange={(e) => setMatch(prev => ({
                        ...prev,
                        wrestler2: { ...prev.wrestler2, name: e.target.value }
                      }))}
                      className="bg-black/50 border-green-500/30 text-white"
                      placeholder="Last, First"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Weight Class</label>
                    <Select value={match.weightClass.toString()} onValueChange={(val) => setMatch(prev => ({ ...prev, weightClass: parseInt(val) }))}>
                      <SelectTrigger className="bg-black/50 border-gold/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[106, 113, 120, 126, 132, 138, 145, 152, 160, 170, 182, 195, 220, 285].map(weight => (
                          <SelectItem key={weight} value={weight.toString()}>{weight} lbs</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Match Type</label>
                    <Select value={match.matchType} onValueChange={(val: any) => setMatch(prev => ({ ...prev, matchType: val }))}>
                      <SelectTrigger className="bg-black/50 border-gold/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dual">Dual Meet</SelectItem>
                        <SelectItem value="tournament">Tournament</SelectItem>
                        <SelectItem value="exhibition">Exhibition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Mat</label>
                    <Input 
                      value={match.mat}
                      onChange={(e) => setMatch(prev => ({ ...prev, mat: e.target.value }))}
                      className="bg-black/50 border-gold/30 text-white"
                      placeholder="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Referee</label>
                  <Input 
                    value={match.referee}
                    onChange={(e) => setMatch(prev => ({ ...prev, referee: e.target.value }))}
                    className="bg-black/50 border-gold/30 text-white"
                    placeholder="Referee Name"
                  />
                </div>

                <Button 
                  onClick={() => setShowSetup(false)}
                  className="w-full bg-gold hover:bg-gold/90 text-black font-bold"
                >
                  Start Match
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      <WrestlingStatsBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-4">
        {/* Header Bar */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex gap-2">
            <Badge className="bg-gold/20 text-gold border-gold">
              {match.weightClass} lbs
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500">
              {PERIODS[match.period].name}
            </Badge>
            {match.matchType === 'tournament' && (
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500">
                Mat {match.mat}
              </Badge>
            )}
          </div>
          
          <Button 
            onClick={() => setShowSetup(true)}
            variant="outline"
            size="sm"
            className="border-gold/30 text-gold hover:bg-gold/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Setup
          </Button>
        </div>

        {/* Main Scoring Interface */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Red Wrestler (Left) */}
          <Card className="bg-black/80 backdrop-blur-sm border-red-500/30">
            <CardContent className="p-4">
              <div className="text-center mb-4">
                <Badge className="bg-red-500 text-white mb-2">RED</Badge>
                <h2 className="text-xl font-bold text-white">{match.wrestler1.name}</h2>
                <p className="text-gray-400 text-sm">{match.wrestler1.team}</p>
              </div>

              <div className="text-center mb-4">
                <div className="text-6xl font-bold text-red-500">{match.wrestler1.score}</div>
              </div>

              {/* Scoring Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button 
                  onClick={() => {
                    addScore('wrestler1', 2, 'Takedown')
                    setMatch(prev => ({
                      ...prev,
                      wrestler1: { ...prev.wrestler1, takedowns: prev.wrestler1.takedowns + 1 }
                    }))
                  }}
                  className="bg-green-600 hover:bg-green-500 text-white"
                  size="sm"
                >
                  TD<br/>+2
                </Button>
                <Button 
                  onClick={() => {
                    addScore('wrestler1', 1, 'Escape')
                    setMatch(prev => ({
                      ...prev,
                      wrestler1: { ...prev.wrestler1, escapes: prev.wrestler1.escapes + 1 }
                    }))
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                  size="sm"
                >
                  E<br/>+1
                </Button>
                <Button 
                  onClick={() => {
                    addScore('wrestler1', 2, 'Reversal')
                    setMatch(prev => ({
                      ...prev,
                      wrestler1: { ...prev.wrestler1, reversals: prev.wrestler1.reversals + 1 }
                    }))
                  }}
                  className="bg-purple-600 hover:bg-purple-500 text-white"
                  size="sm"
                >
                  R<br/>+2
                </Button>
                <Button 
                  onClick={() => {
                    addScore('wrestler1', 2, 'Near Fall')
                    setMatch(prev => ({
                      ...prev,
                      wrestler1: { ...prev.wrestler1, nearFall2: prev.wrestler1.nearFall2 + 1 }
                    }))
                  }}
                  className="bg-orange-600 hover:bg-orange-500 text-white"
                  size="sm"
                >
                  N2<br/>+2
                </Button>
                <Button 
                  onClick={() => {
                    addScore('wrestler1', 3, 'Near Fall 3')
                    setMatch(prev => ({
                      ...prev,
                      wrestler1: { ...prev.wrestler1, nearFall3: prev.wrestler1.nearFall3 + 1 }
                    }))
                  }}
                  className="bg-orange-600 hover:bg-orange-500 text-white"
                  size="sm"
                >
                  N3<br/>+3
                </Button>
                <Button 
                  onClick={() => {
                    addScore('wrestler1', 4, 'Near Fall 4')
                    setMatch(prev => ({
                      ...prev,
                      wrestler1: { ...prev.wrestler1, nearFall4: prev.wrestler1.nearFall4 + 1 }
                    }))
                  }}
                  className="bg-orange-600 hover:bg-orange-500 text-white"
                  size="sm"
                >
                  N4<br/>+4
                </Button>
              </div>

              {/* Penalties */}
              <div className="space-y-2">
                <Button 
                  onClick={() => addCaution('wrestler1')}
                  variant="outline"
                  className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                  size="sm"
                >
                  Caution ({match.wrestler1.cautions})
                </Button>
                <Button 
                  onClick={() => addStall('wrestler1')}
                  variant="outline"
                  className="w-full border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                  size="sm"
                >
                  Stalling ({match.wrestler1.stalls})
                </Button>
                <Button 
                  onClick={() => addPenalty('wrestler1', 1)}
                  variant="outline"
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                  size="sm"
                >
                  Penalty
                </Button>
              </div>

              {/* Riding Time */}
              <div className="mt-4 p-2 bg-black/50 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Riding Time</span>
                  <span className={`font-mono ${match.ridingTimeActive === 'wrestler1' ? 'text-green-400' : 'text-white'}`}>
                    {formatRidingTime(match.wrestler1.ridingTime)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Center Controls */}
          <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
            <CardContent className="p-4">
              {/* Timer */}
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-white mb-2">
                  {formatTime(timeRemaining)}
                </div>
                <div className="flex justify-center gap-2">
                  <Button
                    onClick={toggleMatch}
                    className={match.isRunning 
                      ? "bg-red-500 hover:bg-red-600" 
                      : "bg-green-500 hover:bg-green-600"
                    }
                    size="sm"
                  >
                    {match.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={() => setTimeRemaining(PERIODS[match.period].duration)}
                    variant="outline"
                    size="sm"
                    className="border-gold/30 text-gold hover:bg-gold/10"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Position Control */}
              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">Position</label>
                <div className="grid grid-cols-3 gap-1">
                  <Button
                    onClick={() => setPosition('neutral')}
                    variant={match.currentPosition === 'neutral' ? 'default' : 'outline'}
                    size="sm"
                    className={match.currentPosition === 'neutral' ? 'bg-gold text-black' : 'border-gold/30 text-gold'}
                  >
                    Neutral
                  </Button>
                  <Button
                    onClick={() => setPosition('top1')}
                    variant={match.currentPosition === 'top1' ? 'default' : 'outline'}
                    size="sm"
                    className={match.currentPosition === 'top1' ? 'bg-red-500 text-white' : 'border-red-500/30 text-red-400'}
                  >
                    Red Top
                  </Button>
                  <Button
                    onClick={() => setPosition('top2')}
                    variant={match.currentPosition === 'top2' ? 'default' : 'outline'}
                    size="sm"
                    className={match.currentPosition === 'top2' ? 'bg-green-500 text-white' : 'border-green-500/30 text-green-400'}
                  >
                    Green Top
                  </Button>
                </div>
              </div>

              {/* Special Times */}
              <div className="space-y-2 mb-4">
                <Button
                  onClick={() => setMatch(prev => ({ ...prev, bloodTime: !prev.bloodTime }))}
                  variant={match.bloodTime ? 'default' : 'outline'}
                  className={match.bloodTime ? 'bg-red-600 text-white w-full' : 'border-red-500/30 text-red-400 w-full hover:bg-red-500/10'}
                  size="sm"
                >
                  <Droplets className="w-4 h-4 mr-2" />
                  Blood Time
                </Button>
                <Button
                  onClick={() => setMatch(prev => ({ ...prev, injuryTime: !prev.injuryTime }))}
                  variant={match.injuryTime ? 'default' : 'outline'}
                  className={match.injuryTime ? 'bg-orange-600 text-white w-full' : 'border-orange-500/30 text-orange-400 w-full hover:bg-orange-500/10'}
                  size="sm"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Injury Time
                </Button>
              </div>

              {/* Period Selection */}
              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">Period</label>
                <div className="grid grid-cols-3 gap-1">
                  {([1, 2, 3] as const).map(p => (
                    <Button
                      key={p}
                      onClick={() => {
                        setMatch(prev => ({ ...prev, period: p }))
                        setTimeRemaining(120)
                      }}
                      variant={match.period === p ? 'default' : 'outline'}
                      size="sm"
                      className={match.period === p ? 'bg-gold text-black' : 'border-gold/30 text-gold'}
                    >
                      P{p}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  {(['SV', 'TB', 'UTB'] as const).map(p => (
                    <Button
                      key={p}
                      onClick={() => {
                        setMatch(prev => ({ ...prev, period: p }))
                        setTimeRemaining(PERIODS[p].duration)
                      }}
                      variant={match.period === p ? 'default' : 'outline'}
                      size="sm"
                      className={match.period === p ? 'bg-purple-500 text-white' : 'border-purple-500/30 text-purple-400'}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Match Actions */}
              <div className="space-y-2">
                <Button
                  className="w-full bg-gold hover:bg-gold/90 text-black font-bold"
                  size="sm"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  PIN
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                  size="sm"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Technical Fall
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Forfeit
                </Button>
              </div>

              {/* Last Action */}
              <div className="mt-4 p-2 bg-black/50 rounded">
                <p className="text-xs text-gray-400">Last Action</p>
                <p className="text-sm text-gold">{match.lastAction}</p>
              </div>
            </CardContent>
          </Card>

          {/* Green Wrestler (Right) */}
          <Card className="bg-black/80 backdrop-blur-sm border-green-500/30">
            <CardContent className="p-4">
              <div className="text-center mb-4">
                <Badge className="bg-green-500 text-white mb-2">GREEN</Badge>
                <h2 className="text-xl font-bold text-white">{match.wrestler2.name}</h2>
                <p className="text-gray-400 text-sm">{match.wrestler2.team}</p>
              </div>

              <div className="text-center mb-4">
                <div className="text-6xl font-bold text-green-500">{match.wrestler2.score}</div>
              </div>

              {/* Scoring Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button 
                  onClick={() => {
                    addScore('wrestler2', 2, 'Takedown')
                    setMatch(prev => ({
                      ...prev,
                      wrestler2: { ...prev.wrestler2, takedowns: prev.wrestler2.takedowns + 1 }
                    }))
                  }}
                  className="bg-green-600 hover:bg-green-500 text-white"
                  size="sm"
                >
                  TD<br/>+2
                </Button>
                <Button 
                  onClick={() => {
                    addScore('wrestler2', 1, 'Escape')
                    setMatch(prev => ({
                      ...prev,
                      wrestler2: { ...prev.wrestler2, escapes: prev.wrestler2.escapes + 1 }
                    }))
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                  size="sm"
                >
                  E<br/>+1
                </Button>
                <Button 
                  onClick={() => {
                    addScore('wrestler2', 2, 'Reversal')
                    setMatch(prev => ({
                      ...prev,
                      wrestler2: { ...prev.wrestler2, reversals: prev.wrestler2.reversals + 1 }
                    }))
                  }}
                  className="bg-purple-600 hover:bg-purple-500 text-white"
                  size="sm"
                >
                  R<br/>+2
                </Button>
                <Button 
                  onClick={() => {
                    addScore('wrestler2', 2, 'Near Fall')
                    setMatch(prev => ({
                      ...prev,
                      wrestler2: { ...prev.wrestler2, nearFall2: prev.wrestler2.nearFall2 + 1 }
                    }))
                  }}
                  className="bg-orange-600 hover:bg-orange-500 text-white"
                  size="sm"
                >
                  N2<br/>+2
                </Button>
                <Button 
                  onClick={() => {
                    addScore('wrestler2', 3, 'Near Fall 3')
                    setMatch(prev => ({
                      ...prev,
                      wrestler2: { ...prev.wrestler2, nearFall3: prev.wrestler2.nearFall3 + 1 }
                    }))
                  }}
                  className="bg-orange-600 hover:bg-orange-500 text-white"
                  size="sm"
                >
                  N3<br/>+3
                </Button>
                <Button 
                  onClick={() => {
                    addScore('wrestler2', 4, 'Near Fall 4')
                    setMatch(prev => ({
                      ...prev,
                      wrestler2: { ...prev.wrestler2, nearFall4: prev.wrestler2.nearFall4 + 1 }
                    }))
                  }}
                  className="bg-orange-600 hover:bg-orange-500 text-white"
                  size="sm"
                >
                  N4<br/>+4
                </Button>
              </div>

              {/* Penalties */}
              <div className="space-y-2">
                <Button 
                  onClick={() => addCaution('wrestler2')}
                  variant="outline"
                  className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                  size="sm"
                >
                  Caution ({match.wrestler2.cautions})
                </Button>
                <Button 
                  onClick={() => addStall('wrestler2')}
                  variant="outline"
                  className="w-full border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                  size="sm"
                >
                  Stalling ({match.wrestler2.stalls})
                </Button>
                <Button 
                  onClick={() => addPenalty('wrestler2', 1)}
                  variant="outline"
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                  size="sm"
                >
                  Penalty
                </Button>
              </div>

              {/* Riding Time */}
              <div className="mt-4 p-2 bg-black/50 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Riding Time</span>
                  <span className={`font-mono ${match.ridingTimeActive === 'wrestler2' ? 'text-green-400' : 'text-white'}`}>
                    {formatRidingTime(match.wrestler2.ridingTime)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Bar */}
        <Card className="mt-4 bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-400">Takedowns</p>
                <p className="text-white font-bold">{match.wrestler1.takedowns}-{match.wrestler2.takedowns}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Escapes</p>
                <p className="text-white font-bold">{match.wrestler1.escapes}-{match.wrestler2.escapes}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Reversals</p>
                <p className="text-white font-bold">{match.wrestler1.reversals}-{match.wrestler2.reversals}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Near Falls</p>
                <p className="text-white font-bold">
                  {match.wrestler1.nearFall2 + match.wrestler1.nearFall3 + match.wrestler1.nearFall4}-
                  {match.wrestler2.nearFall2 + match.wrestler2.nearFall3 + match.wrestler2.nearFall4}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Stalls</p>
                <p className="text-white font-bold">{match.wrestler1.stalls}-{match.wrestler2.stalls}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Cautions</p>
                <p className="text-white font-bold">{match.wrestler1.cautions}-{match.wrestler2.cautions}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">RT Adv</p>
                <p className="text-white font-bold">
                  {match.wrestler1.ridingTime > match.wrestler2.ridingTime 
                    ? `Red +${formatRidingTime(match.wrestler1.ridingTime - match.wrestler2.ridingTime)}`
                    : match.wrestler2.ridingTime > match.wrestler1.ridingTime
                    ? `Green +${formatRidingTime(match.wrestler2.ridingTime - match.wrestler1.ridingTime)}`
                    : 'Even'
                  }
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Match Type</p>
                <p className="text-gold font-bold uppercase">{match.matchType}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}