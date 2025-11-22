import { NextResponse } from 'next/server'
import { getOpenAITools, getTool, requiresConfirmation } from '@/lib/ai/tools'
import { executeAction } from '@/lib/ai/executor'

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

    // Enhanced system prompt for intelligent data parsing
    const smartSystemPrompt = `You are Mat Ops AI, an intelligent wrestling team management assistant. You help coaches manage their wrestling program - roster, events, practices, stats, and more.

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
