'use client'

import { FC } from 'react'
import { Users, ChevronUp, ChevronDown, Circle, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type WrestlingPosition = 'neutral' | 'top' | 'bottom' | 'out_of_bounds' | 'referee'

interface PositionTrackerProps {
  currentPosition: WrestlingPosition
  topWrestler?: 'home' | 'away'
  onPositionChange: (position: WrestlingPosition, topWrestler?: 'home' | 'away') => void
  homeWrestler: string
  awayWrestler: string
}

const PositionTracker: FC<PositionTrackerProps> = ({
  currentPosition,
  topWrestler,
  onPositionChange,
  homeWrestler,
  awayWrestler
}) => {
  const positions = [
    { 
      id: 'neutral' as WrestlingPosition, 
      label: 'Neutral', 
      icon: <Users className="w-5 h-5" />,
      color: 'blue'
    },
    { 
      id: 'top' as WrestlingPosition, 
      label: 'Top/Bottom', 
      icon: <ChevronUp className="w-5 h-5" />,
      color: 'green'
    },
    { 
      id: 'out_of_bounds' as WrestlingPosition, 
      label: 'Out of Bounds', 
      icon: <X className="w-5 h-5" />,
      color: 'yellow'
    },
    { 
      id: 'referee' as WrestlingPosition, 
      label: "Referee's Position", 
      icon: <Circle className="w-5 h-5" />,
      color: 'purple'
    }
  ]

  const colorClasses = {
    blue: 'bg-blue-500/20 border-blue-500 text-blue-400',
    green: 'bg-green-500/20 border-green-500 text-green-400',
    yellow: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
    purple: 'bg-purple-500/20 border-purple-500 text-purple-400'
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-gold/20 rounded-lg p-4">
      <h3 className="text-gold font-bold mb-3">Position Tracking</h3>
      
      {/* Position Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {positions.map((pos) => (
          <button
            key={pos.id}
            onClick={() => {
              if (pos.id === 'top' || pos.id === 'bottom') {
                onPositionChange('top', currentPosition === 'top' && topWrestler === 'home' ? 'away' : 'home')
              } else {
                onPositionChange(pos.id)
              }
            }}
            className={cn(
              'p-3 rounded-lg border flex items-center justify-center gap-2 transition-all',
              currentPosition === pos.id 
                ? colorClasses[pos.color as keyof typeof colorClasses]
                : 'bg-black/30 border-gray-700 hover:border-gold/50'
            )}
          >
            {pos.icon}
            <span className="font-semibold">{pos.label}</span>
          </button>
        ))}
      </div>

      {/* Top/Bottom Position Display */}
      {(currentPosition === 'top' || currentPosition === 'bottom') && (
        <div className="p-3 bg-black/30 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">Position Control:</div>
          <div className="space-y-2">
            <div className={cn(
              'flex items-center justify-between p-2 rounded',
              topWrestler === 'home' ? 'bg-green-500/20' : 'bg-black/20'
            )}>
              <span className="text-white">{homeWrestler}</span>
              {topWrestler === 'home' && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500">
                  <ChevronUp className="w-3 h-3 mr-1" />
                  TOP
                </Badge>
              )}
              {topWrestler === 'away' && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500">
                  <ChevronDown className="w-3 h-3 mr-1" />
                  BOTTOM
                </Badge>
              )}
            </div>
            
            <div className={cn(
              'flex items-center justify-between p-2 rounded',
              topWrestler === 'away' ? 'bg-red-500/20' : 'bg-black/20'
            )}>
              <span className="text-white">{awayWrestler}</span>
              {topWrestler === 'away' && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500">
                  <ChevronUp className="w-3 h-3 mr-1" />
                  TOP
                </Badge>
              )}
              {topWrestler === 'home' && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500">
                  <ChevronDown className="w-3 h-3 mr-1" />
                  BOTTOM
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PositionTracker