'use client'

import { useState } from 'react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'
import LiveMatchViewer from '@/components/live-match-viewer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Radio, Trophy, Users, Activity } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LiveMatchesPage() {
  const router = useRouter()
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)

  const handleSelectMatch = (matchId: string) => {
    setSelectedMatchId(matchId)
    // Optionally navigate to the live scoring page with the match ID
    // router.push(`/matches/live-scoring?id=${matchId}&spectator=true`)
  }

  const handleStartNewMatch = () => {
    router.push('/matches/live-scoring')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      <WrestlingStatsBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF38] mb-2 flex items-center gap-3">
            <Radio className="w-8 h-8 text-red-500 animate-pulse" />
            Live Wrestling Matches
          </h1>
          <p className="text-gray-400">
            Watch and follow live matches in real-time
          </p>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-2">
            <Badge className="bg-green-900/50 text-green-400 border-green-600">
              Real-time Updates
            </Badge>
            <Badge className="bg-blue-900/50 text-blue-400 border-blue-600">
              Multi-Mat Support
            </Badge>
          </div>
          <Button
            onClick={handleStartNewMatch}
            className="bg-[#D4AF38] hover:bg-[#B8941C] text-black font-bold"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Start New Match
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Matches List */}
          <div className="lg:col-span-2">
            <LiveMatchViewer 
              matchId={selectedMatchId || undefined}
              onSelectMatch={handleSelectMatch}
            />
          </div>

          {/* Stats and Info Panel */}
          <div className="space-y-4">
            {/* Tournament Stats */}
            <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#D4AF38] flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Today's Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Matches</span>
                  <span className="text-white font-bold">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Pins/Falls</span>
                  <span className="text-white font-bold">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Tech Falls</span>
                  <span className="text-white font-bold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Major Decisions</span>
                  <span className="text-white font-bold">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Decisions</span>
                  <span className="text-white font-bold">8</span>
                </div>
              </CardContent>
            </Card>

            {/* Active Mats */}
            <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#D4AF38] flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Active Mats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map(mat => (
                    <div
                      key={mat}
                      className="bg-black/60 rounded-lg p-3 border border-[#D4AF38]/20 text-center"
                    >
                      <p className="text-[#D4AF38] font-bold">Mat {mat}</p>
                      <p className="text-white text-sm">Active</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#D4AF38]">
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => router.push('/matches')}
                  variant="outline"
                  className="w-full bg-black/60 border-[#D4AF38]/30 text-white hover:bg-[#D4AF38]/20"
                >
                  View All Matches
                </Button>
                <Button
                  onClick={() => router.push('/wrestlers')}
                  variant="outline"
                  className="w-full bg-black/60 border-[#D4AF38]/30 text-white hover:bg-[#D4AF38]/20"
                >
                  Wrestler Roster
                </Button>
                <Button
                  onClick={() => router.push('/team-stats')}
                  variant="outline"
                  className="w-full bg-black/60 border-[#D4AF38]/30 text-white hover:bg-[#D4AF38]/20"
                >
                  Team Statistics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-black/60 rounded-lg p-6 border border-[#D4AF38]/20">
          <h3 className="text-lg font-bold text-[#D4AF38] mb-3">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-white font-semibold mb-1">📡 Real-time Updates</p>
              <p className="text-gray-400">
                Matches update automatically as scores change. No need to refresh!
              </p>
            </div>
            <div>
              <p className="text-white font-semibold mb-1">👁️ Spectator Mode</p>
              <p className="text-gray-400">
                Click "Watch Live" to follow any match in progress with full details.
              </p>
            </div>
            <div>
              <p className="text-white font-semibold mb-1">🔔 Notifications</p>
              <p className="text-gray-400">
                Get alerts when new matches start or when exciting moments happen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}