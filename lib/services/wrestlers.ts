import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type Wrestler = Database['public']['Tables']['wrestlers']['Row']
type WrestlerInsert = Database['public']['Tables']['wrestlers']['Insert']
type WrestlerUpdate = Database['public']['Tables']['wrestlers']['Update']

export class WrestlerService {
  // Get all wrestlers for a team
  static async getTeamRoster(teamId: string) {
    const { data, error } = await supabase
      .from('wrestlers')
      .select('*')
      .eq('team_id', teamId)
      .eq('active', true)
      .order('weight_class', { ascending: true })

    if (error) throw error
    return data
  }

  // Get single wrestler with full stats
  static async getWrestler(id: string) {
    const { data: wrestler, error: wrestlerError } = await supabase
      .from('wrestlers')
      .select('*')
      .eq('id', id)
      .single()

    if (wrestlerError) throw wrestlerError

    // Get current season stats
    const { data: stats, error: statsError } = await supabase
      .from('statistics')
      .select('*')
      .eq('wrestler_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Get recent matches
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .eq('wrestler_id', id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get weight history
    const { data: weights, error: weightsError } = await supabase
      .from('weight_management')
      .select('*')
      .eq('wrestler_id', id)
      .order('date', { ascending: false })
      .limit(30)

    return {
      ...wrestler,
      currentStats: stats,
      recentMatches: matches || [],
      weightHistory: weights || []
    }
  }

  // Create new wrestler
  static async createWrestler(wrestler: WrestlerInsert) {
    const { data, error } = await supabase
      .from('wrestlers')
      .insert(wrestler)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update wrestler
  static async updateWrestler(id: string, updates: WrestlerUpdate) {
    const { data, error } = await supabase
      .from('wrestlers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Calculate MatBoss Power Index
  static calculatePowerIndex(wrestler: Wrestler, stats: any) {
    let index = 0
    
    // Win percentage component (0-2.5 points)
    const winPct = stats.win_percentage || 0
    index += winPct * 0.025

    // Bonus point percentage (0-1.5 points)
    const bonusMatches = (stats.pins || 0) + (stats.tech_falls || 0) + (stats.major_decisions || 0)
    const bonusPct = stats.matches_total > 0 ? bonusMatches / stats.matches_total : 0
    index += bonusPct * 1.5

    // Strength of schedule (0-1 point)
    // This would need opponent data to calculate properly
    index += 0.5 // Placeholder

    return Math.round(index * 100) / 100
  }

  // Get wrestlers by weight class
  static async getByWeightClass(teamId: string, weightClass: number) {
    const { data, error } = await supabase
      .from('wrestlers')
      .select('*')
      .eq('team_id', teamId)
      .eq('weight_class', weightClass)
      .eq('active', true)

    if (error) throw error
    return data
  }

  // Search wrestlers
  static async searchWrestlers(query: string) {
    const { data, error } = await supabase
      .from('wrestlers')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .limit(20)

    if (error) throw error
    return data
  }

  // Get injured wrestlers
  static async getInjuredWrestlers(teamId: string) {
    const { data, error } = await supabase
      .from('wrestlers')
      .select('*')
      .eq('team_id', teamId)
      .not('current_injuries', 'is', null)
      .eq('active', true)

    if (error) throw error
    return data
  }

  // Update weight
  static async recordWeight(wrestlerId: string, weight: number, bodyFat?: number, hydration?: string) {
    const { data, error } = await supabase
      .from('weight_management')
      .insert({
        wrestler_id: wrestlerId,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        weight,
        body_fat_percentage: bodyFat,
        hydration_level: hydration
      })
      .select()
      .single()

    if (error) throw error

    // Update wrestler's current weight
    await supabase
      .from('wrestlers')
      .update({ weight_class: Math.ceil(weight) })
      .eq('id', wrestlerId)

    return data
  }

  // Get lineup for dual meet
  static async getOptimalLineup(teamId: string) {
    const weightClasses = [106, 113, 120, 126, 132, 138, 145, 152, 160, 170, 182, 195, 220, 285]
    const lineup: any = {}

    for (const weight of weightClasses) {
      const { data } = await supabase
        .from('wrestlers')
        .select(`
          *,
          statistics (
            win_percentage,
            matboss_power_index
          )
        `)
        .eq('team_id', teamId)
        .eq('weight_class', weight)
        .eq('active', true)
        .order('statistics.matboss_power_index', { ascending: false })
        .limit(1)

      if (data && data.length > 0) {
        lineup[weight] = data[0]
      }
    }

    return lineup
  }
}