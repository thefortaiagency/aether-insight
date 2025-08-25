'use client'

import { FC, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Trophy, Scale, User, Hash, AlertCircle } from 'lucide-react'

export interface MatchData {
  homeWrestler: string
  awayWrestler: string
  homeTeam: string
  awayTeam: string
  weightClass: string
  matchType: 'dual' | 'tournament' | 'exhibition'
  referee?: string
  mat?: string
  boutNumber?: number
}

interface MatchSetupProps {
  onStartMatch: (data: MatchData) => void
  wrestlers?: Array<{ id: string; name: string; weight: number; team: string }>
}

const WEIGHT_CLASSES = [
  '106', '113', '120', '126', '132', '138', 
  '144', '150', '157', '165', '175', '190', 
  '220', '285'
]

const MatchSetup: FC<MatchSetupProps> = ({ onStartMatch, wrestlers = [] }) => {
  const [matchData, setMatchData] = useState<MatchData>({
    homeWrestler: '',
    awayWrestler: '',
    homeTeam: '',
    awayTeam: '',
    weightClass: '',
    matchType: 'dual',
    referee: '',
    mat: '',
    boutNumber: 1
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateMatch = () => {
    const newErrors: Record<string, string> = {}
    
    if (!matchData.homeWrestler) newErrors.homeWrestler = 'Home wrestler required'
    if (!matchData.awayWrestler) newErrors.awayWrestler = 'Away wrestler required'
    if (!matchData.weightClass) newErrors.weightClass = 'Weight class required'
    if (matchData.homeWrestler === matchData.awayWrestler) {
      newErrors.awayWrestler = 'Cannot wrestle against self'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleStartMatch = () => {
    if (validateMatch()) {
      onStartMatch(matchData)
    }
  }

  const handleWrestlerSelect = (wrestler: string, side: 'home' | 'away') => {
    const selected = wrestlers.find(w => w.name === wrestler)
    if (selected) {
      setMatchData(prev => ({
        ...prev,
        [side === 'home' ? 'homeWrestler' : 'awayWrestler']: wrestler,
        [side === 'home' ? 'homeTeam' : 'awayTeam']: selected.team,
        weightClass: prev.weightClass || selected.weight.toString()
      }))
    } else {
      setMatchData(prev => ({
        ...prev,
        [side === 'home' ? 'homeWrestler' : 'awayWrestler']: wrestler
      }))
    }
  }

  return (
    <Card className="bg-black/40 backdrop-blur-xl border border-gold/20">
      <CardHeader className="border-b border-gold/20">
        <CardTitle className="text-2xl text-gold flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          Match Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Match Type Selection */}
        <div className="space-y-2">
          <Label className="text-white">Match Type</Label>
          <Select 
            value={matchData.matchType} 
            onValueChange={(value: 'dual' | 'tournament' | 'exhibition') => 
              setMatchData(prev => ({ ...prev, matchType: value }))
            }
          >
            <SelectTrigger className="bg-black/40 border-gold/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black border-gold/30">
              <SelectItem value="dual">Dual Meet</SelectItem>
              <SelectItem value="tournament">Tournament</SelectItem>
              <SelectItem value="exhibition">Exhibition</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Weight Class */}
        <div className="space-y-2">
          <Label className="text-white flex items-center gap-2">
            <Scale className="w-4 h-4" />
            Weight Class
          </Label>
          <Select 
            value={matchData.weightClass} 
            onValueChange={(value) => setMatchData(prev => ({ ...prev, weightClass: value }))}
          >
            <SelectTrigger className={`bg-black/40 border-gold/30 text-white ${errors.weightClass ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select weight class" />
            </SelectTrigger>
            <SelectContent className="bg-black border-gold/30">
              {WEIGHT_CLASSES.map(weight => (
                <SelectItem key={weight} value={weight}>
                  {weight} lbs
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.weightClass && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.weightClass}
            </p>
          )}
        </div>

        {/* Wrestlers Selection */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Home Wrestler */}
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <User className="w-4 h-4 text-green-400" />
              Home Wrestler
            </Label>
            <Input
              value={matchData.homeWrestler}
              onChange={(e) => handleWrestlerSelect(e.target.value, 'home')}
              className={`bg-black/40 border-gold/30 text-white ${errors.homeWrestler ? 'border-red-500' : ''}`}
              placeholder="Enter wrestler name"
              list="home-wrestlers"
            />
            <datalist id="home-wrestlers">
              {wrestlers.map(w => (
                <option key={w.id} value={w.name} />
              ))}
            </datalist>
            {matchData.homeTeam && (
              <p className="text-sm text-gray-400">{matchData.homeTeam}</p>
            )}
            {errors.homeWrestler && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.homeWrestler}
              </p>
            )}
          </div>

          {/* Away Wrestler */}
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <User className="w-4 h-4 text-red-400" />
              Away Wrestler
            </Label>
            <Input
              value={matchData.awayWrestler}
              onChange={(e) => handleWrestlerSelect(e.target.value, 'away')}
              className={`bg-black/40 border-gold/30 text-white ${errors.awayWrestler ? 'border-red-500' : ''}`}
              placeholder="Enter wrestler name"
              list="away-wrestlers"
            />
            <datalist id="away-wrestlers">
              {wrestlers.map(w => (
                <option key={w.id} value={w.name} />
              ))}
            </datalist>
            {matchData.awayTeam && (
              <p className="text-sm text-gray-400">{matchData.awayTeam}</p>
            )}
            {errors.awayWrestler && (
              <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.awayWrestler}
              </p>
            )}
          </div>
        </div>

        {/* Additional Fields */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Referee */}
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <Users className="w-4 h-4" />
              Referee
            </Label>
            <Input
              value={matchData.referee}
              onChange={(e) => setMatchData(prev => ({ ...prev, referee: e.target.value }))}
              className="bg-black/40 border-gold/30 text-white"
              placeholder="Optional"
            />
          </div>

          {/* Mat Number */}
          {matchData.matchType === 'tournament' && (
            <div className="space-y-2">
              <Label className="text-white">Mat Number</Label>
              <Input
                value={matchData.mat}
                onChange={(e) => setMatchData(prev => ({ ...prev, mat: e.target.value }))}
                className="bg-black/40 border-gold/30 text-white"
                placeholder="Mat #"
              />
            </div>
          )}

          {/* Bout Number */}
          {matchData.matchType === 'dual' && (
            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Bout Number
              </Label>
              <Input
                type="number"
                value={matchData.boutNumber}
                onChange={(e) => setMatchData(prev => ({ ...prev, boutNumber: parseInt(e.target.value) || 1 }))}
                className="bg-black/40 border-gold/30 text-white"
                min="1"
                max="14"
              />
            </div>
          )}
        </div>

        {/* Start Match Button */}
        <Button 
          onClick={handleStartMatch}
          className="w-full bg-gold hover:bg-gold/90 text-black font-bold text-lg py-6"
        >
          <Trophy className="w-5 h-5 mr-2" />
          Start Match
        </Button>
      </CardContent>
    </Card>
  )
}

export default MatchSetup