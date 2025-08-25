// Enhanced offline queue system for matches and events
// Queues all operations when offline and syncs when online

import { offlineStorage } from './offline-storage'

interface QueuedOperation {
  id: string
  type: 'match_create' | 'match_update' | 'match_event' | 'video_upload'
  endpoint: string
  method: string
  data: any
  timestamp: number
  retries: number
  synced: boolean
  matchId?: string
}

class OfflineQueue {
  private dbName = 'AetherInsightQueue'
  private dbVersion = 1
  private db: IDBDatabase | null = null
  private syncInProgress = false
  private onlineCheckInterval: NodeJS.Timeout | null = null

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        this.setupEventListeners()
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains('operations')) {
          const store = db.createObjectStore('operations', { keyPath: 'id' })
          store.createIndex('synced', 'synced', { unique: false })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('matchId', 'matchId', { unique: false })
        }
      }
    })
  }

  private setupEventListeners() {
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('🌐 Connection restored - starting sync...')
        this.processSyncQueue()
      })

      window.addEventListener('offline', () => {
        console.log('📵 Connection lost - queuing operations...')
      })

      // Also check periodically (every 30 seconds) in case events don't fire
      this.onlineCheckInterval = setInterval(() => {
        if (navigator.onLine && !this.syncInProgress) {
          this.processSyncQueue()
        }
      }, 30000)
    }
  }

  async queueOperation(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retries' | 'synced'>) {
    if (!this.db) await this.init()

    const queuedOp: QueuedOperation = {
      ...operation,
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
      synced: false
    }

    return new Promise<string>((resolve, reject) => {
      const transaction = this.db!.transaction(['operations'], 'readwrite')
      const store = transaction.objectStore('operations')
      const request = store.put(queuedOp)

      request.onsuccess = () => {
        console.log(`📦 Operation queued: ${queuedOp.type}`)
        resolve(queuedOp.id)
        
        // Try to sync immediately if online
        if (navigator.onLine) {
          this.processSyncQueue()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async processSyncQueue() {
    if (this.syncInProgress || !navigator.onLine) return
    
    this.syncInProgress = true
    console.log('🔄 Processing sync queue...')

    try {
      const operations = await this.getUnSyncedOperations()
      console.log(`Found ${operations.length} operations to sync`)

      let successCount = 0
      let failCount = 0

      for (const op of operations) {
        try {
          console.log(`Syncing ${op.type} operation...`)
          
          const response = await fetch(op.endpoint, {
            method: op.method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(op.data)
          })

          if (response.ok) {
            await this.markOperationSynced(op.id)
            successCount++
            console.log(`✅ Synced: ${op.type}`)

            // If this was a match creation, update the ID mapping
            if (op.type === 'match_create') {
              const result = await response.json()
              if (result.data?.id) {
                await this.updateMatchIdMapping(op.id, result.data.id)
              }
            }
          } else {
            // Increment retry count
            await this.incrementRetryCount(op.id)
            failCount++
            console.log(`❌ Failed to sync: ${op.type} - ${response.status}`)
            
            // If too many retries, mark as failed
            if (op.retries >= 3) {
              console.log(`⚠️ Operation ${op.id} failed after 3 retries`)
              await this.markOperationFailed(op.id)
            }
          }
        } catch (error) {
          console.error(`Error syncing operation ${op.id}:`, error)
          await this.incrementRetryCount(op.id)
          failCount++
        }
      }

      console.log(`✅ Sync complete: ${successCount} success, ${failCount} failed`)
      
      // Clean up old synced operations
      await this.cleanupSyncedOperations()
      
    } catch (error) {
      console.error('Error processing sync queue:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  async getUnSyncedOperations(): Promise<QueuedOperation[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['operations'], 'readonly')
      const store = transaction.objectStore('operations')
      const index = store.index('synced')
      const request = index.getAll(false)

      request.onsuccess = () => {
        const operations = request.result || []
        // Sort by timestamp to maintain order
        operations.sort((a, b) => a.timestamp - b.timestamp)
        resolve(operations)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async markOperationSynced(id: string) {
    if (!this.db) await this.init()

    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(['operations'], 'readwrite')
      const store = transaction.objectStore('operations')
      const request = store.get(id)

      request.onsuccess = () => {
        const op = request.result
        if (op) {
          op.synced = true
          const updateRequest = store.put(op)
          updateRequest.onsuccess = () => resolve()
          updateRequest.onerror = () => reject(updateRequest.error)
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async markOperationFailed(id: string) {
    // Mark as synced so we don't keep retrying forever
    await this.markOperationSynced(id)
    console.log(`⛔ Operation ${id} marked as permanently failed`)
  }

  async incrementRetryCount(id: string) {
    if (!this.db) await this.init()

    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(['operations'], 'readwrite')
      const store = transaction.objectStore('operations')
      const request = store.get(id)

      request.onsuccess = () => {
        const op = request.result
        if (op) {
          op.retries = (op.retries || 0) + 1
          const updateRequest = store.put(op)
          updateRequest.onsuccess = () => resolve()
          updateRequest.onerror = () => reject(updateRequest.error)
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async updateMatchIdMapping(tempId: string, realId: string) {
    // Update any pending operations that reference the temp match ID
    if (!this.db) await this.init()

    const transaction = this.db!.transaction(['operations'], 'readwrite')
    const store = transaction.objectStore('operations')
    const index = store.index('matchId')
    const request = index.getAll(tempId)

    request.onsuccess = () => {
      const operations = request.result || []
      operations.forEach(op => {
        if (op.data?.match_id === tempId) {
          op.data.match_id = realId
          op.matchId = realId
          store.put(op)
        }
      })
    }
  }

  async cleanupSyncedOperations() {
    if (!this.db) await this.init()

    const transaction = this.db!.transaction(['operations'], 'readwrite')
    const store = transaction.objectStore('operations')
    const index = store.index('synced')
    const request = index.getAll(true)

    request.onsuccess = () => {
      const operations = request.result || []
      // Keep last 100 synced operations for debugging
      if (operations.length > 100) {
        const toDelete = operations.slice(0, operations.length - 100)
        toDelete.forEach(op => store.delete(op.id))
        console.log(`🧹 Cleaned up ${toDelete.length} old synced operations`)
      }
    }
  }

  async getQueueStatus() {
    if (!this.db) await this.init()

    const unsynced = await this.getUnSyncedOperations()
    
    return {
      pending: unsynced.length,
      online: navigator.onLine,
      syncInProgress: this.syncInProgress,
      operations: unsynced.map(op => ({
        type: op.type,
        timestamp: new Date(op.timestamp).toLocaleTimeString(),
        retries: op.retries
      }))
    }
  }

  // Convenience methods for common operations
  async queueMatchCreate(matchData: any) {
    return this.queueOperation({
      type: 'match_create',
      endpoint: '/api/matches/live',
      method: 'POST',
      data: matchData
    })
  }

  async queueMatchUpdate(matchId: string, updateData: any) {
    return this.queueOperation({
      type: 'match_update',
      endpoint: '/api/matches/live',
      method: 'PUT',
      data: { id: matchId, ...updateData },
      matchId
    })
  }

  async queueMatchEvent(matchId: string, eventData: any) {
    return this.queueOperation({
      type: 'match_event',
      endpoint: '/api/matches/live/event',
      method: 'POST',
      data: { match_id: matchId, ...eventData },
      matchId
    })
  }

  // Manual sync trigger
  async forceSyncNow() {
    console.log('🔄 Manual sync triggered')
    this.syncInProgress = false // Reset flag
    return this.processSyncQueue()
  }

  // Get all operations for a specific match
  async getMatchOperations(matchId: string): Promise<QueuedOperation[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['operations'], 'readonly')
      const store = transaction.objectStore('operations')
      const index = store.index('matchId')
      const request = index.getAll(matchId)

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  // Cleanup method
  destroy() {
    if (this.onlineCheckInterval) {
      clearInterval(this.onlineCheckInterval)
    }
    if (this.db) {
      this.db.close()
    }
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueue()

// Initialize on import
if (typeof window !== 'undefined') {
  offlineQueue.init().catch(console.error)
}