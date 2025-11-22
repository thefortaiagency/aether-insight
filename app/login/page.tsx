'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LogIn, Mail, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Look up coach by email
      const { data: coach, error: coachError } = await supabase
        .from('coaches')
        .select('*, team_coaches(team_id, role, teams(id, name))')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (coachError || !coach) {
        setError('No coach account found with that email')
        setLoading(false)
        return
      }

      // Get the team info
      const teamCoach = coach.team_coaches?.[0]
      const team = teamCoach?.teams

      // Store in localStorage
      const session = {
        coach: {
          id: coach.id,
          email: coach.email,
          first_name: coach.first_name,
          last_name: coach.last_name
        },
        team: team ? {
          id: team.id,
          name: team.name
        } : null,
        role: teamCoach?.role || 'coach',
        loggedInAt: new Date().toISOString()
      }

      localStorage.setItem('aether-session', JSON.stringify(session))

      // Redirect to roster
      router.push('/roster')
    } catch (err) {
      console.error('Login error:', err)
      setError('Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative flex items-center justify-center">
      <WrestlingStatsBackground />

      <Card className="relative z-10 w-full max-w-md bg-black/80 border-gold/30 backdrop-blur-lg">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <Image
              src="/matopswhite.png"
              alt="Aether Insights"
              width={200}
              height={48}
              className="object-contain"
            />
          </div>
          <CardTitle className="text-2xl text-white">Coach Login</CardTitle>
          <p className="text-gray-400 text-sm mt-2">
            Enter your email to access your team
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="coach@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-black/50 border-gold/30 text-white placeholder:text-gray-500"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-gold hover:bg-gold/90 text-black font-bold"
            >
              {loading ? (
                'Checking...'
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gold/20">
            <p className="text-center text-gray-500 text-xs">
              Demo Mode - No password required
            </p>
            <p className="text-center text-gray-400 text-xs mt-2">
              Try: <span className="text-gold">aoberlin@fortwrestling.com</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
