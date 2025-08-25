'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Printer } from 'lucide-react'

interface BoutSheetProps {
  match: {
    id: string
    wrestler1: {
      name: string
      team: string
      score: number
    }
    wrestler2: {
      name: string
      team: string
      score: number
    }
    weightClass: number
    matchType: string
    period: number
    time: string
    referee?: string
    mat?: string
    winner?: string
    winType?: string
    finalScore?: string
  }
  scoreHistory: Array<{
    timestamp: number
    wrestlerId: string
    action: string
    points: number
    period: number
    time: string
  }>
}

export function BoutSheet({ match, scoreHistory }: BoutSheetProps) {
  const handlePrint = () => {
    window.print()
  }

  // Group score history by period
  const scoresByPeriod = scoreHistory.reduce((acc, score) => {
    if (!acc[score.period]) acc[score.period] = []
    acc[score.period].push(score)
    return acc
  }, {} as Record<number, typeof scoreHistory>)

  return (
    <>
      {/* Print button - hidden when printing */}
      <div className="no-print mb-4">
        <Button onClick={handlePrint} className="bg-gold hover:bg-gold/90 text-black">
          <Printer className="w-4 h-4 mr-2" />
          Print Bout Sheet
        </Button>
      </div>

      {/* Printable bout sheet */}
      <div className="bout-sheet print:block">
        <Card className="p-8 bg-white text-black print:shadow-none">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Official Bout Sheet</h1>
            <p className="text-gray-600 mt-1">Aether Insight Wrestling Analytics</p>
          </div>

          {/* Match Information */}
          <div className="grid grid-cols-2 gap-4 mb-6 pb-4 border-b-2 border-gray-300">
            <div>
              <span className="font-semibold">Weight Class:</span> {match.weightClass} lbs
            </div>
            <div>
              <span className="font-semibold">Match Type:</span> {match.matchType}
            </div>
            {match.referee && (
              <div>
                <span className="font-semibold">Referee:</span> {match.referee}
              </div>
            )}
            {match.mat && (
              <div>
                <span className="font-semibold">Mat:</span> {match.mat}
              </div>
            )}
          </div>

          {/* Wrestlers */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div className={`p-4 rounded-lg ${match.winner === match.wrestler1.name ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50'}`}>
              <h3 className="font-bold text-lg mb-2 text-green-600">GREEN</h3>
              <p className="font-semibold text-xl">{match.wrestler1.name}</p>
              <p className="text-gray-600">{match.wrestler1.team}</p>
              <p className="text-3xl font-bold mt-2">{match.wrestler1.score}</p>
            </div>
            <div className={`p-4 rounded-lg ${match.winner === match.wrestler2.name ? 'bg-red-50 border-2 border-red-500' : 'bg-gray-50'}`}>
              <h3 className="font-bold text-lg mb-2 text-red-600">RED</h3>
              <p className="font-semibold text-xl">{match.wrestler2.name}</p>
              <p className="text-gray-600">{match.wrestler2.team}</p>
              <p className="text-3xl font-bold mt-2">{match.wrestler2.score}</p>
            </div>
          </div>

          {/* Match Result */}
          {match.winner && (
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h3 className="font-bold text-lg mb-2">Match Result</h3>
              <p className="text-xl">
                <span className="font-semibold">Winner:</span> {match.winner}
              </p>
              {match.winType && (
                <p className="text-lg">
                  <span className="font-semibold">Win Type:</span> {match.winType}
                </p>
              )}
              {match.finalScore && (
                <p className="text-lg">
                  <span className="font-semibold">Final Score:</span> {match.finalScore}
                </p>
              )}
            </div>
          )}

          {/* Scoring Summary by Period */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">Scoring Summary</h3>
            
            {[1, 2, 3].map(period => (
              <div key={period} className="mb-4">
                <h4 className="font-semibold mb-2 bg-gray-100 p-2 rounded">
                  Period {period}
                </h4>
                {scoresByPeriod[period] ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1">Time</th>
                        <th className="text-left py-1">Wrestler</th>
                        <th className="text-left py-1">Action</th>
                        <th className="text-right py-1">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scoresByPeriod[period].map((score, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-1">{score.time}</td>
                          <td className="py-1">
                            {score.wrestlerId === 'wrestler1' ? match.wrestler1.name : match.wrestler2.name}
                          </td>
                          <td className="py-1">{score.action}</td>
                          <td className="text-right py-1">+{score.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 text-sm italic">No scoring in this period</p>
                )}
              </div>
            ))}
          </div>

          {/* Officials Signature Section */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-4 border-t-2 border-gray-300">
            <div>
              <p className="text-sm text-gray-600 mb-8">Referee Signature</p>
              <div className="border-b border-gray-400"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-8">Scorer Signature</p>
              <div className="border-b border-gray-400"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-8">Date/Time</p>
              <div className="border-b border-gray-400"></div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-xs text-gray-500">
            <p>Generated by Aether Insight Wrestling Analytics Platform</p>
            <p>Integrated with AetherVTC for complete team management</p>
          </div>
        </Card>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .bout-sheet {
            width: 100%;
            max-width: none;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          @page {
            margin: 0.5in;
            size: letter;
          }
        }
        
        @media screen {
          .bout-sheet {
            max-width: 800px;
          }
        }
      `}</style>
    </>
  )
}