'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Clock, 
  AlertCircle, 
  Play, 
  Pause, 
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Users,
  Activity,
  Award,
  TrendingUp,
  Shield,
  Zap,
  Flag
} from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'

interface LiveMatch {
  id: string
  wrestler1: {
    name: string
    team: string
    score: number
    stalls: number
    cautions: number
    ridingTime: number
  }
  wrestler2: {
    name: string
    team: string
    score: number
    stalls: number
    cautions: number
    ridingTime: number
  }
  weightClass: number
  period: number
  time: string
  isRunning: boolean
  lastAction: string
}

export default function LiveScoringPage() {
  const [match, setMatch] = useState<LiveMatch>({
    id: '1',
    wrestler1: {
      name: 'Wyatt Hoppes',
      team: 'Aether Wrestling',
      score: 0,
      stalls: 0,
      cautions: 0,
      ridingTime: 0
    },
    wrestler2: {
      name: 'Jake Thompson',
      team: 'Central High',
      score: 0,
      stalls: 0,
      cautions: 0,
      ridingTime: 0
    },
    weightClass: 132,
    period: 1,
    time: '2:00',
    isRunning: false,
    lastAction: 'Match Ready'
  })

  const [timeRemaining, setTimeRemaining] = useState(120) // 2 minutes in seconds
  const [ridingTimeActive, setRidingTimeActive] = useState<'wrestler1' | 'wrestler2' | null>(null)

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (match.isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Period ended
            handlePeriodEnd()
            return 0
          }
          return prev - 1
        })

        // Update riding time
        if (ridingTimeActive) {
          setMatch(prev => ({
            ...prev,
            [ridingTimeActive]: {
              ...prev[ridingTimeActive],
              ridingTime: prev[ridingTimeActive].ridingTime + 1
            }
          }))
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [match.isRunning, timeRemaining, ridingTimeActive])

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Format riding time
  const formatRidingTime = (seconds: number) => {
    const mins = Math.floor(Math.abs(seconds) / 60)
    const secs = Math.abs(seconds) % 60
    const sign = seconds >= 0 ? '' : '-'
    return `${sign}${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Scoring actions
  const scoreTakedown = (wrestler: 'wrestler1' | 'wrestler2') => {
    setMatch(prev => ({
      ...prev,
      [wrestler]: {
        ...prev[wrestler],
        score: prev[wrestler].score + 2
      },
      lastAction: `Takedown - ${prev[wrestler].name} (+2)`
    }))
    setRidingTimeActive(wrestler)
  }

  const scoreEscape = (wrestler: 'wrestler1' | 'wrestler2') => {
    setMatch(prev => ({
      ...prev,
      [wrestler]: {
        ...prev[wrestler],
        score: prev[wrestler].score + 1
      },
      lastAction: `Escape - ${prev[wrestler].name} (+1)`
    }))
    setRidingTimeActive(null)
  }

  const scoreReversal = (wrestler: 'wrestler1' | 'wrestler2') => {
    const otherWrestler = wrestler === 'wrestler1' ? 'wrestler2' : 'wrestler1'
    setMatch(prev => ({
      ...prev,
      [wrestler]: {
        ...prev[wrestler],
        score: prev[wrestler].score + 2
      },
      lastAction: `Reversal - ${prev[wrestler].name} (+2)`
    }))
    setRidingTimeActive(wrestler)
  }

  const scoreNearfall = (wrestler: 'wrestler1' | 'wrestler2', points: 2 | 3) => {
    setMatch(prev => ({
      ...prev,
      [wrestler]: {
        ...prev[wrestler],
        score: prev[wrestler].score + points
      },
      lastAction: `Near Fall - ${prev[wrestler].name} (+${points})`
    }))
  }

  const addStalling = (wrestler: 'wrestler1' | 'wrestler2') => {
    const otherWrestler = wrestler === 'wrestler1' ? 'wrestler2' : 'wrestler1'
    setMatch(prev => {
      const newStalls = prev[wrestler].stalls + 1
      let points = 0
      
      // Stalling progression: Warning, 1pt, 1pt, 2pts, DQ
      if (newStalls === 2) points = 1
      else if (newStalls === 3) points = 1
      else if (newStalls === 4) points = 2
      
      return {
        ...prev,
        [wrestler]: {
          ...prev[wrestler],
          stalls: newStalls
        },
        [otherWrestler]: {
          ...prev[otherWrestler],
          score: prev[otherWrestler].score + points
        },
        lastAction: newStalls === 1 
          ? `Stalling Warning - ${prev[wrestler].name}`
          : `Stalling - ${prev[wrestler].name} (${prev[otherWrestler].name} +${points})`
      }
    })
  }

  const toggleMatch = () => {
    setMatch(prev => ({
      ...prev,
      isRunning: !prev.isRunning,
      lastAction: !prev.isRunning ? 'Match Started' : 'Match Paused'
    }))
  }

  const handlePeriodEnd = () => {
    if (match.period < 3) {
      setMatch(prev => ({
        ...prev,
        period: prev.period + 1,
        isRunning: false,
        lastAction: `End of Period ${prev.period}`
      }))
      setTimeRemaining(120) // Reset to 2 minutes
      setRidingTimeActive(null)
    } else {
      // Match ended
      setMatch(prev => ({
        ...prev,
        isRunning: false,
        lastAction: 'Match Complete'
      }))
    }
  }

  const declareWinner = (type: 'pin' | 'tech' | 'injury' | 'dq', wrestler: 'wrestler1' | 'wrestler2') => {
    setMatch(prev => ({
      ...prev,
      isRunning: false,
      lastAction: `${type.toUpperCase()} - ${prev[wrestler].name} WINS!`
    }))
  }

  // Calculate riding time advantage
  const ridingTimeAdvantage = match.wrestler1.ridingTime - match.wrestler2.ridingTime
  const ridingTimePoint = Math.abs(ridingTimeAdvantage) >= 60 ? 1 : 0
  const ridingTimeWinner = ridingTimeAdvantage > 0 ? 'wrestler1' : 'wrestler2'

  return (
    <div className="min-h-screen relative">
      <WrestlingStatsBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gold via-yellow-400 to-gold 
            bg-clip-text text-transparent mb-2">
            Live Match Scoring
          </h1>
          <p className="text-gray-300">Advanced Real-Time Scoring System</p>
        </div>

        {/* Weight Class & Timer */}
        <Card className="mb-6 bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
          <div className="p-6 text-center">
            <Badge className="bg-gold/20 text-gold border-gold mb-4 text-lg px-4 py-2">
              {match.weightClass} lbs
            </Badge>
            
            <div className="text-6xl font-bold text-white mb-2">
              {formatTime(timeRemaining)}
            </div>
            
            <div className="flex justify-center items-center gap-4 mb-4">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500">
                Period {match.period}
              </Badge>
              {match.isRunning && (
                <Badge className="bg-green-500/20 text-green-300 border-green-500 animate-pulse">
                  <Activity className="w-3 h-3 mr-1" />
                  LIVE
                </Badge>
              )}
            </div>

            <div className="flex justify-center gap-2">
              <Button
                onClick={toggleMatch}
                className={match.isRunning 
                  ? "bg-red-500/20 hover:bg-red-500/30 border-red-500" 
                  : "bg-green-500/20 hover:bg-green-500/30 border-green-500"
                }
              >
                {match.isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {match.isRunning ? 'Pause' : 'Start'}
              </Button>
              
              <Button
                onClick={() => {
                  setTimeRemaining(120)
                  setMatch(prev => ({ ...prev, lastAction: 'Timer Reset' }))
                }}
                className="bg-purple-500/20 hover:bg-purple-500/30 border-purple-500"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Timer
              </Button>
            </div>
          </div>
        </Card>

        {/* Wrestlers Score Display */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Wrestler 1 */}
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-xl border-green-500/30">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{match.wrestler1.name}</h2>
                  <p className="text-green-400">{match.wrestler1.team}</p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-green-400">{match.wrestler1.score}</div>
                  <div className="text-sm text-gray-400">Points</div>
                </div>
              </div>

              {/* Riding Time */}
              <div className="mb-4 p-3 bg-black/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Riding Time</span>
                  <span className={`font-mono ${ridingTimeActive === 'wrestler1' ? 'text-green-400' : 'text-white'}`}>
                    {formatRidingTime(match.wrestler1.ridingTime)}
                  </span>
                </div>
              </div>

              {/* Penalties */}
              <div className="flex gap-2 mb-4">
                {match.wrestler1.stalls > 0 && (
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500">
                    Stalls: {match.wrestler1.stalls}
                  </Badge>
                )}
                {match.wrestler1.cautions > 0 && (
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500">
                    Cautions: {match.wrestler1.cautions}
                  </Badge>
                )}
              </div>

              {/* Scoring Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => scoreTakedown('wrestler1')}
                  className="bg-green-500/20 hover:bg-green-500/30 border-green-500"
                >
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Takedown (+2)
                </Button>
                <Button
                  onClick={() => scoreEscape('wrestler1')}
                  className="bg-green-500/20 hover:bg-green-500/30 border-green-500"
                >
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Escape (+1)
                </Button>
                <Button
                  onClick={() => scoreReversal('wrestler1')}
                  className="bg-green-500/20 hover:bg-green-500/30 border-green-500"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reversal (+2)
                </Button>
                <Button
                  onClick={() => scoreNearfall('wrestler1', 2)}
                  className="bg-green-500/20 hover:bg-green-500/30 border-green-500"
                >
                  NF2 (+2)
                </Button>
                <Button
                  onClick={() => scoreNearfall('wrestler1', 3)}
                  className="bg-green-500/20 hover:bg-green-500/30 border-green-500"
                >
                  NF3 (+3)
                </Button>
                <Button
                  onClick={() => addStalling('wrestler1')}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Stalling
                </Button>
              </div>

              {/* Quick Win Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button
                  onClick={() => declareWinner('pin', 'wrestler1')}
                  className="bg-gold/20 hover:bg-gold/30 border-gold"
                >
                  <Trophy className="w-4 h-4 mr-1" />
                  PIN
                </Button>
                <Button
                  onClick={() => declareWinner('tech', 'wrestler1')}
                  className="bg-gold/20 hover:bg-gold/30 border-gold"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Tech Fall
                </Button>
              </div>
            </div>
          </Card>

          {/* Wrestler 2 */}
          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-xl border-red-500/30">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{match.wrestler2.name}</h2>
                  <p className="text-red-400">{match.wrestler2.team}</p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-red-400">{match.wrestler2.score}</div>
                  <div className="text-sm text-gray-400">Points</div>
                </div>
              </div>

              {/* Riding Time */}
              <div className="mb-4 p-3 bg-black/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Riding Time</span>
                  <span className={`font-mono ${ridingTimeActive === 'wrestler2' ? 'text-red-400' : 'text-white'}`}>
                    {formatRidingTime(match.wrestler2.ridingTime)}
                  </span>
                </div>
              </div>

              {/* Penalties */}
              <div className="flex gap-2 mb-4">
                {match.wrestler2.stalls > 0 && (
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500">
                    Stalls: {match.wrestler2.stalls}
                  </Badge>
                )}
                {match.wrestler2.cautions > 0 && (
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500">
                    Cautions: {match.wrestler2.cautions}
                  </Badge>
                )}
              </div>

              {/* Scoring Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => scoreTakedown('wrestler2')}
                  className="bg-red-500/20 hover:bg-red-500/30 border-red-500"
                >
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Takedown (+2)
                </Button>
                <Button
                  onClick={() => scoreEscape('wrestler2')}
                  className="bg-red-500/20 hover:bg-red-500/30 border-red-500"
                >
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Escape (+1)
                </Button>
                <Button
                  onClick={() => scoreReversal('wrestler2')}
                  className="bg-red-500/20 hover:bg-red-500/30 border-red-500"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reversal (+2)
                </Button>
                <Button
                  onClick={() => scoreNearfall('wrestler2', 2)}
                  className="bg-red-500/20 hover:bg-red-500/30 border-red-500"
                >
                  NF2 (+2)
                </Button>
                <Button
                  onClick={() => scoreNearfall('wrestler2', 3)}
                  className="bg-red-500/20 hover:bg-red-500/30 border-red-500"
                >
                  NF3 (+3)
                </Button>
                <Button
                  onClick={() => addStalling('wrestler2')}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Stalling
                </Button>
              </div>

              {/* Quick Win Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button
                  onClick={() => declareWinner('pin', 'wrestler2')}
                  className="bg-gold/20 hover:bg-gold/30 border-gold"
                >
                  <Trophy className="w-4 h-4 mr-1" />
                  PIN
                </Button>
                <Button
                  onClick={() => declareWinner('tech', 'wrestler2')}
                  className="bg-gold/20 hover:bg-gold/30 border-gold"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Tech Fall
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Riding Time Advantage */}
        {ridingTimePoint > 0 && (
          <Card className="mb-6 bg-gold/10 backdrop-blur-xl border-gold/30">
            <div className="p-4 text-center">
              <div className="flex justify-center items-center gap-2">
                <Clock className="w-5 h-5 text-gold" />
                <span className="text-gold font-semibold">
                  Riding Time Point: {match[ridingTimeWinner].name} (+1)
                </span>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Advantage: {formatRidingTime(ridingTimeAdvantage)}
              </div>
            </div>
          </Card>
        )}

        {/* Last Action */}
        <Card className="bg-purple-500/10 backdrop-blur-xl border-purple-500/30">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 font-semibold">Last Action:</span>
              <span className="text-white">{match.lastAction}</span>
            </div>
          </div>
        </Card>

        {/* Period Score Breakdown */}
        <Card className="mt-6 bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gold mb-4">Period Breakdown</h3>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((period) => (
                <div key={period} className={`p-3 rounded-lg ${
                  match.period === period ? 'bg-gold/20 border border-gold' : 'bg-black/30'
                }`}>
                  <div className="text-center text-sm text-gray-400 mb-2">Period {period}</div>
                  <div className="flex justify-around">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {period <= match.period ? '0' : '-'}
                      </div>
                      <div className="text-xs text-gray-500">{match.wrestler1.name.split(' ')[1]}</div>
                    </div>
                    <div className="text-gray-500">vs</div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">
                        {period <= match.period ? '0' : '-'}
                      </div>
                      <div className="text-xs text-gray-500">{match.wrestler2.name.split(' ')[1]}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}