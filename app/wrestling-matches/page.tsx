'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CloudflareVideoPlayer from '@/components/cloudflare-video-player'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Video, Play, Calendar, Trophy, Users, Clock, Filter, Search,
  Download, Share2, Trash2, Edit, Star, TrendingUp, Award,
  FileVideo, ChevronRight, Eye, Timer, Scale, MapPin, 
  Target, Shield, Zap, AlertTriangle, ArrowDown, RotateCcw,
  Droplets, Heart, Flag, ArrowLeft, Home
} from 'lucide-react'
import PageBackground from "@/components/background/page-background"
import { toast } from 'sonner'
import Link from 'next/link'

interface ScoringEvent {
  id: string
  timestamp: number
  period: number | string
  time: string
  wrestler: 'home' | 'away'
  type: 'takedown' | 'takedown3' | 'escape' | 'reversal' | 'nearfall2' | 'nearfall3' | 'nearfall4' | 'nearfall5' | 
        'penalty' | 'caution' | 'stalling' | 'blood' | 'injury' | 'pin' | 'techfall' | 'forfeit' | 'dq'
  points: number
  videoTime: number // Time in seconds from start of video
  description: string
}

interface MatchWithEvents {
  id: string
  date: string
  event: string
  eventType: 'dual' | 'tournament' | 'practice'
  weight: number
  mat: string
  homeWrestler: {
    name: string
    team: string
    score: number
    grade?: number
  }
  awayWrestler: {
    name: string
    team: string
    score: number
    grade?: number
  }
  winner?: 'home' | 'away'
  winType?: 'pin' | 'techfall' | 'major' | 'decision' | 'forfeit' | 'dq'
  duration: string
  totalTime: number
  ridingTime?: { home: number; away: number }
  videoUrl?: string
  cloudflareVideoId?: string
  videoBlob?: Blob
  localVideoUrl?: string
  events: ScoringEvent[]
  starred?: boolean
  referee?: string
}

export default function EnhancedWrestlingMatchesPage() {
  const [matches, setMatches] = useState<MatchWithEvents[]>([])
  const [selectedMatch, setSelectedMatch] = useState<MatchWithEvents | null>(null)
  const [filterWeight, setFilterWeight] = useState<string>('all')
  const [filterEvent, setFilterEvent] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null)

  // Load matches from localStorage on component mount
  useEffect(() => {
    loadMatchesFromStorage()
  }, [])

  const loadMatchesFromStorage = async () => {
    try {
      // Get all localStorage keys that start with 'match-'
      const matchKeys = Object.keys(localStorage).filter(key => key.startsWith('match-'))
      
      const loadedMatches: MatchWithEvents[] = []
      
      matchKeys.forEach(key => {
        try {
          const matchData = JSON.parse(localStorage.getItem(key) || '{}')
          
          // Convert stored videoBlob back to Blob if needed
          if (matchData.videoBlob) {
            // Note: Blob data doesn't persist well in localStorage
            // In production, you'd upload to Cloudflare immediately
            matchData.localVideoUrl = matchData.videoBlob
          }
          
          loadedMatches.push(matchData)
        } catch (e) {
          console.error('Error parsing match:', key, e)
        }
      })
      
      // Also fetch videos from Cloudflare
      try {
        const response = await fetch('/api/stream/list-videos')
        if (response.ok) {
          const data = await response.json()
          console.log('Cloudflare videos found:', data.videos?.length || 0)
          
          // Add Cloudflare videos as matches if they're not already in localStorage
          if (data.videos && data.videos.length > 0) {
            data.videos.forEach((video: any, index: number) => {
              // Check if we already have this video in localStorage
              const existingMatch = loadedMatches.find(m => m.cloudflareVideoId === video.cloudflareVideoId)
              
              if (!existingMatch) {
                // Create a match entry from Cloudflare video
                const cloudflareMatch: MatchWithEvents = {
                  id: `cloudflare-${video.cloudflareVideoId}`,
                  date: video.created ? new Date(video.created).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                  event: video.meta?.event || `Match ${index + 1}`,
                  eventType: 'practice',
                  weight: parseInt(video.meta?.weight) || 157,
                  mat: video.meta?.mat || 'Mat 1',
                  homeWrestler: {
                    name: video.meta?.homeWrestler || 'Home Wrestler',
                    team: video.meta?.homeTeam || 'Home Team',
                    score: parseInt(video.meta?.homeScore) || 0
                  },
                  awayWrestler: {
                    name: video.meta?.awayWrestler || 'Away Wrestler',
                    team: video.meta?.awayTeam || 'Away Team',
                    score: parseInt(video.meta?.awayScore) || 0
                  },
                  duration: video.duration ? formatDuration(video.duration) : '0:00',
                  totalTime: video.duration || 0,
                  cloudflareVideoId: video.cloudflareVideoId,
                  cloudflarePlaybackUrl: video.cloudflarePlaybackUrl,
                  events: [],
                  starred: false
                }
                loadedMatches.push(cloudflareMatch)
              }
            })
          }
        }
      } catch (error) {
        console.error('Error fetching Cloudflare videos:', error)
      }
      
      // Sort by date, newest first
      loadedMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      setMatches(loadedMatches)
      
      if (loadedMatches.length === 0) {
        // Add comprehensive demo data matching MatBoss stats
        const demoMatches: MatchWithEvents[] = [
          {
            id: 'demo-1',
            date: '2025-08-24',
            event: 'State Championships - Finals',
            eventType: 'tournament',
            weight: 160,
            mat: 'Mat 1',
            homeWrestler: { name: 'Jackson Martinez', team: 'Fort Wayne North', score: 11, grade: 12 },
            awayWrestler: { name: 'Tyler Anderson', team: 'Carmel', score: 4, grade: 11 },
            winner: 'home',
            winType: 'major',
            duration: '6:00',
            totalTime: 360,
            ridingTime: { home: 87, away: 23 },
            events: [
              { id: 'e1', timestamp: Date.now(), period: 1, time: '1:42', wrestler: 'home', type: 'takedown', points: 2, videoTime: 18, description: 'High crotch to double leg' },
              { id: 'e2', timestamp: Date.now(), period: 1, time: '1:15', wrestler: 'away', type: 'escape', points: 1, videoTime: 45, description: 'Stand up' },
              { id: 'e3', timestamp: Date.now(), period: 1, time: '0:48', wrestler: 'home', type: 'takedown', points: 2, videoTime: 72, description: 'Ankle pick' },
              { id: 'e4', timestamp: Date.now(), period: 2, time: '1:45', wrestler: 'home', type: 'escape', points: 1, videoTime: 135, description: 'Granby roll' },
              { id: 'e5', timestamp: Date.now(), period: 2, time: '1:20', wrestler: 'home', type: 'takedown', points: 2, videoTime: 160, description: 'Blast double' },
              { id: 'e6', timestamp: Date.now(), period: 2, time: '0:55', wrestler: 'home', type: 'nearfall3', points: 3, videoTime: 185, description: 'Cradle - 3 count' },
              { id: 'e7', timestamp: Date.now(), period: 3, time: '1:30', wrestler: 'away', type: 'escape', points: 1, videoTime: 270, description: 'Switch' },
              { id: 'e8', timestamp: Date.now(), period: 3, time: '0:45', wrestler: 'away', type: 'takedown', points: 2, videoTime: 315, description: 'Low single' },
              { id: 'e9', timestamp: Date.now(), period: 3, time: '0:20', wrestler: 'home', type: 'reversal', points: 2, videoTime: 340, description: 'Peterson roll' },
              { id: 'e10', timestamp: Date.now(), period: 3, time: '0:01', wrestler: 'home', type: 'penalty', points: 1, videoTime: 359, description: 'Riding time point' }
            ],
            starred: true,
            referee: 'Mike Thompson'
          },
          {
            id: 'demo-2',
            date: '2025-08-24',
            event: 'State Championships - Semifinals',
            eventType: 'tournament',
            weight: 160,
            mat: 'Mat 2',
            homeWrestler: { name: 'Jackson Martinez', team: 'Fort Wayne North', score: 15, grade: 12 },
            awayWrestler: { name: 'Ryan Cooper', team: 'Penn', score: 0, grade: 10 },
            winner: 'home',
            winType: 'tech_fall',
            duration: '4:32',
            totalTime: 272,
            ridingTime: { home: 125, away: 0 },
            events: [
              { id: 'e1', timestamp: Date.now(), period: 1, time: '1:55', wrestler: 'home', type: 'takedown3', points: 3, videoTime: 5, description: '4-point throw (feet to back)' },
              { id: 'e2', timestamp: Date.now(), period: 1, time: '1:30', wrestler: 'home', type: 'nearfall3', points: 3, videoTime: 30, description: 'Tilt series - 3 count' },
              { id: 'e3', timestamp: Date.now(), period: 1, time: '0:45', wrestler: 'home', type: 'nearfall2', points: 2, videoTime: 75, description: 'Tilt continuation - 2 count' },
              { id: 'e4', timestamp: Date.now(), period: 2, time: '1:50', wrestler: 'home', type: 'escape', points: 1, videoTime: 130, description: 'Stand up' },
              { id: 'e5', timestamp: Date.now(), period: 2, time: '1:35', wrestler: 'home', type: 'takedown', points: 2, videoTime: 145, description: 'Sweep single' },
              { id: 'e6', timestamp: Date.now(), period: 2, time: '1:10', wrestler: 'home', type: 'nearfall2', points: 2, videoTime: 170, description: 'Half nelson - 2 count' },
              { id: 'e7', timestamp: Date.now(), period: 3, time: '1:28', wrestler: 'home', type: 'takedown', points: 2, videoTime: 212, description: 'Duck under' }
            ],
            starred: false,
            referee: 'John Wilson'
          },
          {
            id: 'demo-3',
            date: '2025-08-23',
            event: 'Dual Meet vs Cathedral',
            eventType: 'dual',
            weight: 152,
            mat: 'Main',
            homeWrestler: { name: 'Marcus Thompson', team: 'Fort Wayne North', score: 3, grade: 11 },
            awayWrestler: { name: 'Josh Williams', team: 'Cathedral', score: 1, grade: 11 },
            winner: 'home',
            winType: 'decision',
            duration: '6:00',
            totalTime: 360,
            ridingTime: { home: 62, away: 48 },
            events: [
              { id: 'e1', timestamp: Date.now(), period: 1, time: '0:30', wrestler: 'home', type: 'takedown', points: 2, videoTime: 90, description: 'Snap down to go-behind' },
              { id: 'e2', timestamp: Date.now(), period: 2, time: '1:30', wrestler: 'away', type: 'escape', points: 1, videoTime: 150, description: 'Stand up' },
              { id: 'e3', timestamp: Date.now(), period: 3, time: '0:01', wrestler: 'home', type: 'penalty', points: 1, videoTime: 359, description: 'Riding time point' }
            ],
            starred: false,
            referee: 'Dave Miller'
          },
          {
            id: 'demo-4',
            date: '2025-08-23',
            event: 'Dual Meet vs Cathedral',
            eventType: 'dual',
            weight: 145,
            mat: 'Main',
            homeWrestler: { name: 'Alex Rodriguez', team: 'Fort Wayne North', score: 0, grade: 10 },
            awayWrestler: { name: 'Sam Davis', team: 'Cathedral', score: 0, grade: 12 },
            winner: 'away',
            winType: 'pin',
            duration: '3:45',
            totalTime: 225,
            ridingTime: { home: 0, away: 142 },
            events: [
              { id: 'e1', timestamp: Date.now(), period: 1, time: '1:30', wrestler: 'away', type: 'takedown', points: 2, videoTime: 30, description: 'Fireman\'s carry' },
              { id: 'e2', timestamp: Date.now(), period: 2, time: '0:15', wrestler: 'away', type: 'pin', points: 6, videoTime: 225, description: 'Cradle pin at 3:45' }
            ],
            starred: false,
            referee: 'Dave Miller'
          },
          {
            id: 'demo-5',
            date: '2025-08-22',
            event: 'Practice Match',
            eventType: 'practice',
            weight: 170,
            mat: 'Practice Mat 1',
            homeWrestler: { name: 'David Lee', team: 'Fort Wayne North', score: 8, grade: 12 },
            awayWrestler: { name: 'Chris Brown', team: 'Fort Wayne North', score: 6, grade: 11 },
            winner: 'home',
            winType: 'decision',
            duration: '6:00',
            totalTime: 360,
            ridingTime: { home: 45, away: 38 },
            events: [
              { id: 'e1', timestamp: Date.now(), period: 1, time: '1:45', wrestler: 'home', type: 'takedown', points: 2, videoTime: 15, description: 'Single leg' },
              { id: 'e2', timestamp: Date.now(), period: 1, time: '0:50', wrestler: 'away', type: 'escape', points: 1, videoTime: 70, description: 'Stand up' },
              { id: 'e3', timestamp: Date.now(), period: 1, time: '0:20', wrestler: 'away', type: 'takedown', points: 2, videoTime: 100, description: 'Re-shot' },
              { id: 'e4', timestamp: Date.now(), period: 2, time: '1:40', wrestler: 'home', type: 'escape', points: 1, videoTime: 140, description: 'Sit out' },
              { id: 'e5', timestamp: Date.now(), period: 2, time: '1:10', wrestler: 'home', type: 'takedown', points: 2, videoTime: 170, description: 'High crotch' },
              { id: 'e6', timestamp: Date.now(), period: 2, time: '0:30', wrestler: 'away', type: 'reversal', points: 2, videoTime: 210, description: 'Switch' },
              { id: 'e7', timestamp: Date.now(), period: 3, time: '1:50', wrestler: 'away', type: 'escape', points: 1, videoTime: 250, description: 'Stand up' },
              { id: 'e8', timestamp: Date.now(), period: 3, time: '1:20', wrestler: 'home', type: 'takedown', points: 2, videoTime: 280, description: 'Double leg' },
              { id: 'e9', timestamp: Date.now(), period: 3, time: '0:01', wrestler: 'home', type: 'penalty', points: 1, videoTime: 359, description: 'Riding time point' }
            ],
            starred: false
          }
        ]
        setMatches(demoMatches)
      }
    } catch (error) {
      console.error('Error loading matches:', error)
      toast.error('Failed to load saved matches')
    }
  }

  // Save match to localStorage
  const saveMatch = (match: MatchWithEvents) => {
    try {
      localStorage.setItem(`match-${match.id}`, JSON.stringify(match))
      toast.success('Match saved')
    } catch (error) {
      console.error('Error saving match:', error)
      toast.error('Failed to save match')
    }
  }

  // Filter matches based on criteria
  const filteredMatches = matches.filter(match => {
    if (filterWeight !== 'all' && match.weight.toString() !== filterWeight) return false
    if (filterEvent !== 'all' && match.eventType !== filterEvent) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return match.homeWrestler.name.toLowerCase().includes(query) ||
             match.awayWrestler.name.toLowerCase().includes(query) ||
             match.event.toLowerCase().includes(query)
    }
    if (activeTab === 'starred' && !match.starred) return false
    if (activeTab === 'tournament' && match.eventType !== 'tournament') return false
    if (activeTab === 'dual' && match.eventType !== 'dual') return false
    if (activeTab === 'practice' && match.eventType !== 'practice') return false
    return true
  })

  const getWinTypeColor = (winType?: string) => {
    switch (winType) {
      case 'pin': return 'bg-gold-500 text-black'
      case 'techfall': return 'bg-orange-500'
      case 'major': return 'bg-blue-500'
      case 'decision': return 'bg-green-500'
      case 'forfeit': return 'bg-gray-500'
      case 'dq': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'takedown':
      case 'takedown3':
        return <Target className="h-4 w-4" />
      case 'escape':
        return <ArrowDown className="h-4 w-4 rotate-180" />
      case 'reversal':
        return <RotateCcw className="h-4 w-4" />
      case 'nearfall2':
      case 'nearfall3':
      case 'nearfall4':
      case 'nearfall5':
        return <Shield className="h-4 w-4" />
      case 'penalty':
      case 'caution':
      case 'stalling':
        return <AlertTriangle className="h-4 w-4" />
      case 'pin':
        return <Trophy className="h-4 w-4" />
      case 'blood':
        return <Droplets className="h-4 w-4" />
      case 'injury':
        return <Heart className="h-4 w-4" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  const getEventColor = (type: string, wrestler: string) => {
    const isHome = wrestler === 'home'
    const baseColor = isHome ? 'text-red-400' : 'text-green-400'
    
    if (type === 'pin') return 'text-gold-400'
    if (type.includes('penalty') || type === 'caution' || type === 'stalling') return 'text-yellow-400'
    if (type === 'injury' || type === 'blood') return 'text-orange-400'
    
    return baseColor
  }

  const toggleStar = (matchId: string) => {
    setMatches(prev => prev.map(match => {
      if (match.id === matchId) {
        const updated = { ...match, starred: !match.starred }
        saveMatch(updated)
        return updated
      }
      return match
    }))
    toast.success('Match updated')
  }

  const deleteMatch = (matchId: string) => {
    if (confirm('Are you sure you want to delete this match? This cannot be undone.')) {
      // Remove from localStorage
      localStorage.removeItem(`match-${matchId}`)
      
      // Remove from state
      setMatches(prev => prev.filter(match => match.id !== matchId))
      setSelectedMatch(null)
      
      // Clean up video URL if needed
      if (currentVideoUrl) {
        URL.revokeObjectURL(currentVideoUrl)
        setCurrentVideoUrl(null)
      }
      
      toast.success('Match deleted')
    }
  }

  const jumpToTimestamp = (videoTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = videoTime
      videoRef.current.play()
      toast.info(`Jumping to ${formatVideoTime(videoTime)}`)
    }
  }

  const formatVideoTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatRidingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle match selection and video URL creation
  const selectMatch = (match: MatchWithEvents) => {
    setSelectedMatch(match)
    
    // Clean up previous video URL
    if (currentVideoUrl) {
      URL.revokeObjectURL(currentVideoUrl)
    }
    
    // Create video URL if local blob exists
    if (match.videoBlob) {
      const url = URL.createObjectURL(match.videoBlob)
      setCurrentVideoUrl(url)
    } else if (match.localVideoUrl) {
      setCurrentVideoUrl(match.localVideoUrl)
    } else {
      setCurrentVideoUrl(null)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentVideoUrl) {
        URL.revokeObjectURL(currentVideoUrl)
      }
    }
  }, [currentVideoUrl])

  return (
    <>
      <PageBackground />
      <div className="p-4 md:p-6 relative">
        {/* Back Navigation */}
        <div className="mb-4 flex gap-2">
          <Link href="/dashboard">
            <Button variant="outline" className="border-gray-600 text-gray-400 hover:bg-gray-900/50">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Logo/Icon at top center to push content down */}
        <div className="flex justify-center mb-6 md:mb-8 pt-4 md:pt-8">
          <div className="relative">
            <Trophy className="h-12 w-12 md:h-16 md:w-16 text-[#D4AF38]" />
            <div className="absolute inset-0 blur-xl bg-[#D4AF38]/20 rounded-full"></div>
          </div>
        </div>

        {/* Header with proper z-index */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#D4AF38] mb-2">Wrestling Matches</h1>
            <p className="text-sm md:text-base text-gray-400">View and analyze all recorded matches ({matches.length} total)</p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3 relative z-20">
            <Link href="/wrestling-video">
              <Button className="bg-[#D4AF38] hover:bg-[#D4AF38]/90 text-black relative z-20 text-sm md:text-base">
                <Video className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Record New Match</span>
                <span className="sm:hidden">Record</span>
              </Button>
            </Link>
            <Link href="/wrestling-schedule">
              <Button variant="outline" className="border-[#D4AF38] text-[#D4AF38] relative z-20 text-sm md:text-base">
                <Calendar className="h-4 w-4 mr-1 md:mr-2" />
                Schedule
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search wrestlers, events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/50 border-gray-700 text-white"
                />
              </div>
              <Select value={filterWeight} onValueChange={setFilterWeight}>
                <SelectTrigger className="w-full md:w-[150px] bg-black/50 border-gray-700 text-white">
                  <SelectValue placeholder="Weight Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Weights</SelectItem>
                  {[106, 113, 120, 126, 132, 138, 145, 152, 160, 170, 182, 195, 220, 285].map(weight => (
                    <SelectItem key={weight} value={weight.toString()}>{weight} lbs</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterEvent} onValueChange={setFilterEvent}>
                <SelectTrigger className="w-full md:w-[150px] bg-black/50 border-gray-700 text-white">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="tournament">Tournament</SelectItem>
                  <SelectItem value="dual">Dual Meet</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - Stack on mobile, side-by-side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Match List - Full width on mobile, 1/3 on desktop */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
              <CardHeader className="py-3 md:py-4">
                <CardTitle className="text-lg md:text-xl text-[#D4AF38]">Matches ({filteredMatches.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] md:h-[700px]">
                  {filteredMatches.map(match => (
                    <div
                      key={match.id}
                      onClick={() => selectMatch(match)}
                      className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-900/50 transition-colors ${
                        selectedMatch?.id === match.id ? 'bg-[#D4AF38]/10' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                          {match.winType && (
                            <Badge className={`${getWinTypeColor(match.winType)} text-xs`}>
                              {match.winType.toUpperCase()}
                            </Badge>
                          )}
                          {match.starred && <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-500 fill-yellow-500" />}
                        </div>
                        <span className="text-xs text-gray-400">{match.date}</span>
                      </div>
                      
                      <div className="mb-2">
                        <div className="text-sm font-semibold text-white">
                          {match.weight} lbs - {match.event}
                        </div>
                        <div className="text-xs text-gray-400">
                          {match.mat} • {match.duration}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className={`text-sm flex justify-between ${match.winner === 'home' ? 'text-green-400' : 'text-gray-400'}`}>
                          <span>{match.homeWrestler.name}</span>
                          <span className="font-bold">{match.homeWrestler.score}</span>
                        </div>
                        <div className={`text-sm flex justify-between ${match.winner === 'away' ? 'text-green-400' : 'text-gray-400'}`}>
                          <span>{match.awayWrestler.name}</span>
                          <span className="font-bold">{match.awayWrestler.score}</span>
                        </div>
                      </div>

                      {match.events && match.events.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-[#D4AF38]">
                          <TrendingUp className="h-3 w-3" />
                          {match.events.length} scoring events
                        </div>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Video Player & Details - Full width on mobile, 2/3 on desktop */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6 order-1 lg:order-2">
            {selectedMatch ? (
              <>
                {/* Video Player */}
                <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      {selectedMatch.cloudflareVideoId ? (
                        <CloudflareVideoPlayer videoId={selectedMatch.cloudflareVideoId} />
                      ) : currentVideoUrl ? (
                        <video
                          ref={videoRef}
                          src={currentVideoUrl}
                          controls
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center">
                            <FileVideo className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                            <p>Video not available</p>
                            <p className="text-sm mt-2">WebM recording saved locally</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Match Details */}
                <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-[#D4AF38]">{selectedMatch.event}</CardTitle>
                        <CardDescription className="text-gray-400">
                          {selectedMatch.date} • {selectedMatch.mat} • {selectedMatch.weight} lbs
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleStar(selectedMatch.id)}
                          className="text-yellow-500"
                        >
                          <Star className={`h-5 w-5 ${selectedMatch.starred ? 'fill-current' : ''}`} />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="text-red-500"
                          onClick={() => deleteMatch(selectedMatch.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Wrestlers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                      <div className={`p-4 rounded-lg border ${
                        selectedMatch.winner === 'home' 
                          ? 'bg-green-900/20 border-green-600' 
                          : 'bg-gray-900/50 border-gray-700'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="text-lg font-semibold text-white">
                              {selectedMatch.homeWrestler.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {selectedMatch.homeWrestler.team}
                              {selectedMatch.homeWrestler.grade && ` • Grade ${selectedMatch.homeWrestler.grade}`}
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-white">
                            {selectedMatch.homeWrestler.score}
                          </div>
                        </div>
                        {selectedMatch.winner === 'home' && (
                          <Badge className="bg-green-600">WINNER</Badge>
                        )}
                        {selectedMatch.ridingTime && (
                          <div className="mt-2 text-sm text-gray-400">
                            Riding Time: {formatRidingTime(selectedMatch.ridingTime.home)}
                          </div>
                        )}
                      </div>

                      <div className={`p-4 rounded-lg border ${
                        selectedMatch.winner === 'away' 
                          ? 'bg-green-900/20 border-green-600' 
                          : 'bg-gray-900/50 border-gray-700'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="text-lg font-semibold text-white">
                              {selectedMatch.awayWrestler.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {selectedMatch.awayWrestler.team}
                              {selectedMatch.awayWrestler.grade && ` • Grade ${selectedMatch.awayWrestler.grade}`}
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-white">
                            {selectedMatch.awayWrestler.score}
                          </div>
                        </div>
                        {selectedMatch.winner === 'away' && (
                          <Badge className="bg-green-600">WINNER</Badge>
                        )}
                        {selectedMatch.ridingTime && (
                          <div className="mt-2 text-sm text-gray-400">
                            Riding Time: {formatRidingTime(selectedMatch.ridingTime.away)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Scoring Events Timeline */}
                    {selectedMatch.events && selectedMatch.events.length > 0 && (
                      <>
                        <Separator className="bg-gray-800" />
                        <div>
                          <h4 className="text-lg font-semibold text-[#D4AF38] mb-4">
                            Scoring Timeline (Click to jump to moment)
                          </h4>
                          <ScrollArea className="h-[300px]">
                            <div className="space-y-2">
                              {selectedMatch.events.map((event, index) => (
                                <div
                                  key={event.id}
                                  onClick={() => jumpToTimestamp(event.videoTime)}
                                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-900/50 hover:bg-gray-900/70 cursor-pointer transition-colors group"
                                >
                                  <div className={`${getEventColor(event.type, event.wrestler)}`}>
                                    {getEventIcon(event.type)}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        P{event.period} • {event.time}
                                      </Badge>
                                      <span className={`text-sm font-medium ${
                                        event.wrestler === 'home' ? 'text-red-400' : 'text-green-400'
                                      }`}>
                                        {event.wrestler === 'home' 
                                          ? selectedMatch.homeWrestler.name 
                                          : selectedMatch.awayWrestler.name}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">
                                      {event.description}
                                    </div>
                                  </div>
                                  
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-white">
                                      {event.points > 0 ? `+${event.points}` : event.points}
                                    </div>
                                    <div className="text-xs text-gray-500 group-hover:text-[#D4AF38]">
                                      @{formatVideoTime(event.videoTime)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </>
                    )}

                    {/* Match Stats */}
                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                      <div className="text-center p-2 md:p-3 bg-gray-900/50 rounded-lg">
                        <Trophy className="h-4 w-4 md:h-5 md:w-5 text-[#D4AF38] mx-auto mb-1" />
                        <div className="text-xs md:text-sm text-gray-400">Win Type</div>
                        <div className="text-white font-semibold text-xs md:text-base">
                          {selectedMatch.winType?.toUpperCase() || 'IN PROGRESS'}
                        </div>
                      </div>
                      <div className="text-center p-2 md:p-3 bg-gray-900/50 rounded-lg">
                        <Clock className="h-4 w-4 md:h-5 md:w-5 text-[#D4AF38] mx-auto mb-1" />
                        <div className="text-xs md:text-sm text-gray-400">Duration</div>
                        <div className="text-white font-semibold text-xs md:text-base">{selectedMatch.duration}</div>
                      </div>
                      <div className="text-center p-2 md:p-3 bg-gray-900/50 rounded-lg">
                        <Scale className="h-4 w-4 md:h-5 md:w-5 text-[#D4AF38] mx-auto mb-1" />
                        <div className="text-xs md:text-sm text-gray-400">Weight</div>
                        <div className="text-white font-semibold text-xs md:text-base">{selectedMatch.weight} lbs</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-black/80 backdrop-blur-sm border-[#D4AF38]/30">
                <CardContent className="flex flex-col items-center justify-center h-[600px] text-gray-500">
                  <Video className="h-16 w-16 mb-4" />
                  <p className="text-lg">Select a match to view</p>
                  <p className="text-sm mt-2">Choose from the list on the left</p>
                  {matches.length === 0 && (
                    <Link href="/wrestling-video">
                      <Button className="mt-4 bg-[#D4AF38] hover:bg-[#D4AF38]/90 text-black">
                        Record Your First Match
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}