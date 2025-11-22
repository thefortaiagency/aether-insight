import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface ImportWrestler {
  name: string
  team?: string
  state?: string
  athleteId?: string
  weightClass?: number
  wins?: number
  losses?: number
}

interface MatchResult {
  imported: ImportWrestler
  matched?: {
    id: string
    first_name: string
    last_name: string
    weight_class: number | null
    confidence: number
  }
  potentialMatches?: Array<{
    id: string
    first_name: string
    last_name: string
    weight_class: number | null
    similarity: number
  }>
  isNew: boolean
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

// Calculate similarity score (0-1)
function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  return 1 - levenshtein(a.toLowerCase(), b.toLowerCase()) / maxLen
}

// Parse full name into first/last
function parseName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ')
  }
}

export async function POST(request: Request) {
  try {
    const { teamId, wrestlers } = await request.json() as {
      teamId: string
      wrestlers: ImportWrestler[]
    }

    if (!teamId) {
      return NextResponse.json({ error: 'teamId is required' }, { status: 400 })
    }

    if (!wrestlers || !Array.isArray(wrestlers) || wrestlers.length === 0) {
      return NextResponse.json({ error: 'wrestlers array is required' }, { status: 400 })
    }

    // Get existing wrestlers for this team
    const { data: existingWrestlers, error } = await supabase
      .from('wrestlers')
      .select('id, first_name, last_name, weight_class')
      .eq('team_id', teamId)

    if (error) {
      console.error('Error fetching wrestlers:', error)
      return NextResponse.json({ error: 'Failed to fetch existing wrestlers' }, { status: 500 })
    }

    const results: MatchResult[] = []

    for (const imported of wrestlers) {
      const { firstName, lastName } = parseName(imported.name)
      const fullNameLower = imported.name.toLowerCase()

      let bestMatch: MatchResult['matched'] | undefined
      const potentialMatches: MatchResult['potentialMatches'] = []

      for (const existing of existingWrestlers || []) {
        const existingFullName = `${existing.first_name} ${existing.last_name}`.toLowerCase()
        const sim = similarity(fullNameLower, existingFullName)

        // Exact match (>95% similarity)
        if (sim > 0.95) {
          bestMatch = {
            id: existing.id,
            first_name: existing.first_name,
            last_name: existing.last_name,
            weight_class: existing.weight_class,
            confidence: sim
          }
          break
        }

        // Potential match (>70% similarity)
        if (sim > 0.7) {
          potentialMatches.push({
            id: existing.id,
            first_name: existing.first_name,
            last_name: existing.last_name,
            weight_class: existing.weight_class,
            similarity: sim
          })
        }

        // Also check last name only match with same weight class
        if (existing.last_name && lastName) {
          const lastNameSim = similarity(lastName.toLowerCase(), existing.last_name.toLowerCase())
          if (lastNameSim > 0.9 && imported.weightClass === existing.weight_class) {
            if (!potentialMatches.find(p => p.id === existing.id)) {
              potentialMatches.push({
                id: existing.id,
                first_name: existing.first_name,
                last_name: existing.last_name,
                weight_class: existing.weight_class,
                similarity: lastNameSim * 0.9 // Slightly lower since only last name matched
              })
            }
          }
        }
      }

      // Sort potential matches by similarity
      potentialMatches.sort((a, b) => b.similarity - a.similarity)

      results.push({
        imported,
        matched: bestMatch,
        potentialMatches: bestMatch ? undefined : potentialMatches.slice(0, 3),
        isNew: !bestMatch && potentialMatches.length === 0
      })
    }

    // Categorize results
    const matched = results.filter(r => r.matched)
    const needsReview = results.filter(r => !r.matched && r.potentialMatches && r.potentialMatches.length > 0)
    const newWrestlers = results.filter(r => r.isNew)

    return NextResponse.json({
      success: true,
      summary: {
        total: wrestlers.length,
        matched: matched.length,
        needsReview: needsReview.length,
        new: newWrestlers.length
      },
      results: {
        matched,
        needsReview,
        newWrestlers
      }
    })

  } catch (error) {
    console.error('Import wrestlers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Add wrestlers to team
export async function PUT(request: Request) {
  try {
    const { teamId, wrestlers, seasonId } = await request.json() as {
      teamId: string
      wrestlers: Array<{
        name: string
        weightClass?: number
        linkToExisting?: string // existing wrestler ID to link
      }>
      seasonId?: string
    }

    if (!teamId || !wrestlers || wrestlers.length === 0) {
      return NextResponse.json({ error: 'teamId and wrestlers are required' }, { status: 400 })
    }

    const added: string[] = []
    const linked: string[] = []
    const errors: string[] = []

    for (const wrestler of wrestlers) {
      if (wrestler.linkToExisting) {
        // Link stats to existing wrestler - just mark as linked
        linked.push(wrestler.name)
        continue
      }

      // Add new wrestler
      const { firstName, lastName } = parseName(wrestler.name)

      const { data, error } = await supabase
        .from('wrestlers')
        .insert({
          team_id: teamId,
          first_name: firstName,
          last_name: lastName,
          weight_class: wrestler.weightClass || null,
          season_id: seasonId || null,
          wins: 0,
          losses: 0,
          pins: 0,
          tech_falls: 0,
          major_decisions: 0,
          decisions: 0,
          takedowns: 0,
          escapes: 0,
          reversals: 0,
          near_fall_2: 0,
          near_fall_3: 0,
          near_fall_4: 0,
          team_points: 0
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding wrestler:', error)
        errors.push(`Failed to add ${wrestler.name}: ${error.message}`)
      } else {
        added.push(wrestler.name)
      }
    }

    return NextResponse.json({
      success: true,
      added,
      linked,
      errors
    })

  } catch (error) {
    console.error('Add wrestlers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
