import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface ImportMatch {
  wrestlerName: string
  wrestlerId?: string
  opponent: string
  opponentTeam: string
  result: 'Win' | 'Loss'
  winType: string
  score: string
  wrestlerScore?: number
  opponentScore?: number
  weightClass: number
  round?: string
  date?: string
  takedowns?: number
  escapes?: number
  reversals?: number
  nearfall2?: number
  nearfall3?: number
}

interface MatchResult {
  imported: ImportMatch
  wrestler?: {
    id: string
    first_name: string
    last_name: string
  }
  duplicate?: {
    id: string
    opponent_name: string
    match_date: string
    result: string
  }
  isNew: boolean
  isDuplicate: boolean
  wrestlerNotFound: boolean
}

// Standard high school weight classes
const STANDARD_WEIGHT_CLASSES = [106, 113, 120, 126, 132, 138, 144, 150, 157, 165, 175, 190, 215, 285]

// Map any weight to nearest standard weight class
function mapToStandardWeight(weight: number): number {
  if (!weight || weight <= 0) return 106

  // Find the closest standard weight class
  let closest = STANDARD_WEIGHT_CLASSES[0]
  let minDiff = Math.abs(weight - closest)

  for (const stdWeight of STANDARD_WEIGHT_CLASSES) {
    const diff = Math.abs(weight - stdWeight)
    if (diff < minDiff) {
      minDiff = diff
      closest = stdWeight
    }
  }

  return closest
}

// Simple Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  return 1 - levenshtein(a.toLowerCase(), b.toLowerCase()) / maxLen
}

// POST - Check matches for duplicates and match wrestlers
export async function POST(request: Request) {
  try {
    const { teamId, matches } = await request.json() as {
      teamId: string
      matches: ImportMatch[]
    }

    if (!teamId) {
      return NextResponse.json({ error: 'teamId is required' }, { status: 400 })
    }

    if (!matches || !Array.isArray(matches) || matches.length === 0) {
      return NextResponse.json({ error: 'matches array is required' }, { status: 400 })
    }

    // Get existing wrestlers for this team
    const { data: wrestlers, error: wrestlersError } = await supabase
      .from('wrestlers')
      .select('id, first_name, last_name, weight_class')
      .eq('team_id', teamId)

    if (wrestlersError) {
      console.error('Error fetching wrestlers:', wrestlersError)
      return NextResponse.json({ error: 'Failed to fetch wrestlers' }, { status: 500 })
    }

    // Get existing matches for all wrestlers on this team
    const wrestlerIds = wrestlers?.map(w => w.id) || []
    let existingMatches: any[] = []

    if (wrestlerIds.length > 0) {
      const { data: matchesData } = await supabase
        .from('matches')
        .select('id, wrestler_id, opponent_name, match_date, result, final_score_for, final_score_against, weight_class')
        .in('wrestler_id', wrestlerIds)

      existingMatches = matchesData || []
    }

    const results: MatchResult[] = []

    for (const imported of matches) {
      // Find matching wrestler by name
      let matchedWrestler = null
      let bestSimilarity = 0

      for (const wrestler of wrestlers || []) {
        const fullName = `${wrestler.first_name} ${wrestler.last_name}`.toLowerCase()
        const importedName = imported.wrestlerName.toLowerCase()
        const sim = similarity(importedName, fullName)

        if (sim > bestSimilarity && sim > 0.8) {
          bestSimilarity = sim
          matchedWrestler = wrestler
        }
      }

      if (!matchedWrestler) {
        results.push({
          imported,
          isNew: false,
          isDuplicate: false,
          wrestlerNotFound: true
        })
        continue
      }

      // Check for duplicate match
      const duplicate = existingMatches.find(existing => {
        if (existing.wrestler_id !== matchedWrestler!.id) return false

        // Check opponent name similarity
        const oppSim = similarity(
          (existing.opponent_name || '').toLowerCase(),
          imported.opponent.toLowerCase()
        )
        if (oppSim < 0.8) return false

        // Check if scores match (if available)
        if (imported.wrestlerScore !== undefined && imported.opponentScore !== undefined) {
          if (existing.final_score_for === imported.wrestlerScore &&
            existing.final_score_against === imported.opponentScore) {
            return true
          }
        }

        // Check weight class
        if (existing.weight_class === imported.weightClass) {
          return true
        }

        return false
      })

      results.push({
        imported,
        wrestler: matchedWrestler,
        duplicate: duplicate ? {
          id: duplicate.id,
          opponent_name: duplicate.opponent_name,
          match_date: duplicate.match_date,
          result: duplicate.result
        } : undefined,
        isNew: !duplicate,
        isDuplicate: !!duplicate,
        wrestlerNotFound: false
      })
    }

    // Categorize results
    const newMatches = results.filter(r => r.isNew && !r.wrestlerNotFound)
    const duplicates = results.filter(r => r.isDuplicate)
    const wrestlerNotFound = results.filter(r => r.wrestlerNotFound)

    return NextResponse.json({
      success: true,
      summary: {
        total: matches.length,
        new: newMatches.length,
        duplicates: duplicates.length,
        wrestlerNotFound: wrestlerNotFound.length
      },
      results: {
        newMatches,
        duplicates,
        wrestlerNotFound
      }
    })

  } catch (error) {
    console.error('Import matches preview error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

interface MatchInput {
  existingMatchId?: string // For updates
  wrestlerId: string
  opponent: string
  opponentTeam: string
  result: 'Win' | 'Loss'
  winType: string
  score: string
  wrestlerScore?: number
  opponentScore?: number
  weightClass: number
  round?: string
  date?: string
  matchDate?: string // Alias for date (from extension)
  // Stats
  takedowns?: number
  takedownsAgainst?: number
  escapes?: number
  escapesAgainst?: number
  reversals?: number
  reversalsAgainst?: number
  nearfall2?: number
  nearfall2Against?: number
  nearfall3?: number
  nearfall3Against?: number
  nearfall4?: number
  nearfall4Against?: number
  penalties?: number
  penaltiesAgainst?: number
}

// PUT - Actually import the matches
export async function PUT(request: Request) {
  try {
    const { teamId, matches, updates } = await request.json() as {
      teamId: string
      matches: MatchInput[]
      updates?: MatchInput[]
    }

    if (!teamId) {
      return NextResponse.json({ error: 'teamId is required' }, { status: 400 })
    }

    if ((!matches || matches.length === 0) && (!updates || updates.length === 0)) {
      return NextResponse.json({ error: 'matches or updates are required' }, { status: 400 })
    }

    const added: string[] = []
    const errors: string[] = []

    // Process new matches
    for (const match of (matches || [])) {
      // Map win type to outcome_type
      let outcomeType = 'decision'
      if (match.winType === 'Fall' || match.winType === 'Pin') outcomeType = 'pin'
      else if (match.winType === 'Tech Fall') outcomeType = 'tech_fall'
      else if (match.winType === 'Major Decision') outcomeType = 'major'
      else if (match.winType === 'Forfeit') outcomeType = 'forfeit'

      // Truncate string fields to fit database column limits (varchar 50)
      const truncate = (str: string | undefined, max: number) => str ? str.substring(0, max) : null

      // Map to standard weight class
      const standardWeight = mapToStandardWeight(match.weightClass)

      const { data, error } = await supabase
        .from('matches')
        .insert({
          wrestler_id: match.wrestlerId,
          opponent_name: truncate(match.opponent, 100),
          opponent_team: truncate(match.opponentTeam, 100),
          weight_class: standardWeight,
          result: match.result.toLowerCase(),
          win_type: outcomeType,
          final_score_for: match.wrestlerScore || 0,
          final_score_against: match.opponentScore || 0,
          match_date: match.matchDate || match.date || new Date().toISOString().split('T')[0],
          round: truncate(match.round, 50),
          // Stats
          takedowns_for: match.takedowns || 0,
          takedowns_against: match.takedownsAgainst || 0,
          escapes_for: match.escapes || 0,
          escapes_against: match.escapesAgainst || 0,
          reversals_for: match.reversals || 0,
          reversals_against: match.reversalsAgainst || 0,
          nearfall_2_for: match.nearfall2 || 0,
          nearfall_2_against: match.nearfall2Against || 0,
          nearfall_3_for: match.nearfall3 || 0,
          nearfall_3_against: match.nearfall3Against || 0,
          nearfall_4_for: match.nearfall4 || 0,
          nearfall_4_against: match.nearfall4Against || 0,
          penalties_for: match.penalties || 0,
          penalties_against: match.penaltiesAgainst || 0
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding match:', error)
        errors.push(`Failed to add match vs ${match.opponent}: ${error.message}`)
      } else {
        added.push(`${match.opponent} (${match.result})`)

        // Update wrestler stats
        await updateWrestlerStats(match.wrestlerId, match.result, outcomeType)
      }
    }

    // Process updates (existing matches to overwrite)
    const updated: string[] = []
    if (updates && updates.length > 0) {
      for (const match of updates) {
        if (!match.existingMatchId) continue

        let outcomeType = 'decision'
        if (match.winType === 'Fall' || match.winType === 'Pin') outcomeType = 'pin'
        else if (match.winType === 'Tech Fall') outcomeType = 'tech_fall'
        else if (match.winType === 'Major Decision') outcomeType = 'major'
        else if (match.winType === 'Forfeit') outcomeType = 'forfeit'

        const truncate = (str: string | undefined, max: number) => str ? str.substring(0, max) : null
        const standardWeight = mapToStandardWeight(match.weightClass)

        const { error } = await supabase
          .from('matches')
          .update({
            opponent_name: truncate(match.opponent, 100),
            opponent_team: truncate(match.opponentTeam, 100),
            weight_class: standardWeight,
            result: match.result.toLowerCase(),
            win_type: outcomeType,
            final_score_for: match.wrestlerScore || 0,
            final_score_against: match.opponentScore || 0,
            match_date: match.matchDate || match.date || new Date().toISOString().split('T')[0],
            round: truncate(match.round, 50),
            // Stats
            takedowns_for: match.takedowns || 0,
            takedowns_against: match.takedownsAgainst || 0,
            escapes_for: match.escapes || 0,
            escapes_against: match.escapesAgainst || 0,
            reversals_for: match.reversals || 0,
            reversals_against: match.reversalsAgainst || 0,
            nearfall_2_for: match.nearfall2 || 0,
            nearfall_2_against: match.nearfall2Against || 0,
            nearfall_3_for: match.nearfall3 || 0,
            nearfall_3_against: match.nearfall3Against || 0,
            nearfall_4_for: match.nearfall4 || 0,
            nearfall_4_against: match.nearfall4Against || 0,
            penalties_for: match.penalties || 0,
            penalties_against: match.penaltiesAgainst || 0
          })
          .eq('id', match.existingMatchId)

        if (error) {
          console.error('Error updating match:', error)
          errors.push(`Failed to update match vs ${match.opponent}: ${error.message}`)
        } else {
          updated.push(`${match.opponent} (${match.result})`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      added,
      updated,
      errors
    })

  } catch (error) {
    console.error('Add matches error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update wrestler win/loss/pin counts
async function updateWrestlerStats(wrestlerId: string, result: string, outcomeType: string) {
  try {
    // Get current stats
    const { data: wrestler } = await supabase
      .from('wrestlers')
      .select('wins, losses, pins, tech_falls, major_decisions, decisions')
      .eq('id', wrestlerId)
      .single()

    if (!wrestler) return

    const updates: any = {}

    if (result.toLowerCase() === 'win') {
      updates.wins = (wrestler.wins || 0) + 1

      if (outcomeType === 'pin') {
        updates.pins = (wrestler.pins || 0) + 1
      } else if (outcomeType === 'tech_fall') {
        updates.tech_falls = (wrestler.tech_falls || 0) + 1
      } else if (outcomeType === 'major') {
        updates.major_decisions = (wrestler.major_decisions || 0) + 1
      } else if (outcomeType === 'decision') {
        updates.decisions = (wrestler.decisions || 0) + 1
      }
    } else {
      updates.losses = (wrestler.losses || 0) + 1
    }

    await supabase
      .from('wrestlers')
      .update(updates)
      .eq('id', wrestlerId)

  } catch (error) {
    console.error('Error updating wrestler stats:', error)
  }
}
