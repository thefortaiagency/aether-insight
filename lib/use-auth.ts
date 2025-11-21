'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Coach {
  id: string
  email: string
  first_name: string
  last_name: string
}

interface Team {
  id: string
  name: string
}

interface Session {
  coach: Coach
  team: Team | null
  role: string
  loggedInAt: string
}

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('aether-session')

    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSession(parsed)
      } catch (e) {
        localStorage.removeItem('aether-session')
      }
    } else if (requireAuth) {
      router.push('/login')
    }

    setLoading(false)
  }, [requireAuth, router])

  const logout = () => {
    localStorage.removeItem('aether-session')
    setSession(null)
    router.push('/login')
  }

  return {
    session,
    coach: session?.coach,
    team: session?.team,
    teamId: session?.team?.id,
    isAuthenticated: !!session,
    loading,
    logout
  }
}
