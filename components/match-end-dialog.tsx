'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Trophy, AlertCircle, Clock } from 'lucide-react'

interface MatchEndDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (endType: string, winner: string, time?: string) => void
  wrestler1: { name: string; score: number }
  wrestler2: { name: string; score: number }
  period: number | string
  currentTime: string
}

export function MatchEndDialog({
  isOpen,
  onClose,
  onConfirm,
  wrestler1,
  wrestler2,
  period,
  currentTime
}: MatchEndDialogProps) {
  const [endType, setEndType] = useState<string>('decision')
  const [winner, setWinner] = useState<string>(
    wrestler1.score > wrestler2.score ? 'wrestler1' : 'wrestler2'
  )
  const [pinTime, setPinTime] = useState<string>(currentTime)

  const scoreDiff = Math.abs(wrestler1.score - wrestler2.score)
  
  // Auto-detect match end type based on score
  const getDefaultEndType = () => {
    if (scoreDiff >= 15) return 'tech_fall'
    if (scoreDiff >= 8 && scoreDiff <= 14) return 'major_decision'
    return 'decision'
  }

  const handleConfirm = () => {
    const time = endType === 'pin' ? pinTime : currentTime
    onConfirm(endType, winner, time)
  }

  const endTypes = [
    {
      value: 'pin',
      label: 'Pin/Fall',
      description: 'Both shoulders on mat for 2 seconds',
      points: 6
    },
    {
      value: 'tech_fall',
      label: 'Technical Fall',
      description: '15+ point lead',
      points: 5,
      disabled: scoreDiff < 15
    },
    {
      value: 'major_decision',
      label: 'Major Decision',
      description: '8-14 point victory',
      points: 4,
      disabled: scoreDiff < 8 || scoreDiff > 14
    },
    {
      value: 'decision',
      label: 'Regular Decision',
      description: 'Less than 8 point victory',
      points: 3
    },
    {
      value: 'forfeit',
      label: 'Forfeit',
      description: 'Opponent did not compete',
      points: 6
    },
    {
      value: 'medical_forfeit',
      label: 'Medical Forfeit',
      description: 'Injury default',
      points: 6
    },
    {
      value: 'disqualification',
      label: 'Disqualification',
      description: 'Rule violation',
      points: 6
    },
    {
      value: 'default',
      label: 'Default',
      description: 'Failure to make weight',
      points: 6
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-black/95 border border-gold/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gold flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            End Match
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Current Score: {wrestler1.name} ({wrestler1.score}) vs {wrestler2.name} ({wrestler2.score})
            <br />
            Period {period} - Time: {currentTime}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Match End Type */}
          <div className="space-y-3">
            <Label className="text-white text-lg">How did the match end?</Label>
            <RadioGroup value={endType} onValueChange={setEndType}>
              {endTypes.map((type) => (
                <div
                  key={type.value}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${
                    type.disabled 
                      ? 'opacity-50 cursor-not-allowed border-gray-700' 
                      : endType === type.value 
                      ? 'border-gold bg-gold/10' 
                      : 'border-gray-700 hover:border-gold/50'
                  }`}
                >
                  <RadioGroupItem
                    value={type.value}
                    disabled={type.disabled}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{type.label}</span>
                      <span className="text-xs text-gold">+{type.points} team pts</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{type.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Winner Selection */}
          <div className="space-y-3">
            <Label className="text-white text-lg">Winner</Label>
            <RadioGroup value={winner} onValueChange={setWinner}>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    winner === 'wrestler1' 
                      ? 'border-green-500 bg-green-500/20' 
                      : 'border-gray-700 hover:border-green-500/50'
                  }`}
                  onClick={() => setWinner('wrestler1')}
                >
                  <RadioGroupItem value="wrestler1" className="sr-only" />
                  <div className="text-center">
                    <p className="font-bold text-lg">{wrestler1.name}</p>
                    <p className="text-2xl font-bold text-green-400">{wrestler1.score}</p>
                  </div>
                </div>
                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    winner === 'wrestler2' 
                      ? 'border-green-500 bg-green-500/20' 
                      : 'border-gray-700 hover:border-green-500/50'
                  }`}
                  onClick={() => setWinner('wrestler2')}
                >
                  <RadioGroupItem value="wrestler2" className="sr-only" />
                  <div className="text-center">
                    <p className="font-bold text-lg">{wrestler2.name}</p>
                    <p className="text-2xl font-bold text-green-400">{wrestler2.score}</p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Pin Time (only for pins) */}
          {endType === 'pin' && (
            <div className="space-y-3">
              <Label htmlFor="pin-time" className="text-white text-lg flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pin Time
              </Label>
              <Input
                id="pin-time"
                value={pinTime}
                onChange={(e) => setPinTime(e.target.value)}
                placeholder="0:00"
                className="bg-black/50 border-gold/30 text-white"
              />
            </div>
          )}

          {/* Auto-detection Notice */}
          {scoreDiff >= 15 && endType !== 'tech_fall' && endType !== 'pin' && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-yellow-300">
                Score difference is {scoreDiff} points. Consider marking as Technical Fall.
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-gold hover:bg-gold/90 text-black font-bold"
          >
            End Match
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}