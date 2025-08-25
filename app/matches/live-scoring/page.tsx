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
  ArrowUp, ArrowDown, RefreshCw, User, Settings, Save,
  Undo2, Redo2, History
} from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'
import MatchSetup from '@/components/match-setup'
import { useRouter } from 'next/navigation'

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
  result?: 'win' | 'loss' | 'draw'
  win_type?: 'pin' | 'tech_fall' | 'major_decision' | 'decision' | 'forfeit'
  pin_time?: string
}

const PERIODS = {
  1: { name: 'Period 1', duration: 120 },
  2: { name: 'Period 2', duration: 120 },
  3: { name: 'Period 3', duration: 120 },
  'SV': { name: 'Sudden Victory', duration: 60 },
  'TB': { name: 'Tiebreaker', duration: 30 },
  'UTB': { name: 'Ultimate TB', duration: 30 }
}

interface MatchAction {
  type: string
  timestamp: number
  previousState: LiveMatch
  description: string
}

export default function LiveScoringPage() {
  const router = useRouter()
  const [matchId, setMatchId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [autoSave, setAutoSave] = useState(true)
  const [actionHistory, setActionHistory] = useState<MatchAction[]>([])
  const [redoStack, setRedoStack] = useState<MatchAction[]>([])
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
  
  const handleStartMatch = (setupData: any) => {
    // Update match with setup data
    setMatch(prev => ({
      ...prev,
      wrestler1: {
        ...prev.wrestler1,
        name: setupData.wrestler1.name,
        team: setupData.wrestler1.team
      },
      wrestler2: {
        ...prev.wrestler2,
        name: setupData.wrestler2.name,
        team: setupData.wrestler2.team
      },
      weightClass: setupData.weightClass,
      matchType: setupData.matchType,
      referee: setupData.referee,
      mat: setupData.mat
    }))
    
    // Hide setup and show scoring interface
    setShowSetup(false)
    
    // Create match in database
    createMatch(setupData)
  }
  
  const createMatch = async (setupData: any) => {
    try {
      const response = await fetch('/api/matches/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wrestler1_name: setupData.wrestler1.name,
          wrestler1_team: setupData.wrestler1.team,
          wrestler1_id: setupData.wrestler1.id,
          wrestler2_name: setupData.wrestler2.name,
          wrestler2_team: setupData.wrestler2.team,
          wrestler2_id: setupData.wrestler2.id,
          weight_class: setupData.weightClass,
          mat_number: setupData.mat,
          referee_name: setupData.referee,
          match_type: setupData.matchType,
          bout_number: setupData.boutNumber
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setMatchId(data.data.id)
      }
    } catch (error) {
      console.error('Error creating match:', error)
    }
  }

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
          setMatch(prev => {
            const activeWrestler = match.ridingTimeActive as 'wrestler1' | 'wrestler2'
            return {
              ...prev,
              [activeWrestler]: {
                ...prev[activeWrestler],
                ridingTime: prev[activeWrestler].ridingTime + 1
              }
            }
          })
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

  // Record an action for undo/redo
  const recordAction = (type: string, description: string, newState: LiveMatch) => {
    const action: MatchAction = {
      type,
      timestamp: Date.now(),
      previousState: match,
      description
    }
    
    setActionHistory(prev => [...prev, action])
    setRedoStack([]) // Clear redo stack when new action is performed
    setMatch(newState)
  }

  // Undo last action
  const undo = () => {
    if (actionHistory.length === 0) return
    
    const lastAction = actionHistory[actionHistory.length - 1]
    const currentState = match
    
    // Move action to redo stack
    setRedoStack(prev => [...prev, {
      ...lastAction,
      previousState: currentState
    }])
    
    // Restore previous state
    setMatch(lastAction.previousState)
    setActionHistory(prev => prev.slice(0, -1))
    
    // Save to database
    if (autoSave && matchId) {
      saveMatchToDatabase()
    }
  }

  // Redo last undone action
  const redo = () => {
    if (redoStack.length === 0) return
    
    const redoAction = redoStack[redoStack.length - 1]
    const currentState = match
    
    // Move action back to history
    setActionHistory(prev => [...prev, {
      ...redoAction,
      previousState: currentState
    }])
    
    // Restore the state
    setMatch(redoAction.previousState)
    setRedoStack(prev => prev.slice(0, -1))
    
    // Save to database
    if (autoSave && matchId) {
      saveMatchToDatabase()
    }
  }

  const addScore = (wrestler: 'wrestler1' | 'wrestler2', points: number, action: string) => {
    const newState = {
      ...match,
      [wrestler]: {
        ...match[wrestler],
        score: match[wrestler].score + points
      },
      lastAction: `${match[wrestler].name} - ${action} +${points}`
    }
    
    recordAction('score', `${match[wrestler].name} - ${action} +${points}`, newState)
    
    // Auto-save if enabled
    if (autoSave && matchId) {
      saveMatchToDatabase()
    }
    
    // Save scoring event
    if (matchId) {
      saveMatchEvent(wrestler, action, points)
    }
  }

  // Save match to database
  const saveMatchToDatabase = async () => {
    if (!matchId) {
      // Create new match
      const response = await fetch('/api/matches/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wrestler1_name: match.wrestler1.name,
          wrestler1_team: match.wrestler1.team,
          wrestler2_name: match.wrestler2.name,
          wrestler2_team: match.wrestler2.team,
          weight_class: match.weightClass,
          mat_number: match.mat,
          referee_name: match.referee,
          match_type: match.matchType
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setMatchId(data.data.id)
      }
    } else {
      // Update existing match
      setIsSaving(true)
      
      const periodScores: any = {}
      if (match.period === 1) {
        periodScores.period1 = { wrestler1: match.wrestler1.score, wrestler2: match.wrestler2.score }
      } else if (match.period === 2) {
        periodScores.period2 = { wrestler1: match.wrestler1.score, wrestler2: match.wrestler2.score }
      } else if (match.period === 3) {
        periodScores.period3 = { wrestler1: match.wrestler1.score, wrestler2: match.wrestler2.score }
      }

      await fetch('/api/matches/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_id: matchId,
          wrestler1_score: match.wrestler1.score,
          wrestler2_score: match.wrestler2.score,
          wrestler1_name: match.wrestler1.name,
          wrestler2_name: match.wrestler2.name,
          wrestler1_stats: {
            takedowns: match.wrestler1.takedowns,
            escapes: match.wrestler1.escapes,
            reversals: match.wrestler1.reversals,
            near_fall_2: match.wrestler1.nearFall2,
            near_fall_3: match.wrestler1.nearFall3,
            near_fall_4: match.wrestler1.nearFall4,
            stalls: match.wrestler1.stalls,
            cautions: match.wrestler1.cautions,
            warnings: match.wrestler1.warnings,
            riding_time: match.wrestler1.ridingTime
          },
          wrestler2_stats: {
            takedowns: match.wrestler2.takedowns,
            escapes: match.wrestler2.escapes,
            reversals: match.wrestler2.reversals,
            near_fall_2: match.wrestler2.nearFall2,
            near_fall_3: match.wrestler2.nearFall3,
            near_fall_4: match.wrestler2.nearFall4,
            stalls: match.wrestler2.stalls,
            cautions: match.wrestler2.cautions,
            warnings: match.wrestler2.warnings,
            riding_time: match.wrestler2.ridingTime
          },
          current_period: match.period,
          match_time: timeRemaining,
          period_scores: periodScores,
          wrestler1_riding_time: match.wrestler1.ridingTime,
          wrestler2_riding_time: match.wrestler2.ridingTime
        })
      })
      
      setIsSaving(false)
    }
  }

  // Save individual scoring event
  const saveMatchEvent = async (wrestler: string, action: string, points: number) => {
    if (!matchId) return

    const wrestlerName = wrestler === 'wrestler1' ? match.wrestler1.name : match.wrestler2.name
    const periodNumber = match.period === 'SV' ? 4 : match.period === 'TB' ? 5 : match.period === 'UTB' ? 6 : match.period

    await fetch('/api/matches/live/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        match_id: matchId,
        event_time: 120 - timeRemaining, // Time elapsed in period
        period: periodNumber,
        event_type: action,
        points: points,
        wrestler_name: wrestlerName,
        move_name: action,
        from_position: match.currentPosition
      })
    })
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
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
          <MatchSetup onStartMatch={handleStartMatch} />
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
            className="bg-black/60 text-gold hover:bg-gold/20 font-semibold"
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
                    const newState = {
                      ...match,
                      wrestler1: { 
                        ...match.wrestler1, 
                        score: match.wrestler1.score + 2,
                        takedowns: match.wrestler1.takedowns + 1 
                      },
                      lastAction: `${match.wrestler1.name} - Takedown +2`
                    }
                    recordAction('score', `${match.wrestler1.name} - Takedown +2`, newState)
                    if (autoSave && matchId) saveMatchToDatabase()
                    if (matchId) saveMatchEvent('wrestler1', 'Takedown', 2)
                  }}
                  className="bg-green-700 hover:bg-green-800 text-white font-bold"
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
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold"
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
                  className="bg-purple-700 hover:bg-purple-800 text-white font-bold"
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
                  className="bg-orange-700 hover:bg-orange-800 text-white font-bold"
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
                  className="bg-orange-700 hover:bg-orange-800 text-white font-bold"
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
                  className="bg-orange-700 hover:bg-orange-800 text-white font-bold"
                  size="sm"
                >
                  N4<br/>+4
                </Button>
                <Button 
                  onClick={() => {
                    setMatch(prev => ({
                      ...prev,
                      result: 'win',
                      win_type: 'pin',
                      pin_time: `${Math.floor((120 - timeRemaining) / 60)}:${String((120 - timeRemaining) % 60).padStart(2, '0')}`,
                      lastAction: `${match.wrestler1.name} - PIN!`,
                      isRunning: false
                    }))
                    if (matchId) {
                      saveMatchToDatabase()
                    }
                  }}
                  className="bg-red-900 hover:bg-red-950 text-white font-bold"
                  size="sm"
                >
                  PIN
                </Button>
              </div>

              {/* Penalties */}
              <div className="space-y-2">
                <Button 
                  onClick={() => addCaution('wrestler1')}
                  variant="outline"
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold border-0"
                  size="sm"
                >
                  Caution ({match.wrestler1.cautions})
                </Button>
                <Button 
                  onClick={() => addStall('wrestler1')}
                  variant="outline"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold border-0"
                  size="sm"
                >
                  Stalling ({match.wrestler1.stalls})
                </Button>
                
                {/* Stalling Progression Display */}
                {match.wrestler1.stalls > 0 && (
                  <div className="flex gap-1 justify-center px-2">
                    <div className={`flex-1 h-2 rounded ${match.wrestler1.stalls >= 1 ? 'bg-yellow-500' : 'bg-gray-600'}`} title="Warning" />
                    <div className={`flex-1 h-2 rounded ${match.wrestler1.stalls >= 2 ? 'bg-orange-500' : 'bg-gray-600'}`} title="+1 pt" />
                    <div className={`flex-1 h-2 rounded ${match.wrestler1.stalls >= 3 ? 'bg-orange-600' : 'bg-gray-600'}`} title="+1 pt" />
                    <div className={`flex-1 h-2 rounded ${match.wrestler1.stalls >= 4 ? 'bg-red-600' : 'bg-gray-600'}`} title="+2 pts" />
                    {match.wrestler1.stalls >= 5 && (
                      <div className="flex-1 h-2 rounded bg-red-900 animate-pulse" title="DQ" />
                    )}
                  </div>
                )}
                
                <Button 
                  onClick={() => addPenalty('wrestler1', 1)}
                  variant="outline"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold border-0"
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
                      ? "bg-red-600 hover:bg-red-700 text-white font-bold" 
                      : "bg-green-700 hover:bg-green-800 text-white font-bold"
                    }
                    size="sm"
                  >
                    {match.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={() => setTimeRemaining(PERIODS[match.period].duration)}
                    variant="outline"
                    size="sm"
                    className="bg-black/60 text-gold hover:bg-gold/20 font-semibold"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Save and History Controls */}
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    onClick={undo}
                    disabled={actionHistory.length === 0}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold disabled:opacity-50"
                    size="sm"
                    title={actionHistory.length > 0 ? `Undo: ${actionHistory[actionHistory.length - 1]?.description}` : 'Nothing to undo'}
                  >
                    <Undo2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={redo}
                    disabled={redoStack.length === 0}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold disabled:opacity-50"
                    size="sm"
                    title={redoStack.length > 0 ? `Redo: ${redoStack[redoStack.length - 1]?.description}` : 'Nothing to redo'}
                  >
                    <Redo2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={saveMatchToDatabase}
                    disabled={isSaving}
                    className="bg-[#D4AF38] hover:bg-[#B8941C] text-black font-bold"
                    size="sm"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {isSaving ? 'Saving...' : 'Save Match'}
                  </Button>
                  <label className="flex items-center gap-2 text-white text-sm">
                    <input
                      type="checkbox"
                      checked={autoSave}
                      onChange={(e) => setAutoSave(e.target.checked)}
                      className="rounded"
                    />
                    Auto-save
                  </label>
                </div>
                
                {/* Action History Counter */}
                {actionHistory.length > 0 && (
                  <div className="text-center text-xs text-gray-400 mt-2">
                    <History className="w-3 h-3 inline mr-1" />
                    {actionHistory.length} action{actionHistory.length !== 1 ? 's' : ''} recorded
                  </div>
                )}
                {matchId && (
                  <div className="text-center text-xs text-gray-400 mt-2">
                    Match ID: {matchId}
                  </div>
                )}
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
                    className={match.currentPosition === 'top1' ? 'bg-red-600 text-white font-bold' : 'bg-red-800 text-white hover:bg-red-700'}
                  >
                    Red Top
                  </Button>
                  <Button
                    onClick={() => setPosition('top2')}
                    variant={match.currentPosition === 'top2' ? 'default' : 'outline'}
                    size="sm"
                    className={match.currentPosition === 'top2' ? 'bg-green-700 text-white font-bold' : 'bg-green-900 text-white hover:bg-green-800'}
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
                  className={match.bloodTime ? 'bg-red-700 text-white font-bold w-full' : 'bg-red-900 text-white w-full hover:bg-red-800'}
                  size="sm"
                >
                  <Droplets className="w-4 h-4 mr-2" />
                  Blood Time
                </Button>
                <Button
                  onClick={() => setMatch(prev => ({ ...prev, injuryTime: !prev.injuryTime }))}
                  variant={match.injuryTime ? 'default' : 'outline'}
                  className={match.injuryTime ? 'bg-orange-700 text-white font-bold w-full' : 'bg-orange-900 text-white w-full hover:bg-orange-800'}
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
                      className={match.period === p ? 'bg-gold text-black font-bold' : 'bg-black/60 text-gold hover:bg-gold/20 font-semibold'}
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
                      className={match.period === p ? 'bg-purple-700 text-white font-bold' : 'bg-purple-900 text-white hover:bg-purple-800'}
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
                  className="w-full bg-orange-700 hover:bg-orange-800 text-white font-bold"
                  size="sm"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Technical Fall
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-red-700 hover:bg-red-800 text-white font-bold"
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
                  className="bg-green-700 hover:bg-green-800 text-white font-bold"
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
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold"
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
                  className="bg-purple-700 hover:bg-purple-800 text-white font-bold"
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
                  className="bg-orange-700 hover:bg-orange-800 text-white font-bold"
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
                  className="bg-orange-700 hover:bg-orange-800 text-white font-bold"
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
                  className="bg-orange-700 hover:bg-orange-800 text-white font-bold"
                  size="sm"
                >
                  N4<br/>+4
                </Button>
                <Button 
                  onClick={() => {
                    setMatch(prev => ({
                      ...prev,
                      result: 'loss',
                      win_type: 'pin',
                      pin_time: `${Math.floor((120 - timeRemaining) / 60)}:${String((120 - timeRemaining) % 60).padStart(2, '0')}`,
                      lastAction: `${match.wrestler2.name} - PIN!`,
                      isRunning: false
                    }))
                    if (matchId) {
                      saveMatchToDatabase()
                    }
                  }}
                  className="bg-red-900 hover:bg-red-950 text-white font-bold"
                  size="sm"
                >
                  PIN
                </Button>
              </div>

              {/* Penalties */}
              <div className="space-y-2">
                <Button 
                  onClick={() => addCaution('wrestler2')}
                  variant="outline"
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold border-0"
                  size="sm"
                >
                  Caution ({match.wrestler2.cautions})
                </Button>
                <Button 
                  onClick={() => addStall('wrestler2')}
                  variant="outline"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold border-0"
                  size="sm"
                >
                  Stalling ({match.wrestler2.stalls})
                </Button>
                
                {/* Stalling Progression Display */}
                {match.wrestler2.stalls > 0 && (
                  <div className="flex gap-1 justify-center px-2">
                    <div className={`flex-1 h-2 rounded ${match.wrestler2.stalls >= 1 ? 'bg-yellow-500' : 'bg-gray-600'}`} title="Warning" />
                    <div className={`flex-1 h-2 rounded ${match.wrestler2.stalls >= 2 ? 'bg-orange-500' : 'bg-gray-600'}`} title="+1 pt" />
                    <div className={`flex-1 h-2 rounded ${match.wrestler2.stalls >= 3 ? 'bg-orange-600' : 'bg-gray-600'}`} title="+1 pt" />
                    <div className={`flex-1 h-2 rounded ${match.wrestler2.stalls >= 4 ? 'bg-red-600' : 'bg-gray-600'}`} title="+2 pts" />
                    {match.wrestler2.stalls >= 5 && (
                      <div className="flex-1 h-2 rounded bg-red-900 animate-pulse" title="DQ" />
                    )}
                  </div>
                )}
                
                <Button 
                  onClick={() => addPenalty('wrestler2', 1)}
                  variant="outline"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold border-0"
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