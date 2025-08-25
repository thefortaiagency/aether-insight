import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Insert into match_events table
    const { data: eventData, error } = await supabaseAdmin
      .from('match_events')
      .insert({
        match_id: data.match_id,
        timestamp: data.timestamp || Date.now(),
        video_timestamp: data.video_timestamp || 0,
        event_type: data.event_type,
        wrestler_id: data.wrestler_id,
        wrestler_name: data.wrestler_name,
        points: data.points || 0,
        description: data.description,
        period: data.period || 1,
        event_time: data.event_time,
        move_name: data.move_name || data.event_type,
        from_position: data.from_position
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving match event:', error)
      // If match_events table doesn't exist, just log and continue
      if (error.code === '42P01') {
        console.log('match_events table does not exist yet. Run the migration script.')
        return NextResponse.json({ 
          warning: 'Event not saved - database table pending creation',
          data: null 
        })
      }
      throw error
    }

    // Also update the match to indicate it has events
    if (data.match_id) {
      await supabaseAdmin
        .from('matches')
        .update({ 
          has_video: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.match_id)
    }

    return NextResponse.json({ 
      success: true,
      data: eventData 
    })
  } catch (error) {
    console.error('Error in match event API:', error)
    return NextResponse.json(
      { error: 'Failed to save match event' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get('match_id')

    if (!matchId) {
      return NextResponse.json(
        { error: 'Match ID is required' },
        { status: 400 }
      )
    }

    // Get all events for a match
    const { data, error } = await supabaseAdmin
      .from('match_events')
      .select('*')
      .eq('match_id', matchId)
      .order('timestamp', { ascending: true })

    if (error) {
      // If table doesn't exist, return empty array
      if (error.code === '42P01') {
        return NextResponse.json({ 
          data: [],
          warning: 'match_events table does not exist yet'
        })
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching match events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch match events' },
      { status: 500 }
    )
  }
}