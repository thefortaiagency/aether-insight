'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Send, Bot, User, Sparkles, Zap, Brain, Trophy,
  Users, TrendingUp, Calendar, Dumbbell, Target, Loader2,
  Plug, PlugZap, Lightbulb, MessageSquare
} from 'lucide-react'
import WrestlingStatsBackground from '@/components/wrestling-stats-background'
import { supabase } from '@/lib/supabase'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
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

const WRESTLING_KNOWLEDGE = `You are Mat Ops AI, a wrestling coaching assistant. You have expertise in:
- Wrestling techniques (takedowns, escapes, reversals, pins)
- Practice planning and drill recommendations
- Match strategy and opponent analysis
- Weight management guidance
- Team building and motivation
- Wrestling rules and scoring
- Conditioning and injury prevention

Always be encouraging but realistic. Use wrestling terminology appropriately.
When discussing stats, be specific about what the numbers mean for the wrestler's development.
Suggest actionable improvements based on the data.`

export default function MatOpsAIPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [extensionConnected, setExtensionConnected] = useState(false)
  const [teamData, setTeamData] = useState<any>(null)
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

  // Load team data for context - DETAILED wrestler awareness
  useEffect(() => {
    const loadTeamData = async () => {
      const session = localStorage.getItem('aether-session')
      if (!session) return

      const { team } = JSON.parse(session)
      if (!team?.id) return

      const { data: wrestlers } = await supabase
        .from('wrestlers')
        .select('*')
        .eq('team_id', team.id)
        .order('weight_class', { ascending: true })

      if (!wrestlers) return

      // Calculate detailed stats for AI context
      const totalWins = wrestlers.reduce((sum: number, w: any) => sum + (w.wins || 0), 0)
      const totalLosses = wrestlers.reduce((sum: number, w: any) => sum + (w.losses || 0), 0)
      const totalPins = wrestlers.reduce((sum: number, w: any) => sum + (w.pins || 0), 0)
      const totalTechFalls = wrestlers.reduce((sum: number, w: any) => sum + (w.tech_falls || 0), 0)
      const totalMajors = wrestlers.reduce((sum: number, w: any) => sum + (w.major_decisions || 0), 0)
      const totalTakedowns = wrestlers.reduce((sum: number, w: any) => sum + (w.takedowns || 0), 0)
      const totalEscapes = wrestlers.reduce((sum: number, w: any) => sum + (w.escapes || 0), 0)
      const totalReversals = wrestlers.reduce((sum: number, w: any) => sum + (w.reversals || 0), 0)
      const totalTeamPoints = wrestlers.reduce((sum: number, w: any) => sum + (w.team_points || 0), 0)

      // Identify top performers
      const wrestlersWithMatches = wrestlers.filter((w: any) => (w.wins || 0) + (w.losses || 0) > 0)
      const topByWinPct = [...wrestlersWithMatches]
        .map((w: any) => ({
          ...w,
          winPct: (w.wins || 0) / ((w.wins || 0) + (w.losses || 0)) * 100
        }))
        .sort((a, b) => b.winPct - a.winPct)
        .slice(0, 5)

      const topByPins = [...wrestlers]
        .sort((a: any, b: any) => (b.pins || 0) - (a.pins || 0))
        .slice(0, 5)

      const topByTakedowns = [...wrestlers]
        .sort((a: any, b: any) => (b.takedowns || 0) - (a.takedowns || 0))
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
        wrestlers,
        wrestlerCount: wrestlers.length,
        totalWins,
        totalLosses,
        winPercentage: totalWins + totalLosses > 0
          ? ((totalWins / (totalWins + totalLosses)) * 100).toFixed(1)
          : 0,
        totalPins,
        totalTechFalls,
        totalMajors,
        bonusPointPct: totalWins > 0
          ? (((totalPins + totalTechFalls + totalMajors) / totalWins) * 100).toFixed(1)
          : 0,
        totalTakedowns,
        totalEscapes,
        totalReversals,
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
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hey Coach! 👋 I'm Mat Ops AI, your wrestling assistant.

I can help you with:
• **Team analysis** - Review your roster and stats
• **Practice planning** - Drill ideas and workout structures
• **Match strategy** - Opponent scouting and game plans
• **Weight management** - Tracking and recommendations

${teamData ? `I see you have **${teamData.wrestlerCount} wrestlers** on your roster with a combined record of **${teamData.totalWins}-${teamData.totalLosses}**.` : 'Log in to see your team data here.'}

What can I help you with today?`,
        timestamp: new Date(),
      }])
    }
  }, [teamData])

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
  return `- ${w.first_name} ${w.last_name} | ${w.weight_class || '?'}lbs | Grade ${w.grade || '?'} | ${w.wins || 0}-${w.losses || 0} (${winPct}%) | ${w.pins || 0} pins | TD: ${w.takedowns || 0} | E: ${w.escapes || 0} | R: ${w.reversals || 0}`
}).join('\n')}

When answering questions about specific wrestlers, reference their actual stats. Be specific with names and numbers.`
      }

      // Call AI API (using OpenAI-compatible endpoint)
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
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message || data.content || 'Sorry, I had trouble processing that. Try again?',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
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

                <div className="pt-4 border-t border-gold/10 mt-4">
                  <div className="text-xs text-gray-500 mb-2">Tips</div>
                  <div className="text-xs text-gray-400 space-y-2">
                    <p className="flex items-start gap-2">
                      <Lightbulb className="w-3 h-3 mt-0.5 text-gold" />
                      Ask about specific wrestlers by name
                    </p>
                    <p className="flex items-start gap-2">
                      <Lightbulb className="w-3 h-3 mt-0.5 text-gold" />
                      Request drill variations for any technique
                    </p>
                    <p className="flex items-start gap-2">
                      <Lightbulb className="w-3 h-3 mt-0.5 text-gold" />
                      Get weight cut strategies and timelines
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
                          : 'bg-black/40 text-gray-200 border border-gold/10'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content.split('**').map((part, i) =>
                            i % 2 === 1 ? <strong key={i} className="text-gold">{part}</strong> : part
                          )}
                        </div>
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
      const winPct = teamData.totalWins + teamData.totalLosses > 0
        ? ((teamData.totalWins / (teamData.totalWins + teamData.totalLosses)) * 100).toFixed(1)
        : 0
      return `**${teamData.teamName} Season Overview**

📊 **Record**: ${teamData.totalWins}-${teamData.totalLosses} (${winPct}%)
👥 **Roster Size**: ${teamData.wrestlerCount} wrestlers

The team is showing solid fundamentals. Focus areas to improve:
- Increase pin rate for bonus points
- Work on escape percentage from bottom
- Develop depth at key weight classes

Want me to analyze specific wrestlers or weight classes?`
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
