'use client'

import { FC } from 'react'
import { Clock, Trophy, ChevronDown, ChevronUp, RotateCcw, AlertCircle, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface ScoringEvent {
  id: string
  timestamp: string
  period: number
  wrestler: 'home' | 'away'
  wrestlerName: string
  action: string
  points: number
  position?: string
  score: { home: number; away: number }
  videoTimestamp?: number
}

interface EventLoggerProps {
  events: ScoringEvent[]
  homeWrestler: string
  awayWrestler: string
  onEventClick?: (event: ScoringEvent) => void
}

const EventLogger: FC<EventLoggerProps> = ({
  events,
  homeWrestler,
  awayWrestler,
  onEventClick
}) => {
  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'takedown':
      case 'takedown2':
      case 'takedown3':
        return <ChevronDown className="w-4 h-4" />
      case 'escape':
        return <ChevronUp className="w-4 h-4" />
      case 'reversal':
        return <RotateCcw className="w-4 h-4" />
      case 'nearfall':
      case 'nearfall2':
      case 'nearfall3':
        return <Zap className="w-4 h-4" />
      case 'penalty':
      case 'stalling':
        return <AlertCircle className="w-4 h-4" />
      case 'pin':
      case 'fall':
        return <Trophy className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'takedown':
      case 'takedown2':
      case 'takedown3':
        return 'text-green-400 bg-green-500/20'
      case 'escape':
        return 'text-blue-400 bg-blue-500/20'
      case 'reversal':
        return 'text-purple-400 bg-purple-500/20'
      case 'nearfall':
      case 'nearfall2':
      case 'nearfall3':
        return 'text-orange-400 bg-orange-500/20'
      case 'penalty':
      case 'stalling':
        return 'text-yellow-400 bg-yellow-500/20'
      case 'pin':
      case 'fall':
        return 'text-gold bg-gold/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-gold/20 rounded-lg">
      <div className="p-4 border-b border-gold/20">
        <h3 className="text-gold font-bold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Match Event Log
        </h3>
      </div>
      
      <div className="max-h-96 overflow-y-auto p-4">
        {events.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No scoring events yet
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => onEventClick?.(event)}
                className={cn(
                  'p-3 rounded-lg border transition-all cursor-pointer',
                  'hover:bg-white/5 hover:border-gold/30',
                  event.wrestler === 'home' 
                    ? 'border-green-500/30 bg-green-500/5' 
                    : 'border-red-500/30 bg-red-500/5'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      getActionColor(event.action)
                    )}>
                      {getActionIcon(event.action)}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'font-bold',
                          event.wrestler === 'home' ? 'text-green-400' : 'text-red-400'
                        )}>
                          {event.wrestlerName}
                        </span>
                        <Badge className={cn(
                          'text-xs',
                          getActionColor(event.action)
                        )}>
                          {event.action.toUpperCase()}
                        </Badge>
                        {event.points > 0 && (
                          <Badge className="bg-gold/20 text-gold border-gold">
                            +{event.points}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.timestamp}
                        </span>
                        <span>Period {event.period}</span>
                        {event.position && (
                          <span className="text-xs">({event.position})</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      <span className="text-green-400">{event.score.home}</span>
                      <span className="text-gray-500 mx-1">-</span>
                      <span className="text-red-400">{event.score.away}</span>
                    </div>
                    {event.videoTimestamp !== undefined && (
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500 text-xs mt-1">
                        Video: {Math.floor(event.videoTimestamp / 60)}:{(event.videoTimestamp % 60).toString().padStart(2, '0')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {events.length > 0 && (
        <div className="p-3 border-t border-gold/20 bg-black/20">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Events: {events.length}</span>
            <span className="text-gray-400">
              Last: {events[events.length - 1].action} at {events[events.length - 1].timestamp}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventLogger