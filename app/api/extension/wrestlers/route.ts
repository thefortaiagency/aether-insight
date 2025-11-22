import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client for API routes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - Fetch wrestlers for a team with calculated stats from matches
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')

    if (!teamId) {
      return NextResponse.json({ error: 'teamId required' }, { status: 400 })
    }

    // Get wrestlers
    const { data: wrestlers, error } = await supabase
      .from('wrestlers')
      .select('*')
      .eq('team_id', teamId)
      .order('weight_class', { ascending: true })

    if (error) throw error
    if (!wrestlers || wrestlers.length === 0) {
      return NextResponse.json({ wrestlers: [] })
    }

    // Get all matches for these wrestlers to calculate real stats
    const wrestlerIds = wrestlers.map((w: any) => w.id)
    const { data: matches } = await supabase
      .from('matches')
      .select('wrestler_id, result, win_type, takedowns_for, escapes_for, reversals_for, nearfall_2_for, nearfall_3_for, nearfall_4_for')
      .in('wrestler_id', wrestlerIds)

    const matchList = matches || []

    // Calculate stats for each wrestler from matches
    const wrestlersWithStats = wrestlers.map((w: any) => {
      const wMatches = matchList.filter((m: any) => m.wrestler_id === w.id)
      const wins = wMatches.filter((m: any) => m.result === 'win').length
      const losses = wMatches.filter((m: any) => m.result === 'loss').length
      const pins = wMatches.filter((m: any) =>
        m.result === 'win' && (m.win_type === 'pin' || m.win_type === 'fall' || m.win_type === 'Pin' || m.win_type === 'Fall')
      ).length
      const techFalls = wMatches.filter((m: any) =>
        m.result === 'win' && (m.win_type === 'tech_fall' || m.win_type === 'Tech Fall' || m.win_type === 'TF')
      ).length
      const majors = wMatches.filter((m: any) =>
        m.result === 'win' && (m.win_type === 'major' || m.win_type === 'Major Decision' || m.win_type === 'MD')
      ).length
      const decisions = wMatches.filter((m: any) =>
        m.result === 'win' && (m.win_type === 'decision' || m.win_type === 'Decision' || !m.win_type)
      ).length
      const takedowns = wMatches.reduce((sum: number, m: any) => sum + (m.takedowns_for || 0), 0)
      const escapes = wMatches.reduce((sum: number, m: any) => sum + (m.escapes_for || 0), 0)
      const reversals = wMatches.reduce((sum: number, m: any) => sum + (m.reversals_for || 0), 0)
      const nearfalls = wMatches.reduce((sum: number, m: any) =>
        sum + (m.nearfall_2_for || 0) + (m.nearfall_3_for || 0) + (m.nearfall_4_for || 0), 0)

      return {
        ...w,
        // Override with calculated stats
        wins,
        losses,
        pins,
        tech_falls: techFalls,
        major_decisions: majors,
        decisions,
        takedowns,
        escapes,
        reversals,
        nearfalls,
        matchCount: wMatches.length
      }
    })

    return NextResponse.json({ wrestlers: wrestlersWithStats })
  } catch (error) {
    console.error('Error fetching wrestlers:', error)
    return NextResponse.json({ error: 'Failed to fetch wrestlers' }, { status: 500 })
  }
}

// PATCH - Update a wrestler's stats (for extension agentic actions)
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { wrestlerId, updates } = body

    if (!wrestlerId || !updates) {
      return NextResponse.json({ error: 'wrestlerId and updates required' }, { status: 400 })
    }

    // Whitelist allowed fields for security
    const allowedFields = [
      'first_name', 'last_name', 'grade', 'weight_class', 'actual_weight',
      'wins', 'losses', 'pins', 'tech_falls', 'major_decisions', 'decisions',
      'takedowns', 'escapes', 'reversals', 'near_fall_2', 'near_fall_3', 'near_fall_4',
      'team_points', 'forfeits_won', 'forfeits_lost'
    ]

    const sanitizedUpdates: Record<string, any> = {}
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        sanitizedUpdates[key] = value
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('wrestlers')
      .update(sanitizedUpdates)
      .eq('id', wrestlerId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      wrestler: data,
      message: `Updated ${Object.keys(sanitizedUpdates).join(', ')} for wrestler`
    })
  } catch (error) {
    console.error('Error updating wrestler:', error)
    return NextResponse.json({ error: 'Failed to update wrestler' }, { status: 500 })
  }
}

// POST - Add a match result (updates wrestler stats atomically)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { wrestlerId, matchResult } = body

    if (!wrestlerId || !matchResult) {
      return NextResponse.json({ error: 'wrestlerId and matchResult required' }, { status: 400 })
    }

    // Get current wrestler stats
    const { data: wrestler, error: fetchError } = await supabase
      .from('wrestlers')
      .select('*')
      .eq('id', wrestlerId)
      .single()

    if (fetchError || !wrestler) {
      return NextResponse.json({ error: 'Wrestler not found' }, { status: 404 })
    }

    // Build updates based on match result
    const updates: Record<string, number> = {}

    // Win/Loss
    if (matchResult.won) {
      updates.wins = (wrestler.wins || 0) + 1

      // Win type
      if (matchResult.winType === 'pin') {
        updates.pins = (wrestler.pins || 0) + 1
      } else if (matchResult.winType === 'tech_fall') {
        updates.tech_falls = (wrestler.tech_falls || 0) + 1
      } else if (matchResult.winType === 'major') {
        updates.major_decisions = (wrestler.major_decisions || 0) + 1
      } else if (matchResult.winType === 'decision') {
        updates.decisions = (wrestler.decisions || 0) + 1
      } else if (matchResult.winType === 'forfeit') {
        updates.forfeits_won = (wrestler.forfeits_won || 0) + 1
      }

      // Team points (standard dual meet scoring)
      if (matchResult.teamPoints) {
        updates.team_points = (wrestler.team_points || 0) + matchResult.teamPoints
      }
    } else {
      updates.losses = (wrestler.losses || 0) + 1
      if (matchResult.winType === 'forfeit') {
        updates.forfeits_lost = (wrestler.forfeits_lost || 0) + 1
      }
    }

    // Individual stats from match
    if (matchResult.takedowns) {
      updates.takedowns = (wrestler.takedowns || 0) + matchResult.takedowns
    }
    if (matchResult.escapes) {
      updates.escapes = (wrestler.escapes || 0) + matchResult.escapes
    }
    if (matchResult.reversals) {
      updates.reversals = (wrestler.reversals || 0) + matchResult.reversals
    }
    if (matchResult.nearFall2) {
      updates.near_fall_2 = (wrestler.near_fall_2 || 0) + matchResult.nearFall2
    }
    if (matchResult.nearFall3) {
      updates.near_fall_3 = (wrestler.near_fall_3 || 0) + matchResult.nearFall3
    }

    // Apply updates
    const { data, error } = await supabase
      .from('wrestlers')
      .update(updates)
      .eq('id', wrestlerId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      wrestler: data,
      message: `Recorded ${matchResult.won ? 'WIN' : 'LOSS'} for ${wrestler.first_name} ${wrestler.last_name}`,
      updates
    })
  } catch (error) {
    console.error('Error recording match:', error)
    return NextResponse.json({ error: 'Failed to record match' }, { status: 500 })
  }
}
