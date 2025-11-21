import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      // Return a helpful fallback response if no API key
      return NextResponse.json({
        message: "I'm running in offline mode right now. I can still help with general wrestling questions! What would you like to know?",
      })
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      throw new Error('OpenAI API error')
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || 'Sorry, I had trouble processing that.'

    return NextResponse.json({ message: content })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { message: "I'm having trouble connecting right now. Try asking me something else!" },
      { status: 200 } // Return 200 so client uses fallback gracefully
    )
  }
}
