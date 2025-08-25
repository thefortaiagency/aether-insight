import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const match = await request.json()
    
    // Validate required fields
    if (!match.wrestler1_name || !match.wrestler2_name || !match.weight_class) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate weight class
    const validWeights = [106, 113, 120, 126, 132, 138, 145, 152, 160, 170, 182, 195, 220, 285]
    if (!validWeights.includes(parseInt(match.weight_class))) {
      return NextResponse.json(
        { error: 'Invalid weight class' },
        { status: 400 }
      )
    }

    // Check if wrestlers exist and create if needed
    let wrestler1_id = null
    let wrestler2_id = null

    // Try to find wrestler 1
    const { data: wrestler1Data } = await supabase
      .from('wrestlers')
      .select('id')
      .eq('name', match.wrestler1_name)
      .eq('team', match.wrestler1_team || '')
      .single()

    if (wrestler1Data) {
      wrestler1_id = wrestler1Data.id
    } else {
      // Create wrestler 1
      const { data: newWrestler1 } = await supabase
        .from('wrestlers')
        .insert({
          name: match.wrestler1_name,
          team: match.wrestler1_team || 'Unknown',
          weight_class: match.weight_class
        })
        .select()
        .single()
      
      if (newWrestler1) {
        wrestler1_id = newWrestler1.id
      }
    }

    // Try to find wrestler 2
    const { data: wrestler2Data } = await supabase
      .from('wrestlers')
      .select('id')
      .eq('name', match.wrestler2_name)
      .eq('team', match.wrestler2_team || '')
      .single()

    if (wrestler2Data) {
      wrestler2_id = wrestler2Data.id
    } else {
      // Create wrestler 2
      const { data: newWrestler2 } = await supabase
        .from('wrestlers')
        .insert({
          name: match.wrestler2_name,
          team: match.wrestler2_team || 'Unknown',
          weight_class: match.weight_class
        })
        .select()
        .single()
      
      if (newWrestler2) {
        wrestler2_id = newWrestler2.id
      }
    }

    // Determine winner ID
    let winner_id = null
    if (match.winner) {
      if (match.winner === match.wrestler1_name) {
        winner_id = wrestler1_id
      } else if (match.winner === match.wrestler2_name) {
        winner_id = wrestler2_id
      }
    }

    // Create the match record
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .insert({
        date: match.date || new Date().toISOString(),
        wrestler1_id,
        wrestler2_id,
        wrestler1_name: match.wrestler1_name,
        wrestler1_team: match.wrestler1_team || 'Unknown',
        wrestler1_score: match.wrestler1_score || 0,
        wrestler2_name: match.wrestler2_name,
        wrestler2_team: match.wrestler2_team || 'Unknown',
        wrestler2_score: match.wrestler2_score || 0,
        weight_class: match.weight_class,
        match_type: match.match_type || 'dual',
        winner_id,
        win_type: match.win_type || 'decision',
        period_ended: match.period || 3,
        final_time: match.final_time || '6:00',
        status: 'completed',
        imported: true // Flag to indicate this was imported
      })
      .select()
      .single()

    if (matchError) {
      console.error('Match creation error:', matchError)
      return NextResponse.json(
        { error: 'Failed to create match' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      data: matchData 
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Server error during import' },
      { status: 500 }
    )
  }
}