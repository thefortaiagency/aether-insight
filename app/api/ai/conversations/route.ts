import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// GET - Load conversation and messages
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')
    const conversationId = searchParams.get('conversationId')

    if (!teamId) {
      return NextResponse.json({ error: 'teamId required' }, { status: 400 })
    }

    // If specific conversation requested
    if (conversationId) {
      const { data: messages, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return NextResponse.json({ messages })
    }

    // Get active conversation or create one
    const { data: conversation, error: convError } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('team_id', teamId)
      .eq('is_active', true)
      .order('last_message_at', { ascending: false })
      .limit(1)
      .single()

    if (convError && convError.code !== 'PGRST116') { // PGRST116 = no rows
      throw convError
    }

    // If no active conversation, create one
    let activeConversation = conversation
    if (!activeConversation) {
      const { data: newConv, error: createError } = await supabase
        .from('ai_conversations')
        .insert({ team_id: teamId, is_active: true })
        .select()
        .single()

      if (createError) throw createError
      activeConversation = newConv
    }

    // Load messages for this conversation
    const { data: messages, error: msgError } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', activeConversation.id)
      .order('created_at', { ascending: true })

    if (msgError) throw msgError

    return NextResponse.json({
      conversation: activeConversation,
      messages: messages || []
    })
  } catch (error: any) {
    console.error('Error loading conversation:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Save a message to conversation
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { teamId, conversationId, message } = body

    if (!teamId || !message) {
      return NextResponse.json({ error: 'teamId and message required' }, { status: 400 })
    }

    // Get or create active conversation
    let convId = conversationId
    if (!convId) {
      const { data: conv } = await supabase
        .from('ai_conversations')
        .select('id')
        .eq('team_id', teamId)
        .eq('is_active', true)
        .order('last_message_at', { ascending: false })
        .limit(1)
        .single()

      if (conv) {
        convId = conv.id
      } else {
        // Create new conversation
        const { data: newConv, error } = await supabase
          .from('ai_conversations')
          .insert({ team_id: teamId, is_active: true })
          .select()
          .single()

        if (error) throw error
        convId = newConv.id
      }
    }

    // Insert the message
    const { data: savedMessage, error: msgError } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: convId,
        role: message.role,
        content: message.content,
        action_name: message.actionName || null,
        action_params: message.actionParams || null,
        action_result: message.actionResult || null,
        action_success: message.actionResult?.success ?? null,
      })
      .select()
      .single()

    if (msgError) throw msgError

    // Update conversation last_message_at
    await supabase
      .from('ai_conversations')
      .update({
        last_message_at: new Date().toISOString(),
      })
      .eq('id', convId)

    // Auto-generate title from first user message if not set
    if (message.role === 'user') {
      const { data: conv } = await supabase
        .from('ai_conversations')
        .select('title, message_count')
        .eq('id', convId)
        .single()

      if (conv && !conv.title) {
        // Use first 50 chars of first message as title
        const title = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '')
        await supabase
          .from('ai_conversations')
          .update({ title })
          .eq('id', convId)
      }
    }

    return NextResponse.json({
      success: true,
      conversationId: convId,
      message: savedMessage
    })
  } catch (error: any) {
    console.error('Error saving message:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Archive/end a conversation (start fresh)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')
    const conversationId = searchParams.get('conversationId')

    if (!teamId) {
      return NextResponse.json({ error: 'teamId required' }, { status: 400 })
    }

    if (conversationId) {
      // Archive specific conversation
      await supabase
        .from('ai_conversations')
        .update({ is_active: false, archived: true })
        .eq('id', conversationId)
    } else {
      // Archive all active conversations for this team (start fresh)
      await supabase
        .from('ai_conversations')
        .update({ is_active: false })
        .eq('team_id', teamId)
        .eq('is_active', true)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error archiving conversation:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
