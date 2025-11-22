'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  User, Trophy, TrendingUp, Target,
  Plus, Search, Download, ChevronRight, Pencil, X, Save, Loader2
} from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Wrestler {
  id: string
  first_name: string
  last_name: string
  grade: number | null
  weight_class: number | null
  // Calculated from matches
  wins: number
  losses: number
  pins: number
  tech_falls: number
  majors: number
  takedowns: number
  escapes: number
  reversals: number
}

interface Match {
  id: string
  wrestler_id: string
  result: string
  win_type: string
  takedowns_for: number
  escapes_for: number
  reversals_for: number
}

export default function WrestlersPage() {
  const [wrestlers, setWrestlers] = useState<Wrestler[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWeightClass, setSelectedWeightClass] = useState<number | null>(null)
  const [teamId, setTeamId] = useState<string | null>(null)
  const [teamName, setTeamName] = useState<string>('')

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingWrestler, setEditingWrestler] = useState<Wrestler | null>(null)
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    weight_class: '',
    grade: '',
  })
  const [saving, setSaving] = useState(false)

  // Get team ID from session
  useEffect(() => {
    const session = localStorage.getItem('aether-session')
    if (session) {
      try {
        const parsed = JSON.parse(session)
        if (parsed.team?.id) {
          setTeamId(parsed.team.id)
          setTeamName(parsed.team.name || '')
        } else {
          window.location.href = '/login'
        }
      } catch (e) {
        window.location.href = '/login'
      }
    } else {
      window.location.href = '/login'
    }
  }, [])

  // Load wrestlers when teamId is available
  useEffect(() => {
    if (teamId) {
      loadWrestlers()
    }
  }, [teamId])

  const loadWrestlers = async () => {
    if (!teamId) return
    setLoading(true)
    try {
      // Load wrestlers
      const { data: wrestlersData, error } = await supabase
        .from('wrestlers')
        .select('*')
        .eq('team_id', teamId)
        .order('last_name')

      if (error) {
        console.error('Error loading wrestlers:', error)
        setLoading(false)
        return
      }

      if (!wrestlersData || wrestlersData.length === 0) {
        setWrestlers([])
        setLoading(false)
        return
      }

      // Load all matches for these wrestlers
      const wrestlerIds = wrestlersData.map((w: any) => w.id)
      const { data: matchesData } = await supabase
        .from('matches')
        .select('wrestler_id, result, win_type, takedowns_for, escapes_for, reversals_for')
        .in('wrestler_id', wrestlerIds)

      const matches = (matchesData || []) as Match[]

      // Calculate stats for each wrestler from matches
      setWrestlers(wrestlersData.map((w: any) => {
        const wMatches = matches.filter(m => m.wrestler_id === w.id)
        const wins = wMatches.filter(m => m.result === 'win').length
        const losses = wMatches.filter(m => m.result === 'loss').length
        const pins = wMatches.filter(m =>
          m.result === 'win' && (m.win_type === 'pin' || m.win_type === 'fall' || m.win_type === 'Pin' || m.win_type === 'Fall')
        ).length
        const techFalls = wMatches.filter(m =>
          m.result === 'win' && (m.win_type === 'tech_fall' || m.win_type === 'Tech Fall' || m.win_type === 'TF')
        ).length
        const majors = wMatches.filter(m =>
          m.result === 'win' && (m.win_type === 'major' || m.win_type === 'Major Decision' || m.win_type === 'MD')
        ).length
        const takedowns = wMatches.reduce((sum, m) => sum + (m.takedowns_for || 0), 0)
        const escapes = wMatches.reduce((sum, m) => sum + (m.escapes_for || 0), 0)
        const reversals = wMatches.reduce((sum, m) => sum + (m.reversals_for || 0), 0)

        return {
          id: w.id,
          first_name: w.first_name || '',
          last_name: w.last_name || '',
          grade: w.grade,
          weight_class: w.weight_class,
          wins,
          losses,
          pins,
          tech_falls: techFalls,
          majors,
          takedowns,
          escapes,
          reversals
        }
      }))
    } catch (error) {
      console.error('Error loading wrestlers:', error)
    }
    setLoading(false)
  }

  const filteredWrestlers = wrestlers.filter(wrestler => {
    const fullName = `${wrestler.first_name} ${wrestler.last_name}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase())
    const matchesWeight = !selectedWeightClass || wrestler.weight_class === selectedWeightClass
    return matchesSearch && matchesWeight
  })

  const weightClasses = [106, 113, 120, 126, 132, 138, 144, 150, 157, 165, 175, 190, 215, 285]

  // Calculate team stats (now from calculated wrestler stats)
  const totalWins = wrestlers.reduce((sum, w) => sum + w.wins, 0)
  const totalLosses = wrestlers.reduce((sum, w) => sum + w.losses, 0)
  const teamStats = {
    totalWrestlers: wrestlers.length,
    totalWins,
    totalLosses,
    totalPins: wrestlers.reduce((sum, w) => sum + w.pins, 0),
    totalTechFalls: wrestlers.reduce((sum, w) => sum + w.tech_falls, 0),
    totalMajors: wrestlers.reduce((sum, w) => sum + w.majors, 0),
    winPercentage: totalWins + totalLosses > 0
      ? ((totalWins / (totalWins + totalLosses)) * 100).toFixed(1)
      : '0.0'
  }

  const getWinPercentage = (wins: number, losses: number) => {
    if (wins + losses === 0) return 0
    return ((wins / (wins + losses)) * 100).toFixed(1)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  const openEditModal = (wrestler: Wrestler, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingWrestler(wrestler)
    setEditForm({
      first_name: wrestler.first_name,
      last_name: wrestler.last_name,
      weight_class: wrestler.weight_class?.toString() || '',
      grade: wrestler.grade?.toString() || '',
    })
    setEditModalOpen(true)
  }

  const handleSaveWrestler = async () => {
    if (!editingWrestler) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('wrestlers')
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          weight_class: editForm.weight_class ? parseInt(editForm.weight_class) : null,
          grade: editForm.grade ? parseInt(editForm.grade) : null,
        })
        .eq('id', editingWrestler.id)

      if (error) throw error

      // Update local state
      setWrestlers(prev => prev.map(w =>
        w.id === editingWrestler.id
          ? {
              ...w,
              first_name: editForm.first_name,
              last_name: editForm.last_name,
              weight_class: editForm.weight_class ? parseInt(editForm.weight_class) : null,
              grade: editForm.grade ? parseInt(editForm.grade) : null,
            }
          : w
      ))

      setEditModalOpen(false)
      setEditingWrestler(null)
    } catch (error) {
      console.error('Error saving wrestler:', error)
      alert('Failed to save wrestler. Please try again.')
    }

    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 relative">
      <WrestlingStatsBackground />

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#D4AF38]">{teamName || 'Team'} Roster</h1>
            <p className="text-gray-200">Wrestler Management System</p>
          </div>
          <div className="flex gap-2">
            <Link href="/roster">
              <Button className="bg-[#D4AF38] hover:bg-[#D4AF38]/90 text-black">
                <Plus className="h-4 w-4 mr-2" />
                Manage Roster
              </Button>
            </Link>
            <Button variant="outline" className="border-[#D4AF38]/30 text-[#D4AF38] hover:bg-[#D4AF38]/10">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#D4AF38]/60 h-4 w-4" />
                <Input
                  placeholder="Search wrestlers..."
                  className="pl-10 bg-black/80 border-[#D4AF38]/30 text-white placeholder:text-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                className={`border-[#D4AF38]/50 transition-all ${
                  !selectedWeightClass
                    ? 'bg-[#D4AF38] text-black font-bold hover:bg-[#D4AF38]/90'
                    : 'bg-black/40 text-[#D4AF38] hover:bg-[#D4AF38]/20'
                }`}
                onClick={() => setSelectedWeightClass(null)}
              >
                All Weights
              </Button>
              {weightClasses.map(weight => (
                <Button
                  key={weight}
                  variant="outline"
                  size="sm"
                  className={`border-[#D4AF38]/50 min-w-[50px] transition-all ${
                    selectedWeightClass === weight
                      ? 'bg-[#D4AF38] text-black font-bold hover:bg-[#D4AF38]/90'
                      : 'bg-black/40 text-[#D4AF38] hover:bg-[#D4AF38]/20'
                  }`}
                  onClick={() => setSelectedWeightClass(weight)}
                >
                  {weight}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Team Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total Wrestlers</p>
                  <p className="text-2xl font-bold text-white">{teamStats.totalWrestlers}</p>
                </div>
                <User className="h-8 w-8 text-[#D4AF38]" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Team Record</p>
                  <p className="text-2xl font-bold text-white">{teamStats.totalWins}-{teamStats.totalLosses}</p>
                </div>
                <Trophy className="h-8 w-8 text-[#D4AF38]" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Win %</p>
                  <p className="text-2xl font-bold text-white">{teamStats.winPercentage}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-[#D4AF38]" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total Pins</p>
                  <p className="text-2xl font-bold text-white">{teamStats.totalPins}</p>
                </div>
                <Target className="h-8 w-8 text-[#D4AF38]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wrestlers Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading wrestlers...</p>
          </div>
        ) : filteredWrestlers.length === 0 ? (
          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardContent className="p-12 text-center">
              <User className="w-16 h-16 text-[#D4AF38]/30 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">No Wrestlers Found</h2>
              <p className="text-gray-400 mb-4">
                {searchTerm || selectedWeightClass
                  ? 'No wrestlers match your search criteria.'
                  : 'Add wrestlers to your roster to get started.'}
              </p>
              <Link href="/roster">
                <Button className="bg-[#D4AF38] hover:bg-[#D4AF38]/90 text-black">
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Roster
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWrestlers.map((wrestler) => (
              <Link key={wrestler.id} href={`/roster?wrestler=${wrestler.id}`}>
                <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30 hover:bg-black/70 hover:border-[#D4AF38]/50 transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF38] to-[#D4AF38]/50 flex items-center justify-center text-black font-bold">
                          {getInitials(wrestler.first_name, wrestler.last_name)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {wrestler.first_name} {wrestler.last_name}
                          </h3>
                          <p className="text-sm text-gray-300">
                            {wrestler.grade ? `Grade ${wrestler.grade} • ` : ''}
                            {wrestler.weight_class ? `${wrestler.weight_class} lbs` : 'No weight'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-[#D4AF38] hover:bg-[#D4AF38]/20"
                          onClick={(e) => openEditModal(wrestler, e)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Badge className={`${
                        Number(getWinPercentage(wrestler.wins, wrestler.losses)) >= 70
                          ? 'bg-green-600'
                          : Number(getWinPercentage(wrestler.wins, wrestler.losses)) >= 50
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                      }`}>
                        {getWinPercentage(wrestler.wins, wrestler.losses)}%
                      </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Record</span>
                        <span className="text-white font-semibold">
                          <span className="text-green-400">{wrestler.wins}</span>
                          <span className="text-gray-500">-</span>
                          <span className="text-red-400">{wrestler.losses}</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Pin / TF / Maj</span>
                        <span className="text-white font-semibold">
                          <span className="text-[#D4AF38]">{wrestler.pins}</span>
                          <span className="text-gray-500"> / </span>
                          <span className="text-purple-400">{wrestler.tech_falls}</span>
                          <span className="text-gray-500"> / </span>
                          <span className="text-blue-400">{wrestler.majors}</span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">TD / Esc / Rev</span>
                        <span className="text-white font-semibold">
                          <span className="text-[#D4AF38]">{wrestler.takedowns}</span>
                          <span className="text-gray-500"> / </span>
                          <span className="text-blue-400">{wrestler.escapes}</span>
                          <span className="text-gray-500"> / </span>
                          <span className="text-green-400">{wrestler.reversals}</span>
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#D4AF38]/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Click to view matches</span>
                        <ChevronRight className="h-4 w-4 text-[#D4AF38]/60" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Edit Wrestler Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-gray-900 border border-[#D4AF38]/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#D4AF38]">Edit Wrestler</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-gray-300">First Name</Label>
                <Input
                  id="first_name"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  className="bg-black/50 border-[#D4AF38]/30 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-gray-300">Last Name</Label>
                <Input
                  id="last_name"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  className="bg-black/50 border-[#D4AF38]/30 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight_class" className="text-gray-300">Weight Class</Label>
                <Select
                  value={editForm.weight_class}
                  onValueChange={(value) => setEditForm({ ...editForm, weight_class: value })}
                >
                  <SelectTrigger className="bg-black/50 border-[#D4AF38]/30 text-white">
                    <SelectValue placeholder="Select weight" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-[#D4AF38]/30">
                    {weightClasses.map(wc => (
                      <SelectItem key={wc} value={wc.toString()} className="text-white hover:bg-[#D4AF38]/20">
                        {wc} lbs
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade" className="text-gray-300">Grade</Label>
                <Select
                  value={editForm.grade}
                  onValueChange={(value) => setEditForm({ ...editForm, grade: value })}
                >
                  <SelectTrigger className="bg-black/50 border-[#D4AF38]/30 text-white">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-[#D4AF38]/30">
                    {[9, 10, 11, 12].map(g => (
                      <SelectItem key={g} value={g.toString()} className="text-white hover:bg-[#D4AF38]/20">
                        Grade {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveWrestler}
              disabled={saving}
              className="bg-[#D4AF38] hover:bg-[#D4AF38]/90 text-black"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
