'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Play, Pause, SkipForward, RotateCcw, Clock, CheckCircle,
  ChevronLeft, Volume2, VolumeX, Dumbbell, Calendar, MapPin
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Drill {
  id: string
  name: string
  duration: number
  category: 'warmup' | 'technique' | 'live' | 'conditioning' | 'cooldown'
  description?: string
}

interface Practice {
  id: string
  date: string
  start_time: string
  end_time: string
  location: string
  plan_name: string
  drill_plan: Drill[]
  notes: string
}

const CATEGORY_COLORS: Record<string, string> = {
  warmup: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  technique: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  live: 'bg-red-500/20 text-red-400 border-red-500/30',
  conditioning: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  cooldown: 'bg-green-500/20 text-green-400 border-green-500/30',
}

const CATEGORY_ICONS: Record<string, string> = {
  warmup: '🔥',
  technique: '🤼',
  live: '⚔️',
  conditioning: '💪',
  cooldown: '🧘',
}

export default function PracticeExecutionPage() {
  const params = useParams()
  const router = useRouter()
  const [practice, setPractice] = useState<Practice | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [completedDrills, setCompletedDrills] = useState<Set<number>>(new Set())
  const [soundEnabled, setSoundEnabled] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Load practice data
  useEffect(() => {
    const loadPractice = async () => {
      if (!params.id) return

      const { data, error } = await supabase
        .from('practices')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('Error loading practice:', error)
        setLoading(false)
        return
      }

      setPractice(data)
      if (data?.drill_plan?.length > 0) {
        setTimeLeft(data.drill_plan[0].duration * 60)
      }
      setLoading(false)
    }

    loadPractice()
  }, [params.id])

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer finished
            playSound()
            setIsRunning(false)
            setCompletedDrills(prev => new Set([...prev, currentDrillIndex]))
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning, timeLeft, currentDrillIndex])

  const playSound = () => {
    if (soundEnabled && typeof window !== 'undefined') {
      // Use Web Audio API for a simple beep
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        oscillator.frequency.value = 800
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
      } catch (e) {
        console.log('Audio not available')
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startPause = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    if (practice?.drill_plan?.[currentDrillIndex]) {
      setTimeLeft(practice.drill_plan[currentDrillIndex].duration * 60)
    }
  }

  const nextDrill = () => {
    if (!practice?.drill_plan) return
    setCompletedDrills(prev => new Set([...prev, currentDrillIndex]))

    if (currentDrillIndex < practice.drill_plan.length - 1) {
      const nextIndex = currentDrillIndex + 1
      setCurrentDrillIndex(nextIndex)
      setTimeLeft(practice.drill_plan[nextIndex].duration * 60)
      setIsRunning(false)
    }
  }

  const selectDrill = (index: number) => {
    if (!practice?.drill_plan) return
    setCurrentDrillIndex(index)
    setTimeLeft(practice.drill_plan[index].duration * 60)
    setIsRunning(false)
  }

  const getTotalTime = () => {
    if (!practice?.drill_plan) return 0
    return practice.drill_plan.reduce((sum, d) => sum + d.duration, 0)
  }

  const getCompletedTime = () => {
    if (!practice?.drill_plan) return 0
    return practice.drill_plan
      .filter((_, i) => completedDrills.has(i))
      .reduce((sum, d) => sum + d.duration, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gold">Loading practice...</div>
      </div>
    )
  }

  if (!practice || !practice.drill_plan || practice.drill_plan.length === 0) {
    return (
      <div className="min-h-screen bg-black p-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-gold mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Card className="bg-black/60 border-gold/20">
          <CardContent className="p-6 text-center">
            <Dumbbell className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400">No drill plan found for this practice.</p>
            <p className="text-sm text-gray-500 mt-2">Add a practice plan from Coach's Corner first.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentDrill = practice.drill_plan[currentDrillIndex]
  const progress = (getCompletedTime() / getTotalTime()) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/90 backdrop-blur border-b border-gold/20 p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-gold"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-white">{practice.plan_name || 'Practice'}</h1>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              {new Date(practice.date).toLocaleDateString()}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-gold"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </div>

        {/* Overall Progress */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{completedDrills.size}/{practice.drill_plan.length} drills</span>
            <span>{getCompletedTime()}/{getTotalTime()} min</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Current Drill - Large Timer */}
      <div className="p-4">
        <Card className={`${CATEGORY_COLORS[currentDrill.category]} border-2`}>
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-2">{CATEGORY_ICONS[currentDrill.category]}</div>
            <Badge className={CATEGORY_COLORS[currentDrill.category]}>
              {currentDrill.category}
            </Badge>
            <h2 className="text-2xl font-bold text-white mt-3">{currentDrill.name}</h2>
            {currentDrill.description && (
              <p className="text-gray-300 mt-2 text-sm">{currentDrill.description}</p>
            )}

            {/* Big Timer */}
            <div className={`text-7xl font-mono font-bold my-6 ${
              timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-white'
            }`}>
              {formatTime(timeLeft)}
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                onClick={resetTimer}
                className="border-gold/30 text-gold"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                onClick={startPause}
                className={isRunning
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
                }
              >
                {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={nextDrill}
                disabled={currentDrillIndex >= practice.drill_plan.length - 1}
                className="border-gold/30 text-gold"
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drill List */}
      <div className="px-4 pb-20">
        <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Practice Plan
        </h3>
        <div className="space-y-2">
          {practice.drill_plan.map((drill, index) => (
            <div
              key={drill.id}
              onClick={() => selectDrill(index)}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                index === currentDrillIndex
                  ? `${CATEGORY_COLORS[drill.category]} ring-2 ring-gold`
                  : completedDrills.has(index)
                    ? 'bg-green-900/20 border-green-500/30 opacity-60'
                    : 'bg-black/40 border-gold/10 hover:border-gold/30'
              }`}
            >
              <span className="text-lg">{CATEGORY_ICONS[drill.category]}</span>
              <div className="flex-1 min-w-0">
                <div className={`font-medium truncate ${
                  completedDrills.has(index) ? 'text-green-400 line-through' : 'text-white'
                }`}>
                  {drill.name}
                </div>
                {drill.description && (
                  <div className="text-xs text-gray-500 truncate">{drill.description}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {drill.duration}m
                </Badge>
                {completedDrills.has(index) && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
