import { NextResponse } from 'next/server'

// Supported providers (same as NEXUS extension)
type Provider = 'anthropic' | 'openai'

interface ChatRequest {
  messages: Array<{ role: string; content: string }>
  provider?: Provider
  model?: string
}

export async function POST(request: Request) {
  try {
    const { messages, provider = 'anthropic', model } = await request.json() as ChatRequest

    // Try Anthropic first (preferred), then OpenAI
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY

    // Determine which provider to use
    let useProvider = provider
    if (provider === 'anthropic' && !anthropicKey) {
      useProvider = openaiKey ? 'openai' : 'anthropic'
    } else if (provider === 'openai' && !openaiKey) {
      useProvider = anthropicKey ? 'anthropic' : 'openai'
    }

    // No API keys available
    if (!anthropicKey && !openaiKey) {
      return NextResponse.json({
        message: "I'm running in offline mode. I can still help with general wrestling questions using my built-in knowledge!",
        provider: 'fallback'
      })
    }

    let response: Response
    let content: string

    if (useProvider === 'anthropic' && anthropicKey) {
      // Call Anthropic Claude API (same as extension)
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

    } else if (openaiKey) {
      // Call OpenAI API (same as extension)
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
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('OpenAI API error:', error)
        throw new Error('OpenAI API error')
      }

      const data = await response.json()
      content = data.choices?.[0]?.message?.content || 'Sorry, I had trouble processing that.'

      return NextResponse.json({
        message: content,
        provider: 'openai',
        model: model || 'gpt-4o-mini'
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
