'use client'

import { useState, useEffect, useCallback } from 'react'

interface ExtensionState {
  connected: boolean
  version?: string
  capabilities?: string[]
}

interface ExtensionMessage {
  type: string
  payload?: any
}

/**
 * Hook to detect and communicate with Mat Ops browser extension
 *
 * The extension will:
 * 1. Detect this page via the meta tag and matops-app data attribute
 * 2. Inject matOpsExtension object on window
 * 3. Dispatch 'matops-extension-ready' event
 * 4. Listen for 'matops-web-message' events from this page
 * 5. Dispatch 'matops-extension-message' events with data
 */
export function useExtension() {
  const [extension, setExtension] = useState<ExtensionState>({ connected: false })
  const [lastMessage, setLastMessage] = useState<any>(null)

  useEffect(() => {
    // Check if extension is already loaded
    const checkExtension = () => {
      const ext = (window as any).matOpsExtension
      if (ext) {
        setExtension({
          connected: true,
          version: ext.version || '1.0.0',
          capabilities: ext.capabilities || ['chat', 'roster', 'scraping'],
        })
        return true
      }
      return false
    }

    // Initial check
    if (!checkExtension()) {
      // Listen for extension ready event
      const handleExtensionReady = (event: CustomEvent) => {
        console.log('Mat Ops Extension connected!', event.detail)
        setExtension({
          connected: true,
          version: event.detail?.version || '1.0.0',
          capabilities: event.detail?.capabilities || [],
        })
      }

      window.addEventListener('matops-extension-ready', handleExtensionReady as EventListener)

      // Broadcast that web app is ready
      window.dispatchEvent(new CustomEvent('matops-web-ready', {
        detail: { page: window.location.pathname }
      }))

      return () => {
        window.removeEventListener('matops-extension-ready', handleExtensionReady as EventListener)
      }
    }
  }, [])

  // Listen for messages from extension
  useEffect(() => {
    const handleExtensionMessage = (event: CustomEvent) => {
      console.log('Message from extension:', event.detail)
      setLastMessage(event.detail)
    }

    window.addEventListener('matops-extension-message', handleExtensionMessage as EventListener)

    return () => {
      window.removeEventListener('matops-extension-message', handleExtensionMessage as EventListener)
    }
  }, [])

  // Send message to extension
  const sendToExtension = useCallback((type: string, payload?: any) => {
    const message: ExtensionMessage = { type, payload }
    window.dispatchEvent(new CustomEvent('matops-web-message', { detail: message }))
  }, [])

  // Request extension to perform an action
  const requestAction = useCallback((action: string, data?: any) => {
    if (!extension.connected) {
      console.warn('Extension not connected')
      return false
    }
    sendToExtension('action', { action, data })
    return true
  }, [extension.connected, sendToExtension])

  // Share data with extension
  const shareData = useCallback((dataType: string, data: any) => {
    sendToExtension('data', { dataType, data })
  }, [sendToExtension])

  return {
    extension,
    isConnected: extension.connected,
    version: extension.version,
    capabilities: extension.capabilities,
    lastMessage,
    sendToExtension,
    requestAction,
    shareData,
  }
}

/**
 * Extension action types that can be requested
 */
export const ExtensionActions = {
  SCRAPE_OPPONENT: 'scrape_opponent',
  IMPORT_DATA: 'import_data',
  OPEN_CHAT: 'open_chat',
  SYNC_ROSTER: 'sync_roster',
  GET_TAB_INFO: 'get_tab_info',
} as const

/**
 * Data types that can be shared with extension
 */
export const DataTypes = {
  ROSTER: 'roster',
  WRESTLER: 'wrestler',
  MATCH: 'match',
  TEAM: 'team',
} as const
