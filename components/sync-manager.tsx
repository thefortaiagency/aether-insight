'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Cloud, 
  CloudOff, 
  Upload, 
  Check, 
  X, 
  RefreshCw,
  Database,
  Video,
  FileText,
  Wifi,
  WifiOff,
  AlertCircle
} from 'lucide-react'
import { offlineStorage } from '@/lib/offline-storage'
import { offlineQueue } from '@/lib/offline-queue'
import { cn } from '@/lib/utils'

interface SyncStatus {
  matches: { pending: number; synced: number }
  events: { pending: number; synced: number }
  videos: { pending: number; totalSize: number; synced: number }
  online: boolean
}

export function SyncManager({ matchId }: { matchId?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    matches: { pending: 0, synced: 0 },
    events: { pending: 0, synced: 0 },
    videos: { pending: 0, totalSize: 0, synced: 0 },
    online: true
  })
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncMessage, setSyncMessage] = useState('')

  // Check sync status
  const checkStatus = async () => {
    const online = navigator.onLine
    
    // Get offline storage info
    const storageInfo = await offlineStorage.getStorageInfo()
    
    // Get queue status
    const queueStatus = await offlineQueue.getQueueStatus()
    
    setSyncStatus({
      matches: { 
        pending: storageInfo.matchCount, 
        synced: 0 
      },
      events: { 
        pending: queueStatus.pending, 
        synced: 0 
      },
      videos: { 
        pending: storageInfo.videoCount, 
        totalSize: storageInfo.totalSize,
        synced: 0 
      },
      online
    })
  }

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    
    // Listen for online/offline events
    const handleOnline = () => checkStatus()
    const handleOffline = () => checkStatus()
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Manual sync for matches and events
  const syncMatchData = async () => {
    setIsSyncing(true)
    setSyncProgress(0)
    setSyncMessage('Syncing match data...')

    try {
      // Sync queued operations (matches and events)
      await offlineQueue.forceSyncNow()
      setSyncProgress(50)
      
      // Sync offline storage
      const results = await offlineStorage.syncAll((message) => {
        setSyncMessage(message)
      })
      
      setSyncProgress(100)
      setSyncMessage(`Synced ${results.matchesSynced} matches`)
      
      // Refresh status
      await checkStatus()
    } catch (error) {
      console.error('Sync error:', error)
      setSyncMessage('Sync failed - check connection')
    } finally {
      setIsSyncing(false)
      setTimeout(() => setSyncMessage(''), 3000)
    }
  }

  // Manual video upload using Cloudflare Stream direct upload URLs (no size limit!)
  const uploadVideos = async () => {
    if (!syncStatus.online) {
      setSyncMessage('Cannot upload videos while offline')
      return
    }

    setIsSyncing(true)
    setSyncProgress(0)
    setSyncMessage('Preparing video upload...')

    try {
      const videos = await offlineStorage.getAllUnsyncedVideos()
      
      if (videos.length === 0) {
        setSyncMessage('No videos to upload')
        return
      }

      // Upload videos one at a time
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i]
        setSyncProgress((i / videos.length) * 100)
        
        const sizeMB = video.blob.size / (1024 * 1024)
        setSyncMessage(`Uploading video ${i + 1} of ${videos.length} (${sizeMB.toFixed(1)}MB)...`)
        
        try {
          // Step 1: Get a direct upload URL from Cloudflare
          const uploadUrlResponse = await fetch('/api/videos/get-upload-url', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              matchId: video.matchId,
              fileName: `match-${video.matchId}.webm`
            })
          })
          
          if (!uploadUrlResponse.ok) {
            throw new Error('Failed to get upload URL')
          }
          
          const { uploadURL, videoId, streamURL } = await uploadUrlResponse.json()
          
          // Step 2: Upload directly to Cloudflare (bypasses Vercel limits!)
          setSyncMessage(`Uploading video ${i + 1} directly to Cloudflare...`)
          
          // Create a File object from the blob
          const file = new File([video.blob], `match-${video.matchId}.webm`, {
            type: 'video/webm'
          })
          
          // Cloudflare direct upload expects FormData
          const formData = new FormData()
          formData.append('file', file)
          
          const uploadResponse = await fetch(uploadURL, {
            method: 'POST',
            body: formData
            // Don't set Content-Type header - let browser set it with boundary
          })
          
          if (!uploadResponse.ok) {
            throw new Error(`Direct upload failed: ${uploadResponse.status}`)
          }
          
          // Step 3: Save video info to our database
          await fetch('/api/videos/save-upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              matchId: video.matchId,
              cloudflareId: videoId,
              streamUrl: streamURL,
              fileSize: video.blob.size
            })
          })
          
          // Mark video as synced
          await offlineStorage.markVideoSynced(video.id)
          setSyncMessage(`✓ Uploaded video ${i + 1} of ${videos.length} (${sizeMB.toFixed(1)}MB)`)
          
        } catch (error) {
          console.error('Video upload error:', error)
          setSyncMessage(`Failed to upload video ${i + 1} - ${error}`)
          // Continue with next video instead of stopping
        }
      }
      
      setSyncProgress(100)
      setSyncMessage('All videos uploaded successfully!')
      await checkStatus()
    } catch (error) {
      console.error('Video upload error:', error)
      setSyncMessage('Video upload failed')
    } finally {
      setIsSyncing(false)
      setTimeout(() => setSyncMessage(''), 3000)
    }
  }

  // Clear synced data
  const clearSyncedData = async () => {
    await offlineStorage.clearSyncedData()
    await checkStatus()
    setSyncMessage('Cleared synced data')
    setTimeout(() => setSyncMessage(''), 3000)
  }

  const totalPending = 
    syncStatus.matches.pending + 
    syncStatus.events.pending + 
    syncStatus.videos.pending

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-4 left-4 z-50 p-3 rounded-full shadow-lg transition-all",
          "bg-black/80 backdrop-blur-sm border",
          syncStatus.online ? "border-green-500" : "border-red-500",
          totalPending > 0 && "animate-pulse"
        )}
      >
        <div className="relative">
          {syncStatus.online ? (
            <Cloud className="w-6 h-6 text-green-400" />
          ) : (
            <CloudOff className="w-6 h-6 text-red-400" />
          )}
          {totalPending > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalPending}
            </span>
          )}
        </div>
      </button>

      {/* Sync panel */}
      {isOpen && (
        <Card className="fixed bottom-20 left-4 z-50 w-96 bg-black/90 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <span>Sync Manager</span>
              <Badge className={syncStatus.online ? "bg-green-600" : "bg-red-600"}>
                {syncStatus.online ? (
                  <><Wifi className="w-3 h-3 mr-1" /> Online</>
                ) : (
                  <><WifiOff className="w-3 h-3 mr-1" /> Offline</>
                )}
              </Badge>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage local data and sync with server
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Sync status */}
            <div className="space-y-3">
              {/* Matches */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Database className="w-4 h-4" />
                  <span>Matches</span>
                </div>
                <Badge variant={syncStatus.matches.pending > 0 ? "secondary" : "default"}>
                  {syncStatus.matches.pending} pending
                </Badge>
              </div>

              {/* Events */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <FileText className="w-4 h-4" />
                  <span>Events</span>
                </div>
                <Badge variant={syncStatus.events.pending > 0 ? "secondary" : "default"}>
                  {syncStatus.events.pending} pending
                </Badge>
              </div>

              {/* Videos */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Video className="w-4 h-4" />
                  <span>Videos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={syncStatus.videos.pending > 0 ? "secondary" : "default"}>
                    {syncStatus.videos.pending} pending
                  </Badge>
                  {syncStatus.videos.totalSize > 0 && (
                    <span className="text-xs text-gray-500">
                      ({(syncStatus.videos.totalSize / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            {isSyncing && (
              <div className="space-y-2">
                <Progress value={syncProgress} className="h-2" />
                <p className="text-xs text-gray-400 text-center">{syncMessage}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2">
              {/* Sync match data */}
              <Button
                onClick={syncMatchData}
                disabled={!syncStatus.online || isSyncing || (syncStatus.matches.pending === 0 && syncStatus.events.pending === 0)}
                className="w-full bg-gold/20 hover:bg-gold/30 text-gold border-gold/50"
                size="sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                Sync Match Data
              </Button>

              {/* Upload videos */}
              <Button
                onClick={uploadVideos}
                disabled={!syncStatus.online || isSyncing || syncStatus.videos.pending === 0}
                className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-blue-600/50"
                size="sm"
              >
                <Video className="w-4 h-4 mr-2" />
                Upload Videos ({syncStatus.videos.pending})
              </Button>

              {/* Clear synced */}
              <Button
                onClick={clearSyncedData}
                disabled={isSyncing}
                variant="outline"
                className="w-full text-gray-400 border-gray-600"
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Synced Data
              </Button>
            </div>

            {/* Info message */}
            {!syncStatus.online && (
              <div className="flex items-start gap-2 p-2 bg-red-900/20 rounded text-xs text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  You're offline. All data is being saved locally and will sync when connection is restored.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}