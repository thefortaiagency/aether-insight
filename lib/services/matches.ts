import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type Match = Database['public']['Tables']['matches']['Row']
type MatchInsert = Database['public']['Tables']['matches']['Insert']
type MatchUpdate = Database['public']['Tables']['matches']['Update']

export interface LiveMatchState {
  matchId: string
  period: number
  time: string
  wrestler1Score: number
  wrestler2Score: number
  wrestler1Stalls: number
  wrestler2Stalls: number
  ridingTime: { wrestler1: number; wrestler2: number }
  lastAction: string
  isActive: boolean
}

export class MatchService {
  // Create new match
  static async createMatch(match: MatchInsert) {
    const { data, error } = await supabase
      .from('matches')
      .insert(match)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update match score
  static async updateMatchScore(matchId: string, updates: MatchUpdate) {
    const { data, error } = await supabase
      .from('matches')
      .update(updates)
      .eq('id', matchId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get live matches
  static async getLiveMatches() {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        wrestler:wrestlers!wrestler_id(*),
        event:events(*)
      `)
      .is('actual_end_time', null)
      .not('actual_start_time', 'is', null)
      .order('actual_start_time', { ascending: false })

    if (error) throw error
    return data
  }

  // Get recent matches for a team
  static async getTeamMatches(teamId: string, limit = 20) {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        wrestler:wrestlers!wrestler_id(*)
      `)
      .eq('wrestler.team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }

  // Score a takedown
  static async scoreTakedown(matchId: string, wrestlerId: string, points = 2) {
    const match = await this.getMatch(matchId)
    if (!match) throw new Error('Match not found')

    const isWrestler1 = match.wrestler_id === wrestlerId
    const currentScore = isWrestler1 ? match.wrestler_score : match.opponent_score
    const currentTakedowns = isWrestler1 ? match.takedowns_scored : match.takedowns_allowed

    const updates: MatchUpdate = {}
    const period = match.period || 1
    if (isWrestler1) {
      updates.wrestler_score = currentScore + points
      updates.takedowns_scored = currentTakedowns + 1
      if (period === 1) {
        updates.period1_wrestler_score = (match.period1_wrestler_score || 0) + points
      } else if (period === 2) {
        updates.period2_wrestler_score = (match.period2_wrestler_score || 0) + points
      } else if (period === 3) {
        updates.period3_wrestler_score = (match.period3_wrestler_score || 0) + points
      }
    } else {
      updates.opponent_score = currentScore + points
      updates.takedowns_allowed = currentTakedowns + 1
      if (period === 1) {
        updates.period1_opponent_score = (match.period1_opponent_score || 0) + points
      } else if (period === 2) {
        updates.period2_opponent_score = (match.period2_opponent_score || 0) + points
      } else if (period === 3) {
        updates.period3_opponent_score = (match.period3_opponent_score || 0) + points
      }
    }

    return this.updateMatchScore(matchId, updates)
  }

  // Score an escape
  static async scoreEscape(matchId: string, wrestlerId: string) {
    const match = await this.getMatch(matchId)
    if (!match) throw new Error('Match not found')

    const isWrestler1 = match.wrestler_id === wrestlerId
    const currentScore = isWrestler1 ? match.wrestler_score : match.opponent_score
    const currentEscapes = isWrestler1 ? match.escapes_scored : match.escapes_allowed

    const updates: MatchUpdate = {}
    const period = match.period || 1
    if (isWrestler1) {
      updates.wrestler_score = currentScore + 1
      updates.escapes_scored = currentEscapes + 1
      if (period === 1) {
        updates.period1_wrestler_score = (match.period1_wrestler_score || 0) + 1
      } else if (period === 2) {
        updates.period2_wrestler_score = (match.period2_wrestler_score || 0) + 1
      } else if (period === 3) {
        updates.period3_wrestler_score = (match.period3_wrestler_score || 0) + 1
      }
    } else {
      updates.opponent_score = currentScore + 1
      updates.escapes_allowed = currentEscapes + 1
      if (period === 1) {
        updates.period1_opponent_score = (match.period1_opponent_score || 0) + 1
      } else if (period === 2) {
        updates.period2_opponent_score = (match.period2_opponent_score || 0) + 1
      } else if (period === 3) {
        updates.period3_opponent_score = (match.period3_opponent_score || 0) + 1
      }
    }

    return this.updateMatchScore(matchId, updates)
  }

  // Score a reversal
  static async scoreReversal(matchId: string, wrestlerId: string) {
    const match = await this.getMatch(matchId)
    if (!match) throw new Error('Match not found')

    const isWrestler1 = match.wrestler_id === wrestlerId
    const currentScore = isWrestler1 ? match.wrestler_score : match.opponent_score
    const currentReversals = isWrestler1 ? match.reversals_scored : match.reversals_allowed

    const updates: MatchUpdate = {}
    const period = match.period || 1
    if (isWrestler1) {
      updates.wrestler_score = currentScore + 2
      updates.reversals_scored = currentReversals + 1
      if (period === 1) {
        updates.period1_wrestler_score = (match.period1_wrestler_score || 0) + 2
      } else if (period === 2) {
        updates.period2_wrestler_score = (match.period2_wrestler_score || 0) + 2
      } else if (period === 3) {
        updates.period3_wrestler_score = (match.period3_wrestler_score || 0) + 2
      }
    } else {
      updates.opponent_score = currentScore + 2
      updates.reversals_allowed = currentReversals + 1
      if (period === 1) {
        updates.period1_opponent_score = (match.period1_opponent_score || 0) + 2
      } else if (period === 2) {
        updates.period2_opponent_score = (match.period2_opponent_score || 0) + 2
      } else if (period === 3) {
        updates.period3_opponent_score = (match.period3_opponent_score || 0) + 2
      }
    }

    return this.updateMatchScore(matchId, updates)
  }

  // Score near fall points
  static async scoreNearfall(matchId: string, wrestlerId: string, seconds: 2 | 3) {
    const match = await this.getMatch(matchId)
    if (!match) throw new Error('Match not found')

    const points = seconds === 2 ? 2 : 3
    const isWrestler1 = match.wrestler_id === wrestlerId
    const currentScore = isWrestler1 ? match.wrestler_score : match.opponent_score

    const updates: MatchUpdate = {}
    const period = match.period || 1
    if (isWrestler1) {
      updates.wrestler_score = currentScore + points
      if (seconds === 2) {
        updates.nearfall_2_scored = (match.nearfall_2_scored || 0) + 1
      } else {
        updates.nearfall_3_scored = (match.nearfall_3_scored || 0) + 1
      }
      if (period === 1) {
        updates.period1_wrestler_score = (match.period1_wrestler_score || 0) + points
      } else if (period === 2) {
        updates.period2_wrestler_score = (match.period2_wrestler_score || 0) + points
      } else if (period === 3) {
        updates.period3_wrestler_score = (match.period3_wrestler_score || 0) + points
      }
    } else {
      updates.opponent_score = currentScore + points
      if (seconds === 2) {
        updates.nearfall_2_allowed = (match.nearfall_2_allowed || 0) + 1
      } else {
        updates.nearfall_3_allowed = (match.nearfall_3_allowed || 0) + 1
      }
      if (period === 1) {
        updates.period1_opponent_score = (match.period1_opponent_score || 0) + points
      } else if (period === 2) {
        updates.period2_opponent_score = (match.period2_opponent_score || 0) + points
      } else if (period === 3) {
        updates.period3_opponent_score = (match.period3_opponent_score || 0) + points
      }
    }

    return this.updateMatchScore(matchId, updates)
  }

  // Score penalty points
  static async scorePenalty(matchId: string, againstWrestlerId: string, points = 1) {
    const match = await this.getMatch(matchId)
    if (!match) throw new Error('Match not found')

    const isAgainstWrestler1 = match.wrestler_id === againstWrestlerId
    
    const updates: MatchUpdate = {}
    if (isAgainstWrestler1) {
      updates.opponent_score = (match.opponent_score || 0) + points
      updates.penalty_points_allowed = (match.penalty_points_allowed || 0) + points
      updates.stalling_calls = (match.stalling_calls || 0) + 1
    } else {
      updates.wrestler_score = (match.wrestler_score || 0) + points
      updates.penalty_points_scored = (match.penalty_points_scored || 0) + points
    }

    return this.updateMatchScore(matchId, updates)
  }

  // End match with outcome
  static async endMatch(
    matchId: string, 
    outcome: 'win' | 'loss' | 'draw',
    outcomeType: 'pin' | 'tech_fall' | 'major' | 'decision' | 'forfeit' | 'injury' | 'dq',
    outcomeTime?: string,
    outcomeRound?: number
  ) {
    const updates: MatchUpdate = {
      actual_end_time: new Date().toISOString(),
      outcome,
      outcome_type: outcomeType,
      outcome_time: outcomeTime,
      outcome_round: outcomeRound
    }

    const match = await this.updateMatchScore(matchId, updates)

    // Update wrestler statistics
    if (match) {
      await this.updateWrestlerStats(match.wrestler_id, match)
    }

    return match
  }

  // Get single match
  static async getMatch(matchId: string) {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single()

    if (error) throw error
    return data
  }

  // Update wrestler statistics after match
  private static async updateWrestlerStats(wrestlerId: string, match: Match) {
    // Get current season stats
    const currentYear = new Date().getFullYear()
    const season = `${currentYear}-${currentYear + 1}`

    const { data: existingStats } = await supabase
      .from('statistics')
      .select('*')
      .eq('wrestler_id', wrestlerId)
      .eq('season', season)
      .single()

    if (existingStats) {
      // Update existing stats
      const updates: any = {
        matches_total: existingStats.matches_total + 1,
        matches_won: match.outcome === 'win' ? existingStats.matches_won + 1 : existingStats.matches_won,
        matches_lost: match.outcome === 'loss' ? existingStats.matches_lost + 1 : existingStats.matches_lost,
        pins: match.outcome_type === 'pin' && match.outcome === 'win' ? 
          existingStats.pins + 1 : existingStats.pins,
        tech_falls: match.outcome_type === 'tech_fall' && match.outcome === 'win' ? 
          existingStats.tech_falls + 1 : existingStats.tech_falls,
        major_decisions: match.outcome_type === 'major' && match.outcome === 'win' ? 
          existingStats.major_decisions + 1 : existingStats.major_decisions,
        regular_decisions: match.outcome_type === 'decision' && match.outcome === 'win' ? 
          existingStats.regular_decisions + 1 : existingStats.regular_decisions,
        total_points_scored: existingStats.total_points_scored + match.wrestler_score,
        total_points_allowed: existingStats.total_points_allowed + match.opponent_score,
        takedowns_total: existingStats.takedowns_total + match.takedowns_scored,
        escapes_total: existingStats.escapes_total + match.escapes_scored,
        reversals_total: existingStats.reversals_total + match.reversals_scored,
        win_percentage: 0
      }

      // Calculate win percentage
      updates.win_percentage = updates.matches_total > 0 ? 
        (updates.matches_won / updates.matches_total) * 100 : 0

      await supabase
        .from('statistics')
        .update(updates)
        .eq('id', existingStats.id)
    } else {
      // Create new stats record
      await supabase
        .from('statistics')
        .insert({
          wrestler_id: wrestlerId,
          season,
          matches_total: 1,
          matches_won: match.outcome === 'win' ? 1 : 0,
          matches_lost: match.outcome === 'loss' ? 1 : 0,
          win_percentage: match.outcome === 'win' ? 100 : 0,
          pins: match.outcome_type === 'pin' && match.outcome === 'win' ? 1 : 0,
          tech_falls: match.outcome_type === 'tech_fall' && match.outcome === 'win' ? 1 : 0,
          major_decisions: match.outcome_type === 'major' && match.outcome === 'win' ? 1 : 0,
          regular_decisions: match.outcome_type === 'decision' && match.outcome === 'win' ? 1 : 0,
          total_points_scored: match.wrestler_score,
          total_points_allowed: match.opponent_score,
          takedowns_total: match.takedowns_scored,
          escapes_total: match.escapes_scored,
          reversals_total: match.reversals_scored
        })
    }

    // Update wrestler's season record
    await supabase
      .from('wrestlers')
      .update({
        season_wins: match.outcome === 'win' ? 
          (await this.getWrestlerWins(wrestlerId)) : undefined,
        season_losses: match.outcome === 'loss' ? 
          (await this.getWrestlerLosses(wrestlerId)) : undefined
      })
      .eq('id', wrestlerId)
  }

  private static async getWrestlerWins(wrestlerId: string) {
    const { count } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('wrestler_id', wrestlerId)
      .eq('outcome', 'win')
    
    return count || 0
  }

  private static async getWrestlerLosses(wrestlerId: string) {
    const { count } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('wrestler_id', wrestlerId)
      .eq('outcome', 'loss')
    
    return count || 0
  }

  // Subscribe to live match updates
  static subscribeToMatch(matchId: string, callback: (match: Match) => void) {
    return supabase
      .channel(`match:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`
        },
        (payload: any) => {
          callback(payload.new as Match)
        }
      )
      .subscribe()
  }
}