'use client'

import { useExtension } from '@/lib/use-extension'
import { Badge } from '@/components/ui/badge'
import { Plug, PlugZap, Zap } from 'lucide-react'

interface ExtensionStatusProps {
  showDetails?: boolean
  className?: string
}

export function ExtensionStatus({ showDetails = false, className = '' }: ExtensionStatusProps) {
  const { isConnected, version, capabilities } = useExtension()

  if (isConnected) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-1">
          <PlugZap className="w-3 h-3" />
          Extension Connected
        </Badge>
        {showDetails && version && (
          <span className="text-xs text-gray-500">v{version}</span>
        )}
        {showDetails && capabilities && capabilities.length > 0 && (
          <div className="flex gap-1">
            {capabilities.map((cap) => (
              <Badge key={cap} variant="outline" className="text-xs border-gold/30 text-gold">
                {cap}
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Badge className={`bg-gray-500/20 text-gray-400 border-gray-500/30 flex items-center gap-1 ${className}`}>
      <Plug className="w-3 h-3" />
      Web Only
    </Badge>
  )
}

/**
 * Small indicator dot for navbar or compact areas
 */
export function ExtensionIndicator() {
  const { isConnected } = useExtension()

  return (
    <div
      className={`w-2 h-2 rounded-full ${
        isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
      }`}
      title={isConnected ? 'Extension Connected' : 'Web Only'}
    />
  )
}
