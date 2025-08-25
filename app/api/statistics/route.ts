import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/statistics - Get wrestler statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wrestlerId = searchParams.get('wrestler_id')
    const teamId = searchParams.get('team_id')
    const season = searchParams.get('season')
    const type = searchParams.get('type') || 'summary' // summary, detailed, comparison

    if (type === 'summary' && wrestlerId) {
      // Get wrestler's overall statistics
      const { data: stats, error } = await supabase
        .from('season_records')
        .select(`
          *,
          wrestler:wrestlers!wrestler_id (
            id,
            first_name,
            last_name,
            weight_class,
            team:teams (
              name
            )
          )
        `)
        .eq('wrestler_id', wrestlerId)
        .order('season', { ascending: false })

      if (error) {
        console.error('Error fetching wrestler statistics:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Get match statistics aggregates
      const { data: matchStats } = await supabase
        .from('match_statistics')
        .select('*')
        .eq('wrestler_id', wrestlerId)

      // Calculate totals
      const totals = matchStats?.reduce((acc: any, stat: any) => ({
        takedowns: acc.takedowns + (stat.takedowns || 0),
        escapes: acc.escapes + (stat.escapes || 0),
        reversals: acc.reversals + (stat.reversals || 0),
        near_falls: acc.near_falls + (stat.near_fall_2 || 0) + (stat.near_fall_3 || 0) + (stat.near_fall_4 || 0),
        stalls: acc.stalls + (stat.stalls || 0),
        cautions: acc.cautions + (stat.cautions || 0),
        warnings: acc.warnings + (stat.warnings || 0),
        penalties: acc.penalties + (stat.penalties || 0),
        riding_time_total: acc.riding_time_total + (stat.riding_time || 0),
        matches: acc.matches + 1
      }), {
        takedowns: 0,
        escapes: 0,
        reversals: 0,
        near_falls: 0,
        stalls: 0,
        cautions: 0,
        warnings: 0,
        penalties: 0,
        riding_time_total: 0,
        matches: 0
      })

      return NextResponse.json({ 
        data: {
          season_records: stats,
          career_totals: totals,
          averages: totals ? {
            takedowns_per_match: (totals.takedowns / totals.matches).toFixed(2),
            escapes_per_match: (totals.escapes / totals.matches).toFixed(2),
            reversals_per_match: (totals.reversals / totals.matches).toFixed(2),
            near_falls_per_match: (totals.near_falls / totals.matches).toFixed(2),
            riding_time_avg: (totals.riding_time_total / totals.matches).toFixed(0)
          } : null
        }
      })
    }

    if (type === 'team' && teamId) {
      // Get team statistics
      const { data: wrestlers } = await supabase
        .from('wrestlers')
        .select(`
          id,
          first_name,
          last_name,
          weight_class,
          season_records!inner (
            season,
            wins,
            losses,
            pins,
            tech_falls,
            major_decisions,
            team_points
          )
        `)
        .eq('team_id', teamId)
        .eq('season_records.season', season || '2024-25')

      const teamStats = {
        total_wins: 0,
        total_losses: 0,
        total_pins: 0,
        total_tech_falls: 0,
        total_major_decisions: 0,
        total_team_points: 0,
        wrestlers: [] as Array<{
          name: string
          weight_class: number
          record: string
          pins: number
          team_points: number
        }>
      }

      wrestlers?.forEach(wrestler => {
        const record = wrestler.season_records[0]
        if (record) {
          teamStats.total_wins += record.wins
          teamStats.total_losses += record.losses
          teamStats.total_pins += record.pins
          teamStats.total_tech_falls += record.tech_falls
          teamStats.total_major_decisions += record.major_decisions
          teamStats.total_team_points += parseFloat(record.team_points || 0)
          
          teamStats.wrestlers.push({
            name: `${wrestler.first_name} ${wrestler.last_name}`,
            weight_class: wrestler.weight_class,
            record: `${record.wins}-${record.losses}`,
            pins: record.pins,
            team_points: record.team_points
          })
        }
      })

      return NextResponse.json({ data: teamStats })
    }

    if (type === 'comparison' && wrestlerId) {
      // Get comparison data for wrestler vs opponents
      const { data: matches } = await supabase
        .from('matches')
        .select(`
          *,
          match_statistics (*)
        `)
        .or(`wrestler_id.eq.${wrestlerId},opponent_wrestler_id.eq.${wrestlerId}`)
        .order('match_date', { ascending: false })
        .limit(10)

      return NextResponse.json({ data: matches })
    }

    return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 })
  } catch (error) {
    console.error('Error in GET /api/statistics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/statistics/calculate - Calculate and update wrestler statistics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wrestler_id, season } = body

    if (!wrestler_id || !season) {
      return NextResponse.json({ error: 'Wrestler ID and season required' }, { status: 400 })
    }

    // Get all matches for the wrestler in the season
    const { data: matches } = await supabase
      .from('matches')
      .select('*')
      .or(`wrestler_id.eq.${wrestler_id},opponent_wrestler_id.eq.${wrestler_id}`)
      .gte('match_date', `${season}-08-01`)
      .lte('match_date', `${parseInt(season) + 1}-07-31`)

    // Calculate statistics
    const stats = {
      wins: 0,
      losses: 0,
      pins: 0,
      tech_falls: 0,
      major_decisions: 0,
      decisions: 0,
      team_points: 0
    }

    matches?.forEach(match => {
      const isWrestler1 = match.wrestler_id === wrestler_id
      const won = (isWrestler1 && match.result === 'win') || 
                  (!isWrestler1 && match.result === 'loss')

      if (won) {
        stats.wins++
        
        // Calculate team points based on win type
        switch (match.win_type) {
          case 'pin':
          case 'fall':
            stats.pins++
            stats.team_points += 6
            break
          case 'tech_fall':
            stats.tech_falls++
            stats.team_points += 5
            break
          case 'major_decision':
            stats.major_decisions++
            stats.team_points += 4
            break
          case 'decision':
            stats.decisions++
            stats.team_points += 3
            break
          case 'forfeit':
            stats.team_points += 6
            break
          default:
            stats.team_points += 3
        }
      } else if (match.result) {
        stats.losses++
      }
    })

    // Update season record
    const { data: existingRecord } = await supabase
      .from('season_records')
      .select('id')
      .eq('wrestler_id', wrestler_id)
      .eq('season', season)
      .single()

    const recordData = {
      wrestler_id,
      season,
      wins: stats.wins,
      losses: stats.losses,
      pins: stats.pins,
      tech_falls: stats.tech_falls,
      major_decisions: stats.major_decisions,
      team_points: stats.team_points
    }

    if (existingRecord) {
      const { error } = await supabase
        .from('season_records')
        .update(recordData)
        .eq('id', existingRecord.id)

      if (error) {
        console.error('Error updating season record:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      const { error } = await supabase
        .from('season_records')
        .insert(recordData)

      if (error) {
        console.error('Error creating season record:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: stats,
      message: 'Statistics calculated and updated successfully'
    })
  } catch (error) {
    console.error('Error in POST /api/statistics/calculate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}