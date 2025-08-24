'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  User, Trophy, TrendingUp, Target, Activity, 
  Plus, Search, Filter, Download, ChevronRight 
} from 'lucide-react'
import AnimatedStatsBackground from '@/components/animated-stats-background'

// Mock data for wrestlers
const WRESTLERS = [
  {
    id: '1',
    name: 'Wyatt Hoppes',
    grade: 11,
    weight: 132,
    weightClass: 132,
    record: { wins: 30, losses: 1 },
    winPercentage: 96.8,
    powerIndex: 5.1,
    pins: 22,
    techFalls: 4,
    streak: { type: 'W', count: 15 },
    lastMatch: '2024-01-20',
    photo: null
  },
  {
    id: '2',
    name: 'Jackson Webb',
    grade: 12,
    weight: 145,
    weightClass: 145,
    record: { wins: 25, losses: 6 },
    winPercentage: 80.6,
    powerIndex: 3.1,
    pins: 14,
    techFalls: 5,
    streak: { type: 'W', count: 7 },
    lastMatch: '2024-01-20',
    photo: null
  },
  {
    id: '3',
    name: 'Ben Bush',
    grade: 10,
    weight: 120,
    weightClass: 120,
    record: { wins: 21, losses: 8 },
    winPercentage: 72.4,
    powerIndex: 1.6,
    pins: 9,
    techFalls: 3,
    streak: { type: 'L', count: 1 },
    lastMatch: '2024-01-19',
    photo: null
  },
  {
    id: '4',
    name: 'Tanner Eppard',
    grade: 11,
    weight: 152,
    weightClass: 152,
    record: { wins: 20, losses: 9 },
    winPercentage: 69.0,
    powerIndex: 2.1,
    pins: 11,
    techFalls: 1,
    streak: { type: 'W', count: 3 },
    lastMatch: '2024-01-20',
    photo: null
  },
  {
    id: '5',
    name: 'Arell Sago',
    grade: 12,
    weight: 160,
    weightClass: 160,
    record: { wins: 18, losses: 11 },
    winPercentage: 62.1,
    powerIndex: 1.0,
    pins: 10,
    techFalls: 3,
    streak: { type: 'W', count: 2 },
    lastMatch: '2024-01-18',
    photo: null
  }
]

export default function WrestlersPage() {
  const [wrestlers] = useState(WRESTLERS)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWeightClass, setSelectedWeightClass] = useState<number | null>(null)

  const filteredWrestlers = wrestlers.filter(wrestler => {
    const matchesSearch = wrestler.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesWeight = !selectedWeightClass || wrestler.weightClass === selectedWeightClass
    return matchesSearch && matchesWeight
  })

  const weightClasses = [106, 113, 120, 126, 132, 138, 145, 152, 160, 170, 182, 195, 220, 285]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 relative">
      <AnimatedStatsBackground />
      
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-md border-b border-gold/30 relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <Image 
                  src="/aether-logo.png" 
                  alt="Aether Logo" 
                  fill
                  className="object-contain drop-shadow-[0_0_15px_rgba(212,175,56,0.5)]"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#D4AF38]">Team Roster</h1>
                <p className="text-gray-200">Wrestler Management System</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="bg-[#D4AF38] hover:bg-[#D4AF38]/90 text-black">
                <Plus className="h-4 w-4 mr-2" />
                Add Wrestler
              </Button>
              <Button variant="outline" className="border-gold/30 text-white hover:bg-white/10">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="bg-white/10 backdrop-blur-md border border-gold/30 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold/60 h-4 w-4" />
                <Input 
                  placeholder="Search wrestlers..." 
                  className="pl-10 bg-black/20 border-gold/30 text-white placeholder:text-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                className={`border-gold/30 hover:bg-white/10 ${!selectedWeightClass ? 'bg-white/20 text-[#D4AF38]' : 'text-white'}`}
                onClick={() => setSelectedWeightClass(null)}
              >
                All Weights
              </Button>
              {weightClasses.map(weight => (
                <Button 
                  key={weight}
                  variant="outline" 
                  className={`border-gold/30 hover:bg-white/10 ${selectedWeightClass === weight ? 'bg-white/20 text-[#D4AF38]' : 'text-white'}`}
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
          <Card className="bg-white/10 backdrop-blur-md border border-gold/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total Wrestlers</p>
                  <p className="text-2xl font-bold text-white">{wrestlers.length}</p>
                </div>
                <User className="h-8 w-8 text-[#D4AF38]" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md border border-gold/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Team Win %</p>
                  <p className="text-2xl font-bold text-white">76.9%</p>
                </div>
                <Trophy className="h-8 w-8 text-[#D4AF38]" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md border border-gold/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total Pins</p>
                  <p className="text-2xl font-bold text-white">154</p>
                </div>
                <Target className="h-8 w-8 text-[#D4AF38]" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md border border-gold/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Avg Power Index</p>
                  <p className="text-2xl font-bold text-white">2.4</p>
                </div>
                <TrendingUp className="h-8 w-8 text-[#D4AF38]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wrestlers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWrestlers.map((wrestler) => (
            <Card key={wrestler.id} className="bg-white/10 backdrop-blur-md border border-gold/30 hover:bg-white/15 transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF38] to-[#D4AF38]/50 flex items-center justify-center text-black font-bold">
                      {wrestler.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{wrestler.name}</h3>
                      <p className="text-sm text-gray-300">Grade {wrestler.grade} • {wrestler.weightClass} lbs</p>
                    </div>
                  </div>
                  <Badge className={`${wrestler.streak.type === 'W' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {wrestler.streak.count}{wrestler.streak.type}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Record</span>
                    <span className="text-white font-semibold">
                      {wrestler.record.wins}-{wrestler.record.losses} ({wrestler.winPercentage}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Power Index</span>
                    <span className={`font-semibold ${wrestler.powerIndex >= 3 ? 'text-green-400' : wrestler.powerIndex >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {wrestler.powerIndex > 0 ? '+' : ''}{wrestler.powerIndex}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Pins/Tech Falls</span>
                    <span className="text-white font-semibold">{wrestler.pins}/{wrestler.techFalls}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gold/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Last Match: {wrestler.lastMatch}</span>
                    <ChevronRight className="h-4 w-4 text-gold/60" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}