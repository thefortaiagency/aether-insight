'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  WifiOff, Wifi, Cloud, CloudOff, Upload, 
  Database, Loader2, CheckCircle, AlertCircle 
} from 'lucide-react'
import { offlineStorage } from '@/lib/offline-storage'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<string>('')
  const [storageInfo, setStorageInfo] = useState({
    matchCount: 0,
    videoCount: 0,
    totalSize: 0
  })

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)

    // Update storage info
    updateStorageInfo()

    // Set up event listeners
    const handleOnline = () => {
      setIsOnline(true)
      setSyncStatus('Back online! Ready to sync.')
    }

    const handleOffline = () => {
      setIsOnline(false)
      setSyncStatus('Offline mode - data will be saved locally')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check storage periodically
    const interval = setInterval(updateStorageInfo, 5000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  const updateStorageInfo = async () => {
    try {
      const info = await offlineStorage.getStorageInfo()
      setStorageInfo(info)
    } catch (error) {
      console.error('Error getting storage info:', error)
    }
  }

  const handleSync = async () => {
    if (!isOnline) {
      setSyncStatus('Cannot sync while offline')
      return
    }

    setIsSyncing(true)
    setSyncStatus('Starting sync...')

    try {
      const results = await offlineStorage.syncAll((message) => {
        setSyncStatus(message)
      })

      if (results.errors.length === 0) {
        setSyncStatus(
          `✅ Sync complete! ${results.matchesSynced} matches, ${results.videosSynced} videos uploaded`
        )
      } else {
        setSyncStatus(
          `⚠️ Sync completed with errors. ${results.matchesSynced} matches, ${results.videosSynced} videos uploaded`
        )
        console.error('Sync errors:', results.errors)
      }

      // Update storage info after sync
      await updateStorageInfo()
    } catch (error) {
      setSyncStatus(`❌ Sync failed: ${error}`)
      console.error('Sync error:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
  }

  // Don't show anything if online and no data to sync
  if (isOnline && storageInfo.matchCount === 0 && storageInfo.videoCount === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {/* Connection Status */}
      <div className="bg-black/90 backdrop-blur-sm border border-gold/30 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <Badge className="bg-green-900/50 text-green-400 border-green-600">
                  Online
                </Badge>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <Badge className="bg-red-900/50 text-red-400 border-red-600">
                  Offline
                </Badge>
              </>
            )}
          </div>
          
          {storageInfo.matchCount > 0 || storageInfo.videoCount > 0 ? (
            <Badge className="bg-yellow-900/50 text-yellow-400 border-yellow-600">
              <Database className="w-3 h-3 mr-1" />
              {storageInfo.matchCount + storageInfo.videoCount} items
            </Badge>
          ) : null}
        </div>

        {/* Storage Info */}
        {(storageInfo.matchCount > 0 || storageInfo.videoCount > 0) && (
          <div className="text-xs space-y-1">
            {storageInfo.matchCount > 0 && (
              <div className="flex justify-between text-gray-400">
                <span>Unsynced matches:</span>
                <span className="text-white font-bold">{storageInfo.matchCount}</span>
              </div>
            )}
            {storageInfo.videoCount > 0 && (
              <div className="flex justify-between text-gray-400">
                <span>Unsynced videos:</span>
                <span className="text-white font-bold">{storageInfo.videoCount}</span>
              </div>
            )}
            {storageInfo.totalSize > 0 && (
              <div className="flex justify-between text-gray-400">
                <span>Storage used:</span>
                <span className="text-white font-bold">{formatSize(storageInfo.totalSize)}</span>
              </div>
            )}
          </div>
        )}

        {/* Sync Status */}
        {syncStatus && (
          <Alert className="bg-gray-900/50 border-gray-700 p-2">
            <AlertDescription className="text-xs text-gray-300">
              {syncStatus}
            </AlertDescription>
          </Alert>
        )}

        {/* Sync Button */}
        {isOnline && (storageInfo.matchCount > 0 || storageInfo.videoCount > 0) && (
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full bg-gold hover:bg-gold/90 text-black font-bold"
            size="sm"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>
        )}

        {/* Offline Mode Info */}
        {!isOnline && (
          <div className="text-xs text-gray-400">
            <p className="flex items-center gap-1">
              <CloudOff className="w-3 h-3" />
              Recording and scoring will be saved locally
            </p>
          </div>
        )}
      </div>
    </div>
  )
}