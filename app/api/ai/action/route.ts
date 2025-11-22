// API Route for AI Actions
// POST /api/ai/action - Execute an AI tool action

import { NextRequest, NextResponse } from 'next/server'
import { executeAction } from '@/lib/ai/executor'
import { getTool } from '@/lib/ai/tools'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teamId, action, params, confirmed } = body

    if (!teamId) {
      return NextResponse.json(
        { success: false, message: 'Team ID is required' },
        { status: 400 }
      )
    }

    if (!action) {
      return NextResponse.json(
        { success: false, message: 'Action name is required' },
        { status: 400 }
      )
    }

    // Validate action exists
    const tool = getTool(action)
    if (!tool) {
      return NextResponse.json(
        { success: false, message: `Unknown action: ${action}` },
        { status: 400 }
      )
    }

    // Execute the action
    const result = await executeAction(teamId, action, params || {}, confirmed || false)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('AI Action error:', error)
    return NextResponse.json(
      { success: false, message: `Server error: ${error.message}` },
      { status: 500 }
    )
  }
}

// GET /api/ai/action - List available actions
export async function GET() {
  const { AI_TOOLS } = await import('@/lib/ai/tools')

  const tools = AI_TOOLS.map(tool => ({
    name: tool.name,
    description: tool.description,
    category: tool.category,
    dangerous: tool.dangerous,
    parameters: tool.parameters,
  }))

  return NextResponse.json({
    success: true,
    tools,
    categories: ['wrestlers', 'events', 'practices', 'weight', 'matches', 'query'],
  })
}
