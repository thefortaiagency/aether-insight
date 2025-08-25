'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, TrendingUp, Users, Target, Award, BarChart3, 
  Activity, Zap, Shield, Star, ChevronUp, ChevronDown,
  Calendar, Clock, Percent, Hash, Upload, FileText,
  Download, CheckCircle, AlertCircle
} from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface TeamStats {
  totalMatches: number
  wins: number
  losses: number
  pins: number
  techFalls: number
  majorDecisions: number
  teamPoints: number
  dualMeetRecord: { wins: number; losses: number }
  tournamentPlacements: { first: number; second: number; third: number }
  averageMatchTime: string
  fastestPin: string
  mostWins: { wrestler: string; count: number }
  mostPins: { wrestler: string; count: number }
  weightClassPerformance: Array<{
    weight: string
    wins: number
    losses: number
    winRate: number
  }>
  monthlyProgress: Array<{
    month: string
    wins: number
    losses: number
    teamPoints: number
  }>
  scoringBreakdown: Array<{
    type: string
    count: number
    percentage: number
  }>
}

export default function TeamStatsPage() {
  const [showImport, setShowImport] = useState(false)
  const [importSource, setImportSource] = useState<'matboss' | 'trackwrestling' | null>(null)
  const [importing, setImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<string>('')
  
  const [stats, setStats] = useState<TeamStats>({
    totalMatches: 342,
    wins: 287,
    losses: 55,
    pins: 89,
    techFalls: 34,
    majorDecisions: 45,
    teamPoints: 1847,
    dualMeetRecord: { wins: 18, losses: 3 },
    tournamentPlacements: { first: 5, second: 8, third: 12 },
    averageMatchTime: '4:23',
    fastestPin: '0:17',
    mostWins: { wrestler: 'Jackson Martinez', count: 38 },
    mostPins: { wrestler: 'Ryan Thompson', count: 22 },
    weightClassPerformance: [
      { weight: '106', wins: 18, losses: 4, winRate: 81.8 },
      { weight: '113', wins: 22, losses: 3, winRate: 88.0 },
      { weight: '120', wins: 19, losses: 6, winRate: 76.0 },
      { weight: '126', wins: 24, losses: 2, winRate: 92.3 },
      { weight: '132', wins: 21, losses: 5, winRate: 80.8 },
      { weight: '138', wins: 20, losses: 4, winRate: 83.3 },
      { weight: '145', wins: 23, losses: 3, winRate: 88.5 },
      { weight: '152', wins: 18, losses: 7, winRate: 72.0 },
      { weight: '160', wins: 25, losses: 1, winRate: 96.2 },
      { weight: '170', wins: 19, losses: 5, winRate: 79.2 },
      { weight: '182', wins: 22, losses: 4, winRate: 84.6 },
      { weight: '195', wins: 20, losses: 5, winRate: 80.0 },
      { weight: '220', wins: 18, losses: 3, winRate: 85.7 },
      { weight: '285', wins: 18, losses: 3, winRate: 85.7 }
    ],
    monthlyProgress: [
      { month: 'Nov', wins: 42, losses: 8, teamPoints: 287 },
      { month: 'Dec', wins: 58, losses: 11, teamPoints: 412 },
      { month: 'Jan', wins: 73, losses: 14, teamPoints: 523 },
      { month: 'Feb', wins: 67, losses: 12, teamPoints: 445 },
      { month: 'Mar', wins: 47, losses: 10, teamPoints: 180 }
    ],
    scoringBreakdown: [
      { type: 'Takedowns', count: 892, percentage: 45 },
      { type: 'Escapes', count: 356, percentage: 18 },
      { type: 'Reversals', count: 198, percentage: 10 },
      { type: 'Near Falls', count: 297, percentage: 15 },
      { type: 'Penalties', count: 158, percentage: 8 },
      { type: 'Riding Time', count: 79, percentage: 4 }
    ]
  })

  const winRate = ((stats.wins / stats.totalMatches) * 100).toFixed(1)
  const pinRate = ((stats.pins / stats.wins) * 100).toFixed(1)

  const COLORS = ['#D4AF38', '#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1']

  // Handle import from MatBoss or TrackWrestling
  const handleImport = async (source: 'matboss' | 'trackwrestling') => {
    setImporting(true)
    setImportSource(source)
    setImportStatus(`Importing from ${source === 'matboss' ? 'MatBoss' : 'TrackWrestling'}...`)
    
    try {
      // Simulate API call to import data
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In production, this would make an actual API call
      // const response = await fetch(`/api/import/${source}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ teamId, apiKey })
      // })
      
      setImportStatus(`Successfully imported data from ${source === 'matboss' ? 'MatBoss' : 'TrackWrestling'}!`)
      setShowImport(false)
      
      // Update stats with imported data
      // setStats(importedData)
      
    } catch (error) {
      setImportStatus(`Failed to import from ${source === 'matboss' ? 'MatBoss' : 'TrackWrestling'}`)
    } finally {
      setImporting(false)
      setTimeout(() => setImportStatus(''), 3000)
    }
  }

  // Handle file upload for MatBoss CSV/Excel
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    setImporting(true)
    setImportStatus('Processing file...')
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // In production, upload to server
      // const response = await fetch('/api/import/file', {
      //   method: 'POST',
      //   body: formData
      // })
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      setImportStatus('File imported successfully!')
      setShowImport(false)
      
    } catch (error) {
      setImportStatus('Failed to process file')
    } finally {
      setImporting(false)
      setTimeout(() => setImportStatus(''), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      <WrestlingStatsBackground />
      
      <div className="relative z-10 p-4 md:p-6">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gold mb-2">Team Statistics</h1>
            <p className="text-gray-400">Fort Wayne North Warriors - 2024-25 Season</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              onClick={() => setShowImport(!showImport)}
              className="bg-gold hover:bg-gold/90 text-black font-bold"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Stats
            </Button>
          </div>
        </div>

        {/* Import Section */}
        {showImport && (
          <Card className="bg-black/90 backdrop-blur-sm border-gold/30 mb-6">
            <CardHeader>
              <CardTitle className="text-gold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Import Team Statistics
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowImport(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* MatBoss Import */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">MatBoss</h3>
                      <p className="text-xs text-gray-400">Import from MatBoss system</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={() => handleImport('matboss')}
                      disabled={importing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {importing && importSource === 'matboss' ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Sync with MatBoss Cloud
                        </>
                      )}
                    </Button>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-700" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-black px-2 text-gray-400">or</span>
                      </div>
                    </div>
                    
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={importing}
                      />
                      <div className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg hover:border-gold/50 transition-colors text-center">
                        <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-400">Upload MatBoss Export</p>
                        <p className="text-xs text-gray-500 mt-1">CSV or Excel file</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* TrackWrestling Import */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">TrackWrestling</h3>
                      <p className="text-xs text-gray-400">Import from TrackWrestling</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={() => handleImport('trackwrestling')}
                      disabled={importing}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {importing && importSource === 'trackwrestling' ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Connect TrackWrestling
                        </>
                      )}
                    </Button>
                    
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <p className="text-xs text-gray-400 mb-2">Quick Import:</p>
                      <div className="space-y-2">
                        <button className="text-xs text-gold hover:text-gold/80 block">
                          → Import Season Results
                        </button>
                        <button className="text-xs text-gold hover:text-gold/80 block">
                          → Import Tournament Data
                        </button>
                        <button className="text-xs text-gold hover:text-gold/80 block">
                          → Import Wrestler Records
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Import Status */}
              {importStatus && (
                <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                  importStatus.includes('Success') || importStatus.includes('success') 
                    ? 'bg-green-900/30 border border-green-600/50 text-green-400'
                    : importStatus.includes('Failed') || importStatus.includes('failed')
                    ? 'bg-red-900/30 border border-red-600/50 text-red-400'
                    : 'bg-blue-900/30 border border-blue-600/50 text-blue-400'
                }`}>
                  {importStatus.includes('Success') || importStatus.includes('success') ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : importStatus.includes('Failed') || importStatus.includes('failed') ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  )}
                  <span className="text-sm">{importStatus}</span>
                </div>
              )}

              {/* Help Text */}
              <div className="mt-4 p-3 bg-gray-900/30 rounded-lg">
                <p className="text-xs text-gray-400">
                  <strong>Note:</strong> Import your team's statistics from MatBoss or TrackWrestling to automatically 
                  populate all charts and analytics. Supports season data, tournament results, and individual wrestler records.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Win Rate</p>
                  <p className="text-2xl font-bold text-gold">{winRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-gold/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Total Wins</p>
                  <p className="text-2xl font-bold text-green-400">{stats.wins}</p>
                </div>
                <Trophy className="w-8 h-8 text-green-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Pin Rate</p>
                  <p className="text-2xl font-bold text-orange-400">{pinRate}%</p>
                </div>
                <Zap className="w-8 h-8 text-orange-400/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Team Points</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.teamPoints}</p>
                </div>
                <Star className="w-8 h-8 text-purple-400/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dual Meet & Tournament Records */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardHeader>
              <CardTitle className="text-gold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Dual Meet Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  <span className="text-green-400">{stats.dualMeetRecord.wins}</span>
                  <span className="text-gray-500 mx-2">-</span>
                  <span className="text-red-400">{stats.dualMeetRecord.losses}</span>
                </div>
                <div className="flex justify-center gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Conference:</span>
                    <span className="text-white ml-1">8-1</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Non-Conf:</span>
                    <span className="text-white ml-1">10-2</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardHeader>
              <CardTitle className="text-gold flex items-center gap-2">
                <Award className="w-5 h-5" />
                Tournament Placements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-around">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center mb-2">
                    <span className="text-gold font-bold">1st</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{stats.tournamentPlacements.first}</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-400/20 rounded-full flex items-center justify-center mb-2">
                    <span className="text-gray-300 font-bold">2nd</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{stats.tournamentPlacements.second}</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center mb-2">
                    <span className="text-orange-400 font-bold">3rd</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{stats.tournamentPlacements.third}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weight Class Performance */}
        <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30 mb-6">
          <CardHeader>
            <CardTitle className="text-gold flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Weight Class Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.weightClassPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="weight" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #D4AF38' }}
                  labelStyle={{ color: '#D4AF38' }}
                />
                <Legend />
                <Bar dataKey="wins" fill="#10B981" name="Wins" />
                <Bar dataKey="losses" fill="#EF4444" name="Losses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Progress */}
        <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30 mb-6">
          <CardHeader>
            <CardTitle className="text-gold flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Season Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #D4AF38' }}
                  labelStyle={{ color: '#D4AF38' }}
                />
                <Legend />
                <Line type="monotone" dataKey="wins" stroke="#10B981" strokeWidth={2} name="Wins" />
                <Line type="monotone" dataKey="losses" stroke="#EF4444" strokeWidth={2} name="Losses" />
                <Line type="monotone" dataKey="teamPoints" stroke="#D4AF38" strokeWidth={2} name="Team Points" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Scoring Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardHeader>
              <CardTitle className="text-gold flex items-center gap-2">
                <Target className="w-5 h-5" />
                Scoring Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.scoringBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="percentage"
                    label={({ type, percentage }) => `${type}: ${percentage}%`}
                  >
                    {stats.scoringBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
            <CardHeader>
              <CardTitle className="text-gold flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-gold/10 rounded-lg border border-gold/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-400">Most Wins</p>
                      <p className="text-lg font-bold text-white">{stats.mostWins.wrestler}</p>
                    </div>
                    <Badge className="bg-gold/20 text-gold border-gold">
                      {stats.mostWins.count} Wins
                    </Badge>
                  </div>
                </div>
                
                <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-400">Most Pins</p>
                      <p className="text-lg font-bold text-white">{stats.mostPins.wrestler}</p>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500">
                      {stats.mostPins.count} Pins
                    </Badge>
                  </div>
                </div>

                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-400">Fastest Pin</p>
                      <p className="text-lg font-bold text-white">Alex Thompson</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500">
                      {stats.fastestPin}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Match Type Breakdown */}
        <Card className="bg-black/80 backdrop-blur-sm border border-[#D4AF38]/30">
          <CardHeader>
            <CardTitle className="text-gold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Victory Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-black/30 rounded-lg">
                <Zap className="w-8 h-8 text-gold mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.pins}</p>
                <p className="text-sm text-gray-400">Pins</p>
              </div>
              <div className="text-center p-4 bg-black/30 rounded-lg">
                <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.techFalls}</p>
                <p className="text-sm text-gray-400">Tech Falls</p>
              </div>
              <div className="text-center p-4 bg-black/30 rounded-lg">
                <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{stats.majorDecisions}</p>
                <p className="text-sm text-gray-400">Major Decisions</p>
              </div>
              <div className="text-center p-4 bg-black/30 rounded-lg">
                <Award className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">119</p>
                <p className="text-sm text-gray-400">Decisions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}