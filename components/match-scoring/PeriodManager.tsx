'use client'

import { FC } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PeriodManagerProps {
  currentPeriod: number
  periods: Array<{
    number: number
    homeScore: number
    awayScore: number
    completed: boolean
  }>
  onPeriodChange?: (period: number) => void
}

const PeriodManager: FC<PeriodManagerProps> = ({
  currentPeriod,
  periods,
  onPeriodChange
}) => {
  return (
    <div className="bg-black/40 backdrop-blur-xl border border-gold/20 rounded-lg p-4">
      <h3 className="text-gold font-bold mb-3">Period Breakdown</h3>
      <div className="grid grid-cols-3 gap-3">
        {periods.map((period) => (
          <div
            key={period.number}
            className={cn(
              'p-3 rounded-lg border transition-all cursor-pointer',
              currentPeriod === period.number 
                ? 'bg-gold/20 border-gold shadow-lg shadow-gold/20' 
                : period.completed 
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-black/30 border-gray-700 hover:border-gold/50'
            )}
            onClick={() => onPeriodChange?.(period.number)}
          >
            <div className="text-center mb-2">
              <Badge 
                className={cn(
                  'text-xs',
                  currentPeriod === period.number 
                    ? 'bg-gold text-black' 
                    : period.completed 
                      ? 'bg-green-500/20 text-green-400 border-green-500'
                      : 'bg-gray-700 text-gray-400'
                )}
              >
                Period {period.number}
              </Badge>
            </div>
            
            <div className="flex justify-around items-center">
              <div className="text-center">
                <div className={cn(
                  'text-2xl font-bold',
                  period.homeScore > period.awayScore ? 'text-green-400' : 'text-white'
                )}>
                  {period.completed || currentPeriod === period.number ? period.homeScore : '-'}
                </div>
              </div>
              
              <div className="text-gray-500 text-sm">vs</div>
              
              <div className="text-center">
                <div className={cn(
                  'text-2xl font-bold',
                  period.awayScore > period.homeScore ? 'text-red-400' : 'text-white'
                )}>
                  {period.completed || currentPeriod === period.number ? period.awayScore : '-'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Overtime Section */}
      {periods.every(p => p.completed) && periods[0].homeScore + periods[1].homeScore + periods[2].homeScore === 
         periods[0].awayScore + periods[1].awayScore + periods[2].awayScore && (
        <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500">
            OVERTIME
          </Badge>
          <div className="mt-2 text-sm text-gray-400">
            Sudden Victory • Ultimate Tiebreaker if needed
          </div>
        </div>
      )}
    </div>
  )
}

export default PeriodManager