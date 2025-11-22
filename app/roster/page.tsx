'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Users, Plus, Save, Download, Upload, Trash2,
  ChevronDown, ChevronUp, RefreshCw, FileSpreadsheet, User
} from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'
import { supabase } from '@/lib/supabase'

interface Wrestler {
  id: string
  first_name: string
  last_name: string
  weight_class: number | null
  wins: number
  losses: number
}

interface Match {
  id: string
  created_at: string
  wrestler_id: string
  match_date: string | null
  opponent_first_name: string
  opponent_last_name: string
  opponent_team: string | null
  weight_class: number
  outcome: string
  outcome_type: string | null
  wrestler_score: number
  opponent_score: number
  takedowns_scored: number
  escapes_scored: number
  reversals_scored: number
  nearfall_2_scored: number
  nearfall_3_scored: number
  penalty_points_scored: number
  notes: string | null
  isNew?: boolean
}

const OUTCOME_TYPES = ['pin', 'tech_fall', 'major', 'decision', 'forfeit', 'injury', 'dq']
const WEIGHT_CLASSES = [106, 113, 120, 126, 132, 138, 144, 150, 157, 165, 175, 190, 215, 285]

export default function RosterPage() {
  const [wrestlers, setWrestlers] = useState<Wrestler[]>([])
  const [selectedWrestlerId, setSelectedWrestlerId] = useState<string | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sortField, setSortField] = useState<keyof Match>('match_date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [teamId, setTeamId] = useState<string | null>(null)
  const [teamName, setTeamName] = useState<string>('')

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

  // Load matches when wrestler is selected
  useEffect(() => {
    if (selectedWrestlerId) {
      loadMatches(selectedWrestlerId)
    } else {
      setMatches([])
    }
  }, [selectedWrestlerId])

  const loadWrestlers = async () => {
    if (!teamId) return
    setLoading(true)
    try {
      const { data: wrestlersData } = await supabase
        .from('wrestlers')
        .select('id, first_name, last_name, weight_class, wins, losses')
        .eq('team_id', teamId)
        .order('last_name')

      if (wrestlersData) {
        setWrestlers(wrestlersData.map((w: any) => ({
          ...w,
          wins: w.wins || 0,
          losses: w.losses || 0
        })))
      }
    } catch (error) {
      console.error('Error loading wrestlers:', error)
    }
    setLoading(false)
  }

  const loadMatches = async (wrestlerId: string) => {
    setLoadingMatches(true)
    try {
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*')
        .eq('wrestler_id', wrestlerId)
        .order('created_at', { ascending: false })

      if (matchesData) {
        const transformed = matchesData.map((m: any) => {
          // Parse opponent name into first/last
          const opponentParts = (m.opponent_name || '').trim().split(/\s+/)
          const opponentFirstName = opponentParts[0] || ''
          const opponentLastName = opponentParts.slice(1).join(' ') || ''

          return {
            id: m.id,
            created_at: m.created_at,
            wrestler_id: m.wrestler_id,
            match_date: m.scheduled_time || m.actual_start_time || m.created_at?.split('T')[0],
            opponent_first_name: opponentFirstName,
            opponent_last_name: opponentLastName,
            opponent_team: m.opponent_team,
            weight_class: m.weight_class || 0,
            outcome: m.outcome || '',
            outcome_type: m.outcome_type,
            wrestler_score: m.wrestler_score || 0,
            opponent_score: m.opponent_score || 0,
            takedowns_scored: m.takedowns_scored || 0,
            escapes_scored: m.escapes_scored || 0,
            reversals_scored: m.reversals_scored || 0,
            nearfall_2_scored: m.nearfall_2_scored || 0,
            nearfall_3_scored: m.nearfall_3_scored || 0,
            penalty_points_scored: m.penalty_points_scored || 0,
            notes: m.notes
          }
        })
        setMatches(transformed)
      }
    } catch (error) {
      console.error('Error loading matches:', error)
    }
    setLoadingMatches(false)
  }

  const selectedWrestler = wrestlers.find(w => w.id === selectedWrestlerId)

  const addNewMatch = () => {
    if (!selectedWrestlerId || !selectedWrestler) return

    const newMatch: Match = {
      id: `new-${Date.now()}`,
      created_at: new Date().toISOString(),
      wrestler_id: selectedWrestlerId,
      match_date: new Date().toISOString().split('T')[0],
      opponent_first_name: '',
      opponent_last_name: '',
      opponent_team: '',
      weight_class: selectedWrestler.weight_class || 0,
      outcome: 'win',
      outcome_type: 'decision',
      wrestler_score: 0,
      opponent_score: 0,
      takedowns_scored: 0,
      escapes_scored: 0,
      reversals_scored: 0,
      nearfall_2_scored: 0,
      nearfall_3_scored: 0,
      penalty_points_scored: 0,
      notes: '',
      isNew: true
    }
    setMatches([newMatch, ...matches])
    setHasChanges(true)
  }

  const updateMatch = (id: string, field: keyof Match, value: any) => {
    setMatches(prev => prev.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    ))
    setHasChanges(true)
  }

  const deleteMatch = async (id: string) => {
    if (id.startsWith('new-')) {
      setMatches(prev => prev.filter(m => m.id !== id))
    } else {
      if (confirm('Are you sure you want to delete this match?')) {
        await supabase.from('matches').delete().eq('id', id)
        setMatches(prev => prev.filter(m => m.id !== id))
      }
    }
  }

  const saveAll = async () => {
    if (!selectedWrestlerId) return
    setSaving(true)
    try {
      for (const match of matches) {
        const opponentName = `${match.opponent_first_name} ${match.opponent_last_name}`.trim()

        const data = {
          wrestler_id: selectedWrestlerId,
          opponent_name: opponentName,
          opponent_team: match.opponent_team,
          weight_class: match.weight_class,
          scheduled_time: match.match_date,
          outcome: match.outcome,
          outcome_type: match.outcome_type,
          wrestler_score: match.wrestler_score,
          opponent_score: match.opponent_score,
          takedowns_scored: match.takedowns_scored,
          escapes_scored: match.escapes_scored,
          reversals_scored: match.reversals_scored,
          nearfall_2_scored: match.nearfall_2_scored,
          nearfall_3_scored: match.nearfall_3_scored,
          penalty_points_scored: match.penalty_points_scored,
          notes: match.notes
        }

        if (match.isNew) {
          const { data: newData, error } = await supabase
            .from('matches')
            .insert(data)
            .select()
            .single()

          if (newData) {
            setMatches(prev => prev.map(m =>
              m.id === match.id ? { ...m, id: newData.id, isNew: false } : m
            ))
          }
          if (error) console.error('Insert error:', error)
        } else {
          await supabase
            .from('matches')
            .update(data)
            .eq('id', match.id)
        }
      }

      // Recalculate wrestler wins/losses
      const wins = matches.filter(m => m.outcome === 'win').length
      const losses = matches.filter(m => m.outcome === 'loss').length
      await supabase
        .from('wrestlers')
        .update({ wins, losses })
        .eq('id', selectedWrestlerId)

      setHasChanges(false)
      await loadMatches(selectedWrestlerId)
      await loadWrestlers()
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error saving changes')
    }
    setSaving(false)
  }

  const handleSort = (field: keyof Match) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedMatches = [...matches].sort((a, b) => {
    const aVal = a[sortField] ?? ''
    const bVal = b[sortField] ?? ''
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const EditableCell = ({ match, field, type = 'text', className = '' }: { match: Match; field: keyof Match; type?: string; className?: string }) => {
    const isEditing = editingCell?.id === match.id && editingCell?.field === field
    const value = match[field]

    if (isEditing) {
      return (
        <Input
          type={type}
          value={String(value ?? '')}
          onChange={(e) => updateMatch(match.id, field, type === 'number' ? Number(e.target.value) : e.target.value)}
          onBlur={() => setEditingCell(null)}
          onKeyDown={(e) => e.key === 'Enter' && setEditingCell(null)}
          autoFocus
          className={`h-7 w-full bg-black/50 border-gold/50 text-white text-sm ${className}`}
        />
      )
    }

    return (
      <div
        onClick={() => setEditingCell({ id: match.id, field })}
        className="cursor-pointer hover:bg-gold/10 px-2 py-1 rounded min-h-[28px] flex items-center"
      >
        {value ?? '-'}
      </div>
    )
  }

  const SelectCell = ({ match, field, options, labels }: { match: Match; field: keyof Match; options: string[]; labels?: Record<string, string> }) => {
    return (
      <Select
        value={String(match[field] || '')}
        onValueChange={(v) => updateMatch(match.id, field, v)}
      >
        <SelectTrigger className="h-7 bg-black/50 border-gold/30 text-white text-sm">
          <SelectValue placeholder="-" />
        </SelectTrigger>
        <SelectContent className="bg-black/95 border-gold/30">
          {options.map(opt => (
            <SelectItem key={opt} value={opt} className="text-white hover:bg-gold/20">
              {labels ? labels[opt] : opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  const NumberSelectCell = ({ match, field, options }: { match: Match; field: keyof Match; options: number[] }) => {
    return (
      <Select
        value={String(match[field] || '')}
        onValueChange={(v) => updateMatch(match.id, field, Number(v))}
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

  const SortHeader = ({ field, label }: { field: keyof Match; label: string }) => (
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

  // Export matches to CSV
  const exportMatches = () => {
    if (!selectedWrestler || matches.length === 0) return

    const headers = ['date', 'opponent_first_name', 'opponent_last_name', 'opponent_team', 'weight_class', 'outcome', 'outcome_type', 'wrestler_score', 'opponent_score', 'takedowns', 'escapes', 'reversals', 'nf2', 'nf3', 'penalty_pts', 'notes']
    const rows = matches.map(m => [
      m.match_date || '',
      m.opponent_first_name,
      m.opponent_last_name,
      m.opponent_team || '',
      m.weight_class,
      m.outcome,
      m.outcome_type || '',
      m.wrestler_score,
      m.opponent_score,
      m.takedowns_scored,
      m.escapes_scored,
      m.reversals_scored,
      m.nearfall_2_scored,
      m.nearfall_3_scored,
      m.penalty_points_scored,
      m.notes || ''
    ].join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedWrestler.first_name}_${selectedWrestler.last_name}_matches.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import from CSV
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedWrestlerId || !selectedWrestler) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

      const imported: Match[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        if (values.length < 2) continue

        const match: Match = {
          id: `new-${Date.now()}-${i}`,
          created_at: new Date().toISOString(),
          wrestler_id: selectedWrestlerId,
          match_date: values[headers.indexOf('date')] || new Date().toISOString().split('T')[0],
          opponent_first_name: values[headers.indexOf('opponent_first_name')] || '',
          opponent_last_name: values[headers.indexOf('opponent_last_name')] || '',
          opponent_team: values[headers.indexOf('opponent_team')] || '',
          weight_class: parseInt(values[headers.indexOf('weight_class')]) || selectedWrestler.weight_class || 0,
          outcome: values[headers.indexOf('outcome')] || 'win',
          outcome_type: values[headers.indexOf('outcome_type')] || 'decision',
          wrestler_score: parseInt(values[headers.indexOf('wrestler_score')]) || 0,
          opponent_score: parseInt(values[headers.indexOf('opponent_score')]) || 0,
          takedowns_scored: parseInt(values[headers.indexOf('takedowns')]) || 0,
          escapes_scored: parseInt(values[headers.indexOf('escapes')]) || 0,
          reversals_scored: parseInt(values[headers.indexOf('reversals')]) || 0,
          nearfall_2_scored: parseInt(values[headers.indexOf('nf2')]) || 0,
          nearfall_3_scored: parseInt(values[headers.indexOf('nf3')]) || 0,
          penalty_points_scored: parseInt(values[headers.indexOf('penalty_pts')]) || 0,
          notes: values[headers.indexOf('notes')] || '',
          isNew: true
        }

        if (match.opponent_first_name || match.opponent_last_name) {
          imported.push(match)
        }
      }

      if (imported.length > 0) {
        setMatches(prev => [...imported, ...prev])
        setHasChanges(true)
        alert(`Imported ${imported.length} matches. Click "Save All" to save.`)
      } else {
        alert('No matches found in file.')
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Calculate stats for selected wrestler
  const wrestlerStats = {
    totalMatches: matches.length,
    wins: matches.filter(m => m.outcome === 'win').length,
    losses: matches.filter(m => m.outcome === 'loss').length,
    pins: matches.filter(m => m.outcome === 'win' && m.outcome_type === 'pin').length,
    techFalls: matches.filter(m => m.outcome === 'win' && m.outcome_type === 'tech_fall').length,
    totalTakedowns: matches.reduce((sum, m) => sum + m.takedowns_scored, 0),
    totalEscapes: matches.reduce((sum, m) => sum + m.escapes_scored, 0),
    totalReversals: matches.reduce((sum, m) => sum + m.reversals_scored, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      <WrestlingStatsBackground />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".csv"
        className="hidden"
      />

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-gold" />
              {teamName || 'Team'} Roster
            </h1>
            <p className="text-gray-400 mt-1">Select a wrestler to view and edit their matches</p>
          </div>
        </div>

        {/* Wrestler Selector */}
        <Card className="bg-black/60 border-gold/20 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gold" />
                <span className="text-white font-medium">Select Wrestler:</span>
              </div>
              <Select value={selectedWrestlerId || ''} onValueChange={setSelectedWrestlerId}>
                <SelectTrigger className="w-72 bg-black/50 border-gold/30 text-white">
                  <SelectValue placeholder="Choose a wrestler..." />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-gold/30 max-h-80">
                  {loading ? (
                    <SelectItem value="" disabled className="text-gray-400">Loading...</SelectItem>
                  ) : wrestlers.length === 0 ? (
                    <SelectItem value="" disabled className="text-gray-400">No wrestlers found</SelectItem>
                  ) : (
                    wrestlers.map(w => (
                      <SelectItem key={w.id} value={w.id} className="text-white hover:bg-gold/20">
                        <div className="flex items-center gap-2">
                          <span>{w.last_name}, {w.first_name}</span>
                          {w.weight_class && <Badge className="bg-gold/20 text-gold text-xs">{w.weight_class}lbs</Badge>}
                          <span className="text-gray-400 text-xs">({w.wins}-{w.losses})</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {selectedWrestler && (
                <div className="flex gap-2 ml-auto">
                  <Button
                    onClick={addNewMatch}
                    className="bg-gold hover:bg-gold/90 text-black font-bold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Match
                  </Button>

                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>

                  <Button
                    onClick={exportMatches}
                    variant="outline"
                    className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                    disabled={matches.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
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
                    onClick={() => selectedWrestlerId && loadMatches(selectedWrestlerId)}
                    variant="outline"
                    className="border-gold/30 text-gold hover:bg-gold/10"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary (only when wrestler selected) */}
        {selectedWrestler && (
          <div className="grid grid-cols-2 md:grid-cols-8 gap-3 mb-6">
            <Card className="bg-black/60 border-gold/20">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-gold">{wrestlerStats.totalMatches}</div>
                <div className="text-xs text-gray-400">Matches</div>
              </CardContent>
            </Card>
            <Card className="bg-black/60 border-gold/20">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{wrestlerStats.wins}</div>
                <div className="text-xs text-gray-400">Wins</div>
              </CardContent>
            </Card>
            <Card className="bg-black/60 border-gold/20">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-red-400">{wrestlerStats.losses}</div>
                <div className="text-xs text-gray-400">Losses</div>
              </CardContent>
            </Card>
            <Card className="bg-black/60 border-gold/20">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">{wrestlerStats.pins}</div>
                <div className="text-xs text-gray-400">Pins</div>
              </CardContent>
            </Card>
            <Card className="bg-black/60 border-gold/20">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-orange-400">{wrestlerStats.techFalls}</div>
                <div className="text-xs text-gray-400">Tech Falls</div>
              </CardContent>
            </Card>
            <Card className="bg-black/60 border-gold/20">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">{wrestlerStats.totalTakedowns}</div>
                <div className="text-xs text-gray-400">Takedowns</div>
              </CardContent>
            </Card>
            <Card className="bg-black/60 border-gold/20">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-cyan-400">{wrestlerStats.totalEscapes}</div>
                <div className="text-xs text-gray-400">Escapes</div>
              </CardContent>
            </Card>
            <Card className="bg-black/60 border-gold/20">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-pink-400">{wrestlerStats.totalReversals}</div>
                <div className="text-xs text-gray-400">Reversals</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Matches Spreadsheet */}
        {selectedWrestler ? (
          <Card className="bg-black/60 border-gold/20 overflow-hidden">
            <div className="p-4 border-b border-gold/20">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-gold" />
                Match History - {selectedWrestler.first_name} {selectedWrestler.last_name}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gold/10 border-b border-gold/20">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gold w-8">#</th>
                    <SortHeader field="match_date" label="Date" />
                    <SortHeader field="opponent_first_name" label="First Name" />
                    <SortHeader field="opponent_last_name" label="Last Name" />
                    <SortHeader field="opponent_team" label="Team" />
                    <SortHeader field="weight_class" label="WC" />
                    <SortHeader field="outcome" label="Result" />
                    <SortHeader field="outcome_type" label="Type" />
                    <th className="px-2 py-2 text-left text-xs font-medium text-gold whitespace-nowrap">Score</th>
                    <SortHeader field="takedowns_scored" label="TD" />
                    <SortHeader field="escapes_scored" label="Esc" />
                    <SortHeader field="reversals_scored" label="Rev" />
                    <SortHeader field="nearfall_2_scored" label="NF2" />
                    <SortHeader field="nearfall_3_scored" label="NF3" />
                    <SortHeader field="penalty_points_scored" label="Pen" />
                    <SortHeader field="notes" label="Notes" />
                    <th className="px-2 py-2 text-center text-xs font-medium text-gold w-12">Del</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/10">
                  {loadingMatches ? (
                    <tr>
                      <td colSpan={17} className="text-center py-8 text-gray-400">Loading matches...</td>
                    </tr>
                  ) : sortedMatches.length === 0 ? (
                    <tr>
                      <td colSpan={17} className="text-center py-8 text-gray-400">
                        No matches found. Click "Add Match" to get started.
                      </td>
                    </tr>
                  ) : (
                    sortedMatches.map((match, index) => (
                      <tr
                        key={match.id}
                        className={`hover:bg-gold/5 ${match.isNew ? 'bg-green-500/10' : ''} ${match.outcome === 'win' ? '' : match.outcome === 'loss' ? 'bg-red-500/5' : ''}`}
                      >
                        <td className="px-2 py-1 text-gray-500 text-xs">{index + 1}</td>
                        <td className="px-1 py-1 w-28">
                          <EditableCell match={match} field="match_date" type="date" />
                        </td>
                        <td className="px-1 py-1">
                          <EditableCell match={match} field="opponent_first_name" />
                        </td>
                        <td className="px-1 py-1">
                          <EditableCell match={match} field="opponent_last_name" />
                        </td>
                        <td className="px-1 py-1">
                          <EditableCell match={match} field="opponent_team" />
                        </td>
                        <td className="px-1 py-1 w-20">
                          <NumberSelectCell match={match} field="weight_class" options={WEIGHT_CLASSES} />
                        </td>
                        <td className="px-1 py-1 w-20">
                          <SelectCell
                            match={match}
                            field="outcome"
                            options={['win', 'loss', 'draw']}
                            labels={{ win: 'Win', loss: 'Loss', draw: 'Draw' }}
                          />
                        </td>
                        <td className="px-1 py-1 w-24">
                          <SelectCell
                            match={match}
                            field="outcome_type"
                            options={OUTCOME_TYPES}
                            labels={{ pin: 'Pin', tech_fall: 'TF', major: 'MD', decision: 'Dec', forfeit: 'FF', injury: 'Inj', dq: 'DQ' }}
                          />
                        </td>
                        <td className="px-1 py-1 w-20">
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={match.wrestler_score}
                              onChange={(e) => updateMatch(match.id, 'wrestler_score', Number(e.target.value))}
                              className="h-7 w-10 bg-black/50 border-gold/30 text-white text-sm text-center p-1"
                            />
                            <span className="text-gray-500">-</span>
                            <Input
                              type="number"
                              value={match.opponent_score}
                              onChange={(e) => updateMatch(match.id, 'opponent_score', Number(e.target.value))}
                              className="h-7 w-10 bg-black/50 border-gold/30 text-white text-sm text-center p-1"
                            />
                          </div>
                        </td>
                        <td className="px-1 py-1 w-12">
                          <EditableCell match={match} field="takedowns_scored" type="number" />
                        </td>
                        <td className="px-1 py-1 w-12">
                          <EditableCell match={match} field="escapes_scored" type="number" />
                        </td>
                        <td className="px-1 py-1 w-12">
                          <EditableCell match={match} field="reversals_scored" type="number" />
                        </td>
                        <td className="px-1 py-1 w-12">
                          <EditableCell match={match} field="nearfall_2_scored" type="number" />
                        </td>
                        <td className="px-1 py-1 w-12">
                          <EditableCell match={match} field="nearfall_3_scored" type="number" />
                        </td>
                        <td className="px-1 py-1 w-12">
                          <EditableCell match={match} field="penalty_points_scored" type="number" />
                        </td>
                        <td className="px-1 py-1 min-w-[100px]">
                          <EditableCell match={match} field="notes" />
                        </td>
                        <td className="px-2 py-1 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMatch(match.id)}
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
        ) : (
          <Card className="bg-black/60 border-gold/20">
            <CardContent className="p-12 text-center">
              <User className="w-16 h-16 text-gold/30 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Select a Wrestler</h2>
              <p className="text-gray-400">Choose a wrestler from the dropdown above to view and edit their match history.</p>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        {selectedWrestler && (
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400">
            <span><strong>WC</strong> = Weight Class</span>
            <span><strong>TD</strong> = Takedowns</span>
            <span><strong>Esc</strong> = Escapes</span>
            <span><strong>Rev</strong> = Reversals</span>
            <span><strong>NF2/NF3</strong> = Near Fall Points</span>
            <span><strong>Pen</strong> = Penalty Points</span>
            <span><strong>TF</strong> = Tech Fall</span>
            <span><strong>MD</strong> = Major Decision</span>
            <span><strong>Dec</strong> = Decision</span>
            <span><strong>FF</strong> = Forfeit</span>
          </div>
        )}

        {hasChanges && (
          <div className="fixed bottom-4 right-4 bg-gold text-black px-4 py-2 rounded-lg shadow-lg font-bold">
            Unsaved changes - Click "Save All"
          </div>
        )}
      </div>
    </div>
  )
}
