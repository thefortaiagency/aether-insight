// Clear old video data from localStorage to prevent quota errors
export function clearOldVideoStorage() {
  if (typeof window === 'undefined') return
  
  try {
    // Get all localStorage keys
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('video-')) {
        keysToRemove.push(key)
      }
    }
    
    // Remove all video keys from localStorage
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      console.log(`Cleared old video from localStorage: ${key}`)
    })
    
    if (keysToRemove.length > 0) {
      console.log(`Cleared ${keysToRemove.length} old videos from localStorage`)
    }
    
    // Also clear any other large data that might be stored
    const storageInfo = {
      used: 0,
      items: 0
    }
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key)
        if (value) {
          storageInfo.used += key.length + value.length
          storageInfo.items++
          
          // If any single item is over 1MB, log it
          if (value.length > 1024 * 1024) {
            console.warn(`Large item in localStorage: ${key} (${(value.length / 1024 / 1024).toFixed(2)}MB)`)
          }
        }
      }
    }
    
    console.log(`localStorage usage: ${(storageInfo.used / 1024 / 1024).toFixed(2)}MB across ${storageInfo.items} items`)
    
  } catch (error) {
    console.error('Error clearing old storage:', error)
  }
}

// Run cleanup on page load
if (typeof window !== 'undefined') {
  clearOldVideoStorage()
}