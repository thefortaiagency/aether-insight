'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Send, Bot, User, Sparkles, Zap, Brain, Trophy,
  Users, TrendingUp, Calendar, Dumbbell, Target, Loader2,
  Plug, PlugZap, Lightbulb, MessageSquare, CheckCircle, XCircle,
  AlertTriangle, Wrench, PlusCircle, Scale
} from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'
import { supabase } from '@/lib/supabase'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  pendingAction?: PendingAction
  actionResult?: ActionResult
}

interface PendingAction {
  name: string
  params: Record<string, any>
  description?: string
}

interface ActionResult {
  success: boolean
  message: string
  data?: any
}

interface QuickAction {
  icon: React.ReactNode
  label: string
  prompt: string
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: <Trophy className="w-4 h-4" />,
    label: 'Season Overview',
    prompt: 'Give me a summary of my team\'s season performance so far.',
  },
  {
    icon: <Users className="w-4 h-4" />,
    label: 'Roster Analysis',
    prompt: 'Analyze my roster and identify any weight classes where we might be weak.',
  },
  {
    icon: <TrendingUp className="w-4 h-4" />,
    label: 'Top Performers',
    prompt: 'Who are my top 3 performing wrestlers based on win percentage and pins?',
  },
  {
    icon: <Dumbbell className="w-4 h-4" />,
    label: 'Practice Ideas',
    prompt: 'Suggest a practice plan focusing on takedowns and escapes for tomorrow.',
  },
  {
    icon: <Target className="w-4 h-4" />,
    label: 'Weight Management',
    prompt: 'Which wrestlers need to watch their weight this week before the tournament?',
  },
  {
    icon: <Calendar className="w-4 h-4" />,
    label: 'Upcoming Prep',
    prompt: 'Help me prepare for our next match. What should we focus on?',
  },
]

const WRESTLING_KNOWLEDGE = `You are Mat Ops AI, an AGENTIC wrestling coaching assistant. You can both answer questions AND take actions.

EXPERTISE:
- Wrestling techniques (takedowns, escapes, reversals, pins)
- Practice planning and drill recommendations
- Match strategy and opponent analysis
- Weight management guidance
- Team building and motivation
- Wrestling rules and scoring (TD=3pts, Esc=1pt, Rev=2pts, NF2=2pts, NF3=3pts, NF4=4pts)

ACTIONS YOU CAN TAKE:
You have tools to modify the team's database. When the coach asks you to do something, USE THE APPROPRIATE TOOL:

**Roster Management:**
- add_wrestler: Add a new wrestler to the roster
- update_wrestler: Update wrestler info (weight class, grade, notes, etc.)
- move_weight_class: Move a wrestler to a different weight class
- deactivate_wrestler: Remove a wrestler from active roster

**Calendar & Events:**
- add_event: Schedule tournaments, duals, scrimmages
- update_event: Change event details
- cancel_event: Remove an event
- record_event_results: Log scores and placements

**Practice Management:**
- add_practice: Schedule a practice session
- update_practice: Change practice details
- cancel_practice: Cancel a practice
- record_practice_details: Log what was done in practice
- record_attendance: Track who showed up

**Weight Tracking:**
- record_weight: Log a wrestler's weight
- bulk_record_weights: Log multiple weights at once

**Match Results:**
- add_match_result: Record a match outcome

**Queries:**
- get_upcoming_events: See what's coming up
- get_upcoming_practices: See scheduled practices
- get_wrestler_stats: Get detailed stats for a wrestler
- get_weight_history: Check weight trends
- get_roster_by_weight: See who's at a weight class
- get_team_record: Get overall team record

FORMATTING RULES:
- Do NOT use ### or #### headers - use **bold** for emphasis instead
- Keep responses concise and scannable
- Use bullet points for lists
- Reference specific wrestler names and stats when available
- When you take an action, briefly confirm what you did

Always be encouraging but realistic. Use wrestling terminology appropriately.
When discussing stats, be specific about what the numbers mean for the wrestler's development.`

export default function MatOpsAIPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [extensionConnected, setExtensionConnected] = useState(false)
  const [teamData, setTeamData] = useState<any>(null)
  const [teamId, setTeamId] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Check for extension connection
  useEffect(() => {
    const checkExtension = () => {
      // The extension will set this on window when it detects Mat Ops
      if ((window as any).matOpsExtension) {
        setExtensionConnected(true)
      }
    }

    // Check immediately and also listen for extension ready event
    checkExtension()
    window.addEventListener('matops-extension-ready', checkExtension)

    // Broadcast that we're ready to connect
    window.dispatchEvent(new CustomEvent('matops-web-ready'))

    return () => {
      window.removeEventListener('matops-extension-ready', checkExtension)
    }
  }, [])

  // Load team data for context - DETAILED wrestler awareness (calculated from matches!)
  useEffect(() => {
    const loadTeamData = async () => {
      const session = localStorage.getItem('aether-session')
      if (!session) return

      const { team } = JSON.parse(session)
      if (!team?.id) return

      // Store team ID for agentic actions
      setTeamId(team.id)

      // Load wrestlers
      const { data: wrestlers } = await supabase
        .from('wrestlers')
        .select('*')
        .eq('team_id', team.id)
        .order('weight_class', { ascending: true })

      if (!wrestlers || wrestlers.length === 0) return

      // Load all matches for these wrestlers
      const wrestlerIds = wrestlers.map((w: any) => w.id)
      const { data: matchesData } = await supabase
        .from('matches')
        .select('wrestler_id, result, win_type, takedowns_for, escapes_for, reversals_for, nearfall_2_for, nearfall_3_for, nearfall_4_for')
        .in('wrestler_id', wrestlerIds)

      const matches = matchesData || []

      // Calculate stats for each wrestler from matches
      const wrestlersWithStats = wrestlers.map((w: any) => {
        const wMatches = matches.filter((m: any) => m.wrestler_id === w.id)
        const wins = wMatches.filter((m: any) => m.result === 'win').length
        const losses = wMatches.filter((m: any) => m.result === 'loss').length
        const pins = wMatches.filter((m: any) =>
          m.result === 'win' && (m.win_type === 'pin' || m.win_type === 'fall' || m.win_type === 'Pin' || m.win_type === 'Fall')
        ).length
        const techFalls = wMatches.filter((m: any) =>
          m.result === 'win' && (m.win_type === 'tech_fall' || m.win_type === 'Tech Fall' || m.win_type === 'TF')
        ).length
        const majors = wMatches.filter((m: any) =>
          m.result === 'win' && (m.win_type === 'major' || m.win_type === 'Major Decision' || m.win_type === 'MD')
        ).length
        const decisions = wMatches.filter((m: any) =>
          m.result === 'win' && (m.win_type === 'decision' || m.win_type === 'Decision' || !m.win_type)
        ).length
        const takedowns = wMatches.reduce((sum: number, m: any) => sum + (m.takedowns_for || 0), 0)
        const escapes = wMatches.reduce((sum: number, m: any) => sum + (m.escapes_for || 0), 0)
        const reversals = wMatches.reduce((sum: number, m: any) => sum + (m.reversals_for || 0), 0)
        const nearfalls = wMatches.reduce((sum: number, m: any) =>
          sum + (m.nearfall_2_for || 0) + (m.nearfall_3_for || 0) + (m.nearfall_4_for || 0), 0)

        return {
          ...w,
          wins, losses, pins, tech_falls: techFalls, majors, decisions,
          takedowns, escapes, reversals, nearfalls,
          matchCount: wMatches.length
        }
      })

      // Calculate team totals from calculated stats
      const totalWins = wrestlersWithStats.reduce((sum: number, w: any) => sum + w.wins, 0)
      const totalLosses = wrestlersWithStats.reduce((sum: number, w: any) => sum + w.losses, 0)
      const totalPins = wrestlersWithStats.reduce((sum: number, w: any) => sum + w.pins, 0)
      const totalTechFalls = wrestlersWithStats.reduce((sum: number, w: any) => sum + w.tech_falls, 0)
      const totalMajors = wrestlersWithStats.reduce((sum: number, w: any) => sum + w.majors, 0)
      const totalDecisions = wrestlersWithStats.reduce((sum: number, w: any) => sum + w.decisions, 0)
      const totalTakedowns = wrestlersWithStats.reduce((sum: number, w: any) => sum + w.takedowns, 0)
      const totalEscapes = wrestlersWithStats.reduce((sum: number, w: any) => sum + w.escapes, 0)
      const totalReversals = wrestlersWithStats.reduce((sum: number, w: any) => sum + w.reversals, 0)
      const totalNearfalls = wrestlersWithStats.reduce((sum: number, w: any) => sum + w.nearfalls, 0)

      // Calculate team points (6 for pin, 5 for TF, 4 for major, 3 for decision)
      const totalTeamPoints = (totalPins * 6) + (totalTechFalls * 5) + (totalMajors * 4) + (totalDecisions * 3)

      // Identify top performers
      const wrestlersWithMatches = wrestlersWithStats.filter((w: any) => w.wins + w.losses > 0)
      const topByWinPct = [...wrestlersWithMatches]
        .map((w: any) => ({
          ...w,
          winPct: w.wins / (w.wins + w.losses) * 100
        }))
        .sort((a: any, b: any) => b.winPct - a.winPct)
        .slice(0, 5)

      const topByPins = [...wrestlersWithStats]
        .filter((w: any) => w.pins > 0)
        .sort((a: any, b: any) => b.pins - a.pins)
        .slice(0, 5)

      const topByTakedowns = [...wrestlersWithStats]
        .filter((w: any) => w.takedowns > 0)
        .sort((a: any, b: any) => b.takedowns - a.takedowns)
        .slice(0, 5)

      // Weight class coverage
      const WEIGHT_CLASSES = [106, 113, 120, 126, 132, 138, 144, 150, 157, 165, 175, 190, 215, 285]
      const filledWeightClasses = new Set(wrestlers.map((w: any) => w.weight_class).filter(Boolean))
      const emptyWeightClasses = WEIGHT_CLASSES.filter(wc => !filledWeightClasses.has(wc))

      // Grade distribution
      const gradeDistribution: Record<number, number> = {}
      wrestlers.forEach((w: any) => {
        if (w.grade) {
          gradeDistribution[w.grade] = (gradeDistribution[w.grade] || 0) + 1
        }
      })

      setTeamData({
        teamName: team.name,
        wrestlers: wrestlersWithStats,
        wrestlerCount: wrestlers.length,
        totalWins,
        totalLosses,
        winPercentage: totalWins + totalLosses > 0
          ? ((totalWins / (totalWins + totalLosses)) * 100).toFixed(1)
          : 0,
        totalPins,
        totalTechFalls,
        totalMajors,
        totalDecisions,
        bonusPointPct: totalWins > 0
          ? (((totalPins + totalTechFalls + totalMajors) / totalWins) * 100).toFixed(1)
          : 0,
        totalTakedowns,
        totalEscapes,
        totalReversals,
        totalNearfalls,
        totalTeamPoints,
        topByWinPct,
        topByPins,
        topByTakedowns,
        emptyWeightClasses,
        gradeDistribution,
      })
    }
    loadTeamData()
  }, [])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const agenticInfo = teamId
        ? `
**AGENTIC MODE ACTIVE** - I can take actions for you:
• Add/update wrestlers on your roster
• Schedule practices and events
• Record weights and attendance
• Log match results

Just tell me what you need!`
        : ''

      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hey Coach! I'm Mat Ops AI, your wrestling assistant.

I can help you with:
• **Team analysis** - Review your roster and stats
• **Practice planning** - Drill ideas and workout structures
• **Match strategy** - Opponent scouting and game plans
• **Weight management** - Tracking and recommendations

${teamData ? `I see you have **${teamData.wrestlerCount} wrestlers** on your roster with a combined record of **${teamData.totalWins}-${teamData.totalLosses}**.` : 'Log in to see your team data here.'}
${agenticInfo}
What can I help you with today?`,
        timestamp: new Date(),
      }])
    }
  }, [teamData, teamId])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Build DETAILED context with team data
      let context = WRESTLING_KNOWLEDGE
      if (teamData && teamData.wrestlers?.length > 0) {
        context += `

=== TEAM DATA: ${teamData.teamName} ===

TEAM OVERVIEW:
- Roster Size: ${teamData.wrestlerCount} wrestlers
- Season Record: ${teamData.totalWins}-${teamData.totalLosses} (${teamData.winPercentage}% win rate)
- Total Pins: ${teamData.totalPins} | Tech Falls: ${teamData.totalTechFalls} | Major Decisions: ${teamData.totalMajors}
- Bonus Point Rate: ${teamData.bonusPointPct}% of wins are bonus point wins
- Team Points Earned: ${teamData.totalTeamPoints}
- Total Takedowns: ${teamData.totalTakedowns} | Escapes: ${teamData.totalEscapes} | Reversals: ${teamData.totalReversals}

${teamData.emptyWeightClasses?.length > 0 ? `UNFILLED WEIGHT CLASSES: ${teamData.emptyWeightClasses.join(', ')} lbs` : 'All weight classes filled!'}

GRADE DISTRIBUTION:
${Object.entries(teamData.gradeDistribution || {}).map(([grade, count]) => `- Grade ${grade}: ${count} wrestlers`).join('\n') || 'No grade data'}

TOP PERFORMERS BY WIN %:
${teamData.topByWinPct?.map((w: any, i: number) =>
  `${i + 1}. ${w.first_name} ${w.last_name} (${w.weight_class || '?'}lbs) - ${w.wins}-${w.losses} (${w.winPct.toFixed(1)}%)`
).join('\n') || 'No match data yet'}

TOP PINNERS:
${teamData.topByPins?.filter((w: any) => w.pins > 0).map((w: any, i: number) =>
  `${i + 1}. ${w.first_name} ${w.last_name} - ${w.pins} pins`
).join('\n') || 'No pins recorded'}

TOP TAKEDOWN SCORERS:
${teamData.topByTakedowns?.filter((w: any) => w.takedowns > 0).map((w: any, i: number) =>
  `${i + 1}. ${w.first_name} ${w.last_name} - ${w.takedowns} takedowns`
).join('\n') || 'No takedowns recorded'}

FULL ROSTER (by weight class):
${teamData.wrestlers.map((w: any) => {
  const matches = (w.wins || 0) + (w.losses || 0)
  const winPct = matches > 0 ? ((w.wins / matches) * 100).toFixed(0) : 'N/A'
  return `- ${w.first_name} ${w.last_name} | ${w.weight_class || '?'}lbs | Grade ${w.grade || '?'} | ${w.wins || 0}-${w.losses || 0} (${winPct}%) | Pins: ${w.pins || 0} | TF: ${w.tech_falls || 0} | Maj: ${w.majors || 0} | Dec: ${w.decisions || 0} | TD: ${w.takedowns || 0} | Esc: ${w.escapes || 0} | Rev: ${w.reversals || 0}`
}).join('\n')}

When answering questions about specific wrestlers, reference their actual stats. Be specific with names and numbers.`
      }

      // Call AI API with agentic capabilities
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: context },
            ...messages.filter(m => m.role !== 'system').map(m => ({
              role: m.role,
              content: m.content,
            })),
            { role: 'user', content },
          ],
          teamId: teamId,
          enableTools: !!teamId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      // Handle pending action that requires confirmation
      if (data.requiresConfirmation && data.pendingAction) {
        setPendingAction(data.pendingAction)
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          pendingAction: data.pendingAction,
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        // Regular response (possibly with action result)
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.message || data.content || 'Sorry, I had trouble processing that. Try again?',
          timestamp: new Date(),
          actionResult: data.actionResult,
        }
        setMessages(prev => [...prev, assistantMessage])

        // Only reload for write actions (mutations), not read-only queries
        if (data.actionResult?.success && data.actionResult?.mutated) {
          // Small delay then refresh
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        }
      }
    } catch (error) {
      console.error('Chat error:', error)

      // Fallback response when API is not available
      const fallbackMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: generateFallbackResponse(content, teamData),
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, fallbackMessage])
    }

    setLoading(false)
    inputRef.current?.focus()
  }

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  // Handle confirmation of pending action
  const handleConfirmAction = async () => {
    if (!pendingAction || !teamId) return

    setLoading(true)
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          confirmedAction: pendingAction,
        }),
      })

      const data = await response.json()

      const resultMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.actionResult?.success
          ? `Done! ${data.actionResult.message}`
          : `Failed: ${data.actionResult?.message || 'Unknown error'}`,
        timestamp: new Date(),
        actionResult: data.actionResult,
      }
      setMessages(prev => [...prev, resultMessage])

      // Refresh if successful
      if (data.actionResult?.success) {
        setTimeout(() => window.location.reload(), 1500)
      }
    } catch (error) {
      console.error('Action error:', error)
      const errorMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, something went wrong executing that action.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    }

    setPendingAction(null)
    setLoading(false)
  }

  // Handle cancellation of pending action
  const handleCancelAction = () => {
    setPendingAction(null)
    const cancelMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: 'Action cancelled. Is there anything else I can help you with?',
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, cancelMessage])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative">
      <WrestlingStatsBackground />

      <div className="relative z-10 container mx-auto px-4 py-6 h-[calc(100vh-80px)] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Bot className="w-7 h-7 text-gold" />
              Mat Ops AI
            </h1>
            <p className="text-gray-400 text-sm">Your wrestling coaching assistant</p>
          </div>
          <div className="flex items-center gap-2">
            {teamId && (
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 flex items-center gap-1">
                <Wrench className="w-3 h-3" />
                Agentic Mode
              </Badge>
            )}
            {extensionConnected ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-1">
                <PlugZap className="w-3 h-3" />
                Extension Connected
              </Badge>
            ) : (
              <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 flex items-center gap-1">
                <Plug className="w-3 h-3" />
                Web Only
              </Badge>
            )}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
          {/* Quick Actions Sidebar */}
          <div className="hidden lg:block">
            <Card className="bg-black/60 border-gold/20 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-gold text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {QUICK_ACTIONS.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={() => handleQuickAction(action)}
                    className="w-full justify-start text-left h-auto py-2 text-gray-300 hover:text-gold hover:bg-gold/10"
                  >
                    <span className="mr-2">{action.icon}</span>
                    <span className="text-sm">{action.label}</span>
                  </Button>
                ))}

                {teamId && (
                  <div className="pt-4 border-t border-gold/10 mt-4">
                    <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      Agentic Actions
                    </div>
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => sendMessage("Add a new wrestler to my roster")}
                        className="w-full justify-start text-xs text-gray-400 hover:text-green-400 hover:bg-green-500/10 h-7"
                      >
                        <PlusCircle className="w-3 h-3 mr-2" />
                        Add Wrestler
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => sendMessage("Schedule a practice for this week")}
                        className="w-full justify-start text-xs text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 h-7"
                      >
                        <Calendar className="w-3 h-3 mr-2" />
                        Schedule Practice
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => sendMessage("Record today's weights for the team")}
                        className="w-full justify-start text-xs text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 h-7"
                      >
                        <Scale className="w-3 h-3 mr-2" />
                        Record Weights
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => sendMessage("What events do we have coming up?")}
                        className="w-full justify-start text-xs text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 h-7"
                      >
                        <Calendar className="w-3 h-3 mr-2" />
                        View Schedule
                      </Button>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gold/10 mt-4">
                  <div className="text-xs text-gray-500 mb-2">Tips</div>
                  <div className="text-xs text-gray-400 space-y-2">
                    <p className="flex items-start gap-2">
                      <Lightbulb className="w-3 h-3 mt-0.5 text-gold" />
                      Ask about specific wrestlers by name
                    </p>
                    <p className="flex items-start gap-2">
                      <Lightbulb className="w-3 h-3 mt-0.5 text-gold" />
                      {teamId ? 'Say "add wrestler John Smith at 145"' : 'Request drill variations for any technique'}
                    </p>
                    <p className="flex items-start gap-2">
                      <Lightbulb className="w-3 h-3 mt-0.5 text-gold" />
                      {teamId ? 'Say "schedule practice for Tuesday 3-5pm"' : 'Get weight cut strategies and timelines'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3 flex flex-col min-h-0">
            <Card className="bg-black/60 border-gold/20 flex-1 flex flex-col min-h-0">
              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-gold/20 text-gold'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-gold/20 text-white'
                          : message.actionResult?.success
                            ? 'bg-green-900/30 text-gray-200 border border-green-500/30'
                            : message.actionResult && !message.actionResult.success
                              ? 'bg-red-900/30 text-gray-200 border border-red-500/30'
                              : 'bg-black/40 text-gray-200 border border-gold/10'
                      }`}>
                        {/* Action result indicator */}
                        {message.actionResult && (
                          <div className={`flex items-center gap-2 mb-2 pb-2 border-b ${
                            message.actionResult.success ? 'border-green-500/30' : 'border-red-500/30'
                          }`}>
                            {message.actionResult.success ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                            <span className={`text-xs font-medium ${
                              message.actionResult.success ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {message.actionResult.success ? 'Action Completed' : 'Action Failed'}
                            </span>
                          </div>
                        )}
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content.split('**').map((part, i) =>
                            i % 2 === 1 ? <strong key={i} className="text-gold">{part}</strong> : part
                          )}
                        </div>
                        {/* Confirmation buttons for pending actions */}
                        {message.pendingAction && pendingAction?.name === message.pendingAction.name && (
                          <div className="flex gap-2 mt-3 pt-3 border-t border-gold/20">
                            <Button
                              size="sm"
                              onClick={handleConfirmAction}
                              disabled={loading}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelAction}
                              disabled={loading}
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-black/40 border border-gold/10 rounded-lg p-3">
                      <Loader2 className="w-5 h-5 animate-spin text-gold" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Mobile Quick Actions */}
              <div className="lg:hidden px-4 py-2 border-t border-gold/10 overflow-x-auto">
                <div className="flex gap-2">
                  {QUICK_ACTIONS.slice(0, 4).map((action, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickAction(action)}
                      className="border-gold/30 text-gold whitespace-nowrap text-xs"
                    >
                      {action.icon}
                      <span className="ml-1">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gold/10">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about wrestling..."
                    className="flex-1 bg-black/50 border-gold/30 text-white"
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-gold hover:bg-gold/90 text-black font-bold"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Fallback responses when API is not available
function generateFallbackResponse(input: string, teamData: any): string {
  const lower = input.toLowerCase()

  if (lower.includes('practice') || lower.includes('drill')) {
    return `Here's a solid practice structure I'd recommend:

**Warm-up (15 min)**
- Light jog, dynamic stretching
- Stance and motion drills

**Technique Block (30 min)**
- Focus on one takedown (single leg chain)
- Partner drilling with resistance progression

**Live Wrestling (25 min)**
- Situation wrestling from various positions
- Full 6-minute matches

**Conditioning (10 min)**
- Buddy carries, sprawl sprints

**Cool Down (10 min)**
- Static stretching, team huddle

Want me to elaborate on any specific drill?`
  }

  if (lower.includes('weight') || lower.includes('cut')) {
    return `**Weight Management Tips:**

1. **Gradual cuts** - Max 2-3 lbs per week safely
2. **Hydration tracking** - Monitor urine color
3. **Smart eating** - Lean proteins, complex carbs
4. **Avoid drastic measures** - No saunas right before weigh-ins

${teamData ? `Looking at your roster, make sure wrestlers at the upper weight classes aren't overreaching on cuts.` : ''}

What specific weight class are you concerned about?`
  }

  if (lower.includes('season') || lower.includes('performance') || lower.includes('overview')) {
    if (teamData) {
      return `**${teamData.teamName} Season Overview**

**Record**: ${teamData.totalWins}-${teamData.totalLosses} (${teamData.winPercentage}% win rate)
**Roster Size**: ${teamData.wrestlerCount} wrestlers

**Win Types** (${teamData.bonusPointPct}% bonus point wins):
- Pins: ${teamData.totalPins}
- Tech Falls: ${teamData.totalTechFalls}
- Major Decisions: ${teamData.totalMajors}
- Decisions: ${teamData.totalDecisions}

**Team Points Potential**: ${teamData.totalTeamPoints} pts

**Scoring Moves**:
- Takedowns: ${teamData.totalTakedowns}
- Escapes: ${teamData.totalEscapes}
- Reversals: ${teamData.totalReversals}

${teamData.emptyWeightClasses?.length > 0 ? `**Empty Weight Classes**: ${teamData.emptyWeightClasses.join(', ')} lbs` : 'All weight classes filled!'}

Want me to analyze specific wrestlers or suggest practice focus areas?`
    }
    return `I'd love to give you a season overview, but I need access to your team data. Make sure you're logged in to see your roster stats!`
  }

  if (lower.includes('roster') || lower.includes('analyze') || lower.includes('team')) {
    if (teamData && teamData.wrestlers.length > 0) {
      const topWrestlers = teamData.wrestlers
        .filter((w: any) => (w.wins || 0) > 0)
        .sort((a: any, b: any) => (b.wins || 0) - (a.wins || 0))
        .slice(0, 3)

      if (topWrestlers.length > 0) {
        return `**Roster Analysis**

🏆 **Top Performers**:
${topWrestlers.map((w: any, i: number) =>
  `${i + 1}. ${w.first_name} ${w.last_name} (${w.weight_class || '?'}lbs) - ${w.wins}-${w.losses}`
).join('\n')}

I can see ${teamData.wrestlerCount} wrestlers on the roster. To identify weak weight classes, I'd need to see your full lineup card.

What specific analysis would help you most?`
      }
    }
    return `Upload your roster data to get detailed analysis. Go to the Roster page to add your wrestlers, then I can help analyze the team!`
  }

  // Default response
  return `Great question, Coach!

I'm here to help with:
• **Practice planning** - Drills, workouts, technique focus
• **Team analysis** - Performance trends, roster evaluation
• **Match strategy** - Preparation and game plans
• **Wrestling knowledge** - Rules, techniques, best practices

${teamData ? `I have your ${teamData.teamName} data loaded with ${teamData.wrestlerCount} wrestlers.` : 'Log in to access your team data.'}

What specific area would you like to explore?`
}
