export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          created_at: string
          name: string
          school: string
          division: string | null
          conference: string | null
          head_coach: string | null
          assistant_coaches: string[] | null
          team_color_primary: string | null
          team_color_secondary: string | null
          logo_url: string | null
          contact_email: string | null
          contact_phone: string | null
        }
        Insert: Omit<Database['public']['Tables']['teams']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['teams']['Insert']>
      }
      wrestlers: {
        Row: {
          id: string
          created_at: string
          team_id: string
          first_name: string
          last_name: string
          nickname: string | null
          date_of_birth: string | null
          grade: number | null
          gpa: number | null
          eligibility_status: string | null
          parent_name: string | null
          parent_email: string | null
          parent_phone: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          weight_class: number | null
          years_experience: number
          dominant_style: string | null
          stance: string | null
          best_moves: Json | null
          weaknesses: Json | null
          season_wins: number
          season_losses: number
          career_wins: number
          career_losses: number
          pins: number
          tech_falls: number
          major_decisions: number
          matboss_power_index: number | null
          blood_type: string | null
          allergies: string | null
          medical_conditions: string | null
          medications: string | null
          insurance_info: Json | null
          doctor_clearance: boolean
          concussion_history: Json | null
          injury_history: Json | null
          current_injuries: Json | null
          physical_therapy_notes: string | null
          speed_40_yard: number | null
          vertical_jump: number | null
          broad_jump: number | null
          bench_press_max: number | null
          squat_max: number | null
          deadlift_max: number | null
          pull_ups_max: number | null
          push_ups_60s: number | null
          flexibility_score: number | null
          body_fat_percentage: number | null
          notes: string | null
          photo_url: string | null
          active: boolean
        }
        Insert: Omit<Database['public']['Tables']['wrestlers']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['wrestlers']['Insert']>
      }
      matches: {
        Row: {
          id: string
          created_at: string
          event_id: string | null
          wrestler_id: string
          opponent_wrestler_id: string | null
          opponent_name: string | null
          opponent_team: string | null
          weight_class: number
          match_type: string
          round: string | null
          mat_number: string | null
          bout_number: number | null
          scheduled_time: string | null
          actual_start_time: string | null
          actual_end_time: string | null
          wrestler_score: number
          opponent_score: number
          outcome: string
          outcome_type: string | null
          outcome_time: string | null
          outcome_round: number | null
          period1_wrestler_score: number
          period1_opponent_score: number
          period2_wrestler_score: number
          period2_opponent_score: number
          period3_wrestler_score: number
          period3_opponent_score: number
          overtime_wrestler_score: number
          overtime_opponent_score: number
          takedowns_scored: number
          takedowns_allowed: number
          escapes_scored: number
          escapes_allowed: number
          reversals_scored: number
          reversals_allowed: number
          nearfall_2_scored: number
          nearfall_2_allowed: number
          nearfall_3_scored: number
          nearfall_3_allowed: number
          penalty_points_scored: number
          penalty_points_allowed: number
          riding_time_advantage: string | null
          riding_time_point: boolean
          cautions: number
          warnings: number
          stalling_calls: number
          video_url: string | null
          notes: string | null
          scouting_report: Json | null
        }
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['matches']['Insert']>
      }
      events: {
        Row: {
          id: string
          created_at: string
          team_id: string
          name: string
          type: string
          date: string
          start_time: string | null
          end_time: string | null
          location: string | null
          address: string | null
          opponent_team: string | null
          home_away: string | null
          tournament_name: string | null
          tournament_size: number | null
          weigh_in_time: string | null
          bus_departure_time: string | null
          notes: string | null
          results: Json | null
          team_score_us: number | null
          team_score_them: number | null
          team_placement: number | null
        }
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['events']['Insert']>
      }
      practices: {
        Row: {
          id: string
          created_at: string
          team_id: string
          date: string
          start_time: string
          end_time: string
          type: string
          location: string | null
          focus_areas: Json | null
          technique_taught: Json | null
          conditioning_minutes: number | null
          live_wrestling_minutes: number | null
          drilling_minutes: number | null
          attendance: Json | null
          notes: string | null
          injuries_reported: Json | null
        }
        Insert: Omit<Database['public']['Tables']['practices']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['practices']['Insert']>
      }
      weight_management: {
        Row: {
          id: string
          created_at: string
          wrestler_id: string
          date: string
          time: string | null
          weight: number
          body_fat_percentage: number | null
          hydration_level: string | null
          notes: string | null
        }
        Insert: Omit<Database['public']['Tables']['weight_management']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['weight_management']['Insert']>
      }
      statistics: {
        Row: {
          id: string
          created_at: string
          wrestler_id: string
          season: string
          matches_total: number
          matches_won: number
          matches_lost: number
          win_percentage: number
          pins: number
          tech_falls: number
          major_decisions: number
          regular_decisions: number
          losses_by_pin: number
          losses_by_tech_fall: number
          losses_by_major: number
          losses_by_decision: number
          total_points_scored: number
          total_points_allowed: number
          takedowns_total: number
          escapes_total: number
          reversals_total: number
          nearfall_points_total: number
          penalty_points_total: number
          riding_time_points_total: number
          average_match_time: string | null
          fastest_pin: string | null
          tournament_championships: number
          tournament_placings: Json | null
          dual_meet_record: string | null
          matboss_power_index: number | null
        }
        Insert: Omit<Database['public']['Tables']['statistics']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['statistics']['Insert']>
      }
      videos: {
        Row: {
          id: string
          created_at: string
          match_id: string | null
          practice_id: string | null
          wrestler_id: string | null
          title: string
          description: string | null
          url: string
          cloudflare_stream_id: string | null
          duration_seconds: number | null
          thumbnail_url: string | null
          tags: string[] | null
          analysis_complete: boolean
          ai_analysis: Json | null
          moves_detected: Json | null
          key_moments: Json | null
          coach_notes: string | null
        }
        Insert: Omit<Database['public']['Tables']['videos']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['videos']['Insert']>
      }
      ai_analysis: {
        Row: {
          id: string
          created_at: string
          video_id: string
          analysis_type: string
          model_used: string | null
          moves_detected: Json
          positions_timeline: Json | null
          scoring_opportunities: Json | null
          technique_scores: Json | null
          improvement_suggestions: Json | null
          opponent_weaknesses: Json | null
          confidence_scores: Json | null
          processing_time_ms: number | null
        }
        Insert: Omit<Database['public']['Tables']['ai_analysis']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['ai_analysis']['Insert']>
      }
      scouting_reports: {
        Row: {
          id: string
          created_at: string
          wrestler_id: string | null
          opponent_name: string
          opponent_team: string | null
          weight_class: number | null
          stance: string | null
          dominant_positions: Json | null
          favorite_moves: Json | null
          weaknesses: Json | null
          conditioning_level: string | null
          mental_toughness: string | null
          injury_history: Json | null
          recent_results: Json | null
          video_links: Json | null
          game_plan: Json | null
          notes: string | null
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['scouting_reports']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['scouting_reports']['Insert']>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}