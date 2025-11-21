import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface WrestlerData {
  usabId?: string
  firstName: string
  lastName: string
  weightClass: number
  grade?: number
  wins: number
  losses: number
  draws?: number
  pins: number
  techFalls?: number
  majorDecisions?: number
  matches?: MatchData[]
}

interface MatchData {
  usabMatchId?: string
  date: string
  opponent: string
  opponentTeam?: string
  result: 'Win' | 'Loss' | 'Draw'
  winType?: string
  wrestlerScore: number
  opponentScore: number
  weightClass: number
  eventName?: string
  round?: string
  // Detailed stats
  takedowns?: number
  escapes?: number
  reversals?: number
  nearfall2?: number
  nearfall3?: number
  nearfall4?: number
  penalties?: number
  ridingTime?: number
}

// POST /api/matops/sync
export async function POST(request: NextRequest) {
  const syncStartTime = Date.now()

  try {
    const body = await request.json()

    console.log('[Mat Ops Sync] Received sync request:', {
      source: body.source,
      wrestlerCount: body.wrestlers?.length || 0,
      timestamp: new Date().toISOString()
    })

    // Validate required fields
    if (!body.wrestlers || !Array.isArray(body.wrestlers)) {
      return NextResponse.json(
        { error: 'Invalid data format: wrestlers array required' },
        { status: 400 }
      )
    }

    if (!body.teamId) {
      return NextResponse.json(
        { error: 'Team ID required' },
        { status: 400 }
      )
    }

    // Verify team exists
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('id', body.teamId)
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    const syncedWrestlers: any[] = []
    const syncedMatches: any[] = []
    const errors: string[] = []

    // Process each wrestler
    for (const wrestler of body.wrestlers as WrestlerData[]) {
      try {
        // Upsert wrestler (insert or update based on usab_id)
        const wrestlerPayload = {
          team_id: body.teamId,
          first_name: wrestler.firstName,
          last_name: wrestler.lastName,
          weight_class: wrestler.weightClass,
          grade: wrestler.grade || null,
          season_wins: wrestler.wins,
          season_losses: wrestler.losses,
          pins: wrestler.pins,
          tech_falls: wrestler.techFalls || 0,
          major_decisions: wrestler.majorDecisions || 0,
          usab_id: wrestler.usabId || null,
          imported_from: body.source || 'USABracketing',
          last_synced_at: new Date().toISOString()
        }

        let wrestlerRecord: any

        // If we have a usab_id, try to find existing wrestler
        if (wrestler.usabId) {
          const { data: existingWrestler } = await supabase
            .from('wrestlers')
            .select('id')
            .eq('usab_id', wrestler.usabId)
            .single()

          if (existingWrestler) {
            // Update existing wrestler
            const { data: updated, error: updateError } = await supabase
              .from('wrestlers')
              .update(wrestlerPayload)
              .eq('id', existingWrestler.id)
              .select()
              .single()

            if (updateError) throw updateError
            wrestlerRecord = updated
          } else {
            // Insert new wrestler
            const { data: inserted, error: insertError } = await supabase
              .from('wrestlers')
              .insert(wrestlerPayload)
              .select()
              .single()

            if (insertError) throw insertError
            wrestlerRecord = inserted
          }
        } else {
          // No usab_id, try to match by name and team
          const { data: existingWrestler } = await supabase
            .from('wrestlers')
            .select('id')
            .eq('team_id', body.teamId)
            .eq('first_name', wrestler.firstName)
            .eq('last_name', wrestler.lastName)
            .single()

          if (existingWrestler) {
            const { data: updated, error: updateError } = await supabase
              .from('wrestlers')
              .update(wrestlerPayload)
              .eq('id', existingWrestler.id)
              .select()
              .single()

            if (updateError) throw updateError
            wrestlerRecord = updated
          } else {
            const { data: inserted, error: insertError } = await supabase
              .from('wrestlers')
              .insert(wrestlerPayload)
              .select()
              .single()

            if (insertError) throw insertError
            wrestlerRecord = inserted
          }
        }

        syncedWrestlers.push(wrestlerRecord)

        // Process matches for this wrestler
        if (wrestler.matches && wrestler.matches.length > 0) {
          for (const match of wrestler.matches) {
            try {
              // Check if match already exists (prevent duplicates)
              if (match.usabMatchId) {
                const { data: existingMatch } = await supabase
                  .from('matches')
                  .select('id')
                  .eq('usab_match_id', match.usabMatchId)
                  .single()

                if (existingMatch) {
                  console.log('[Mat Ops Sync] Skipping duplicate match:', match.usabMatchId)
                  continue
                }
              }

              // Determine outcome and outcome_type for database
              let outcome = match.result === 'Win' ? 'win' : match.result === 'Loss' ? 'loss' : 'draw'
              let outcomeType = match.winType?.toLowerCase() || null

              const matchPayload = {
                wrestler_id: wrestlerRecord.id,
                opponent_name: match.opponent,
                opponent_team: match.opponentTeam || null,
                match_date: match.date,
                weight_class: match.weightClass,
                match_type: 'tournament', // Default, could be enhanced
                outcome: outcome,
                outcome_type: outcomeType,
                wrestler_score: match.wrestlerScore,
                opponent_score: match.opponentScore,

                // Detailed stats if provided
                takedowns_scored: match.takedowns || 0,
                escapes_scored: match.escapes || 0,
                reversals_scored: match.reversals || 0,
                nearfall_2_scored: match.nearfall2 || 0,
                nearfall_3_scored: match.nearfall3 || 0,
                penalty_points_scored: match.penalties || 0,

                // Meta fields
                usab_match_id: match.usabMatchId || null,
                imported_from: body.source || 'USABracketing',
                sync_timestamp: new Date().toISOString(),

                notes: match.eventName ? `Event: ${match.eventName}${match.round ? ', Round: ' + match.round : ''}` : null
              }

              const { data: matchRecord, error: matchError } = await supabase
                .from('matches')
                .insert(matchPayload)
                .select()
                .single()

              if (matchError) {
                console.error('[Mat Ops Sync] Match insert error:', matchError)
                errors.push(`Match error for ${wrestler.firstName} ${wrestler.lastName}: ${matchError.message}`)
              } else {
                syncedMatches.push(matchRecord)
              }
            } catch (matchErr) {
              console.error('[Mat Ops Sync] Error processing match:', matchErr)
              errors.push(`Match processing error: ${matchErr}`)
            }
          }
        }
      } catch (wrestlerErr) {
        console.error('[Mat Ops Sync] Error processing wrestler:', wrestlerErr)
        errors.push(`Wrestler error for ${wrestler.firstName} ${wrestler.lastName}: ${wrestlerErr}`)
      }
    }

    const syncDuration = Date.now() - syncStartTime

    // Log sync activity
    await supabase.from('matops_sync_log').insert({
      source: body.source || 'USABracketing',
      wrestlers_synced: syncedWrestlers.length,
      matches_synced: syncedMatches.length,
      errors_count: errors.length,
      error_details: errors.length > 0 ? { errors } : null,
      sync_duration_ms: syncDuration,
      user_agent: request.headers.get('user-agent') || null,
      extension_version: body.version || null,
      success: errors.length === 0,
      team_id: body.teamId,
      synced_data: body // Store full payload for debugging
    })

    console.log('[Mat Ops Sync] Sync completed:', {
      wrestlers: syncedWrestlers.length,
      matches: syncedMatches.length,
      errors: errors.length,
      duration: syncDuration + 'ms'
    })

    return NextResponse.json({
      success: true,
      wrestlers: syncedWrestlers.length,
      matches: syncedMatches.length,
      errors: errors.length > 0 ? errors : undefined,
      duration: syncDuration,
      message: `Successfully synced ${syncedWrestlers.length} wrestlers and ${syncedMatches.length} matches`
    })

  } catch (error) {
    const syncDuration = Date.now() - syncStartTime

    console.error('[Mat Ops Sync] Fatal error:', error)

    // Log failed sync
    try {
      await supabase.from('matops_sync_log').insert({
        source: 'Unknown',
        wrestlers_synced: 0,
        matches_synced: 0,
        errors_count: 1,
        error_details: { error: String(error) },
        sync_duration_ms: syncDuration,
        success: false
      })
    } catch (logErr) {
      console.error('[Mat Ops Sync] Error logging failed sync:', logErr)
    }

    return NextResponse.json(
      {
        error: 'Sync failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// GET /api/matops/sync - Get sync history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const teamId = searchParams.get('teamId')

    let query = supabase
      .from('matops_sync_log')
      .select('*')
      .order('sync_timestamp', { ascending: false })
      .limit(limit)

    if (teamId) {
      query = query.eq('team_id', teamId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[Mat Ops Sync] Error fetching sync history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sync history' },
      { status: 500 }
    )
  }
}
