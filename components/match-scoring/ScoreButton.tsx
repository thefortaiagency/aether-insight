'use client'

import { ButtonHTMLAttributes, FC } from 'react'
import { cn } from '@/lib/utils'

interface ScoreButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  points: number
  label: string
  color?: 'green' | 'red' | 'gold' | 'purple' | 'blue' | 'yellow' | 'orange'
  icon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const ScoreButton: FC<ScoreButtonProps> = ({
  points,
  label,
  color = 'green',
  icon,
  size = 'md',
  className,
  ...props
}) => {
  const colorClasses = {
    green: 'bg-green-500/20 hover:bg-green-500/30 border-green-500 text-green-400',
    red: 'bg-red-500/20 hover:bg-red-500/30 border-red-500 text-red-400',
    gold: 'bg-gold/20 hover:bg-gold/30 border-gold text-gold',
    purple: 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500 text-purple-400',
    blue: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500 text-blue-400',
    yellow: 'bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500 text-yellow-400',
    orange: 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-500 text-orange-400'
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-3',
    lg: 'px-6 py-4 text-lg'
  }

  return (
    <button
      className={cn(
        'border rounded-lg transition-all duration-200 font-semibold',
        'flex flex-col items-center justify-center gap-1',
        'backdrop-blur-sm transform active:scale-95',
        colorClasses[color],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {icon && <div className="text-2xl">{icon}</div>}
      <span className="font-bold text-lg">{label}</span>
      {points > 0 && (
        <span className="text-2xl font-bold">+{points}</span>
      )}
    </button>
  )
}

export default ScoreButton