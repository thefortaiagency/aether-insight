'use client'

import { FC, useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Play, Pause, RotateCcw, Clock, AlertTriangle, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimerControlsProps {
  currentPeriod: number
  onPeriodEnd: () => void
  onTimeUpdate?: (time: number) => void
  isOvertime?: boolean
}

const TimerControls: FC<TimerControlsProps> = ({ 
  currentPeriod, 
  onPeriodEnd, 
  onTimeUpdate,
  isOvertime = false 
}) => {
  const [time, setTime] = useState(120) // 2 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [bloodTime, setBloodTime] = useState(false)
  const [injuryTime, setInjuryTime] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Period durations
  const getPeriodDuration = () => {
    if (isOvertime) return 60 // 1 minute sudden victory
    return 120 // 2 minutes for regular periods
  }

  useEffect(() => {
    setTime(getPeriodDuration())
    setIsRunning(false)
  }, [currentPeriod, isOvertime])

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime(prev => {
          const newTime = prev - 0.1
          if (newTime <= 0) {
            setIsRunning(false)
            onPeriodEnd()
            return 0
          }
          return newTime
        })
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, time, onPeriodEnd])

  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(getPeriodDuration() - time)
    }
  }, [time])

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setTime(getPeriodDuration())
    setIsRunning(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const tenths = Math.floor((seconds % 1) * 10)
    return `${mins}:${secs.toString().padStart(2, '0')}.${tenths}`
  }

  const getTimerColor = () => {
    if (bloodTime) return 'text-red-500'
    if (injuryTime) return 'text-yellow-500'
    if (time <= 10) return 'text-orange-400'
    if (isOvertime) return 'text-gold'
    return 'text-white'
  }

  return (
    <Card className="bg-black/40 backdrop-blur-xl border border-gold/20">
      <CardContent className="p-6">
        {/* Main Timer Display */}
        <div className="text-center mb-6">
          <div className="text-sm text-gray-400 mb-2">
            {isOvertime ? 'OVERTIME' : `PERIOD ${currentPeriod}`}
          </div>
          <div className={cn(
            "text-6xl font-bold font-mono transition-colors",
            getTimerColor()
          )}>
            {formatTime(time)}
          </div>
          
          {/* Status Indicators */}
          <div className="flex justify-center gap-4 mt-3">
            {bloodTime && (
              <div className="flex items-center gap-1 text-red-500 text-sm">
                <AlertTriangle className="w-4 h-4" />
                Blood Time
              </div>
            )}
            {injuryTime && (
              <div className="flex items-center gap-1 text-yellow-500 text-sm">
                <AlertTriangle className="w-4 h-4" />
                Injury Time
              </div>
            )}
            {isOvertime && (
              <div className="flex items-center gap-1 text-gold text-sm">
                <Zap className="w-4 h-4" />
                Sudden Victory
              </div>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 justify-center mb-4">
          <Button
            onClick={toggleTimer}
            size="lg"
            className={cn(
              "font-bold",
              isRunning 
                ? "bg-red-600 hover:bg-red-700 text-white" 
                : "bg-green-600 hover:bg-green-700 text-white"
            )}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start
              </>
            )}
          </Button>
          
          <Button
            onClick={resetTimer}
            size="lg"
            variant="outline"
            className="border-gold text-gold hover:bg-gold hover:text-black"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset
          </Button>
        </div>

        {/* Special Time Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => setBloodTime(!bloodTime)}
            variant={bloodTime ? "default" : "outline"}
            className={cn(
              "text-sm",
              bloodTime 
                ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                : "border-gray-600 hover:border-red-600"
            )}
          >
            <AlertTriangle className="w-4 h-4 mr-1" />
            Blood Time
          </Button>
          
          <Button
            onClick={() => setInjuryTime(!injuryTime)}
            variant={injuryTime ? "default" : "outline"}
            className={cn(
              "text-sm",
              injuryTime 
                ? "bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600"
                : "border-gray-600 hover:border-yellow-600"
            )}
          >
            <AlertTriangle className="w-4 h-4 mr-1" />
            Injury Time
          </Button>
        </div>

        {/* Quick Time Adjustments */}
        <div className="flex gap-2 justify-center mt-4">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setTime(prev => Math.max(0, prev - 10))}
            className="text-gray-400 hover:text-white"
          >
            -10s
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setTime(prev => Math.max(0, prev - 1))}
            className="text-gray-400 hover:text-white"
          >
            -1s
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setTime(prev => prev + 1)}
            className="text-gray-400 hover:text-white"
          >
            +1s
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setTime(prev => prev + 10)}
            className="text-gray-400 hover:text-white"
          >
            +10s
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default TimerControls