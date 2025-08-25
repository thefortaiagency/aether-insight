// Offline storage service for matches and recordings
// Uses IndexedDB for large video files and localStorage for match data

interface OfflineMatch {
  id: string
  data: any
  timestamp: number
  synced: boolean
}

interface OfflineVideo {
  id: string
  matchId: string
  blob: Blob
  chunks?: string[] // IDs of video chunks
  timestamp: number
  synced: boolean
}

class OfflineStorage {
  private dbName = 'AetherInsightOffline'
  private dbVersion = 1
  private db: IDBDatabase | null = null

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('matches')) {
          const matchStore = db.createObjectStore('matches', { keyPath: 'id' })
          matchStore.createIndex('synced', 'synced', { unique: false })
          matchStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        if (!db.objectStoreNames.contains('videos')) {
          const videoStore = db.createObjectStore('videos', { keyPath: 'id' })
          videoStore.createIndex('matchId', 'matchId', { unique: false })
          videoStore.createIndex('synced', 'synced', { unique: false })
        }

        if (!db.objectStoreNames.contains('videoChunks')) {
          const chunkStore = db.createObjectStore('videoChunks', { keyPath: 'id' })
          chunkStore.createIndex('videoId', 'videoId', { unique: false })
        }
      }
    })
  }

  // Match storage methods
  async saveMatch(matchData: any): Promise<string> {
    if (!this.db) await this.init()

    const match: OfflineMatch = {
      id: matchData.id || `offline-${Date.now()}`,
      data: matchData,
      timestamp: Date.now(),
      synced: false
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['matches'], 'readwrite')
      const store = transaction.objectStore('matches')
      const request = store.put(match)

      request.onsuccess = () => resolve(match.id)
      request.onerror = () => reject(request.error)
    })
  }

  async getMatch(id: string): Promise<OfflineMatch | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['matches'], 'readonly')
      const store = transaction.objectStore('matches')
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllUnsyncedMatches(): Promise<OfflineMatch[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['matches'], 'readonly')
      const store = transaction.objectStore('matches')
      const index = store.index('synced')
      // Use IDBKeyRange to query for false values
      const request = index.getAll(IDBKeyRange.only(false))

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async markMatchSynced(id: string): Promise<void> {
    if (!this.db) await this.init()

    const match = await this.getMatch(id)
    if (match) {
      match.synced = true
      
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(['matches'], 'readwrite')
        const store = transaction.objectStore('matches')
        const request = store.put(match)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    }
  }

  // Video storage methods
  async saveVideo(matchId: string, blob: Blob): Promise<string> {
    if (!this.db) await this.init()

    const video: OfflineVideo = {
      id: `video-${Date.now()}`,
      matchId,
      blob,
      timestamp: Date.now(),
      synced: false
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['videos'], 'readwrite')
      const store = transaction.objectStore('videos')
      const request = store.put(video)

      request.onsuccess = () => resolve(video.id)
      request.onerror = () => reject(request.error)
    })
  }

  async saveVideoChunk(videoId: string, chunkBlob: Blob, chunkNumber: number): Promise<string> {
    if (!this.db) await this.init()

    const chunkId = `${videoId}-chunk-${chunkNumber}`
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['videoChunks'], 'readwrite')
      const store = transaction.objectStore('videoChunks')
      const request = store.put({
        id: chunkId,
        videoId,
        chunkNumber,
        blob: chunkBlob,
        timestamp: Date.now()
      })

      request.onsuccess = () => resolve(chunkId)
      request.onerror = () => reject(request.error)
    })
  }

  async getVideo(id: string): Promise<OfflineVideo | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['videos'], 'readonly')
      const store = transaction.objectStore('videos')
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async getVideosByMatch(matchId: string): Promise<OfflineVideo[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['videos'], 'readonly')
      const store = transaction.objectStore('videos')
      const index = store.index('matchId')
      const request = index.getAll(matchId)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllUnsyncedVideos(): Promise<OfflineVideo[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['videos'], 'readonly')
      const store = transaction.objectStore('videos')
      const index = store.index('synced')
      // Use IDBKeyRange to query for false values
      const request = index.getAll(IDBKeyRange.only(false))

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async markVideoSynced(id: string): Promise<void> {
    if (!this.db) await this.init()

    const video = await this.getVideo(id)
    if (video) {
      video.synced = true
      
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(['videos'], 'readwrite')
        const store = transaction.objectStore('videos')
        const request = store.put(video)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    }
  }

  // Sync utilities
  async syncAll(onProgress?: (message: string) => void): Promise<{
    matchesSynced: number
    videosSynced: number
    errors: string[]
  }> {
    const results = {
      matchesSynced: 0,
      videosSynced: 0,
      errors: [] as string[]
    }

    // Check if online
    if (!navigator.onLine) {
      results.errors.push('No internet connection')
      return results
    }

    // Sync matches
    const unsyncedMatches = await this.getAllUnsyncedMatches()
    for (const match of unsyncedMatches) {
      try {
        onProgress?.(`Syncing match ${match.id}...`)
        
        const response = await fetch('/api/matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(match.data)
        })

        if (response.ok) {
          await this.markMatchSynced(match.id)
          results.matchesSynced++
        } else {
          results.errors.push(`Failed to sync match ${match.id}`)
        }
      } catch (error) {
        results.errors.push(`Error syncing match ${match.id}: ${error}`)
      }
    }

    // Sync videos
    const unsyncedVideos = await this.getAllUnsyncedVideos()
    for (const video of unsyncedVideos) {
      try {
        onProgress?.(`Uploading video for match ${video.matchId}...`)
        
        const formData = new FormData()
        formData.append('file', video.blob, `match-${video.matchId}.webm`)
        formData.append('meta', JSON.stringify({
          matchId: video.matchId,
          offlineRecorded: true,
          timestamp: video.timestamp
        }))

        const response = await fetch('/api/videos/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          await this.markVideoSynced(video.id)
          results.videosSynced++
        } else {
          results.errors.push(`Failed to upload video ${video.id}`)
        }
      } catch (error) {
        results.errors.push(`Error uploading video ${video.id}: ${error}`)
      }
    }

    return results
  }

  // Storage info
  async getStorageInfo(): Promise<{
    matchCount: number
    videoCount: number
    totalSize: number
  }> {
    if (!this.db) await this.init()

    const matches = await this.getAllUnsyncedMatches()
    const videos = await this.getAllUnsyncedVideos()
    
    let totalSize = 0
    for (const video of videos) {
      totalSize += video.blob.size
    }

    return {
      matchCount: matches.length,
      videoCount: videos.length,
      totalSize
    }
  }

  // Clear synced data
  async clearSyncedData(): Promise<void> {
    if (!this.db) await this.init()

    const transaction = this.db!.transaction(['matches', 'videos'], 'readwrite')
    
    // Clear synced matches
    const matchStore = transaction.objectStore('matches')
    const matchIndex = matchStore.index('synced')
    const syncedMatches = await new Promise<OfflineMatch[]>((resolve) => {
      const request = matchIndex.getAll(IDBKeyRange.only(true))
      request.onsuccess = () => resolve(request.result)
    })
    
    for (const match of syncedMatches) {
      matchStore.delete(match.id)
    }

    // Clear synced videos
    const videoStore = transaction.objectStore('videos')
    const videoIndex = videoStore.index('synced')
    const syncedVideos = await new Promise<OfflineVideo[]>((resolve) => {
      const request = videoIndex.getAll(IDBKeyRange.only(true))
      request.onsuccess = () => resolve(request.result)
    })
    
    for (const video of syncedVideos) {
      videoStore.delete(video.id)
    }
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorage()

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    console.log('Back online - starting auto-sync...')
    const results = await offlineStorage.syncAll()
    console.log('Auto-sync complete:', results)
  })
}