'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, Scale, Trophy, User, Hash, MapPin, Calendar,
  ChevronRight, Search, AlertCircle, Check
} from 'lucide-react'

interface MatchSetupProps {
  onStartMatch: (matchData: MatchData) => void
}

interface MatchData {
  wrestler1: {
    id?: string
    name: string
    team: string
  }
  wrestler2: {
    id?: string
    name: string
    team: string
  }
  weightClass: number
  matchType: 'dual' | 'tournament' | 'exhibition'
  referee: string
  mat: string
  boutNumber?: string
  date: string
  time: string
}

interface Wrestler {
  id: string
  first_name: string
  last_name: string
  weight_class: number
  team?: {
    name: string
  }
}

interface Team {
  id: string
  name: string
  school?: string
}

const WEIGHT_CLASSES = [106, 113, 120, 126, 132, 138, 144, 150, 157, 165, 175, 190, 215, 285]

export default function MatchSetup({ onStartMatch }: MatchSetupProps) {
  const [matchData, setMatchData] = useState<MatchData>({
    wrestler1: { name: '', team: '' },
    wrestler2: { name: '', team: '' },
    weightClass: 126,
    matchType: 'dual',
    referee: '',
    mat: '1',
    boutNumber: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5)
  })

  const [wrestlers, setWrestlers] = useState<Wrestler[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [searchWrestler1, setSearchWrestler1] = useState('')
  const [searchWrestler2, setSearchWrestler2] = useState('')
  const [showWrestler1Dropdown, setShowWrestler1Dropdown] = useState(false)
  const [showWrestler2Dropdown, setShowWrestler2Dropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Fetch wrestlers and teams on mount
  useEffect(() => {
    fetchWrestlers()
    fetchTeams()
  }, [])

  const fetchWrestlers = async () => {
    try {
      const response = await fetch('/api/wrestlers')
      if (response.ok) {
        const data = await response.json()
        setWrestlers(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching wrestlers:', error)
    }
  }

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      if (response.ok) {
        const data = await response.json()
        setTeams(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    }
  }

  const filteredWrestlers1 = wrestlers.filter(w => {
    const fullName = `${w.first_name} ${w.last_name}`.toLowerCase()
    const teamName = w.team?.name?.toLowerCase() || ''
    const search = searchWrestler1.toLowerCase()
    return fullName.includes(search) || teamName.includes(search)
  }).slice(0, 5)

  const filteredWrestlers2 = wrestlers.filter(w => {
    const fullName = `${w.first_name} ${w.last_name}`.toLowerCase()
    const teamName = w.team?.name?.toLowerCase() || ''
    const search = searchWrestler2.toLowerCase()
    return fullName.includes(search) || teamName.includes(search)
  }).slice(0, 5)

  const selectWrestler1 = (wrestler: Wrestler) => {
    setMatchData({
      ...matchData,
      wrestler1: {
        id: wrestler.id,
        name: `${wrestler.last_name}, ${wrestler.first_name}`,
        team: wrestler.team?.name || ''
      },
      weightClass: wrestler.weight_class || matchData.weightClass
    })
    setSearchWrestler1(`${wrestler.last_name}, ${wrestler.first_name}`)
    setShowWrestler1Dropdown(false)
  }

  const selectWrestler2 = (wrestler: Wrestler) => {
    setMatchData({
      ...matchData,
      wrestler2: {
        id: wrestler.id,
        name: `${wrestler.last_name}, ${wrestler.first_name}`,
        team: wrestler.team?.name || ''
      }
    })
    setSearchWrestler2(`${wrestler.last_name}, ${wrestler.first_name}`)
    setShowWrestler2Dropdown(false)
  }

  const validateMatch = () => {
    const newErrors: string[] = []
    
    if (!matchData.wrestler1.name) {
      newErrors.push('Wrestler 1 name is required')
    }
    if (!matchData.wrestler2.name) {
      newErrors.push('Wrestler 2 name is required')
    }
    if (!matchData.wrestler1.team && matchData.matchType === 'dual') {
      newErrors.push('Wrestler 1 team is required for dual meets')
    }
    if (!matchData.wrestler2.team && matchData.matchType === 'dual') {
      newErrors.push('Wrestler 2 team is required for dual meets')
    }
    if (!WEIGHT_CLASSES.includes(matchData.weightClass)) {
      newErrors.push('Invalid weight class')
    }
    
    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleStartMatch = () => {
    if (validateMatch()) {
      onStartMatch(matchData)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
      <CardHeader className="border-b border-[#D4AF38]/30">
        <CardTitle className="text-2xl font-bold text-[#D4AF38] flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          Match Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Match Type and Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="match-type" className="text-white mb-2">Match Type</Label>
            <Select
              value={matchData.matchType}
              onValueChange={(value: 'dual' | 'tournament' | 'exhibition') => 
                setMatchData({ ...matchData, matchType: value })
              }
            >
              <SelectTrigger className="bg-black/60 border-[#D4AF38]/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dual">Dual Meet</SelectItem>
                <SelectItem value="tournament">Tournament</SelectItem>
                <SelectItem value="exhibition">Exhibition</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="weight-class" className="text-white mb-2">Weight Class</Label>
            <Select
              value={matchData.weightClass.toString()}
              onValueChange={(value) => 
                setMatchData({ ...matchData, weightClass: parseInt(value) })
              }
            >
              <SelectTrigger className="bg-black/60 border-[#D4AF38]/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEIGHT_CLASSES.map(weight => (
                  <SelectItem key={weight} value={weight.toString()}>
                    {weight} lbs
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="mat" className="text-white mb-2">Mat Number</Label>
            <Input
              id="mat"
              value={matchData.mat}
              onChange={(e) => setMatchData({ ...matchData, mat: e.target.value })}
              className="bg-black/60 border-[#D4AF38]/30 text-white"
              placeholder="1"
            />
          </div>
        </div>

        {/* Wrestler 1 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#D4AF38] flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded-full" />
            Red Wrestler
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Label htmlFor="wrestler1" className="text-white mb-2">Wrestler Name</Label>
              <div className="relative">
                <Input
                  id="wrestler1"
                  value={searchWrestler1}
                  onChange={(e) => {
                    setSearchWrestler1(e.target.value)
                    setMatchData({ ...matchData, wrestler1: { ...matchData.wrestler1, name: e.target.value }})
                    setShowWrestler1Dropdown(true)
                  }}
                  onFocus={() => setShowWrestler1Dropdown(true)}
                  className="bg-black/60 border-[#D4AF38]/30 text-white pr-8"
                  placeholder="Last, First"
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-2 top-3" />
              </div>
              {showWrestler1Dropdown && filteredWrestlers1.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-black border border-[#D4AF38]/30 rounded-md shadow-lg">
                  {filteredWrestlers1.map(wrestler => (
                    <button
                      key={wrestler.id}
                      onClick={() => selectWrestler1(wrestler)}
                      className="w-full px-3 py-2 text-left text-white hover:bg-[#D4AF38]/20 border-b border-[#D4AF38]/10"
                    >
                      <div className="font-semibold">{wrestler.last_name}, {wrestler.first_name}</div>
                      <div className="text-sm text-gray-400">
                        {wrestler.team?.name} • {wrestler.weight_class} lbs
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="team1" className="text-white mb-2">Team</Label>
              <Input
                id="team1"
                value={matchData.wrestler1.team}
                onChange={(e) => setMatchData({ 
                  ...matchData, 
                  wrestler1: { ...matchData.wrestler1, team: e.target.value }
                })}
                className="bg-black/60 border-[#D4AF38]/30 text-white"
                placeholder="Team Name"
              />
            </div>
          </div>
        </div>

        {/* Wrestler 2 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#D4AF38] flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded-full" />
            Green Wrestler
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Label htmlFor="wrestler2" className="text-white mb-2">Wrestler Name</Label>
              <div className="relative">
                <Input
                  id="wrestler2"
                  value={searchWrestler2}
                  onChange={(e) => {
                    setSearchWrestler2(e.target.value)
                    setMatchData({ ...matchData, wrestler2: { ...matchData.wrestler2, name: e.target.value }})
                    setShowWrestler2Dropdown(true)
                  }}
                  onFocus={() => setShowWrestler2Dropdown(true)}
                  className="bg-black/60 border-[#D4AF38]/30 text-white pr-8"
                  placeholder="Last, First"
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-2 top-3" />
              </div>
              {showWrestler2Dropdown && filteredWrestlers2.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-black border border-[#D4AF38]/30 rounded-md shadow-lg">
                  {filteredWrestlers2.map(wrestler => (
                    <button
                      key={wrestler.id}
                      onClick={() => selectWrestler2(wrestler)}
                      className="w-full px-3 py-2 text-left text-white hover:bg-[#D4AF38]/20 border-b border-[#D4AF38]/10"
                    >
                      <div className="font-semibold">{wrestler.last_name}, {wrestler.first_name}</div>
                      <div className="text-sm text-gray-400">
                        {wrestler.team?.name} • {wrestler.weight_class} lbs
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="team2" className="text-white mb-2">Team</Label>
              <Input
                id="team2"
                value={matchData.wrestler2.team}
                onChange={(e) => setMatchData({ 
                  ...matchData, 
                  wrestler2: { ...matchData.wrestler2, team: e.target.value }
                })}
                className="bg-black/60 border-[#D4AF38]/30 text-white"
                placeholder="Team Name"
              />
            </div>
          </div>
        </div>

        {/* Match Officials */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#D4AF38]">Match Officials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="referee" className="text-white mb-2">Referee</Label>
              <Input
                id="referee"
                value={matchData.referee}
                onChange={(e) => setMatchData({ ...matchData, referee: e.target.value })}
                className="bg-black/60 border-[#D4AF38]/30 text-white"
                placeholder="Referee Name"
              />
            </div>

            {matchData.matchType === 'dual' && (
              <div>
                <Label htmlFor="bout" className="text-white mb-2">Bout Number</Label>
                <Input
                  id="bout"
                  value={matchData.boutNumber}
                  onChange={(e) => setMatchData({ ...matchData, boutNumber: e.target.value })}
                  className="bg-black/60 border-[#D4AF38]/30 text-white"
                  placeholder="1-14"
                />
              </div>
            )}
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date" className="text-white mb-2">Date</Label>
            <Input
              id="date"
              type="date"
              value={matchData.date}
              onChange={(e) => setMatchData({ ...matchData, date: e.target.value })}
              className="bg-black/60 border-[#D4AF38]/30 text-white"
            />
          </div>

          <div>
            <Label htmlFor="time" className="text-white mb-2">Time</Label>
            <Input
              id="time"
              type="time"
              value={matchData.time}
              onChange={(e) => setMatchData({ ...matchData, time: e.target.value })}
              className="bg-black/60 border-[#D4AF38]/30 text-white"
            />
          </div>
        </div>

        {/* Validation Errors */}
        {errors.length > 0 && (
          <div className="bg-red-900/20 border border-red-600/50 rounded-md p-4">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Please fix the following errors:</span>
            </div>
            <ul className="list-disc list-inside text-red-300 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            className="bg-black/60 border-[#D4AF38]/30 text-white hover:bg-[#D4AF38]/20"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStartMatch}
            className="bg-[#D4AF38] hover:bg-[#B8941C] text-black font-bold"
          >
            Start Match
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}