'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, Clock, Users, Activity, Award, TrendingUp, 
  Shield, Printer, Mail, Share2, Download, Calendar,
  MapPin, User, Hash
} from 'lucide-react'

interface MatchSummaryProps {
  match: any
  events?: any[]
  onClose?: () => void
}

export default function MatchSummary({ match, events = [], onClose }: MatchSummaryProps) {
  const getWinTypeDisplay = (winType: string) => {
    const types: Record<string, string> = {
      'pin': 'Fall',
      'tech_fall': 'Technical Fall',
      'major_decision': 'Major Decision',
      'decision': 'Decision',
      'forfeit': 'Forfeit',
      'medical_forfeit': 'Medical Forfeit',
      'disqualification': 'Disqualification',
      'default': 'Default'
    }
    return types[winType] || winType
  }

  const getWinner = () => {
    if (match.result === 'win') return match.wrestler1
    if (match.result === 'loss') return match.wrestler2
    return null
  }

  const getLoser = () => {
    if (match.result === 'win') return match.wrestler2
    if (match.result === 'loss') return match.wrestler1
    return null
  }

  const winner = getWinner()
  const loser = getLoser()

  const handlePrint = () => {
    window.print()
  }

  const handleEmail = () => {
    const subject = `Match Results: ${match.wrestler1.name} vs ${match.wrestler2.name}`
    const body = `
Match Results
=============
Date: ${new Date().toLocaleDateString()}
Weight Class: ${match.weightClass} lbs
${winner ? `Winner: ${winner.name} (${winner.team})` : 'No winner'}
${match.win_type ? `Victory: ${getWinTypeDisplay(match.win_type)}` : ''}
Final Score: ${match.wrestler1.score} - ${match.wrestler2.score}
${match.pin_time ? `Pin Time: ${match.pin_time}` : ''}
    `.trim()
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const exportToJSON = () => {
    const data = {
      match,
      events,
      exported: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `match-${match.id || 'summary'}-${Date.now()}.json`
    a.click()
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-black/90 backdrop-blur-sm border-[#D4AF38]/30 print:bg-white print:border-black">
      <CardHeader className="border-b border-[#D4AF38]/30 print:border-black">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold text-[#D4AF38] print:text-black flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Match Summary
          </CardTitle>
          <div className="flex gap-2 print:hidden">
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="bg-black/60 border-[#D4AF38]/30 text-white hover:bg-[#D4AF38]/20"
            >
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
            <Button
              onClick={handleEmail}
              variant="outline"
              size="sm"
              className="bg-black/60 border-[#D4AF38]/30 text-white hover:bg-[#D4AF38]/20"
            >
              <Mail className="w-4 h-4 mr-1" />
              Email
            </Button>
            <Button
              onClick={exportToJSON}
              variant="outline"
              size="sm"
              className="bg-black/60 border-[#D4AF38]/30 text-white hover:bg-[#D4AF38]/20"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6 print:text-black">
        {/* Match Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Date</p>
              <p className="text-white print:text-black font-semibold">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Weight Class</p>
              <p className="text-white print:text-black font-semibold">{match.weightClass} lbs</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Mat</p>
              <p className="text-white print:text-black font-semibold">Mat {match.mat}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Referee</p>
              <p className="text-white print:text-black font-semibold">{match.referee || 'Not recorded'}</p>
            </div>
          </div>
        </div>

        {/* Match Result */}
        {winner && (
          <div className="bg-[#D4AF38]/10 rounded-lg p-4 print:border print:border-black">
            <h3 className="text-lg font-bold text-[#D4AF38] print:text-black mb-3">Match Result</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-green-400 print:text-black font-bold text-xl">
                    WINNER: {winner.name}
                  </p>
                  <p className="text-gray-400">{winner.team}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white print:text-black">{winner.score}</p>
                  <Badge className="bg-green-600 text-white print:bg-gray-200 print:text-black">
                    {getWinTypeDisplay(match.win_type)}
                  </Badge>
                </div>
              </div>
              
              <div className="border-t border-[#D4AF38]/30 pt-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-red-400 print:text-black">
                      {loser?.name}
                    </p>
                    <p className="text-gray-400 text-sm">{loser?.team}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-400">{loser?.score}</p>
                  </div>
                </div>
              </div>

              {match.pin_time && (
                <div className="mt-2 text-center">
                  <Badge className="bg-red-600 text-white">
                    PIN @ {match.pin_time}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Period Breakdown */}
        <div>
          <h3 className="text-lg font-bold text-[#D4AF38] print:text-black mb-3">Period Breakdown</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-black/60 rounded-lg p-3 print:border print:border-black">
              <p className="text-xs text-gray-400 mb-1">Period 1</p>
              <p className="text-xl font-bold text-white print:text-black">
                {match.period1_score_for || 0} - {match.period1_score_against || 0}
              </p>
            </div>
            <div className="bg-black/60 rounded-lg p-3 print:border print:border-black">
              <p className="text-xs text-gray-400 mb-1">Period 2</p>
              <p className="text-xl font-bold text-white print:text-black">
                {match.period2_score_for || 0} - {match.period2_score_against || 0}
              </p>
            </div>
            <div className="bg-black/60 rounded-lg p-3 print:border print:border-black">
              <p className="text-xs text-gray-400 mb-1">Period 3</p>
              <p className="text-xl font-bold text-white print:text-black">
                {match.period3_score_for || 0} - {match.period3_score_against || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div>
          <h3 className="text-lg font-bold text-[#D4AF38] print:text-black mb-3">Match Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Wrestler 1 Stats */}
            <div className="bg-black/60 rounded-lg p-4 print:border print:border-black">
              <h4 className="font-semibold text-white print:text-black mb-3">
                {match.wrestler1.name}
                <span className="ml-2 text-sm text-gray-400">({match.wrestler1.team})</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Takedowns:</span>
                  <span className="text-white print:text-black font-bold">{match.wrestler1.takedowns}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Escapes:</span>
                  <span className="text-white print:text-black font-bold">{match.wrestler1.escapes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reversals:</span>
                  <span className="text-white print:text-black font-bold">{match.wrestler1.reversals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Near Falls:</span>
                  <span className="text-white print:text-black font-bold">
                    {match.wrestler1.nearFall2 + match.wrestler1.nearFall3 + match.wrestler1.nearFall4}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Stalls:</span>
                  <span className="text-white print:text-black font-bold">{match.wrestler1.stalls}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Riding Time:</span>
                  <span className="text-white print:text-black font-bold">
                    {Math.floor(match.wrestler1.ridingTime / 60)}:{String(match.wrestler1.ridingTime % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>

            {/* Wrestler 2 Stats */}
            <div className="bg-black/60 rounded-lg p-4 print:border print:border-black">
              <h4 className="font-semibold text-white print:text-black mb-3">
                {match.wrestler2.name}
                <span className="ml-2 text-sm text-gray-400">({match.wrestler2.team})</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Takedowns:</span>
                  <span className="text-white print:text-black font-bold">{match.wrestler2.takedowns}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Escapes:</span>
                  <span className="text-white print:text-black font-bold">{match.wrestler2.escapes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reversals:</span>
                  <span className="text-white print:text-black font-bold">{match.wrestler2.reversals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Near Falls:</span>
                  <span className="text-white print:text-black font-bold">
                    {match.wrestler2.nearFall2 + match.wrestler2.nearFall3 + match.wrestler2.nearFall4}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Stalls:</span>
                  <span className="text-white print:text-black font-bold">{match.wrestler2.stalls}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Riding Time:</span>
                  <span className="text-white print:text-black font-bold">
                    {Math.floor(match.wrestler2.ridingTime / 60)}:{String(match.wrestler2.ridingTime % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scoring Timeline */}
        {events.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-[#D4AF38] print:text-black mb-3">Scoring Timeline</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto print:max-h-none">
              {events.map((event, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <Badge className="bg-black/60 text-white print:bg-gray-200 print:text-black">
                    P{event.period} @ {Math.floor(event.event_time / 60)}:{String(event.event_time % 60).padStart(2, '0')}
                  </Badge>
                  <span className="text-white print:text-black">
                    {event.wrestler_name} - {event.event_type}
                  </span>
                  {event.points > 0 && (
                    <Badge className="bg-green-600 text-white print:bg-gray-300 print:text-black">
                      +{event.points}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 print:hidden">
          {onClose && (
            <Button
              onClick={onClose}
              className="bg-[#D4AF38] hover:bg-[#B8941C] text-black font-bold"
            >
              Close Summary
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}