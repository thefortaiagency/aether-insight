import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const matchId = params.id
    const body = await request.json()
    
    const {
      winner_id,
      winner_name,
      win_type,
      final_score,
      pin_time,
      period_ended,
      wrestler1_score,
      wrestler2_score,
      wrestler1_stats,
      wrestler2_stats
    } = body

    // Update match as completed
    const { data, error } = await supabase
      .from('matches')
      .update({
        status: 'completed',
        winner_id,
        winner_name,
        win_type,
        pin_time,
        period_ended,
        wrestler1_score,
        wrestler2_score,
        wrestler1_takedowns: wrestler1_stats?.takedowns || 0,
        wrestler1_escapes: wrestler1_stats?.escapes || 0,
        wrestler1_reversals: wrestler1_stats?.reversals || 0,
        wrestler1_near_fall_2: wrestler1_stats?.near_fall_2 || 0,
        wrestler1_near_fall_3: wrestler1_stats?.near_fall_3 || 0,
        wrestler1_near_fall_4: wrestler1_stats?.near_fall_4 || 0,
        wrestler1_stalls: wrestler1_stats?.stalls || 0,
        wrestler1_cautions: wrestler1_stats?.cautions || 0,
        wrestler1_warnings: wrestler1_stats?.warnings || 0,
        wrestler1_riding_time: wrestler1_stats?.riding_time || 0,
        wrestler2_takedowns: wrestler2_stats?.takedowns || 0,
        wrestler2_escapes: wrestler2_stats?.escapes || 0,
        wrestler2_reversals: wrestler2_stats?.reversals || 0,
        wrestler2_near_fall_2: wrestler2_stats?.near_fall_2 || 0,
        wrestler2_near_fall_3: wrestler2_stats?.near_fall_3 || 0,
        wrestler2_near_fall_4: wrestler2_stats?.near_fall_4 || 0,
        wrestler2_stalls: wrestler2_stats?.stalls || 0,
        wrestler2_cautions: wrestler2_stats?.cautions || 0,
        wrestler2_warnings: wrestler2_stats?.warnings || 0,
        wrestler2_riding_time: wrestler2_stats?.riding_time || 0,
        completed_at: new Date().toISOString()
      })
      .eq('id', matchId)
      .select()
      .single()

    if (error) {
      console.error('Error completing match:', error)
      return NextResponse.json(
        { error: 'Failed to complete match' },
        { status: 500 }
      )
    }

    // Update wrestler records if we have wrestler IDs
    if (data.wrestler1_id) {
      await updateWrestlerRecord(data.wrestler1_id, data.wrestler1_id === winner_id, win_type)
    }
    if (data.wrestler2_id) {
      await updateWrestlerRecord(data.wrestler2_id, data.wrestler2_id === winner_id, win_type)
    }

    return NextResponse.json({ 
      success: true,
      data 
    })

  } catch (error) {
    console.error('Complete match error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

async function updateWrestlerRecord(wrestlerId: string, isWinner: boolean, winType: string) {
  const { data: wrestler } = await supabase
    .from('wrestlers')
    .select('wins, losses, pins, tech_falls, major_decisions, decisions')
    .eq('id', wrestlerId)
    .single()

  if (!wrestler) return

  const updates: any = {}
  
  if (isWinner) {
    updates.wins = (wrestler.wins || 0) + 1
    
    switch(winType) {
      case 'pin':
        updates.pins = (wrestler.pins || 0) + 1
        break
      case 'tech_fall':
        updates.tech_falls = (wrestler.tech_falls || 0) + 1
        break
      case 'major_decision':
        updates.major_decisions = (wrestler.major_decisions || 0) + 1
        break
      case 'decision':
        updates.decisions = (wrestler.decisions || 0) + 1
        break
    }
  } else {
    updates.losses = (wrestler.losses || 0) + 1
  }

  await supabase
    .from('wrestlers')
    .update(updates)
    .eq('id', wrestlerId)
}