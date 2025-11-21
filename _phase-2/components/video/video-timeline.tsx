'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Trophy, Circle, Square, Shield, Zap, AlertTriangle,
  Play, Clock, TrendingUp, ChevronRight, Filter
} from 'lucide-react'

interface MatchEvent {
  id: string
  time: number // seconds from start
  period: number
  periodTime: string // time remaining in period
  wrestler: string
  action: string
  points: number
  score: { wrestler1: number; wrestler2: number }
  description?: string
}

interface VideoTimelineProps {
  events: MatchEvent[]
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  wrestler1Name: string
  wrestler2Name: string
}

export function VideoTimeline({
  events,
  currentTime,
  duration,
  onSeek,
  wrestler1Name,
  wrestler2Name
}: VideoTimelineProps) {
  const [filteredEvents, setFilteredEvents] = useState<MatchEvent[]>(events)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)

  const eventColors: Record<string, string> = {
    takedown: '#10B981', // green
    escape: '#3B82F6', // blue
    reversal: '#8B5CF6', // purple
    nearfall: '#F59E0B', // amber
    'near fall': '#F59E0B', // amber
    penalty: '#EF4444', // red
    stalling: '#F97316', // orange
    pin: '#FFD700', // gold
    'tech fall': '#DC2626', // dark red
  }

  const getEventIcon = (action: string) => {
    const actionLower = action.toLowerCase()
    if (actionLower.includes('takedown')) return <Circle className="w-3 h-3" />
    if (actionLower.includes('escape')) return <Square className="w-3 h-3" />
    if (actionLower.includes('reversal')) return <Shield className="w-3 h-3" />
    if (actionLower.includes('near') || actionLower.includes('fall')) return <Zap className="w-3 h-3" />
    if (actionLower.includes('penalty') || actionLower.includes('stall')) return <AlertTriangle className="w-3 h-3" />
    if (actionLower.includes('pin')) return <Trophy className="w-3 h-3" />
    return <Circle className="w-3 h-3" />
  }

  const getEventColor = (action: string) => {
    const actionLower = action.toLowerCase()
    for (const [key, color] of Object.entries(eventColors)) {
      if (actionLower.includes(key)) return color
    }
    return '#9CA3AF' // gray default
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const filterEvents = (filter: string) => {
    setSelectedFilter(filter)
    if (filter === 'all') {
      setFilteredEvents(events)
    } else if (filter === 'scoring') {
      setFilteredEvents(events.filter(e => e.points > 0))
    } else if (filter === 'wrestler1') {
      setFilteredEvents(events.filter(e => e.wrestler === wrestler1Name))
    } else if (filter === 'wrestler2') {
      setFilteredEvents(events.filter(e => e.wrestler === wrestler2Name))
    } else {
      setFilteredEvents(events.filter(e => e.action.toLowerCase().includes(filter)))
    }
  }

  // Update filtered events when events change
  useEffect(() => {
    filterEvents(selectedFilter)
  }, [events])

  return (
    <Card className="bg-black/80 backdrop-blur-sm border-gold/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-gold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Match Timeline
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              onClick={() => filterEvents('all')}
              className={selectedFilter === 'all' ? 'bg-gold text-black' : 'text-gold border-gold/30'}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={selectedFilter === 'scoring' ? 'default' : 'outline'}
              onClick={() => filterEvents('scoring')}
              className={selectedFilter === 'scoring' ? 'bg-gold text-black' : 'text-gold border-gold/30'}
            >
              Scoring
            </Button>
            <Button
              size="sm"
              variant={selectedFilter === 'takedown' ? 'default' : 'outline'}
              onClick={() => filterEvents('takedown')}
              className={selectedFilter === 'takedown' ? 'bg-gold text-black' : 'text-gold border-gold/30'}
            >
              Takedowns
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Visual Timeline */}
        <div className="relative h-16 bg-gray-900 rounded-lg mb-4 overflow-hidden">
          {/* Current time indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
          
          {/* Progress bar */}
          <div
            className="absolute top-0 bottom-0 bg-gold/20"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />

          {/* Event markers */}
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="absolute top-0 bottom-0 w-1 cursor-pointer hover:w-2 transition-all"
              style={{
                left: `${(event.time / duration) * 100}%`,
                backgroundColor: getEventColor(event.action)
              }}
              onClick={() => onSeek(event.time)}
              onMouseEnter={() => setHoveredEvent(event.id)}
              onMouseLeave={() => setHoveredEvent(null)}
              title={`${event.wrestler} - ${event.action} (+${event.points})`}
            >
              {hoveredEvent === event.id && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs p-2 rounded whitespace-nowrap z-30">
                  <div className="font-bold">{event.action}</div>
                  <div>{event.wrestler}</div>
                  <div>+{event.points} pts</div>
                  <div className="text-gray-400">{formatTime(event.time)}</div>
                </div>
              )}
            </div>
          ))}

          {/* Period markers */}
          <div className="absolute inset-0 flex">
            <div className="flex-1 border-r border-white/20 flex items-center justify-center">
              <span className="text-xs text-gray-400">Period 1</span>
            </div>
            <div className="flex-1 border-r border-white/20 flex items-center justify-center">
              <span className="text-xs text-gray-400">Period 2</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-xs text-gray-400">Period 3</span>
            </div>
          </div>
        </div>

        {/* Event List */}
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {filteredEvents.map((event, idx) => {
              const isCurrentEvent = currentTime >= event.time && 
                (idx === filteredEvents.length - 1 || currentTime < filteredEvents[idx + 1]?.time)
              
              return (
                <div
                  key={event.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                    isCurrentEvent 
                      ? 'bg-gold/20 border border-gold/50' 
                      : 'hover:bg-gray-900'
                  }`}
                  onClick={() => onSeek(event.time)}
                >
                  {/* Time */}
                  <div className="text-sm text-gray-400 w-12">
                    {formatTime(event.time)}
                  </div>

                  {/* Period Badge */}
                  <Badge className="bg-gray-800 text-white">
                    P{event.period}
                  </Badge>

                  {/* Event Icon */}
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: getEventColor(event.action) + '33' }}
                  >
                    {getEventIcon(event.action)}
                  </div>

                  {/* Wrestler & Action */}
                  <div className="flex-1">
                    <div className="text-white font-medium">
                      {event.wrestler}
                    </div>
                    <div className="text-sm text-gray-400">
                      {event.action}
                    </div>
                  </div>

                  {/* Points */}
                  {event.points > 0 && (
                    <Badge className="bg-green-600 text-white">
                      +{event.points}
                    </Badge>
                  )}

                  {/* Score */}
                  <div className="text-sm text-gray-400">
                    {event.score.wrestler1}-{event.score.wrestler2}
                  </div>

                  {/* Play Icon */}
                  <ChevronRight className={`w-4 h-4 ${isCurrentEvent ? 'text-gold' : 'text-gray-600'}`} />
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t border-gold/20 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-400">Total Events</p>
            <p className="text-lg font-bold text-white">{events.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Points</p>
            <p className="text-lg font-bold text-gold">
              {events.reduce((sum, e) => sum + e.points, 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Match Time</p>
            <p className="text-lg font-bold text-white">{formatTime(duration)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}