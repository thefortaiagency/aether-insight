'use client'

import { useEffect, useState } from 'react'
import { WifiOff, Wifi, RefreshCw, CloudOff, Cloud } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { offlineQueue } from '@/lib/offline-queue'
import { cn } from '@/lib/utils'

export function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [queueStatus, setQueueStatus] = useState({
    pending: 0,
    syncing: false
  })
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const checkStatus = async () => {
      setIsOnline(navigator.onLine)
      const status = await offlineQueue.getQueueStatus()
      setQueueStatus({
        pending: status.pending,
        syncing: status.syncInProgress
      })
    }

    // Initial check
    checkStatus()

    // Set up listeners
    const handleOnline = () => {
      setIsOnline(true)
      checkStatus()
    }

    const handleOffline = () => {
      setIsOnline(false)
      checkStatus()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check periodically
    const interval = setInterval(checkStatus, 5000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  const handleSync = async () => {
    await offlineQueue.forceSyncNow()
    const status = await offlineQueue.getQueueStatus()
    setQueueStatus({
      pending: status.pending,
      syncing: status.syncInProgress
    })
  }

  if (isOnline && queueStatus.pending === 0) {
    // Everything is synced and online
    return (
      <div className="fixed top-4 right-4 z-50">
        <Badge className="bg-green-600/90 text-white border-green-500 backdrop-blur-sm">
          <Cloud className="w-3 h-3 mr-1" />
          Online & Synced
        </Badge>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* Main status badge */}
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <Badge 
          className={cn(
            "backdrop-blur-sm",
            isOnline 
              ? "bg-yellow-600/90 text-white border-yellow-500" 
              : "bg-red-600/90 text-white border-red-500"
          )}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 mr-1" />
              Online
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 mr-1" />
              Offline
            </>
          )}
          {queueStatus.pending > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-black/30 rounded-full text-xs">
              {queueStatus.pending} pending
            </span>
          )}
        </Badge>

        {queueStatus.syncing && (
          <Badge className="bg-blue-600/90 text-white border-blue-500 animate-pulse">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Syncing...
          </Badge>
        )}
      </div>

      {/* Details panel */}
      {showDetails && (
        <div className="bg-black/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3 min-w-[200px]">
          <div className="text-white text-sm space-y-2">
            <div className="flex items-center justify-between">
              <span>Connection:</span>
              <span className={isOnline ? "text-green-400" : "text-red-400"}>
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Pending Operations:</span>
              <span className={queueStatus.pending > 0 ? "text-yellow-400" : "text-green-400"}>
                {queueStatus.pending}
              </span>
            </div>

            {isOnline && queueStatus.pending > 0 && !queueStatus.syncing && (
              <Button
                onClick={handleSync}
                size="sm"
                className="w-full bg-gold/20 hover:bg-gold/30 text-gold border-gold/50"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Sync Now
              </Button>
            )}

            {!isOnline && (
              <div className="text-xs text-gray-400 mt-2">
                Data will sync automatically when connection is restored
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}