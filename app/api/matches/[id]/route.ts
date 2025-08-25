import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/matches/[id] - Get a single match
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase
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
        ),
        match_statistics (
          *
        ),
        match_events (
          *
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching match:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in GET /api/matches/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/matches/[id] - Update a match
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Update the match
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .update({
        wrestler_id: body.wrestler_id,
        opponent_wrestler_id: body.opponent_wrestler_id,
        opponent_name: body.opponent_name,
        opponent_team: body.opponent_team,
        match_date: body.match_date,
        match_type: body.match_type,
        weight_class: body.weight_class,
        mat_number: body.mat_number,
        referee_name: body.referee_name,
        event_id: body.event_id,
        result: body.result,
        win_type: body.win_type,
        period1_score_for: body.period1_score_for,
        period1_score_against: body.period1_score_against,
        period2_score_for: body.period2_score_for,
        period2_score_against: body.period2_score_against,
        period3_score_for: body.period3_score_for,
        period3_score_against: body.period3_score_against,
        overtime_score_for: body.overtime_score_for,
        overtime_score_against: body.overtime_score_against,
        final_score_for: body.final_score_for,
        final_score_against: body.final_score_against,
        match_duration: body.match_duration,
        pin_time: body.pin_time,
        riding_time_for: body.riding_time_for,
        riding_time_against: body.riding_time_against,
        video_url: body.video_url,
        coach_notes: body.coach_notes
      })
      .eq('id', id)
      .select()
      .single()

    if (matchError) {
      console.error('Error updating match:', matchError)
      return NextResponse.json({ error: matchError.message }, { status: 500 })
    }

    // Update statistics if provided
    if (body.statistics) {
      // Check if statistics exist
      const { data: existingStats } = await supabase
        .from('match_statistics')
        .select('id')
        .eq('match_id', id)
        .eq('wrestler_id', body.wrestler_id)
        .single()

      const stats = body.statistics
      const statsData = {
        match_id: id,
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
      }

      if (existingStats) {
        // Update existing statistics
        const { error: statsError } = await supabase
          .from('match_statistics')
          .update(statsData)
          .eq('id', existingStats.id)
      } else {
        // Insert new statistics
        const { error: statsError } = await supabase
          .from('match_statistics')
          .insert(statsData)
      }
    }

    // Update opponent statistics if provided
    if (body.opponent_statistics && body.opponent_wrestler_id) {
      const { data: existingOppStats } = await supabase
        .from('match_statistics')
        .select('id')
        .eq('match_id', id)
        .eq('wrestler_id', body.opponent_wrestler_id)
        .single()

      const oppStats = body.opponent_statistics
      const oppStatsData = {
        match_id: id,
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
      }

      if (existingOppStats) {
        const { error: oppStatsError } = await supabase
          .from('match_statistics')
          .update(oppStatsData)
          .eq('id', existingOppStats.id)
      } else {
        const { error: oppStatsError } = await supabase
          .from('match_statistics')
          .insert(oppStatsData)
      }
    }

    // Add new events if provided
    if (body.new_events && body.new_events.length > 0) {
      const events = body.new_events.map((event: any) => ({
        match_id: id,
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
        console.error('Error adding match events:', eventsError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: match,
      message: 'Match updated successfully'
    })
  } catch (error) {
    console.error('Error in PATCH /api/matches/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/matches/[id] - Delete a match
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Delete match (cascade will handle related records)
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting match:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Match deleted successfully'
    })
  } catch (error) {
    console.error('Error in DELETE /api/matches/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}