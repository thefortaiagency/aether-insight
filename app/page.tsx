import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Video, Users, Trophy, BarChart3, PlayCircle } from 'lucide-react'
import AnimatedStatsBackground from '@/components/animated-stats-background'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      <AnimatedStatsBackground />
      {/* Header */}
      <div className="glass-effect border-b border-gray-800 relative z-10">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-5xl font-bold text-[#D4AF38] mb-2">Aether Insight</h1>
          <p className="text-xl text-gray-400">Wrestling Analytics & Video Platform</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Wrestling Videos */}
          <Link href="/wrestling-videos">
            <Card className="glass-effect border-gray-800 hover:border-[#D4AF38] transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Wrestling Videos</CardTitle>
                  <Video className="h-8 w-8 text-[#D4AF38]" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">View and manage wrestling match recordings from Cloudflare Stream</p>
                <Button className="w-full mt-4 bg-[#D4AF38] hover:bg-[#D4AF38]/90 text-black">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Watch Videos
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Wrestling Matches */}
          <Link href="/wrestling-matches">
            <Card className="glass-effect border-gray-800 hover:border-[#D4AF38] transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Match Management</CardTitle>
                  <Trophy className="h-8 w-8 text-[#D4AF38]" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Track matches, scores, and detailed match analytics</p>
                <Button className="w-full mt-4 bg-[#D4AF38] hover:bg-[#D4AF38]/90 text-black">
                  View Matches
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Teams */}
          <Link href="/teams">
            <Card className="glass-effect border-gray-800 hover:border-[#D4AF38] transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Team Roster</CardTitle>
                  <Users className="h-8 w-8 text-[#D4AF38]" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Manage wrestlers, weights, and team composition</p>
                <Button className="w-full mt-4 bg-[#D4AF38] hover:bg-[#D4AF38]/90 text-black">
                  Manage Teams
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Team Stats */}
          <Link href="/team-stats">
            <Card className="glass-effect border-gray-800 hover:border-[#D4AF38] transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Team Statistics</CardTitle>
                  <BarChart3 className="h-8 w-8 text-[#D4AF38]" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Comprehensive analytics and performance metrics</p>
                <Button className="w-full mt-4 bg-[#D4AF38] hover:bg-[#D4AF38]/90 text-black">
                  View Stats
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Video Preview */}
        <div className="mt-12">
          <Card className="glass-effect border-gray-800">
            <CardHeader>
              <CardTitle className="text-[#D4AF38]">Platform Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-white font-semibold mb-2">🎥 Cloudflare Stream</h3>
                  <p className="text-gray-400 text-sm">High-quality video streaming with HLS and DASH support</p>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">📊 MatBoss Analytics</h3>
                  <p className="text-gray-400 text-sm">Professional wrestling statistics and match tracking</p>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">🏆 Team Management</h3>
                  <p className="text-gray-400 text-sm">Complete roster and performance management system</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
