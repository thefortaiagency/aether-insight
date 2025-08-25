'use client'

import { useState, useEffect, useCallback } from 'react'
import { clearOldVideoStorage } from '@/utils/clear-old-storage'
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
  Undo2, Redo2, History, Printer, CheckCircle, Video, ChevronRight
} from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'
import MatchSetup from '@/components/match-setup'
import { BoutSheet } from '@/components/bout-sheet'
import { MatchEndDialog } from '@/components/match-end-dialog'
import { SimpleVideoRecorder } from '@/components/video/simple-video-recorder'
import { useRouter } from 'next/navigation'
import { offlineStorage } from '@/lib/offline-storage'
import { offlineQueue } from '@/lib/offline-queue'
import { OfflineStatus } from '@/components/offline-status'
import { SyncManager } from '@/components/sync-manager'
import { MatchComplete } from '@/components/match-complete'

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
  winner?: string
  winType?: string
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
  const [showBoutSheet, setShowBoutSheet] = useState(false)
  const [scoreHistory, setScoreHistory] = useState<any[]>([])
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [matchEnded, setMatchEnded] = useState(false)
  const [showVideoRecorder, setShowVideoRecorder] = useState(true) // Always show video recorder
  const [recordedVideoId, setRecordedVideoId] = useState<string | null>(null)
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
      console.log('Creating match with data:', setupData)
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
        console.log('✅ Match created successfully:', data)
        setMatchId(data.data.id)
        // Show success message
        setMatch(prev => ({
          ...prev,
          lastAction: `Match created - ID: ${data.data.id}`
        }))
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to create match:', errorData)
        alert(`Failed to create match: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ Error creating match:', error)
      alert(`Error creating match: ${error}`)
    }
  }

  // Clear old video storage on component mount
  useEffect(() => {
    clearOldVideoStorage()
  }, [])

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

  // Check for automatic match end conditions
  const checkMatchEnd = () => {
    const scoreDiff = Math.abs(match.wrestler1.score - match.wrestler2.score)
    
    // Tech Fall: 15+ point lead
    if (scoreDiff >= 15 && !matchEnded) {
      setMatch(prev => ({ ...prev, isRunning: false }))
      const leader = match.wrestler1.score > match.wrestler2.score ? 'wrestler1' : 'wrestler2'
      const leaderName = leader === 'wrestler1' ? match.wrestler1.name : match.wrestler2.name
      
      // Auto-show end dialog for tech fall
      recordAction('match_end', `Technical Fall - ${leaderName} leads by ${scoreDiff}`, match)
      setShowEndDialog(true)
    }
  }

  // Handle PIN button
  const handlePin = (wrestler: 'wrestler1' | 'wrestler2') => {
    setMatch(prev => ({ ...prev, isRunning: false }))
    const winnerName = wrestler === 'wrestler1' ? match.wrestler1.name : match.wrestler2.name
    const currentTime = formatTime(timeRemaining)
    
    // Directly end the match with PIN without showing dialog
    recordAction('match_end', `PIN by ${winnerName} at ${currentTime}`, match)
    setMatch(prev => ({
      ...prev,
      isRunning: false,
      winner: winnerName,
      winType: 'pin',
      pin_time: currentTime
    }))
    
    setMatchEnded(true)
    saveMatchToDatabase()
    
    // Record final action
    recordAction('match_end', `Match ended - PIN by ${winnerName} at ${currentTime}`, match)
  }

  // Handle match end confirmation
  const handleMatchEnd = (endType: string, winner: string, time?: string) => {
    const winnerName = winner === 'wrestler1' ? match.wrestler1.name : match.wrestler2.name
    const finalScore = `${match.wrestler1.score}-${match.wrestler2.score}`
    
    setMatch(prev => ({
      ...prev,
      isRunning: false,
      winner: winnerName,
      winType: endType,
      pin_time: time
    }))
    
    setMatchEnded(true)
    setShowEndDialog(false)
    
    // Save final match state
    saveMatchToDatabase()
    
    // Record in history
    recordAction('match_end', `Match ended - ${endType} by ${winnerName} (${finalScore})`, match)
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
    
    // Add to score history for bout sheet
    setScoreHistory(prev => [...prev, {
      timestamp: Date.now(),
      wrestlerId: wrestler,
      action: action,
      points: points,
      period: match.period,
      time: formatTime(timeRemaining)
    }])
    
    // Auto-save if enabled
    if (autoSave && matchId) {
      saveMatchToDatabase()
    }
    
    // Save scoring event
    if (matchId) {
      saveMatchEvent(wrestler, action, points)
    }
    
    // Check for tech fall
    checkMatchEnd()
  }

  // Save match to database
  const saveMatchToDatabase = async () => {
    if (!matchId) {
      // Create new match
      const matchData = {
        wrestler1_name: match.wrestler1.name,
        wrestler1_team: match.wrestler1.team,
        wrestler2_name: match.wrestler2.name,
        wrestler2_team: match.wrestler2.team,
        weight_class: match.weightClass,
        mat_number: match.mat,
        referee_name: match.referee,
        match_type: match.matchType
      }

      console.log('Creating new match (no ID yet):', matchData)

      // Check if online
      if (navigator.onLine) {
        try {
          const response = await fetch('/api/matches/live', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(matchData)
          })
          
          if (response.ok) {
            const data = await response.json()
            console.log('✅ Match created via saveMatchToDatabase:', data)
            setMatchId(data.data.id)
          } else {
            const errorData = await response.json()
            console.error('❌ Failed to create match:', errorData)
            throw new Error(errorData.error || 'Failed to save online')
          }
        } catch (error) {
          // Save offline if online save fails
          console.log('Saving match offline due to error:', error)
          const offlineId = await offlineStorage.saveMatch(matchData)
          setMatchId(offlineId)
        }
      } else {
        // Offline - save locally
        console.log('Offline - saving match locally')
        const offlineId = await offlineStorage.saveMatch(matchData)
        setMatchId(offlineId)
      }
    } else {
      // Update existing match
      console.log('Updating match:', matchId)
      setIsSaving(true)
      
      const periodScores: any = {}
      if (match.period === 1) {
        periodScores.period1 = { wrestler1: match.wrestler1.score, wrestler2: match.wrestler2.score }
      } else if (match.period === 2) {
        periodScores.period2 = { wrestler1: match.wrestler1.score, wrestler2: match.wrestler2.score }
      } else if (match.period === 3) {
        periodScores.period3 = { wrestler1: match.wrestler1.score, wrestler2: match.wrestler2.score }
      }

      const updateData = {
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
      }

      console.log('Updating match with data:', updateData)

      // Check if online and try to save
      if (navigator.onLine) {
        try {
          const response = await fetch('/api/matches/live', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
          })
          
          if (response.ok) {
            const data = await response.json()
            console.log('✅ Match updated successfully:', data)
          } else {
            const errorData = await response.json()
            console.error('❌ Failed to update match, queuing offline:', errorData)
            // Queue for later sync
            await offlineQueue.queueMatchUpdate(matchId, updateData)
          }
        } catch (error) {
          console.error('❌ Error updating match, queuing offline:', error)
          // Queue for later sync
          await offlineQueue.queueMatchUpdate(matchId, updateData)
        }
      } else {
        // Offline - queue the update
        console.log('📵 Offline - queuing match update for later sync')
        await offlineQueue.queueMatchUpdate(matchId, updateData)
        // Also save to offline storage for immediate local access
        await offlineStorage.saveMatch(updateData)
      }
      
      setIsSaving(false)
    }
  }

  // Save individual scoring event with video timestamp
  const saveMatchEvent = async (wrestler: string, action: string, points: number) => {
    if (!matchId) {
      console.warn('Cannot save event - no match ID yet')
      return
    }

    const wrestlerName = wrestler === 'wrestler1' ? match.wrestler1.name : match.wrestler2.name
    const periodNumber = match.period === 'SV' ? 4 : match.period === 'TB' ? 5 : match.period === 'UTB' ? 6 : match.period
    
    // Calculate video timestamp based on when match started
    // This assumes video recording starts when match is created
    const matchStartTime = actionHistory.length > 0 ? actionHistory[0].timestamp : Date.now()
    const videoTimestamp = Math.floor((Date.now() - matchStartTime) / 1000)

    // Format event_time as HH:MM:SS for the database
    const elapsedSeconds = 120 - timeRemaining
    const minutes = Math.floor(elapsedSeconds / 60)
    const seconds = elapsedSeconds % 60
    const formattedEventTime = `00:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

    const eventData = {
      match_id: matchId,
      event_time: formattedEventTime, // Format as HH:MM:SS
      video_timestamp: videoTimestamp, // Seconds from video start
      period: periodNumber,
      event_type: action,
      points: points,
      wrestler_id: null, // Set to null instead of "wrestler1" or "wrestler2" since we don't have UUID
      wrestler_name: wrestlerName,
      move_name: action,
      from_position: match.currentPosition
    }

    console.log('Saving match event:', eventData)

    // Check if online and try to save
    if (navigator.onLine) {
      try {
        const response = await fetch('/api/matches/live/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData)
        })

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Event saved successfully:', data)
        } else {
          const errorData = await response.json()
          console.error('❌ Failed to save event, queuing offline:', errorData)
          // Queue for later sync
          await offlineQueue.queueMatchEvent(matchId, eventData)
        }
      } catch (error) {
        console.error('❌ Error saving event, queuing offline:', error)
        // Queue for later sync
        await offlineQueue.queueMatchEvent(matchId, eventData)
      }
    } else {
      // Offline - queue the event
      console.log('📵 Offline - queuing event for later sync')
      await offlineQueue.queueMatchEvent(matchId, eventData)
    }
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

  // Show match complete screen when match has ended
  if (matchEnded && match.winner) {
    return (
      <MatchComplete
        match={match}
        timeElapsed={formatTime(120 - timeRemaining)}
        hasVideo={!!recordedVideoId || recordedVideoId !== null}
        videoSaved={true} // Videos are always saved locally now
        onSaveMatch={() => {
          saveMatchToDatabase()
          // Could navigate to match details or stay here
        }}
        onNewMatch={() => {
          setShowSetup(true)
          setMatchEnded(false)
          setMatch({
            ...match,
            wrestler1: { ...match.wrestler1, score: 0 },
            wrestler2: { ...match.wrestler2, score: 0 },
            winner: undefined,
            winType: undefined,
            isRunning: false
          })
          setMatchId(null)
          setTimeRemaining(120)
        }}
        onGoHome={() => router.push('/matches')}
        onUploadVideo={() => {
          // This would trigger the sync manager upload
          console.log('Upload video from match complete')
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      <WrestlingStatsBackground />
      <OfflineStatus />
      <SyncManager matchId={matchId || undefined} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-4">
        {/* Video Recorder Section - Always visible */}
        <div className="mb-4">
          <SimpleVideoRecorder
            matchId={matchId || undefined}
            autoStart={match.isRunning}
            onRecordingComplete={(blob, url) => {
              console.log('Recording complete', { size: blob.size, url })
              setRecordedVideoId(`local-${Date.now()}`)
            }}
            className="max-w-4xl mx-auto"
          />
        </div>

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
            {match.bloodTime && (
              <Badge className="bg-red-600 text-white border-red-400 animate-pulse">
                <Droplets className="w-3 h-3 mr-1 inline" />
                BLOOD TIME
              </Badge>
            )}
            {match.injuryTime && (
              <Badge className="bg-orange-600 text-white border-orange-400 animate-pulse">
                <Heart className="w-3 h-3 mr-1 inline" />
                INJURY TIME
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
                
                {/* PIN Button */}
                <Button 
                  onClick={() => handlePin('wrestler1')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold border-2 border-green-400"
                  size="sm"
                  disabled={matchEnded}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  PIN / FALL
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
                    onClick={() => setShowBoutSheet(!showBoutSheet)}
                    className="bg-blue-700 hover:bg-blue-600 text-white font-bold"
                    size="sm"
                  >
                    <Printer className="w-4 h-4 mr-1" />
                    Bout Sheet
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
                  {!matchEnded && (
                    <Button
                      onClick={() => setShowEndDialog(true)}
                      className="bg-red-700 hover:bg-red-600 text-white font-bold"
                      size="sm"
                    >
                      <Trophy className="w-4 h-4 mr-1" />
                      End Match
                    </Button>
                  )}
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
                <div className="relative">
                  <Button
                    onClick={() => {
                      setMatch(prev => ({ ...prev, bloodTime: !prev.bloodTime, isRunning: false }))
                      if (!match.bloodTime) {
                        recordAction('special', 'Blood time started', {
                          ...match,
                          bloodTime: true,
                          isRunning: false,
                          lastAction: 'Blood time started'
                        })
                      }
                    }}
                    variant={match.bloodTime ? 'default' : 'outline'}
                    className={match.bloodTime 
                      ? 'bg-red-600 text-white font-bold w-full animate-pulse border-2 border-red-400' 
                      : 'bg-red-900 text-white w-full hover:bg-red-800'}
                    size="sm"
                  >
                    <Droplets className={`w-4 h-4 mr-2 ${match.bloodTime ? 'animate-pulse' : ''}`} />
                    {match.bloodTime ? 'BLOOD TIME ACTIVE' : 'Blood Time'}
                  </Button>
                  {match.bloodTime && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                      5:00 max
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <Button
                    onClick={() => {
                      setMatch(prev => ({ ...prev, injuryTime: !prev.injuryTime, isRunning: false }))
                      if (!match.injuryTime) {
                        recordAction('special', 'Injury time started', {
                          ...match,
                          injuryTime: true,
                          isRunning: false,
                          lastAction: 'Injury time started'
                        })
                      }
                    }}
                    variant={match.injuryTime ? 'default' : 'outline'}
                    className={match.injuryTime 
                      ? 'bg-orange-600 text-white font-bold w-full animate-pulse border-2 border-orange-400' 
                      : 'bg-orange-900 text-white w-full hover:bg-orange-800'}
                    size="sm"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${match.injuryTime ? 'animate-pulse' : ''}`} />
                    {match.injuryTime ? 'INJURY TIME ACTIVE' : 'Injury Time'}
                  </Button>
                  {match.injuryTime && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                      1:30 max
                    </div>
                  )}
                </div>
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
                
                {/* PIN Button */}
                <Button 
                  onClick={() => handlePin('wrestler2')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold border-2 border-green-400"
                  size="sm"
                  disabled={matchEnded}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  PIN / FALL
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
      
      {/* Bout Sheet Modal/Overlay */}
      {showBoutSheet && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-black">Bout Sheet</h2>
              <Button
                onClick={() => setShowBoutSheet(false)}
                variant="ghost"
                size="sm"
                className="text-black hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4">
              <BoutSheet 
                match={{
                  id: match.id,
                  wrestler1: {
                    name: match.wrestler1.name,
                    team: match.wrestler1.team,
                    score: match.wrestler1.score
                  },
                  wrestler2: {
                    name: match.wrestler2.name,
                    team: match.wrestler2.team,
                    score: match.wrestler2.score
                  },
                  weightClass: match.weightClass,
                  matchType: match.matchType,
                  period: match.period as number,
                  time: formatTime(timeRemaining),
                  referee: match.referee,
                  mat: match.mat,
                  winner: match.winner,
                  winType: match.winType,
                  finalScore: match.winner ? `${match.wrestler1.score}-${match.wrestler2.score}` : undefined
                }}
                scoreHistory={scoreHistory}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Match End Dialog */}
      <MatchEndDialog
        isOpen={showEndDialog}
        onClose={() => setShowEndDialog(false)}
        onConfirm={handleMatchEnd}
        wrestler1={match.wrestler1}
        wrestler2={match.wrestler2}
        period={match.period}
        currentTime={formatTime(timeRemaining)}
      />
    </div>
  )
}