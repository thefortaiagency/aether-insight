import { NextResponse } from 'next/server'
import { getOpenAITools, getTool, requiresConfirmation } from '@/lib/ai/tools'
import { executeAction } from '@/lib/ai/executor'
import { supabase } from '@/lib/supabase'

interface CoachProfile {
  name?: string
  background?: string
  philosophy?: string
  communication_style?: string
  favorite_techniques?: string[]
  team_goals?: string
  season_focus?: string
  ai_preferences?: {
    tone?: 'motivating' | 'analytical' | 'balanced'
    formality?: 'casual' | 'professional' | 'coach-like'
    detail_level?: 'concise' | 'detailed' | 'comprehensive'
  }
}

// Supported providers
type Provider = 'anthropic' | 'openai'

interface ChatRequest {
  messages: Array<{ role: string; content: string }>
  provider?: Provider
  model?: string
  teamId?: string
  enableTools?: boolean
  confirmedAction?: { name: string; params: any }
}

export async function POST(request: Request) {
  try {
    const {
      messages,
      provider = 'openai', // OpenAI has better function calling
      model,
      teamId,
      enableTools = true,
      confirmedAction
    } = await request.json() as ChatRequest

    // If there's a confirmed action, execute it directly
    if (confirmedAction && teamId) {
      const result = await executeAction(teamId, confirmedAction.name, confirmedAction.params, true)
      return NextResponse.json({
        message: result.message,
        actionResult: result,
        provider: 'action'
      })
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY

    // Determine which provider to use (prefer OpenAI for function calling)
    let useProvider = provider
    if (!openaiKey && anthropicKey) {
      useProvider = 'anthropic'
    } else if (openaiKey) {
      useProvider = 'openai'
    }

    // No API keys available
    if (!anthropicKey && !openaiKey) {
      return NextResponse.json({
        message: "I'm running in offline mode. I can still help with general wrestling questions using my built-in knowledge!",
        provider: 'fallback'
      })
    }

    // Get tools for function calling
    const tools = enableTools && teamId ? getOpenAITools() : undefined

    // Fetch coach profile if teamId is provided
    let coachProfile: CoachProfile | null = null
    let teamName = ''
    if (teamId) {
      try {
        const { data } = await supabase
          .from('teams')
          .select('name, coach_profile, head_coach')
          .eq('id', teamId)
          .single()

        if (data) {
          teamName = data.name || ''
          coachProfile = data.coach_profile || {}
          if (coachProfile && !coachProfile.name && data.head_coach) {
            coachProfile.name = data.head_coach
          }
        }
      } catch (error) {
        console.log('Could not fetch coach profile:', error)
      }
    }

    // Build personalized context from coach profile
    const buildCoachContext = (profile: CoachProfile | null, team: string): string => {
      if (!profile || Object.keys(profile).length === 0) return ''

      let context = '\n## COACH PERSONALIZATION\n'
      context += `You are working with ${profile.name || 'Coach'}${team ? ` of ${team}` : ''}.\n\n`

      if (profile.background) {
        context += `**Their Background:** ${profile.background}\n\n`
      }
      if (profile.philosophy) {
        context += `**Their Coaching Philosophy:** ${profile.philosophy}\n\n`
      }
      if (profile.team_goals) {
        context += `**Current Team Goals:** ${profile.team_goals}\n\n`
      }
      if (profile.season_focus) {
        context += `**This Season's Focus:** ${profile.season_focus}\n\n`
      }
      if (profile.favorite_techniques && profile.favorite_techniques.length > 0) {
        context += `**Techniques They Emphasize:** ${profile.favorite_techniques.join(', ')}\n\n`
      }

      // AI preferences
      if (profile.ai_preferences) {
        const prefs = profile.ai_preferences
        context += '**How to Communicate:**\n'
        if (prefs.tone === 'motivating') {
          context += '- Be motivating and challenging - push them and their wrestlers\n'
        } else if (prefs.tone === 'analytical') {
          context += '- Be analytical and data-driven - focus on stats and metrics\n'
        } else {
          context += '- Balance motivation with analysis\n'
        }

        if (prefs.formality === 'casual') {
          context += '- Keep it casual and friendly\n'
        } else if (prefs.formality === 'coach-like') {
          context += '- Be direct and action-oriented like a coach in the corner\n'
        } else {
          context += '- Maintain a professional, structured approach\n'
        }

        if (prefs.detail_level === 'concise') {
          context += '- Keep responses brief and to the point\n'
        } else if (prefs.detail_level === 'comprehensive') {
          context += '- Provide thorough, comprehensive responses\n'
        } else {
          context += '- Provide detailed explanations when helpful\n'
        }
      }

      if (profile.communication_style) {
        context += `\n**Additional Notes:** ${profile.communication_style}\n`
      }

      context += '\nUse this context to personalize your responses. Reference their goals and philosophy when relevant. Speak to their experience level.\n'

      return context
    }

    const coachContext = buildCoachContext(coachProfile, teamName)

    // Enhanced system prompt for intelligent data parsing
    const smartSystemPrompt = `You are Mat Ops AI, an intelligent wrestling coach and team management assistant.${coachContext} You help coaches manage their program AND develop their athletes' mental game. You're like having an assistant coach who understands both the logistics and the mentality needed to build champions.

## YOUR COACHING IDENTITY
You speak like a coach - direct, motivating, action-oriented. Not a therapist, not corporate. You believe every wrestler can develop an elite mindset with the right work. You're supportive but challenging - high expectations with practical tools.

## CONVERSATION MEMORY
IMPORTANT: This is an ongoing conversation. You MUST:
- Remember what was discussed earlier in this chat
- Reference previous messages when relevant ("Earlier you asked about...", "Since I just added...")
- Build on context from past exchanges
- Never ask for information that was already provided in this conversation
- When you take an action, remember it for follow-up questions

## INTELLIGENT DATA PARSING
When a coach pastes data (roster, schedule, stats, match results), you should:
1. **Detect the data type** - Is it a roster list? Schedule? Match results? Stats?
2. **Parse ALL items** - Extract EVERY item from the pasted data into an array
3. **Use BULK import tools** - ALWAYS use bulk_import_wrestlers, bulk_import_events, bulk_import_match_results, or bulk_add_practices
4. **NEVER use single-item tools** - Do NOT use add_event, add_wrestler, etc. when multiple items are pasted. Use the bulk tools instead.
5. **Include ALL items** - When calling bulk_import_events, include ALL events from the pasted data in the events array, not just the first one

## DATA FORMAT EXAMPLES YOU CAN HANDLE:
**Rosters:**
- "John Smith, 145, 10th grade"
- "Smith, John - 145 lbs - Sophomore"
- Tab/CSV: "FirstName,LastName,Weight,Grade"

**Schedules:**
- "Jan 15 - vs Central High (Away)"
- "1/15/25 Central Tournament @ Central HS"
- "Dual vs Westside - Home - 6pm"
- "11/20/2025 Snider JV invite Away Location, IN"

**IMPORTANT**: When you see multiple events/dates, call bulk_import_events with ALL of them:
bulk_import_events({ events: [
  { name: "Event 1", date: "2025-11-20", type: "tournament", location: "Location 1" },
  { name: "Event 2", date: "2025-11-22", type: "dual", location: "Location 2" },
  // ... include ALL events from the pasted data
]})

**Match Results:**
- "John Smith W by pin over Mike Jones (Central)"
- "145: Smith (W) def. Jones 8-3"
- "Carter Fielden beat Jake Thomas by fall"

## CONVERSATION STYLE
- Be conversational and remember context
- Reference what you just did ("Now that I've added those wrestlers...")
- Ask natural follow-up questions ("Want me to also schedule practices for them?")
- Connect related topics ("Since you're adding the schedule, should I also set importance levels for peak events?")

## MINDSET & MENTAL PERFORMANCE COACHING
You understand that wrestling is as much mental as physical. Help coaches develop their athletes' mindset.

**PROACTIVE VS REACTIVE MINDSET:**
- **ELITE mindset**: Aggressive, proactive, takes action first, controls the pace, thrives under pressure
- **Struggling mindset**: Reactive, defensive, hesitant, gives opponents too much respect, different in practice vs competition

**WHEN COACHES ASK ABOUT:**
- **Choking in big matches**: Help identify if the wrestler is shifting to reactive mindset. Suggest building competition personas, pre-match routines.
- **Nervousness**: Reframe as readiness - "Their body is preparing for peak performance." Teach controlled breathing techniques.
- **Consistency**: Help build systematic pre-competition routines that anchor confidence.
- **Confidence issues**: Confidence is EARNED through preparation. Track evidence of readiness.
- **After losses**: Teach mental reset techniques - physical gesture + refocus phrase.

**MENTAL PERFORMANCE TOOLS:**
1. **Competition Persona**: Create a separate identity for competition with specific characteristics
2. **Pre-Competition Routine (20 min)**: Systematic routine before every match
   - Mindset activation (5 min): Visualization + persona activation
   - Physical warm-up (5 min): Dynamic stretches, shadow wrestling
   - Mental priming (5 min): Power pose + affirmations
   - Controlled breathing (2 min): Box breathing (4-4-4-4)
   - Tactical review (3 min): Game plan focus
3. **Reset Button**: Physical gesture + mental phrase to recover from mistakes instantly
4. **Redefining Nervousness**: Nerves = excitement + readiness, not fear
5. **Earned Confidence**: Daily action goals tied to season goals - track the work

**COACHING RESPONSES FOR MENTAL TOPICS:**
- Be direct and action-oriented
- Give specific exercises, not just advice
- Challenge them: "Will you commit to this every day this week?"
- Reference the mental preparation when relevant to practice planning
- Connect physical preparation to mental readiness

## PERIODIZATION & TRAINING KNOWLEDGE (High School Wrestling)
You understand the science of periodization - varying training intensity and volume to peak at championships.

**THE FOUR PHASES:**
1. **Off-Season (4-6 months)**: Foundation building - max strength, aerobic endurance, skill acquisition, hypertrophy. Higher volume lifting (4x12 @ 65%), LSD cardio 30min 2-3x/week.
2. **Pre-Season (6-8 weeks)**: Transition - convert strength to power. Olympic lifts, speed work, anaerobic conditioning. Hill sprints, tempo runs. Volume decreases, intensity increases.
3. **In-Season (10-12 weeks)**: Maintenance & competition. 2 full-body sessions/week, low reps (2x3 @ 80-85%). Most conditioning from live wrestling. Practices under 2 hours.
4. **Championship Season (2-3 weeks)**: TAPERING - progressive reduction in volume (41-60%) while maintaining intensity. 8-14 day taper optimal. Mental preparation increases significantly.

**TAPERING SCIENCE:**
- Reduce training VOLUME progressively (not suddenly)
- MAINTAIN intensity and frequency
- Example: 60 min live wrestling → gradually to 24-35 min over 2 weeks
- Focus on feeling sharp, not building fitness
- INCREASE mental preparation as physical volume decreases

**PRACTICE STRUCTURE (In-Season):**
- Warm-up: 10-15 min (dynamic movements)
- Drill Work: 10-15 min (high reps, all positions)
- Technique/Scout: 10-15 min (specific to upcoming opponents)
- Situational/Live: 30-60 min (most important phase)
- Conditioning Finish: 10-15 min (high-intensity finish)

**KEY PRINCIPLES:**
- Training residuals: different qualities decay at different rates
- Deliberate practice > volume - quality over quantity
- It takes less volume to maintain than to build
- Championship taper: reduce volume 40-60%, keep intensity high
- Mental prep: familiarize the unfamiliar, control the controllables

**MENTAL CUES YOU CAN SHARE:**
- "Pull the trigger" - be first to act
- "Control the pace" - dictate the match
- "First to score, first to finish"
- "My mat" - ownership mentality

When coaches ask about practice planning, periodization, tapering, or peaking, integrate both the physical AND mental preparation aspects.

## AVAILABLE ACTIONS
You can manage wrestlers, events, practices, weights, and matches. When coaches ask you to do something, use the appropriate tool.

When they paste data, parse it and use the bulk import tools. Always confirm what you found before importing.`

    let response: Response
    let content: string

    if (useProvider === 'openai' && openaiKey) {
      // Prepare messages with system prompt
      const systemMessage = messages.find(m => m.role === 'system')?.content
      const otherMessages = messages.filter(m => m.role !== 'system')

      const openaiMessages = [
        { role: 'system', content: systemMessage || smartSystemPrompt },
        ...otherMessages
      ]

      // Call OpenAI API with function calling
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: openaiMessages,
          max_tokens: 2000,
          temperature: 0.7,
          ...(tools && tools.length > 0 ? { tools, tool_choice: 'auto' } : {}),
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('OpenAI API error:', error)
        throw new Error('OpenAI API error')
      }

      const data = await response.json()
      const choice = data.choices?.[0]
      const message = choice?.message

      // Check if the AI wants to call a function
      if (message?.tool_calls && message.tool_calls.length > 0) {
        const toolCall = message.tool_calls[0]
        const functionName = toolCall.function.name
        const functionArgs = JSON.parse(toolCall.function.arguments || '{}')

        console.log('AI wants to call:', functionName, functionArgs)

        // Check if this action requires confirmation
        if (requiresConfirmation(functionName)) {
          const tool = getTool(functionName)
          return NextResponse.json({
            message: `I'd like to **${tool?.description.toLowerCase()}**. This action requires your confirmation.`,
            pendingAction: {
              name: functionName,
              params: functionArgs,
              description: tool?.description,
            },
            requiresConfirmation: true,
            provider: 'openai',
            model: model || 'gpt-4o-mini'
          })
        }

        // Execute the action
        if (teamId) {
          const result = await executeAction(teamId, functionName, functionArgs, false)

          if (result.requiresConfirmation) {
            const tool = getTool(functionName)
            return NextResponse.json({
              message: `I'd like to **${tool?.description.toLowerCase()}**. ${result.confirmationMessage}`,
              pendingAction: {
                name: functionName,
                params: functionArgs,
                description: tool?.description,
              },
              requiresConfirmation: true,
              provider: 'openai',
              model: model || 'gpt-4o-mini'
            })
          }

          // Return the action result along with a natural language response
          return NextResponse.json({
            message: result.success
              ? `Done! ${result.message}`
              : `I couldn't complete that: ${result.message}`,
            actionResult: result,
            provider: 'openai',
            model: model || 'gpt-4o-mini'
          })
        }
      }

      // No function call, just return the text response
      content = message?.content || 'Sorry, I had trouble processing that.'

      return NextResponse.json({
        message: content,
        provider: 'openai',
        model: model || 'gpt-4o-mini'
      })

    } else if (anthropicKey) {
      // Call Anthropic Claude API (no function calling for now)
      const systemMessage = messages.find(m => m.role === 'system')?.content || ''
      const userMessages = messages.filter(m => m.role !== 'system')

      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model || 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          temperature: 0.7,
          system: systemMessage,
          messages: userMessages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content
          }))
        })
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('Anthropic API error:', error)
        throw new Error('Anthropic API error')
      }

      const data = await response.json()
      content = data.content?.[0]?.text || 'Sorry, I had trouble processing that.'

      return NextResponse.json({
        message: content,
        provider: 'anthropic',
        model: model || 'claude-3-5-sonnet-20241022'
      })
    }

    // Fallback
    return NextResponse.json({
      message: "I'm having trouble connecting to AI services. Try again in a moment!",
      provider: 'fallback'
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      {
        message: "I'm having trouble connecting right now. Try asking me something else!",
        provider: 'fallback'
      },
      { status: 200 }
    )
  }
}
