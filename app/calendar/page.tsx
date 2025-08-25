'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Calendar as CalendarIcon, Plus, Trophy, Users, Clock, MapPin,
  ChevronLeft, ChevronRight, Download, Upload, Settings,
  AlertCircle, CheckCircle, Edit, Trash2, Copy, Star,
  Target, Dumbbell, Bus, FileText, X, ChevronDown
} from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'

interface Event {
  id: string
  title: string
  type: 'match' | 'tournament' | 'practice' | 'meeting' | 'travel' | 'other'
  date: string
  time: string
  location: string
  description?: string
  isHome?: boolean
  opponent?: string
  notes?: string
  color: string
}

const eventColors = {
  match: 'bg-green-600',
  tournament: 'bg-gold',
  practice: 'bg-blue-600',
  meeting: 'bg-purple-600',
  travel: 'bg-orange-600',
  other: 'bg-gray-600'
}

const eventIcons = {
  match: <Trophy className="w-4 h-4" />,
  tournament: <Star className="w-4 h-4" />,
  practice: <Dumbbell className="w-4 h-4" />,
  meeting: <Users className="w-4 h-4" />,
  travel: <Bus className="w-4 h-4" />,
  other: <CalendarIcon className="w-4 h-4" />
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Dual Meet vs Central',
      type: 'match',
      date: '2025-01-15',
      time: '18:00',
      location: 'Home Gym',
      isHome: true,
      opponent: 'Central High School',
      color: eventColors.match
    },
    {
      id: '2',
      title: 'Regional Tournament',
      type: 'tournament',
      date: '2025-01-20',
      time: '08:00',
      location: 'Regional Sports Complex',
      description: '16 team tournament',
      color: eventColors.tournament
    },
    {
      id: '3',
      title: 'Team Practice',
      type: 'practice',
      date: '2025-01-16',
      time: '15:30',
      location: 'Wrestling Room',
      notes: 'Focus on takedowns',
      color: eventColors.practice
    }
  ])
  const [showEventModal, setShowEventModal] = useState(false)
  const [showSeasonSetup, setShowSeasonSetup] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month')
  
  // Form state for new events
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    type: 'match',
    time: '15:30',
    isHome: true
  })

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date | null) => {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => event.date === dateStr)
  }

  // Navigate months
  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  // Format month/year for header
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  // Add new event
  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) return
    
    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      type: newEvent.type || 'match',
      date: newEvent.date,
      time: newEvent.time || '15:30',
      location: newEvent.location || '',
      description: newEvent.description,
      isHome: newEvent.isHome,
      opponent: newEvent.opponent,
      notes: newEvent.notes,
      color: eventColors[newEvent.type || 'match']
    }
    
    setEvents([...events, event])
    setShowEventModal(false)
    setNewEvent({ type: 'match', time: '15:30', isHome: true })
  }

  // Delete event
  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id))
  }

  // Quick add functions
  const quickAddPractice = () => {
    const today = new Date()
    const practiceEvent: Event = {
      id: Date.now().toString(),
      title: 'Team Practice',
      type: 'practice',
      date: today.toISOString().split('T')[0],
      time: '15:30',
      location: 'Wrestling Room',
      color: eventColors.practice
    }
    setEvents([...events, practiceEvent])
  }

  const quickAddMatch = () => {
    setNewEvent({ type: 'match', time: '18:00', isHome: true })
    setShowEventModal(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      <WrestlingStatsBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gold mb-2">Season Calendar</h1>
            <p className="text-gray-400">Plan and manage your wrestling season</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <Button
              onClick={() => setShowSeasonSetup(true)}
              className="bg-gold hover:bg-gold/90 text-black font-bold"
            >
              <Settings className="w-4 h-4 mr-2" />
              Season Setup
            </Button>
            <Button
              onClick={quickAddMatch}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Match
            </Button>
            <Button
              onClick={quickAddPractice}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Practice
            </Button>
          </div>
        </div>

        {/* Season Setup Wizard */}
        {showSeasonSetup && (
          <Card className="bg-black/90 backdrop-blur-sm border-gold/30 mb-6">
            <CardHeader>
              <CardTitle className="text-gold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Season Setup Wizard
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSeasonSetup(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-blue-900/30 border-blue-600/50">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  Let's set up your wrestling season! This wizard will help you create your practice schedule, 
                  add key matches, and import your competition calendar.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Practice Schedule */}
                <div className="space-y-4">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-blue-500" />
                    Regular Practice Schedule
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-gray-400">Practice Days</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <label key={day} className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" defaultChecked={day !== 'Sat'} />
                            <span className="text-sm text-gray-300">{day}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-400">Practice Time</Label>
                      <Input 
                        type="time" 
                        defaultValue="15:30"
                        className="bg-gray-900/50 border-gray-700 text-white mt-1"
                      />
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Generate Practice Schedule
                    </Button>
                  </div>
                </div>

                {/* Import Options */}
                <div className="space-y-4">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <Upload className="w-5 h-5 text-green-500" />
                    Import Competition Schedule
                  </h3>
                  <div className="space-y-3">
                    <Button className="w-full bg-green-600 hover:bg-green-700 justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Import from TrackWrestling
                    </Button>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Import from MatBoss
                    </Button>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-700" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-black px-2 text-gray-400">or</span>
                      </div>
                    </div>
                    <label className="cursor-pointer">
                      <input type="file" accept=".csv,.ics" className="hidden" />
                      <div className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg hover:border-gold/50 transition-colors text-center">
                        <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-400">Upload Schedule</p>
                        <p className="text-xs text-gray-500 mt-1">CSV or ICS file</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Key Dates */}
              <div className="space-y-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Star className="w-5 h-5 text-gold" />
                  Key Season Dates
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-400">Season Start</Label>
                    <Input 
                      type="date" 
                      className="bg-gray-900/50 border-gray-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Conference Tournament</Label>
                    <Input 
                      type="date" 
                      className="bg-gray-900/50 border-gray-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">State Tournament</Label>
                    <Input 
                      type="date" 
                      className="bg-gray-900/50 border-gray-700 text-white mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowSeasonSetup(false)}>
                  Cancel
                </Button>
                <Button className="bg-gold hover:bg-gold/90 text-black">
                  Complete Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* View Mode Toggle */}
        <div className="mb-4 flex items-center gap-2">
          <Button
            size="sm"
            variant={viewMode === 'month' ? 'default' : 'outline'}
            onClick={() => setViewMode('month')}
            className={viewMode === 'month' ? 'bg-gold text-black' : ''}
          >
            Month
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'week' ? 'default' : 'outline'}
            onClick={() => setViewMode('week')}
            className={viewMode === 'week' ? 'bg-gold text-black' : ''}
          >
            Week
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-gold text-black' : ''}
          >
            List
          </Button>
        </div>

        {/* Calendar Grid */}
        <Card className="bg-black/80 backdrop-blur-sm border-gold/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigateMonth(-1)}
                className="text-gray-400 hover:text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-bold text-gold">
                {formatMonthYear(currentDate)}
              </h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigateMonth(1)}
                className="text-gray-400 hover:text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate).map((day, index) => {
                const dayEvents = day ? getEventsForDate(day) : []
                const isToday = day && day.toDateString() === new Date().toDateString()
                const isSelected = day && selectedDate && day.toDateString() === selectedDate.toDateString()
                
                return (
                  <div
                    key={index}
                    className={`min-h-[80px] p-2 rounded-lg border transition-all cursor-pointer ${
                      !day 
                        ? 'bg-transparent border-transparent' 
                        : isToday
                        ? 'bg-gold/20 border-gold'
                        : isSelected
                        ? 'bg-gray-800 border-gold/50'
                        : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                    }`}
                    onClick={() => {
                      if (day) {
                        setSelectedDate(day)
                        setNewEvent({ 
                          ...newEvent, 
                          date: day.toISOString().split('T')[0] 
                        })
                      }
                    }}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-semibold mb-1 ${
                          isToday ? 'text-gold' : 'text-gray-300'
                        }`}>
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className={`text-xs px-1 py-0.5 rounded ${event.color} text-white truncate`}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-400">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Events */}
        {selectedDate && (
          <Card className="mt-6 bg-black/80 backdrop-blur-sm border-gold/30">
            <CardHeader>
              <CardTitle className="text-gold flex items-center justify-between">
                <span>
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <Button
                  size="sm"
                  onClick={() => {
                    setNewEvent({ 
                      ...newEvent, 
                      date: selectedDate.toISOString().split('T')[0] 
                    })
                    setShowEventModal(true)
                  }}
                  className="bg-gold hover:bg-gold/90 text-black"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Event
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getEventsForDate(selectedDate).length === 0 ? (
                <p className="text-gray-400 text-center py-8">No events scheduled for this date</p>
              ) : (
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).map(event => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-800"
                    >
                      <div className={`p-2 rounded-lg ${event.color}`}>
                        {eventIcons[event.type]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-white font-semibold">{event.title}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {event.time}
                              </span>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </span>
                            </div>
                            {event.description && (
                              <p className="text-sm text-gray-300 mt-2">{event.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingEvent(event)
                                setNewEvent(event)
                                setShowEventModal(true)
                              }}
                              className="text-gray-400 hover:text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="bg-black/95 border-gold/30 w-full max-w-lg">
              <CardHeader>
                <CardTitle className="text-gold flex items-center justify-between">
                  <span>{editingEvent ? 'Edit Event' : 'Add Event'}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowEventModal(false)
                      setEditingEvent(null)
                      setNewEvent({ type: 'match', time: '15:30', isHome: true })
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-400">Event Type</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {Object.keys(eventColors).map(type => (
                      <Button
                        key={type}
                        size="sm"
                        variant={newEvent.type === type ? 'default' : 'outline'}
                        onClick={() => setNewEvent({ ...newEvent, type: type as Event['type'] })}
                        className={newEvent.type === type ? eventColors[type as Event['type']] : ''}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400">Title</Label>
                  <Input
                    value={newEvent.title || ''}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Event title"
                    className="bg-gray-900/50 border-gray-700 text-white mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Date</Label>
                    <Input
                      type="date"
                      value={newEvent.date || ''}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="bg-gray-900/50 border-gray-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">Time</Label>
                    <Input
                      type="time"
                      value={newEvent.time || '15:30'}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="bg-gray-900/50 border-gray-700 text-white mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400">Location</Label>
                  <Input
                    value={newEvent.location || ''}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Event location"
                    className="bg-gray-900/50 border-gray-700 text-white mt-1"
                  />
                </div>

                {newEvent.type === 'match' && (
                  <>
                    <div>
                      <Label className="text-gray-400">Opponent</Label>
                      <Input
                        value={newEvent.opponent || ''}
                        onChange={(e) => setNewEvent({ ...newEvent, opponent: e.target.value })}
                        placeholder="Opponent team"
                        className="bg-gray-900/50 border-gray-700 text-white mt-1"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newEvent.isHome || false}
                        onChange={(e) => setNewEvent({ ...newEvent, isHome: e.target.checked })}
                        className="rounded"
                      />
                      <Label className="text-gray-400">Home Match</Label>
                    </div>
                  </>
                )}

                <div>
                  <Label className="text-gray-400">Notes</Label>
                  <Textarea
                    value={newEvent.notes || ''}
                    onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                    placeholder="Additional notes"
                    className="bg-gray-900/50 border-gray-700 text-white mt-1"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEventModal(false)
                      setEditingEvent(null)
                      setNewEvent({ type: 'match', time: '15:30', isHome: true })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddEvent}
                    className="bg-gold hover:bg-gold/90 text-black"
                  >
                    {editingEvent ? 'Update Event' : 'Add Event'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}