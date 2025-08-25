import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/matches - Get all matches or filter by query params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wrestlerId = searchParams.get('wrestler_id')
    const teamId = searchParams.get('team_id')
    const date = searchParams.get('date')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('matches')
      .select(`
        *,
        wrestler:wrestlers!wrestler_id (
          id,
          first_name,
          last_name,
          weight_class,
          team:teams (
            id,
            name
          )
        ),
        opponent:wrestlers!opponent_wrestler_id (
          id,
          first_name,
          last_name,
          team:teams (
            id,
            name
          )
        )
      `)
      .order('match_date', { ascending: false })
      .limit(limit)

    if (wrestlerId) {
      query = query.or(`wrestler_id.eq.${wrestlerId},opponent_wrestler_id.eq.${wrestlerId}`)
    }

    if (teamId) {
      // This would need a join through wrestlers table
      query = query.eq('wrestler.team_id', teamId)
    }

    if (date) {
      query = query.eq('match_date', date)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching matches:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in GET /api/matches:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/matches - Create a new match
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Start a transaction by creating the match first
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert({
        wrestler_id: body.wrestler_id || null,
        opponent_wrestler_id: body.opponent_wrestler_id || null,
        opponent_name: body.opponent_name,
        opponent_team: body.opponent_team,
        match_date: body.match_date || new Date().toISOString(),
        match_type: body.match_type || 'dual',
        weight_class: body.weight_class,
        mat_number: body.mat_number,
        referee_name: body.referee_name,
        event_id: body.event_id || null,
        result: body.result, // 'win', 'loss', 'draw'
        win_type: body.win_type, // 'pin', 'tech_fall', 'major_decision', 'decision', etc
        period1_score_for: body.period1_score_for || 0,
        period1_score_against: body.period1_score_against || 0,
        period2_score_for: body.period2_score_for || 0,
        period2_score_against: body.period2_score_against || 0,
        period3_score_for: body.period3_score_for || 0,
        period3_score_against: body.period3_score_against || 0,
        overtime_score_for: body.overtime_score_for || 0,
        overtime_score_against: body.overtime_score_against || 0,
        final_score_for: body.final_score_for,
        final_score_against: body.final_score_against,
        match_duration: body.match_duration,
        pin_time: body.pin_time,
        riding_time_for: body.riding_time_for,
        riding_time_against: body.riding_time_against,
        video_url: body.video_url,
        coach_notes: body.coach_notes
      })
      .select()
      .single()

    if (matchError) {
      console.error('Error creating match:', matchError)
      return NextResponse.json({ error: matchError.message }, { status: 500 })
    }

    // If we have match statistics, create those too
    if (body.statistics && match) {
      const stats = body.statistics
      const { error: statsError } = await supabase
        .from('match_statistics')
        .insert({
          match_id: match.id,
          wrestler_id: body.wrestler_id,
          wrestler_name: body.wrestler_name,
          takedowns: stats.takedowns || 0,
          escapes: stats.escapes || 0,
          reversals: stats.reversals || 0,
          near_fall_2: stats.near_fall_2 || 0,
          near_fall_3: stats.near_fall_3 || 0,
          near_fall_4: stats.near_fall_4 || 0,
          stalls: stats.stalls || 0,
          cautions: stats.cautions || 0,
          warnings: stats.warnings || 0,
          penalties: stats.penalties || 0,
          riding_time: stats.riding_time || 0,
          riding_time_point: stats.riding_time_point || false,
          blood_time: stats.blood_time || 0,
          injury_time: stats.injury_time || 0
        })

      if (statsError) {
        console.error('Error creating match statistics:', statsError)
        // Don't fail the whole request if stats fail
      }

      // Also save opponent statistics if provided
      if (body.opponent_statistics) {
        const oppStats = body.opponent_statistics
        const { error: oppStatsError } = await supabase
          .from('match_statistics')
          .insert({
            match_id: match.id,
            wrestler_id: body.opponent_wrestler_id,
            wrestler_name: body.opponent_name,
            takedowns: oppStats.takedowns || 0,
            escapes: oppStats.escapes || 0,
            reversals: oppStats.reversals || 0,
            near_fall_2: oppStats.near_fall_2 || 0,
            near_fall_3: oppStats.near_fall_3 || 0,
            near_fall_4: oppStats.near_fall_4 || 0,
            stalls: oppStats.stalls || 0,
            cautions: oppStats.cautions || 0,
            warnings: oppStats.warnings || 0,
            penalties: oppStats.penalties || 0,
            riding_time: oppStats.riding_time || 0,
            riding_time_point: oppStats.riding_time_point || false,
            blood_time: oppStats.blood_time || 0,
            injury_time: oppStats.injury_time || 0
          })

        if (oppStatsError) {
          console.error('Error creating opponent statistics:', oppStatsError)
        }
      }
    }

    // If we have match events (move-by-move), save those
    if (body.events && body.events.length > 0 && match) {
      const events = body.events.map((event: any) => ({
        match_id: match.id,
        event_time: event.event_time,
        period: event.period,
        event_type: event.event_type,
        points_scored: event.points_scored || 0,
        wrestler_id: event.wrestler_id,
        wrestler_name: event.wrestler_name,
        move_name: event.move_name,
        move_category: event.move_category,
        from_position: event.from_position,
        to_position: event.to_position,
        success: event.success !== false,
        notes: event.notes
      }))

      const { error: eventsError } = await supabase
        .from('match_events')
        .insert(events)

      if (eventsError) {
        console.error('Error creating match events:', eventsError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: match,
      message: 'Match created successfully'
    })
  } catch (error) {
    console.error('Error in POST /api/matches:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}