'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  User, Trophy, TrendingUp, Target,
  Plus, Search, Download, ChevronRight
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
  wins: number
  losses: number
  pins: number
  tech_falls: number
  takedowns: number
  escapes: number
  reversals: number
}

export default function WrestlersPage() {
  const [wrestlers, setWrestlers] = useState<Wrestler[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWeightClass, setSelectedWeightClass] = useState<number | null>(null)
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

  const loadWrestlers = async () => {
    if (!teamId) return
    setLoading(true)
    try {
      const { data: wrestlersData, error } = await supabase
        .from('wrestlers')
        .select('*')
        .eq('team_id', teamId)
        .order('last_name')

      if (error) {
        console.error('Error loading wrestlers:', error)
      } else if (wrestlersData) {
        setWrestlers(wrestlersData.map((w: any) => ({
          id: w.id,
          first_name: w.first_name || '',
          last_name: w.last_name || '',
          grade: w.grade,
          weight_class: w.weight_class,
          wins: w.wins || 0,
          losses: w.losses || 0,
          pins: w.pins || 0,
          tech_falls: w.tech_falls || 0,
          takedowns: w.takedowns || 0,
          escapes: w.escapes || 0,
          reversals: w.reversals || 0
        })))
      }
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

  // Calculate team stats
  const teamStats = {
    totalWrestlers: wrestlers.length,
    totalWins: wrestlers.reduce((sum, w) => sum + w.wins, 0),
    totalLosses: wrestlers.reduce((sum, w) => sum + w.losses, 0),
    totalPins: wrestlers.reduce((sum, w) => sum + w.pins, 0),
    totalTechFalls: wrestlers.reduce((sum, w) => sum + w.tech_falls, 0),
    winPercentage: wrestlers.reduce((sum, w) => sum + w.wins, 0) + wrestlers.reduce((sum, w) => sum + w.losses, 0) > 0
      ? ((wrestlers.reduce((sum, w) => sum + w.wins, 0) / (wrestlers.reduce((sum, w) => sum + w.wins, 0) + wrestlers.reduce((sum, w) => sum + w.losses, 0))) * 100).toFixed(1)
      : '0.0'
  }

  const getWinPercentage = (wins: number, losses: number) => {
    if (wins + losses === 0) return 0
    return ((wins / (wins + losses)) * 100).toFixed(1)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
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

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Record</span>
                        <span className="text-white font-semibold">
                          {wrestler.wins}-{wrestler.losses}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Pins / Tech Falls</span>
                        <span className="text-white font-semibold">
                          {wrestler.pins} / {wrestler.tech_falls}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">TD / Esc / Rev</span>
                        <span className="text-white font-semibold">
                          {wrestler.takedowns} / {wrestler.escapes} / {wrestler.reversals}
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
    </div>
  )
}
