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

    let response: Response
    let content: string

    if (useProvider === 'openai' && openaiKey) {
      // Call OpenAI API with function calling
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: messages,
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
