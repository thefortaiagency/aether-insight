import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/matches/live - Create or update a live match
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // If match_id exists, update; otherwise create
    if (body.match_id) {
      // Update existing match
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .update({
          final_score_for: body.wrestler1_score,
          final_score_against: body.wrestler2_score,
          match_duration: body.match_time,
          period1_score_for: body.period_scores?.period1?.wrestler1 || 0,
          period1_score_against: body.period_scores?.period1?.wrestler2 || 0,
          period2_score_for: body.period_scores?.period2?.wrestler1 || 0,
          period2_score_against: body.period_scores?.period2?.wrestler2 || 0,
          period3_score_for: body.period_scores?.period3?.wrestler1 || 0,
          period3_score_against: body.period_scores?.period3?.wrestler2 || 0,
          overtime_score_for: body.period_scores?.overtime?.wrestler1 || 0,
          overtime_score_against: body.period_scores?.overtime?.wrestler2 || 0,
          riding_time_for: body.wrestler1_riding_time || 0,
          riding_time_against: body.wrestler2_riding_time || 0,
          result: body.result,
          win_type: body.win_type,
          pin_time: body.pin_time
        })
        .eq('id', body.match_id)
        .select()
        .single()

      if (matchError) {
        console.error('Error updating live match:', matchError)
        return NextResponse.json({ error: matchError.message }, { status: 500 })
      }

      // Update statistics
      if (body.wrestler1_stats) {
        await updateMatchStatistics(body.match_id, body.wrestler1_id, body.wrestler1_name, body.wrestler1_stats)
      }
      
      if (body.wrestler2_stats) {
        await updateMatchStatistics(body.match_id, body.wrestler2_id, body.wrestler2_name, body.wrestler2_stats)
      }

      // Broadcast update via Supabase Realtime
      await supabase
        .from('match_updates')
        .insert({
          match_id: body.match_id,
          update_type: 'score_update',
          data: {
            wrestler1_score: body.wrestler1_score,
            wrestler2_score: body.wrestler2_score,
            period: body.current_period,
            match_time: body.match_time
          }
        })

      return NextResponse.json({ 
        success: true, 
        data: match,
        message: 'Live match updated'
      })
    } else {
      // Create new match
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
          wrestler_id: body.wrestler1_id || null,
          opponent_wrestler_id: body.wrestler2_id || null,
          wrestler_name: body.wrestler1_name,
          opponent_name: body.wrestler2_name,
          wrestler_team: body.wrestler1_team,
          opponent_team: body.wrestler2_team,
          match_date: new Date().toISOString(),
          match_type: body.match_type || 'dual',
          weight_class: body.weight_class,
          mat_number: body.mat_number,
          referee_name: body.referee_name,
          final_score_for: 0,
          final_score_against: 0,
          status: 'in_progress'
        })
        .select()
        .single()

      if (matchError) {
        console.error('Error creating live match:', matchError)
        return NextResponse.json({ error: matchError.message }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        data: match,
        message: 'Live match created'
      })
    }
  } catch (error) {
    console.error('Error in POST /api/matches/live:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to update match statistics
async function updateMatchStatistics(
  matchId: string, 
  wrestlerId: string | null, 
  wrestlerName: string,
  stats: any
) {
  // Check if statistics exist
  const { data: existingStats } = await supabase
    .from('match_statistics')
    .select('id')
    .eq('match_id', matchId)
    .eq('wrestler_name', wrestlerName)
    .single()

  const statsData = {
    match_id: matchId,
    wrestler_id: wrestlerId,
    wrestler_name: wrestlerName,
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
    await supabase
      .from('match_statistics')
      .update(statsData)
      .eq('id', existingStats.id)
  } else {
    await supabase
      .from('match_statistics')
      .insert(statsData)
  }
}

// POST /api/matches/live/event - Add a scoring event
export async function POST_EVENT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { data: event, error } = await supabase
      .from('match_events')
      .insert({
        match_id: body.match_id,
        event_time: body.event_time,
        period: body.period,
        event_type: body.event_type,
        points_scored: body.points || 0,
        wrestler_id: body.wrestler_id,
        wrestler_name: body.wrestler_name,
        move_name: body.move_name,
        move_category: body.move_category,
        from_position: body.from_position,
        to_position: body.to_position,
        success: true,
        notes: body.notes
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding match event:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Broadcast event via Supabase Realtime
    await supabase
      .from('match_updates')
      .insert({
        match_id: body.match_id,
        update_type: 'scoring_event',
        data: event
      })

    return NextResponse.json({ 
      success: true, 
      data: event,
      message: 'Match event added'
    })
  } catch (error) {
    console.error('Error in POST /api/matches/live/event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}