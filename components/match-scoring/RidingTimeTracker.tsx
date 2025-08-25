'use client'

import { FC, useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, ChevronUp, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface RidingTimeTrackerProps {
  currentPosition: 'neutral' | 'top' | 'bottom' | 'out_of_bounds' | 'referee'
  topWrestler?: 'home' | 'away'
  isTimerRunning: boolean
  homeWrestler: string
  awayWrestler: string
  onRidingTimePoint?: (wrestler: 'home' | 'away') => void
}

const RidingTimeTracker: FC<RidingTimeTrackerProps> = ({
  currentPosition,
  topWrestler,
  isTimerRunning,
  homeWrestler,
  awayWrestler,
  onRidingTimePoint
}) => {
  const [homeAdvantage, setHomeAdvantage] = useState(0)
  const [awayAdvantage, setAwayAdvantage] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isTimerRunning && (currentPosition === 'top' || currentPosition === 'bottom') && topWrestler) {
      interval = setInterval(() => {
        if (topWrestler === 'home') {
          setHomeAdvantage(prev => prev + 0.1)
        } else {
          setAwayAdvantage(prev => prev + 0.1)
        }
      }, 100)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning, currentPosition, topWrestler])

  const getNetAdvantage = () => {
    const net = homeAdvantage - awayAdvantage
    return Math.abs(net)
  }

  const getAdvantageWrestler = () => {
    const net = homeAdvantage - awayAdvantage
    if (Math.abs(net) < 1) return null
    return net > 0 ? 'home' : 'away'
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const netAdvantage = getNetAdvantage()
  const advantageWrestler = getAdvantageWrestler()
  const ridingTimePoint = netAdvantage >= 60 // 1 minute advantage

  useEffect(() => {
    if (ridingTimePoint && advantageWrestler && onRidingTimePoint) {
      onRidingTimePoint(advantageWrestler)
    }
  }, [ridingTimePoint, advantageWrestler])

  return (
    <Card className="bg-black/40 backdrop-blur-xl border border-gold/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gold font-bold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Riding Time
          </h3>
          {ridingTimePoint && (
            <Badge className="bg-gold/20 text-gold border-gold animate-pulse">
              +1 POINT
            </Badge>
          )}
        </div>

        {/* Individual Riding Times */}
        <div className="space-y-3">
          {/* Home Wrestler */}
          <div className={cn(
            "flex items-center justify-between p-2 rounded",
            topWrestler === 'home' && (currentPosition === 'top' || currentPosition === 'bottom')
              ? "bg-green-500/20 border border-green-500/30"
              : "bg-black/20"
          )}>
            <div className="flex items-center gap-2">
              <ChevronUp className={cn(
                "w-4 h-4",
                topWrestler === 'home' ? "text-green-400" : "text-gray-500"
              )} />
              <span className="text-white font-medium">{homeWrestler}</span>
            </div>
            <span className={cn(
              "font-mono text-sm",
              homeAdvantage > 0 ? "text-green-400" : "text-gray-500"
            )}>
              {formatTime(homeAdvantage)}
            </span>
          </div>

          {/* Away Wrestler */}
          <div className={cn(
            "flex items-center justify-between p-2 rounded",
            topWrestler === 'away' && (currentPosition === 'top' || currentPosition === 'bottom')
              ? "bg-red-500/20 border border-red-500/30"
              : "bg-black/20"
          )}>
            <div className="flex items-center gap-2">
              <ChevronDown className={cn(
                "w-4 h-4",
                topWrestler === 'away' ? "text-red-400" : "text-gray-500"
              )} />
              <span className="text-white font-medium">{awayWrestler}</span>
            </div>
            <span className={cn(
              "font-mono text-sm",
              awayAdvantage > 0 ? "text-red-400" : "text-gray-500"
            )}>
              {formatTime(awayAdvantage)}
            </span>
          </div>
        </div>

        {/* Net Advantage Display */}
        {netAdvantage >= 1 && (
          <div className="mt-3 p-2 bg-gold/10 border border-gold/30 rounded">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">NET ADVANTAGE</div>
              <div className={cn(
                "text-xl font-bold",
                advantageWrestler === 'home' ? "text-green-400" : "text-red-400"
              )}>
                {formatTime(netAdvantage)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {advantageWrestler === 'home' ? homeWrestler : awayWrestler}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RidingTimeTracker