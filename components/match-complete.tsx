'use client'

import { Trophy, Clock, Save, Upload, Home, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface MatchCompleteProps {
  match: {
    wrestler1: { name: string; team: string; score: number }
    wrestler2: { name: string; team: string; score: number }
    winner?: string
    winType?: string
    pin_time?: string
    period: number | string
    weightClass: number
  }
  timeElapsed: string
  hasVideo: boolean
  videoSaved: boolean
  onSaveMatch: () => void
  onNewMatch: () => void
  onGoHome: () => void
  onUploadVideo?: () => void
}

export function MatchComplete({
  match,
  timeElapsed,
  hasVideo,
  videoSaved,
  onSaveMatch,
  onNewMatch,
  onGoHome,
  onUploadVideo
}: MatchCompleteProps) {
  const winner = match.winner === match.wrestler1.name ? match.wrestler1 : match.wrestler2
  const loser = match.winner === match.wrestler1.name ? match.wrestler2 : match.wrestler1
  
  const getWinDescription = () => {
    switch (match.winType) {
      case 'pin':
        return `Pin at ${match.pin_time || timeElapsed}`
      case 'tech_fall':
        return 'Technical Fall (15+ points)'
      case 'major_decision':
        return 'Major Decision (8-14 points)'
      case 'decision':
        return 'Decision'
      case 'forfeit':
        return 'Forfeit'
      case 'medical_forfeit':
        return 'Medical Forfeit'
      case 'disqualification':
        return 'Disqualification'
      default:
        return `${winner.score} - ${loser.score}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-black/80 backdrop-blur-sm border-gold/30">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Trophy className="w-16 h-16 text-gold animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-bold text-white">
            Match Complete!
          </CardTitle>
          <Badge className="mx-auto mt-2 bg-gold/20 text-gold border-gold">
            {match.weightClass} lbs
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Winner announcement */}
          <div className="text-center p-6 bg-gradient-to-r from-gold/20 to-gold/10 rounded-lg border border-gold/30">
            <h2 className="text-2xl font-bold text-gold mb-2">
              WINNER
            </h2>
            <p className="text-3xl font-bold text-white mb-1">
              {winner.name}
            </p>
            <p className="text-gray-400 mb-3">
              {winner.team}
            </p>
            <Badge className="bg-green-600/20 text-green-400 border-green-500">
              {getWinDescription()}
            </Badge>
          </div>

          {/* Final scores */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg text-center ${match.winner === match.wrestler1.name ? 'bg-green-900/20 border border-green-500/30' : 'bg-gray-900/50'}`}>
              <p className="text-sm text-gray-400 mb-1">{match.wrestler1.team}</p>
              <p className="text-xl font-bold text-white">{match.wrestler1.name}</p>
              <p className="text-3xl font-bold mt-2 text-red-500">{match.wrestler1.score}</p>
            </div>
            <div className={`p-4 rounded-lg text-center ${match.winner === match.wrestler2.name ? 'bg-green-900/20 border border-green-500/30' : 'bg-gray-900/50'}`}>
              <p className="text-sm text-gray-400 mb-1">{match.wrestler2.team}</p>
              <p className="text-xl font-bold text-white">{match.wrestler2.name}</p>
              <p className="text-3xl font-bold mt-2 text-green-500">{match.wrestler2.score}</p>
            </div>
          </div>

          {/* Match info */}
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Duration: {timeElapsed}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Period: {match.period}</span>
            </div>
          </div>

          {/* Video status */}
          {hasVideo && (
            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-400">
                    Video Recording
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {videoSaved ? 'Saved locally - ready to upload' : 'Recording in progress...'}
                  </p>
                </div>
                {videoSaved && onUploadVideo && (
                  <Button
                    onClick={onUploadVideo}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            <Button
              onClick={onSaveMatch}
              className="bg-gold/20 hover:bg-gold/30 text-gold border-gold/50"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Match
            </Button>
            <Button
              onClick={onNewMatch}
              className="bg-green-600/20 hover:bg-green-600/30 text-green-400 border-green-600/50"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Match
            </Button>
            <Button
              onClick={onGoHome}
              variant="outline"
              className="text-gray-400 border-gray-600"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}