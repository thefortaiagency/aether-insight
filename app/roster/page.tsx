'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Users, Plus, Save, Download, Upload, Trash2, Edit2, Check, X,
  ChevronDown, ChevronUp, Filter, Search, RefreshCw
} from 'lucide-react'
import Navigation from '@/components/navigation'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'
import { supabase } from '@/lib/supabase'

interface Wrestler {
  id: string
  first_name: string
  last_name: string
  grade: number | null
  weight_class: number | null
  actual_weight: number | null
  wins: number
  losses: number
  pins: number
  tech_falls: number
  major_decisions: number
  decisions: number
  takedowns: number
  escapes: number
  reversals: number
  near_fall_2: number
  near_fall_3: number
  near_fall_4: number
  team_points: number
  isEditing?: boolean
  isNew?: boolean
}

interface Season {
  id: string
  name: string
  season_type: string
  year_start: number
  is_current: boolean
}

const WEIGHT_CLASSES = [106, 113, 120, 126, 132, 138, 144, 150, 157, 165, 175, 190, 215, 285]
const GRADES = [7, 8, 9, 10, 11, 12]

export default function RosterPage() {
  const [wrestlers, setWrestlers] = useState<Wrestler[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [currentSeason, setCurrentSeason] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Wrestler>('last_name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Team ID - would come from auth context in production
  const teamId = '44f8355c-17f6-4868-840b-c394ae790fe5' // Fort Wrestling

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load seasons
      const { data: seasonsData } = await supabase
        .from('seasons')
        .select('*')
        .eq('team_id', teamId)
        .order('year_start', { ascending: false })

      if (seasonsData) {
        setSeasons(seasonsData)
        const current = seasonsData.find((s: Season) => s.is_current) || seasonsData[0]
        if (current) setCurrentSeason(current.id)
      }

      // Load wrestlers
      const { data: wrestlersData } = await supabase
        .from('wrestlers')
        .select('*')
        .eq('team_id', teamId)
        .order('last_name')

      if (wrestlersData) {
        // Transform to include default stats
        const transformed = wrestlersData.map((w: any) => ({
          ...w,
          wins: w.wins || 0,
          losses: w.losses || 0,
          pins: w.pins || 0,
          tech_falls: w.tech_falls || 0,
          major_decisions: w.major_decisions || 0,
          decisions: w.decisions || 0,
          takedowns: w.takedowns || 0,
          escapes: w.escapes || 0,
          reversals: w.reversals || 0,
          near_fall_2: w.near_fall_2 || 0,
          near_fall_3: w.near_fall_3 || 0,
          near_fall_4: w.near_fall_4 || 0,
          team_points: w.team_points || 0
        }))
        setWrestlers(transformed)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
    setLoading(false)
  }

  const addNewWrestler = () => {
    const newWrestler: Wrestler = {
      id: `new-${Date.now()}`,
      first_name: '',
      last_name: '',
      grade: null,
      weight_class: null,
      actual_weight: null,
      wins: 0,
      losses: 0,
      pins: 0,
      tech_falls: 0,
      major_decisions: 0,
      decisions: 0,
      takedowns: 0,
      escapes: 0,
      reversals: 0,
      near_fall_2: 0,
      near_fall_3: 0,
      near_fall_4: 0,
      team_points: 0,
      isEditing: true,
      isNew: true
    }
    setWrestlers([newWrestler, ...wrestlers])
    setHasChanges(true)
  }

  const updateWrestler = (id: string, field: keyof Wrestler, value: any) => {
    setWrestlers(prev => prev.map(w =>
      w.id === id ? { ...w, [field]: value } : w
    ))
    setHasChanges(true)
  }

  const deleteWrestler = async (id: string) => {
    if (id.startsWith('new-')) {
      setWrestlers(prev => prev.filter(w => w.id !== id))
    } else {
      if (confirm('Are you sure you want to delete this wrestler?')) {
        await supabase.from('wrestlers').delete().eq('id', id)
        setWrestlers(prev => prev.filter(w => w.id !== id))
      }
    }
  }

  const saveAll = async () => {
    setSaving(true)
    try {
      for (const wrestler of wrestlers) {
        const data = {
          team_id: teamId,
          first_name: wrestler.first_name,
          last_name: wrestler.last_name,
          grade: wrestler.grade,
          weight_class: wrestler.weight_class,
          actual_weight: wrestler.actual_weight,
          wins: wrestler.wins,
          losses: wrestler.losses,
          pins: wrestler.pins,
          tech_falls: wrestler.tech_falls,
          major_decisions: wrestler.major_decisions,
          decisions: wrestler.decisions,
          takedowns: wrestler.takedowns,
          escapes: wrestler.escapes,
          reversals: wrestler.reversals,
          near_fall_2: wrestler.near_fall_2,
          near_fall_3: wrestler.near_fall_3,
          near_fall_4: wrestler.near_fall_4,
          team_points: wrestler.team_points
        }

        if (wrestler.isNew) {
          const { data: newData, error } = await supabase
            .from('wrestlers')
            .insert(data)
            .select()
            .single()

          if (newData) {
            setWrestlers(prev => prev.map(w =>
              w.id === wrestler.id ? { ...newData, isNew: false, isEditing: false } : w
            ))
          }
        } else {
          await supabase
            .from('wrestlers')
            .update(data)
            .eq('id', wrestler.id)
        }
      }
      setHasChanges(false)
      await loadData()
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error saving changes')
    }
    setSaving(false)
  }

  const handleSort = (field: keyof Wrestler) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredWrestlers = wrestlers
    .filter(w => {
      if (!searchTerm) return true
      const search = searchTerm.toLowerCase()
      return (
        w.first_name?.toLowerCase().includes(search) ||
        w.last_name?.toLowerCase().includes(search) ||
        w.weight_class?.toString().includes(search)
      )
    })
    .sort((a, b) => {
      const aVal = a[sortField] ?? ''
      const bVal = b[sortField] ?? ''
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortDirection === 'asc' ? comparison : -comparison
    })

  const EditableCell = ({ wrestler, field, type = 'text' }: { wrestler: Wrestler; field: keyof Wrestler; type?: string }) => {
    const isEditing = editingCell?.id === wrestler.id && editingCell?.field === field
    const value = wrestler[field]

    if (isEditing) {
      return (
        <Input
          type={type}
          value={String(value ?? '')}
          onChange={(e) => updateWrestler(wrestler.id, field, type === 'number' ? Number(e.target.value) : e.target.value)}
          onBlur={() => setEditingCell(null)}
          onKeyDown={(e) => e.key === 'Enter' && setEditingCell(null)}
          autoFocus
          className="h-7 w-full bg-black/50 border-gold/50 text-white text-sm"
        />
      )
    }

    return (
      <div
        onClick={() => setEditingCell({ id: wrestler.id, field })}
        className="cursor-pointer hover:bg-gold/10 px-2 py-1 rounded min-h-[28px] flex items-center"
      >
        {value ?? '-'}
      </div>
    )
  }

  const SelectCell = ({ wrestler, field, options }: { wrestler: Wrestler; field: keyof Wrestler; options: number[] }) => {
    return (
      <Select
        value={wrestler[field]?.toString() || ''}
        onValueChange={(v) => updateWrestler(wrestler.id, field, Number(v))}
      >
        <SelectTrigger className="h-7 bg-black/50 border-gold/30 text-white text-sm">
          <SelectValue placeholder="-" />
        </SelectTrigger>
        <SelectContent className="bg-black/95 border-gold/30">
          {options.map(opt => (
            <SelectItem key={opt} value={opt.toString()} className="text-white hover:bg-gold/20">
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  const SortHeader = ({ field, label }: { field: keyof Wrestler; label: string }) => (
    <th
      onClick={() => handleSort(field)}
      className="px-2 py-2 text-left text-xs font-medium text-gold cursor-pointer hover:bg-gold/10 whitespace-nowrap"
    >
      <div className="flex items-center gap-1">
        {label}
        {sortField === field && (
          sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        )}
      </div>
    </th>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      <WrestlingStatsBackground />
      <Navigation />

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-gold" />
              Roster & Stats
            </h1>
            <p className="text-gray-400 mt-1">Spreadsheet view - click any cell to edit</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search wrestlers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-black/50 border-gold/30 text-white w-48"
              />
            </div>

            <Button
              onClick={addNewWrestler}
              className="bg-gold hover:bg-gold/90 text-black font-bold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Wrestler
            </Button>

            <Button
              onClick={saveAll}
              disabled={!hasChanges || saving}
              className="bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save All'}
            </Button>

            <Button
              onClick={loadData}
              variant="outline"
              className="border-gold/30 text-gold hover:bg-gold/10"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Season Selector */}
        {seasons.length > 0 && (
          <div className="mb-4 flex items-center gap-4">
            <span className="text-gray-400 text-sm">Season:</span>
            <Select value={currentSeason || ''} onValueChange={setCurrentSeason}>
              <SelectTrigger className="w-64 bg-black/50 border-gold/30 text-white">
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-gold/30">
                {seasons.map(s => (
                  <SelectItem key={s.id} value={s.id} className="text-white hover:bg-gold/20">
                    {s.name} {s.is_current && <Badge className="ml-2 bg-green-500/20 text-green-400 text-xs">Current</Badge>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="border-gold/30 text-gold hover:bg-gold/10"
              onClick={() => {
                const name = prompt('Season name (e.g., "2024-25 High School"):')
                if (name) {
                  // Create new season
                  supabase.from('seasons').insert({
                    team_id: teamId,
                    name,
                    season_type: 'high_school',
                    year_start: new Date().getFullYear(),
                    is_current: true
                  }).then(() => loadData())
                }
              }}
            >
              <Plus className="w-3 h-3 mr-1" />
              New Season
            </Button>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-black/60 border-gold/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-gold">{wrestlers.length}</div>
              <div className="text-xs text-gray-400">Wrestlers</div>
            </CardContent>
          </Card>
          <Card className="bg-black/60 border-gold/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-400">
                {wrestlers.reduce((sum, w) => sum + w.wins, 0)}
              </div>
              <div className="text-xs text-gray-400">Total Wins</div>
            </CardContent>
          </Card>
          <Card className="bg-black/60 border-gold/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-red-400">
                {wrestlers.reduce((sum, w) => sum + w.losses, 0)}
              </div>
              <div className="text-xs text-gray-400">Total Losses</div>
            </CardContent>
          </Card>
          <Card className="bg-black/60 border-gold/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">
                {wrestlers.reduce((sum, w) => sum + w.pins, 0)}
              </div>
              <div className="text-xs text-gray-400">Total Pins</div>
            </CardContent>
          </Card>
          <Card className="bg-black/60 border-gold/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">
                {wrestlers.reduce((sum, w) => sum + w.team_points, 0)}
              </div>
              <div className="text-xs text-gray-400">Team Points</div>
            </CardContent>
          </Card>
        </div>

        {/* Spreadsheet Table */}
        <Card className="bg-black/60 border-gold/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gold/10 border-b border-gold/20">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gold w-8">#</th>
                  <SortHeader field="last_name" label="Last Name" />
                  <SortHeader field="first_name" label="First Name" />
                  <SortHeader field="grade" label="Gr" />
                  <SortHeader field="weight_class" label="WC" />
                  <SortHeader field="actual_weight" label="Wt" />
                  <SortHeader field="wins" label="W" />
                  <SortHeader field="losses" label="L" />
                  <SortHeader field="pins" label="Pin" />
                  <SortHeader field="tech_falls" label="TF" />
                  <SortHeader field="major_decisions" label="MD" />
                  <SortHeader field="takedowns" label="T" />
                  <SortHeader field="escapes" label="E" />
                  <SortHeader field="reversals" label="R" />
                  <SortHeader field="near_fall_2" label="NF2" />
                  <SortHeader field="near_fall_3" label="NF3" />
                  <SortHeader field="near_fall_4" label="NF4" />
                  <SortHeader field="team_points" label="Pts" />
                  <th className="px-2 py-2 text-center text-xs font-medium text-gold w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {loading ? (
                  <tr>
                    <td colSpan={19} className="text-center py-8 text-gray-400">Loading...</td>
                  </tr>
                ) : filteredWrestlers.length === 0 ? (
                  <tr>
                    <td colSpan={19} className="text-center py-8 text-gray-400">
                      No wrestlers found. Click "Add Wrestler" to get started.
                    </td>
                  </tr>
                ) : (
                  filteredWrestlers.map((wrestler, index) => (
                    <tr
                      key={wrestler.id}
                      className={`hover:bg-gold/5 ${wrestler.isNew ? 'bg-green-500/10' : ''}`}
                    >
                      <td className="px-2 py-1 text-gray-500 text-xs">{index + 1}</td>
                      <td className="px-1 py-1">
                        <EditableCell wrestler={wrestler} field="last_name" />
                      </td>
                      <td className="px-1 py-1">
                        <EditableCell wrestler={wrestler} field="first_name" />
                      </td>
                      <td className="px-1 py-1 w-16">
                        <SelectCell wrestler={wrestler} field="grade" options={GRADES} />
                      </td>
                      <td className="px-1 py-1 w-20">
                        <SelectCell wrestler={wrestler} field="weight_class" options={WEIGHT_CLASSES} />
                      </td>
                      <td className="px-1 py-1 w-16">
                        <EditableCell wrestler={wrestler} field="actual_weight" type="number" />
                      </td>
                      <td className="px-1 py-1 w-12">
                        <EditableCell wrestler={wrestler} field="wins" type="number" />
                      </td>
                      <td className="px-1 py-1 w-12">
                        <EditableCell wrestler={wrestler} field="losses" type="number" />
                      </td>
                      <td className="px-1 py-1 w-12">
                        <EditableCell wrestler={wrestler} field="pins" type="number" />
                      </td>
                      <td className="px-1 py-1 w-12">
                        <EditableCell wrestler={wrestler} field="tech_falls" type="number" />
                      </td>
                      <td className="px-1 py-1 w-12">
                        <EditableCell wrestler={wrestler} field="major_decisions" type="number" />
                      </td>
                      <td className="px-1 py-1 w-12">
                        <EditableCell wrestler={wrestler} field="takedowns" type="number" />
                      </td>
                      <td className="px-1 py-1 w-12">
                        <EditableCell wrestler={wrestler} field="escapes" type="number" />
                      </td>
                      <td className="px-1 py-1 w-12">
                        <EditableCell wrestler={wrestler} field="reversals" type="number" />
                      </td>
                      <td className="px-1 py-1 w-12">
                        <EditableCell wrestler={wrestler} field="near_fall_2" type="number" />
                      </td>
                      <td className="px-1 py-1 w-12">
                        <EditableCell wrestler={wrestler} field="near_fall_3" type="number" />
                      </td>
                      <td className="px-1 py-1 w-12">
                        <EditableCell wrestler={wrestler} field="near_fall_4" type="number" />
                      </td>
                      <td className="px-1 py-1 w-12">
                        <EditableCell wrestler={wrestler} field="team_points" type="number" />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteWrestler(wrestler.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400">
          <span><strong>WC</strong> = Weight Class</span>
          <span><strong>Wt</strong> = Actual Weight</span>
          <span><strong>W/L</strong> = Wins/Losses</span>
          <span><strong>TF</strong> = Tech Fall</span>
          <span><strong>MD</strong> = Major Decision</span>
          <span><strong>T/E/R</strong> = Takedown/Escape/Reversal</span>
          <span><strong>NF2/3/4</strong> = Near Fall Points</span>
          <span><strong>Pts</strong> = Team Points</span>
        </div>

        {hasChanges && (
          <div className="fixed bottom-4 right-4 bg-gold text-black px-4 py-2 rounded-lg shadow-lg font-bold">
            Unsaved changes - Click "Save All"
          </div>
        )}
      </div>
    </div>
  )
}
