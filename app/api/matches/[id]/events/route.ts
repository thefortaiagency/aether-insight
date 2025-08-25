import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const matchId = params.id

    const { data, error } = await supabase
      .from('match_events')
      .select('*')
      .eq('match_id', matchId)
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('Error fetching events:', error)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      data: data || []
    })

  } catch (error) {
    console.error('Get events error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const matchId = params.id
    const body = await request.json()
    
    const {
      wrestler_id,
      wrestler_name,
      action_type,
      points,
      period,
      time_remaining,
      notes
    } = body

    const { data, error } = await supabase
      .from('match_events')
      .insert({
        match_id: matchId,
        wrestler_id,
        wrestler_name,
        action_type,
        points: points || 0,
        period,
        time_remaining,
        notes,
        timestamp: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      )
    }

    // Broadcast the event via Realtime
    await supabase
      .channel('match-events')
      .send({
        type: 'broadcast',
        event: 'new-event',
        payload: {
          match_id: matchId,
          event: data
        }
      })

    return NextResponse.json({ 
      success: true,
      data 
    })

  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const matchId = params.id
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('match_events')
      .delete()
      .eq('id', eventId)
      .eq('match_id', matchId)

    if (error) {
      console.error('Error deleting event:', error)
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true 
    })

  } catch (error) {
    console.error('Delete event error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}