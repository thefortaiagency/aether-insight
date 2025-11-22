// Mat Ops AI Tools - Function definitions for agentic AI
// These tools allow the AI to actually modify the database

export interface AITool {
  name: string
  description: string
  category: 'wrestlers' | 'events' | 'practices' | 'weight' | 'matches' | 'query'
  dangerous: boolean // Requires confirmation
  parameters: {
    name: string
    type: 'string' | 'number' | 'boolean' | 'date' | 'array'
    description: string
    required: boolean
    enum?: string[]
  }[]
}

export const AI_TOOLS: AITool[] = [
  // ============== WRESTLER MANAGEMENT ==============
  {
    name: 'add_wrestler',
    description: 'Add a new wrestler to the roster',
    category: 'wrestlers',
    dangerous: false,
    parameters: [
      { name: 'first_name', type: 'string', description: 'First name', required: true },
      { name: 'last_name', type: 'string', description: 'Last name', required: true },
      { name: 'weight_class', type: 'number', description: 'Weight class (106, 113, 120, 126, 132, 138, 144, 150, 157, 165, 175, 190, 215, 285)', required: true },
      { name: 'grade', type: 'number', description: 'Grade level (9-12)', required: false },
      { name: 'years_experience', type: 'number', description: 'Years of wrestling experience', required: false },
      { name: 'stance', type: 'string', description: 'Wrestling stance', required: false, enum: ['right', 'left', 'switch'] },
    ]
  },
  {
    name: 'update_wrestler',
    description: 'Update a wrestler\'s information',
    category: 'wrestlers',
    dangerous: false,
    parameters: [
      { name: 'wrestler_name', type: 'string', description: 'Wrestler name to find (first last)', required: true },
      { name: 'field', type: 'string', description: 'Field to update', required: true, enum: ['weight_class', 'grade', 'years_experience', 'stance', 'gpa', 'notes', 'active', 'parent_email', 'parent_phone'] },
      { name: 'value', type: 'string', description: 'New value for the field', required: true },
    ]
  },
  {
    name: 'deactivate_wrestler',
    description: 'Mark a wrestler as inactive (does not delete)',
    category: 'wrestlers',
    dangerous: true,
    parameters: [
      { name: 'wrestler_name', type: 'string', description: 'Wrestler name (first last)', required: true },
      { name: 'reason', type: 'string', description: 'Reason for deactivation', required: false },
    ]
  },
  {
    name: 'move_weight_class',
    description: 'Move a wrestler to a different weight class',
    category: 'wrestlers',
    dangerous: false,
    parameters: [
      { name: 'wrestler_name', type: 'string', description: 'Wrestler name (first last)', required: true },
      { name: 'new_weight_class', type: 'number', description: 'New weight class', required: true },
    ]
  },
  {
    name: 'set_varsity_lineup',
    description: 'Set the varsity lineup for a weight class',
    category: 'wrestlers',
    dangerous: false,
    parameters: [
      { name: 'weight_class', type: 'number', description: 'Weight class', required: true },
      { name: 'wrestler_name', type: 'string', description: 'Wrestler name for varsity spot', required: true },
    ]
  },

  // ============== EVENT/CALENDAR MANAGEMENT ==============
  {
    name: 'add_event',
    description: 'Add a new event (tournament, dual meet, scrimmage) to the calendar',
    category: 'events',
    dangerous: false,
    parameters: [
      { name: 'name', type: 'string', description: 'Event name', required: true },
      { name: 'type', type: 'string', description: 'Event type', required: true, enum: ['dual', 'tournament', 'scrimmage', 'conference', 'sectional', 'regional', 'state'] },
      { name: 'date', type: 'date', description: 'Event date (YYYY-MM-DD)', required: true },
      { name: 'start_time', type: 'string', description: 'Start time (HH:MM)', required: false },
      { name: 'location', type: 'string', description: 'Venue/location name', required: false },
      { name: 'address', type: 'string', description: 'Full address', required: false },
      { name: 'opponent_team', type: 'string', description: 'Opponent team name (for duals)', required: false },
      { name: 'home_away', type: 'string', description: 'Home or away', required: false, enum: ['home', 'away', 'neutral'] },
      { name: 'weigh_in_time', type: 'string', description: 'Weigh-in time', required: false },
      { name: 'bus_departure_time', type: 'string', description: 'Bus departure time', required: false },
    ]
  },
  {
    name: 'update_event',
    description: 'Update an existing event',
    category: 'events',
    dangerous: false,
    parameters: [
      { name: 'event_name', type: 'string', description: 'Event name to find', required: true },
      { name: 'field', type: 'string', description: 'Field to update', required: true, enum: ['name', 'date', 'start_time', 'end_time', 'location', 'address', 'opponent_team', 'weigh_in_time', 'bus_departure_time', 'notes'] },
      { name: 'value', type: 'string', description: 'New value', required: true },
    ]
  },
  {
    name: 'cancel_event',
    description: 'Cancel/delete an event from the calendar',
    category: 'events',
    dangerous: true,
    parameters: [
      { name: 'event_name', type: 'string', description: 'Event name to cancel', required: true },
      { name: 'reason', type: 'string', description: 'Cancellation reason', required: false },
    ]
  },
  {
    name: 'record_event_results',
    description: 'Record the results of a completed event',
    category: 'events',
    dangerous: false,
    parameters: [
      { name: 'event_name', type: 'string', description: 'Event name', required: true },
      { name: 'team_score_us', type: 'number', description: 'Our team score', required: false },
      { name: 'team_score_them', type: 'number', description: 'Opponent team score', required: false },
      { name: 'team_placement', type: 'number', description: 'Tournament placement (1st, 2nd, etc)', required: false },
      { name: 'notes', type: 'string', description: 'Event notes/summary', required: false },
    ]
  },

  // ============== PRACTICE MANAGEMENT ==============
  {
    name: 'add_practice',
    description: 'Schedule a new practice session',
    category: 'practices',
    dangerous: false,
    parameters: [
      { name: 'date', type: 'date', description: 'Practice date (YYYY-MM-DD)', required: true },
      { name: 'start_time', type: 'string', description: 'Start time (HH:MM)', required: true },
      { name: 'end_time', type: 'string', description: 'End time (HH:MM)', required: true },
      { name: 'type', type: 'string', description: 'Practice type', required: false, enum: ['regular', 'light', 'competition_prep', 'technique', 'conditioning', 'film_study'] },
      { name: 'location', type: 'string', description: 'Practice location', required: false },
      { name: 'focus_areas', type: 'array', description: 'Techniques/areas to focus on', required: false },
    ]
  },
  {
    name: 'update_practice',
    description: 'Update practice details',
    category: 'practices',
    dangerous: false,
    parameters: [
      { name: 'date', type: 'date', description: 'Practice date to find', required: true },
      { name: 'field', type: 'string', description: 'Field to update', required: true, enum: ['start_time', 'end_time', 'type', 'location', 'focus_areas', 'notes'] },
      { name: 'value', type: 'string', description: 'New value', required: true },
    ]
  },
  {
    name: 'cancel_practice',
    description: 'Cancel a scheduled practice',
    category: 'practices',
    dangerous: true,
    parameters: [
      { name: 'date', type: 'date', description: 'Practice date to cancel', required: true },
      { name: 'reason', type: 'string', description: 'Cancellation reason', required: false },
    ]
  },
  {
    name: 'record_practice_details',
    description: 'Record what was done in practice (after practice)',
    category: 'practices',
    dangerous: false,
    parameters: [
      { name: 'date', type: 'date', description: 'Practice date', required: true },
      { name: 'technique_taught', type: 'array', description: 'Techniques covered', required: false },
      { name: 'conditioning_minutes', type: 'number', description: 'Minutes of conditioning', required: false },
      { name: 'live_wrestling_minutes', type: 'number', description: 'Minutes of live wrestling', required: false },
      { name: 'drilling_minutes', type: 'number', description: 'Minutes of drilling', required: false },
      { name: 'notes', type: 'string', description: 'Practice notes', required: false },
    ]
  },
  {
    name: 'record_attendance',
    description: 'Record practice attendance',
    category: 'practices',
    dangerous: false,
    parameters: [
      { name: 'date', type: 'date', description: 'Practice date', required: true },
      { name: 'present', type: 'array', description: 'List of wrestlers present', required: true },
      { name: 'absent', type: 'array', description: 'List of wrestlers absent', required: false },
      { name: 'excused', type: 'array', description: 'List of excused absences', required: false },
    ]
  },

  // ============== WEIGHT MANAGEMENT ==============
  {
    name: 'record_weight',
    description: 'Record a wrestler\'s weight check',
    category: 'weight',
    dangerous: false,
    parameters: [
      { name: 'wrestler_name', type: 'string', description: 'Wrestler name', required: true },
      { name: 'weight', type: 'number', description: 'Weight in pounds', required: true },
      { name: 'date', type: 'date', description: 'Date of weigh-in (defaults to today)', required: false },
      { name: 'hydration_level', type: 'string', description: 'Hydration status', required: false, enum: ['good', 'fair', 'poor'] },
      { name: 'notes', type: 'string', description: 'Notes about the weigh-in', required: false },
    ]
  },
  {
    name: 'bulk_record_weights',
    description: 'Record weights for multiple wrestlers at once',
    category: 'weight',
    dangerous: false,
    parameters: [
      { name: 'weights', type: 'array', description: 'Array of {wrestler_name, weight} objects', required: true },
      { name: 'date', type: 'date', description: 'Date of weigh-in', required: false },
    ]
  },

  // ============== MATCH MANAGEMENT ==============
  {
    name: 'add_match_result',
    description: 'Record a match result for a wrestler',
    category: 'matches',
    dangerous: false,
    parameters: [
      { name: 'wrestler_name', type: 'string', description: 'Wrestler name', required: true },
      { name: 'opponent_name', type: 'string', description: 'Opponent name', required: true },
      { name: 'opponent_team', type: 'string', description: 'Opponent team', required: false },
      { name: 'result', type: 'string', description: 'Win or loss', required: true, enum: ['win', 'loss'] },
      { name: 'win_type', type: 'string', description: 'Type of win/loss', required: false, enum: ['pin', 'tech_fall', 'major', 'decision', 'forfeit', 'default', 'disqualification'] },
      { name: 'wrestler_score', type: 'number', description: 'Wrestler\'s score', required: false },
      { name: 'opponent_score', type: 'number', description: 'Opponent\'s score', required: false },
      { name: 'event_name', type: 'string', description: 'Event/tournament name', required: false },
    ]
  },

  // ============== QUERY TOOLS (Read-only) ==============
  {
    name: 'get_upcoming_events',
    description: 'Get upcoming events on the calendar',
    category: 'query',
    dangerous: false,
    parameters: [
      { name: 'days', type: 'number', description: 'Number of days to look ahead (default 14)', required: false },
      { name: 'type', type: 'string', description: 'Filter by event type', required: false, enum: ['dual', 'tournament', 'scrimmage', 'all'] },
    ]
  },
  {
    name: 'get_upcoming_practices',
    description: 'Get upcoming scheduled practices',
    category: 'query',
    dangerous: false,
    parameters: [
      { name: 'days', type: 'number', description: 'Number of days to look ahead (default 7)', required: false },
    ]
  },
  {
    name: 'get_wrestler_stats',
    description: 'Get detailed stats for a specific wrestler',
    category: 'query',
    dangerous: false,
    parameters: [
      { name: 'wrestler_name', type: 'string', description: 'Wrestler name', required: true },
    ]
  },
  {
    name: 'get_weight_history',
    description: 'Get weight history for a wrestler',
    category: 'query',
    dangerous: false,
    parameters: [
      { name: 'wrestler_name', type: 'string', description: 'Wrestler name', required: true },
      { name: 'days', type: 'number', description: 'Number of days of history (default 30)', required: false },
    ]
  },
  {
    name: 'get_roster_by_weight',
    description: 'Get wrestlers at a specific weight class',
    category: 'query',
    dangerous: false,
    parameters: [
      { name: 'weight_class', type: 'number', description: 'Weight class', required: true },
    ]
  },
  {
    name: 'get_attendance_report',
    description: 'Get attendance report for a date range',
    category: 'query',
    dangerous: false,
    parameters: [
      { name: 'start_date', type: 'date', description: 'Start date', required: true },
      { name: 'end_date', type: 'date', description: 'End date', required: true },
    ]
  },
  {
    name: 'get_team_record',
    description: 'Get the team\'s overall record',
    category: 'query',
    dangerous: false,
    parameters: []
  },
  {
    name: 'get_wrestler_matches',
    description: 'Get all matches/match history for a specific wrestler',
    category: 'query',
    dangerous: false,
    parameters: [
      { name: 'wrestler_name', type: 'string', description: 'Wrestler name (first last)', required: true },
      { name: 'limit', type: 'number', description: 'Max number of matches to return (default all)', required: false },
    ]
  },
]

// Convert to OpenAI function calling format
export function getOpenAITools() {
  return AI_TOOLS.map(tool => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: 'object',
        properties: tool.parameters.reduce((acc, param) => {
          if (param.type === 'array') {
            // OpenAI requires items property for array types
            acc[param.name] = {
              type: 'array',
              items: { type: 'string' },
              description: param.description,
            }
          } else {
            acc[param.name] = {
              type: param.type === 'date' ? 'string' : param.type,
              description: param.description,
              ...(param.enum ? { enum: param.enum } : {}),
            }
          }
          return acc
        }, {} as Record<string, any>),
        required: tool.parameters.filter(p => p.required).map(p => p.name),
      },
    },
  }))
}

// Get tool by name
export function getTool(name: string): AITool | undefined {
  return AI_TOOLS.find(t => t.name === name)
}

// Check if tool requires confirmation
export function requiresConfirmation(toolName: string): boolean {
  const tool = getTool(toolName)
  return tool?.dangerous ?? false
}
