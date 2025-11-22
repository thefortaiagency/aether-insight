'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Brain, Plus, Save, Trash2, Clock, Users, Target, Dumbbell,
  ChevronDown, ChevronUp, GripVertical, Play, Pause, RotateCcw,
  BookOpen, Lightbulb, Calendar, CheckCircle2, Circle, Edit2
} from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'
import { supabase } from '@/lib/supabase'

interface Drill {
  id: string
  name: string
  duration: number // minutes
  category: 'warmup' | 'technique' | 'live' | 'conditioning' | 'cooldown'
  description?: string
}

interface PracticePlan {
  id: string
  name: string
  date?: string
  drills: Drill[]
  notes?: string
  totalDuration: number
  isTemplate: boolean
}

const DEFAULT_DRILLS: Drill[] = [
  { id: 'd1', name: 'Jogging/Dynamic Stretching', duration: 10, category: 'warmup', description: 'Light jog, high knees, butt kicks, leg swings' },
  { id: 'd2', name: 'Stance & Motion', duration: 5, category: 'warmup', description: 'Circle drill, level changes, sprawls' },
  { id: 'd3', name: 'Shot Drill', duration: 10, category: 'technique', description: 'Single leg, double leg penetration steps' },
  { id: 'd4', name: 'Takedown Chain', duration: 15, category: 'technique', description: 'Setup to shot to finish sequences' },
  { id: 'd5', name: 'Escape Drill', duration: 10, category: 'technique', description: 'Stand-ups, sit-outs, switches' },
  { id: 'd6', name: 'Pinning Combinations', duration: 10, category: 'technique', description: 'Half nelson, arm bar, cradle series' },
  { id: 'd7', name: 'Situation Wrestling', duration: 15, category: 'live', description: 'Start from various positions' },
  { id: 'd8', name: 'Live Wrestling', duration: 20, category: 'live', description: 'Full 6-minute matches' },
  { id: 'd9', name: 'Buddy Carries', duration: 5, category: 'conditioning', description: 'Fireman carry, piggyback, front carry' },
  { id: 'd10', name: 'Sprints/Rope Climbs', duration: 10, category: 'conditioning', description: 'Interval sprints or rope work' },
  { id: 'd11', name: 'Stretching & Cool Down', duration: 10, category: 'cooldown', description: 'Static stretching, foam rolling' },
]

const CATEGORY_COLORS: Record<string, string> = {
  warmup: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  technique: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  live: 'bg-red-500/20 text-red-400 border-red-500/30',
  conditioning: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  cooldown: 'bg-green-500/20 text-green-400 border-green-500/30',
}

// Periodization phase type
type PeriodizationPhase = 'off-season' | 'pre-season' | 'in-season' | 'championship'

interface PracticePlanWithPhase extends PracticePlan {
  phase?: PeriodizationPhase
  phaseDescription?: string
}

const PRACTICE_TEMPLATES: PracticePlanWithPhase[] = [
  // IN-SEASON TEMPLATES
  {
    id: 'template-1',
    name: 'In-Season: Standard Practice',
    phase: 'in-season',
    phaseDescription: 'Maintenance & competition focus',
    drills: [
      { id: 't1-1', name: 'Dynamic Warmup', duration: 12, category: 'warmup', description: 'Total-body flexibility, strength, and endurance' },
      { id: 't1-2', name: 'Stance & Motion', duration: 5, category: 'warmup', description: 'Circle drill, level changes' },
      { id: 't1-3', name: 'High-Rep Drill Work', duration: 12, category: 'technique', description: 'Core techniques from all positions' },
      { id: 't1-4', name: 'Scout/Technique', duration: 12, category: 'technique', description: 'Moves specific to upcoming opponents' },
      { id: 't1-5', name: 'Situational Wrestling', duration: 25, category: 'live', description: '30 sec left down by 1, etc.' },
      { id: 't1-6', name: 'Live Wrestling', duration: 30, category: 'live', description: 'Full matches, group rotations' },
      { id: 't1-7', name: 'Conditioning Finish', duration: 12, category: 'conditioning', description: 'Snappy, high-intensity exercises' },
      { id: 't1-8', name: 'Cool Down', duration: 8, category: 'cooldown' },
    ],
    totalDuration: 116,
    isTemplate: true,
  },
  // CHAMPIONSHIP/TAPER TEMPLATES
  {
    id: 'template-taper-1',
    name: 'Championship Taper: Day 1 (60%)',
    phase: 'championship',
    phaseDescription: 'Volume reduced, intensity high',
    drills: [
      { id: 'tp1-1', name: 'Light Dynamic Warmup', duration: 10, category: 'warmup' },
      { id: 'tp1-2', name: 'High-Intensity Drills', duration: 15, category: 'technique', description: 'Short, crisp reps' },
      { id: 'tp1-3', name: 'Short Live Goes', duration: 20, category: 'live', description: '60% volume, 100% intensity' },
      { id: 'tp1-4', name: 'Match-Specific Situations', duration: 10, category: 'live' },
      { id: 'tp1-5', name: 'Visualization & Stretch', duration: 10, category: 'cooldown', description: 'Mental rehearsal' },
    ],
    totalDuration: 65,
    isTemplate: true,
  },
  {
    id: 'template-taper-2',
    name: 'Championship Taper: Day 2 (50%)',
    phase: 'championship',
    phaseDescription: 'Feeling sharp and confident',
    drills: [
      { id: 'tp2-1', name: 'Light Jog & Stretch', duration: 10, category: 'warmup' },
      { id: 'tp2-2', name: 'Technique Sharpening', duration: 15, category: 'technique', description: 'Light drilling, no hard live' },
      { id: 'tp2-3', name: 'Light Situation Work', duration: 10, category: 'live', description: '50% volume' },
      { id: 'tp2-4', name: 'Mental Prep & Visualization', duration: 15, category: 'cooldown' },
    ],
    totalDuration: 50,
    isTemplate: true,
  },
  {
    id: 'template-taper-3',
    name: 'Championship Taper: Pre-Comp Shakeout',
    phase: 'championship',
    phaseDescription: 'Day before competition',
    drills: [
      { id: 'tp3-1', name: 'Very Light Movement', duration: 10, category: 'warmup', description: 'Break a light sweat' },
      { id: 'tp3-2', name: 'Feel-Good Technique', duration: 10, category: 'technique', description: 'Confidence moves only' },
      { id: 'tp3-3', name: 'Visualization & Mental Prep', duration: 15, category: 'cooldown', description: 'Control the controllables' },
    ],
    totalDuration: 35,
    isTemplate: true,
  },
  // PRE-SEASON TEMPLATES
  {
    id: 'template-preseason',
    name: 'Pre-Season: Power Conversion',
    phase: 'pre-season',
    phaseDescription: 'Strength-to-power transition',
    drills: [
      { id: 'ps-1', name: 'Dynamic Warmup', duration: 12, category: 'warmup' },
      { id: 'ps-2', name: 'Explosive Drills', duration: 15, category: 'technique', description: 'Speed emphasis on shots' },
      { id: 'ps-3', name: 'Chain Wrestling', duration: 20, category: 'technique', description: 'Setup to finish sequences' },
      { id: 'ps-4', name: 'High-Intensity Situational', duration: 25, category: 'live' },
      { id: 'ps-5', name: 'Live Matches', duration: 25, category: 'live' },
      { id: 'ps-6', name: 'Interval Conditioning', duration: 15, category: 'conditioning', description: 'Hill sprints or tempo runs' },
      { id: 'ps-7', name: 'Cool Down', duration: 10, category: 'cooldown' },
    ],
    totalDuration: 122,
    isTemplate: true,
  },
  // OFF-SEASON TEMPLATE
  {
    id: 'template-offseason',
    name: 'Off-Season: Foundation Building',
    phase: 'off-season',
    phaseDescription: 'Build base strength and skills',
    drills: [
      { id: 'os-1', name: 'Extended Warmup', duration: 15, category: 'warmup', description: 'LSD cardio component' },
      { id: 'os-2', name: 'Fundamental Drills', duration: 20, category: 'technique', description: 'Position, hand fighting, defense' },
      { id: 'os-3', name: 'New Skill Acquisition', duration: 25, category: 'technique', description: 'Learn new techniques' },
      { id: 'os-4', name: 'Controlled Live', duration: 20, category: 'live', description: 'Focus on technique over winning' },
      { id: 'os-5', name: 'Strength/Conditioning', duration: 20, category: 'conditioning', description: 'Higher volume work' },
      { id: 'os-6', name: 'Flexibility & Core', duration: 15, category: 'cooldown' },
    ],
    totalDuration: 115,
    isTemplate: true,
  },
  // ORIGINAL TEMPLATES
  {
    id: 'template-2',
    name: 'Competition Week - Light',
    phase: 'in-season',
    drills: [
      { id: 't2-1', name: 'Light Jog & Stretch', duration: 10, category: 'warmup' },
      { id: 't2-2', name: 'Technical Review', duration: 20, category: 'technique' },
      { id: 't2-3', name: 'Light Situation Work', duration: 15, category: 'live' },
      { id: 't2-4', name: 'Match Simulation (50%)', duration: 10, category: 'live' },
      { id: 't2-5', name: 'Visualization & Stretch', duration: 15, category: 'cooldown' },
    ],
    totalDuration: 70,
    isTemplate: true,
  },
  {
    id: 'template-3',
    name: 'Conditioning Focus',
    phase: 'pre-season',
    drills: [
      { id: 't3-1', name: 'Dynamic Warmup', duration: 10, category: 'warmup' },
      { id: 't3-2', name: 'Sprint Intervals', duration: 15, category: 'conditioning' },
      { id: 't3-3', name: 'Technique Under Fatigue', duration: 20, category: 'technique' },
      { id: 't3-4', name: 'Live Go\'s (Short Bursts)', duration: 20, category: 'live' },
      { id: 't3-5', name: 'Partner Conditioning', duration: 15, category: 'conditioning' },
      { id: 't3-6', name: 'Core & Flexibility', duration: 15, category: 'cooldown' },
    ],
    totalDuration: 95,
    isTemplate: true,
  },
]

const PHASE_COLORS: Record<PeriodizationPhase, string> = {
  'off-season': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'pre-season': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'in-season': 'bg-green-500/20 text-green-400 border-green-500/30',
  'championship': 'bg-gold/20 text-gold border-gold/30',
}

export default function CoachCornerPage() {
  const [plans, setPlans] = useState<PracticePlan[]>([])
  const [currentPlan, setCurrentPlan] = useState<PracticePlan | null>(null)
  const [drillLibrary] = useState<Drill[]>(DEFAULT_DRILLS)
  const [notes, setNotes] = useState('')
  const [showDrillLibrary, setShowDrillLibrary] = useState(false)
  const [editingDrill, setEditingDrill] = useState<string | null>(null)
  const [runningTimer, setRunningTimer] = useState<{ drillId: string; timeLeft: number } | null>(null)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)

  // Load saved plans from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('matops-practice-plans')
    if (saved) {
      setPlans(JSON.parse(saved))
    }
    const savedNotes = localStorage.getItem('matops-coach-notes')
    if (savedNotes) {
      setNotes(savedNotes)
    }
  }, [])

  // Save plans to localStorage
  const savePlans = (updatedPlans: PracticePlan[]) => {
    setPlans(updatedPlans)
    localStorage.setItem('matops-practice-plans', JSON.stringify(updatedPlans))
  }

  const saveNotes = (text: string) => {
    setNotes(text)
    localStorage.setItem('matops-coach-notes', text)
  }

  const createNewPlan = () => {
    const newPlan: PracticePlan = {
      id: `plan-${Date.now()}`,
      name: 'New Practice Plan',
      date: new Date().toISOString().split('T')[0],
      drills: [],
      totalDuration: 0,
      isTemplate: false,
    }
    setCurrentPlan(newPlan)
  }

  const loadTemplate = (template: PracticePlan) => {
    const newPlan: PracticePlan = {
      ...template,
      id: `plan-${Date.now()}`,
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString().split('T')[0],
      isTemplate: false,
      drills: template.drills.map(d => ({ ...d, id: `${d.id}-${Date.now()}` })),
    }
    setCurrentPlan(newPlan)
  }

  const addDrillToPlan = (drill: Drill) => {
    if (!currentPlan) return
    const newDrill = { ...drill, id: `drill-${Date.now()}` }
    const updatedPlan = {
      ...currentPlan,
      drills: [...currentPlan.drills, newDrill],
      totalDuration: currentPlan.totalDuration + drill.duration,
    }
    setCurrentPlan(updatedPlan)
  }

  const removeDrillFromPlan = (drillId: string) => {
    if (!currentPlan) return
    const drill = currentPlan.drills.find(d => d.id === drillId)
    const updatedPlan = {
      ...currentPlan,
      drills: currentPlan.drills.filter(d => d.id !== drillId),
      totalDuration: currentPlan.totalDuration - (drill?.duration || 0),
    }
    setCurrentPlan(updatedPlan)
  }

  const updateDrillDuration = (drillId: string, duration: number) => {
    if (!currentPlan) return
    const oldDrill = currentPlan.drills.find(d => d.id === drillId)
    const oldDuration = oldDrill?.duration || 0
    const updatedPlan = {
      ...currentPlan,
      drills: currentPlan.drills.map(d =>
        d.id === drillId ? { ...d, duration } : d
      ),
      totalDuration: currentPlan.totalDuration - oldDuration + duration,
    }
    setCurrentPlan(updatedPlan)
    setEditingDrill(null)
  }

  const savePlan = () => {
    if (!currentPlan) return
    const existingIndex = plans.findIndex(p => p.id === currentPlan.id)
    let updatedPlans: PracticePlan[]
    if (existingIndex >= 0) {
      updatedPlans = plans.map(p => p.id === currentPlan.id ? currentPlan : p)
    } else {
      updatedPlans = [...plans, currentPlan]
    }
    savePlans(updatedPlans)
    alert('Practice plan saved!')
  }

  const deletePlan = (planId: string) => {
    if (confirm('Delete this practice plan?')) {
      savePlans(plans.filter(p => p.id !== planId))
      if (currentPlan?.id === planId) setCurrentPlan(null)
    }
  }

  // Timer functions
  const startTimer = (drill: Drill) => {
    if (timerInterval) clearInterval(timerInterval)
    setRunningTimer({ drillId: drill.id, timeLeft: drill.duration * 60 })
    const interval = setInterval(() => {
      setRunningTimer(prev => {
        if (!prev || prev.timeLeft <= 1) {
          clearInterval(interval)
          // Play sound or notification
          if (typeof window !== 'undefined' && 'Notification' in window) {
            new Notification('Drill Complete!', { body: `${drill.name} finished` })
          }
          return null
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 }
      })
    }, 1000)
    setTimerInterval(interval)
  }

  const stopTimer = () => {
    if (timerInterval) clearInterval(timerInterval)
    setRunningTimer(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative">
      <WrestlingStatsBackground />

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-gold" />
              Coach's Corner
            </h1>
            <p className="text-gray-400 mt-1">Practice plans, drills, and coaching tools</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Practice Plan Builder */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Plan or Plan Selection */}
            <Card className="bg-black/60 border-gold/20">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-gold flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {currentPlan ? currentPlan.name : 'Practice Plans'}
                  </CardTitle>
                  <div className="flex gap-2">
                    {currentPlan ? (
                      <>
                        <Button
                          size="sm"
                          onClick={savePlan}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPlan(null)}
                          className="border-gold/30 text-gold"
                        >
                          Back
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={createNewPlan}
                        className="bg-gold hover:bg-gold/90 text-black font-bold"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        New Plan
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {currentPlan ? (
                  <div className="space-y-4">
                    {/* Plan Name & Date */}
                    <div className="flex gap-4">
                      <Input
                        value={currentPlan.name}
                        onChange={(e) => setCurrentPlan({ ...currentPlan, name: e.target.value })}
                        className="bg-black/50 border-gold/30 text-white flex-1"
                        placeholder="Plan name"
                      />
                      <Input
                        type="date"
                        value={currentPlan.date || ''}
                        onChange={(e) => setCurrentPlan({ ...currentPlan, date: e.target.value })}
                        className="bg-black/50 border-gold/30 text-white w-40"
                      />
                    </div>

                    {/* Total Duration */}
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>Total: <strong className="text-gold">{currentPlan.totalDuration} min</strong></span>
                      <span className="text-xs">({Math.floor(currentPlan.totalDuration / 60)}h {currentPlan.totalDuration % 60}m)</span>
                    </div>

                    {/* Drills List */}
                    <div className="space-y-2">
                      {currentPlan.drills.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Dumbbell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No drills added yet</p>
                          <p className="text-sm">Add drills from the library or templates</p>
                        </div>
                      ) : (
                        currentPlan.drills.map((drill, index) => (
                          <div
                            key={drill.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${CATEGORY_COLORS[drill.category]} ${
                              runningTimer?.drillId === drill.id ? 'ring-2 ring-gold animate-pulse' : ''
                            }`}
                          >
                            <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                            <span className="text-gray-500 text-sm w-6">{index + 1}.</span>
                            <div className="flex-1">
                              <div className="font-medium">{drill.name}</div>
                              {drill.description && (
                                <div className="text-xs opacity-70">{drill.description}</div>
                              )}
                            </div>
                            {editingDrill === drill.id ? (
                              <Input
                                type="number"
                                value={drill.duration}
                                onChange={(e) => updateDrillDuration(drill.id, parseInt(e.target.value) || 0)}
                                onBlur={() => setEditingDrill(null)}
                                className="w-16 h-7 bg-black/50 border-gold/30 text-white text-sm"
                                autoFocus
                              />
                            ) : (
                              <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-gold/20"
                                onClick={() => setEditingDrill(drill.id)}
                              >
                                {drill.duration} min
                              </Badge>
                            )}
                            {runningTimer?.drillId === drill.id ? (
                              <>
                                <span className="font-mono text-gold font-bold">
                                  {formatTime(runningTimer.timeLeft)}
                                </span>
                                <Button size="sm" variant="ghost" onClick={stopTimer} className="h-7 w-7 p-0">
                                  <Pause className="w-4 h-4 text-red-400" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startTimer(drill)}
                                className="h-7 w-7 p-0"
                              >
                                <Play className="w-4 h-4 text-green-400" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeDrillFromPlan(drill.id)}
                              className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Drill Button */}
                    <Button
                      variant="outline"
                      onClick={() => setShowDrillLibrary(!showDrillLibrary)}
                      className="w-full border-dashed border-gold/30 text-gold hover:bg-gold/10"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Drill from Library
                      {showDrillLibrary ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                    </Button>

                    {/* Drill Library Dropdown */}
                    {showDrillLibrary && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 bg-black/40 rounded-lg border border-gold/10">
                        {drillLibrary.map(drill => (
                          <Button
                            key={drill.id}
                            variant="ghost"
                            onClick={() => addDrillToPlan(drill)}
                            className={`justify-start text-left h-auto py-2 ${CATEGORY_COLORS[drill.category]}`}
                          >
                            <Plus className="w-3 h-3 mr-2 flex-shrink-0" />
                            <span className="truncate">{drill.name}</span>
                            <span className="ml-auto text-xs opacity-70">{drill.duration}m</span>
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Plan Notes */}
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Plan Notes</label>
                      <Textarea
                        value={currentPlan.notes || ''}
                        onChange={(e) => setCurrentPlan({ ...currentPlan, notes: e.target.value })}
                        placeholder="Focus areas, wrestler-specific notes, etc."
                        className="bg-black/50 border-gold/30 text-white min-h-[80px]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Templates by Phase */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Practice Templates by Training Phase
                      </h3>

                      {/* Phase Legend */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(['championship', 'in-season', 'pre-season', 'off-season'] as PeriodizationPhase[]).map(phase => (
                          <Badge key={phase} className={`${PHASE_COLORS[phase]} text-xs`}>
                            {phase.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {PRACTICE_TEMPLATES.map(template => (
                          <Card
                            key={template.id}
                            className={`bg-black/40 cursor-pointer hover:border-gold/50 transition-all ${
                              template.phase ? PHASE_COLORS[template.phase].replace('text-', 'border-').split(' ')[2] : 'border-gold/20'
                            }`}
                            onClick={() => loadTemplate(template)}
                          >
                            <CardContent className="p-4">
                              {template.phase && (
                                <Badge className={`${PHASE_COLORS[template.phase]} text-xs mb-2`}>
                                  {template.phase.replace('-', ' ')}
                                </Badge>
                              )}
                              <h4 className="font-medium text-white text-sm">{template.name}</h4>
                              {template.phaseDescription && (
                                <p className="text-xs text-gray-500 mt-1">{template.phaseDescription}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                <Clock className="w-3 h-3" />
                                {template.totalDuration} min
                                <span className="mx-1">•</span>
                                {template.drills.length} drills
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Saved Plans */}
                    {plans.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Saved Plans
                        </h3>
                        <div className="space-y-2">
                          {plans.map(plan => (
                            <div
                              key={plan.id}
                              className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-gold/10 hover:border-gold/30"
                            >
                              <div
                                className="flex-1 cursor-pointer"
                                onClick={() => setCurrentPlan(plan)}
                              >
                                <div className="font-medium text-white">{plan.name}</div>
                                <div className="text-xs text-gray-400">
                                  {plan.date} • {plan.totalDuration} min • {plan.drills.length} drills
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deletePlan(plan.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Tools & Notes */}
          <div className="space-y-6">
            {/* Quick Timer */}
            {runningTimer && (
              <Card className="bg-gold/20 border-gold/50">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-gold mb-1">Current Drill Timer</div>
                  <div className="text-4xl font-mono font-bold text-white">
                    {formatTime(runningTimer.timeLeft)}
                  </div>
                  <Button
                    size="sm"
                    onClick={stopTimer}
                    className="mt-2 bg-red-600 hover:bg-red-700"
                  >
                    <Pause className="w-4 h-4 mr-1" />
                    Stop
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Coach Notes */}
            <Card className="bg-black/60 border-gold/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-gold text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Coach's Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => saveNotes(e.target.value)}
                  placeholder="Quick notes, reminders, wrestler observations..."
                  className="bg-black/50 border-gold/30 text-white min-h-[200px]"
                />
                <p className="text-xs text-gray-500 mt-2">Auto-saved locally</p>
              </CardContent>
            </Card>

            {/* Periodization Guide */}
            <Card className="bg-black/60 border-gold/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-gold text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Periodization Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <Badge className={`${PHASE_COLORS['off-season']} text-xs`}>Off-Season</Badge>
                  <div className="text-gray-400 text-xs mt-1">4-6 months: Build strength, aerobic base, learn new skills</div>
                </div>
                <div>
                  <Badge className={`${PHASE_COLORS['pre-season']} text-xs`}>Pre-Season</Badge>
                  <div className="text-gray-400 text-xs mt-1">6-8 weeks: Convert strength to power, anaerobic work</div>
                </div>
                <div>
                  <Badge className={`${PHASE_COLORS['in-season']} text-xs`}>In-Season</Badge>
                  <div className="text-gray-400 text-xs mt-1">10-12 weeks: Maintain fitness, sharpen skills, compete</div>
                </div>
                <div>
                  <Badge className={`${PHASE_COLORS['championship']} text-xs`}>Championship</Badge>
                  <div className="text-gray-400 text-xs mt-1">2-3 weeks: Taper volume 40-60%, keep intensity, peak!</div>
                </div>
                <div className="pt-2 border-t border-gold/10">
                  <div className="font-medium text-gold text-xs">Taper Science</div>
                  <div className="text-gray-500 text-xs mt-1">
                    Reduce volume progressively. Maintain intensity. 8-14 day taper is optimal.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Reference */}
            <Card className="bg-black/60 border-gold/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-gold text-lg flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Quick Reference
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="font-medium text-white">Match Scoring</div>
                  <div className="text-gray-400 text-xs space-y-1 mt-1">
                    <div>Takedown: 2 pts</div>
                    <div>Escape: 1 pt</div>
                    <div>Reversal: 2 pts</div>
                    <div>Near Fall (2 sec): 2 pts</div>
                    <div>Near Fall (5 sec): 3 pts</div>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-white">Team Scoring</div>
                  <div className="text-gray-400 text-xs space-y-1 mt-1">
                    <div>Pin/Forfeit/DQ: 6 pts</div>
                    <div>Tech Fall (15+): 5 pts</div>
                    <div>Major Decision (8-14): 4 pts</div>
                    <div>Decision: 3 pts</div>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-white">Weight Classes (HS)</div>
                  <div className="text-gray-400 text-xs mt-1">
                    106, 113, 120, 126, 132, 138, 144, 150, 157, 165, 175, 190, 215, 285
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
