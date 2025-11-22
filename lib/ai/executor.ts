// Mat Ops AI Action Executor
// Executes AI tool calls against the database

import { createClient } from '@supabase/supabase-js'
import { getTool, requiresConfirmation } from './tools'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Use service role for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface ActionResult {
  success: boolean
  message: string
  data?: any
  requiresConfirmation?: boolean
  confirmationMessage?: string
  mutated?: boolean // True if data was modified (triggers UI refresh)
}

// Helper to find wrestler by name
async function findWrestler(teamId: string, name: string) {
  const parts = name.trim().split(' ')
  const firstName = parts[0]
  const lastName = parts.slice(1).join(' ') || parts[0]

  // Try exact match first
  let { data } = await supabase
    .from('wrestlers')
    .select('*')
    .eq('team_id', teamId)
    .ilike('first_name', firstName)
    .ilike('last_name', lastName)
    .single()

  if (!data) {
    // Try partial match
    const { data: partialMatch } = await supabase
      .from('wrestlers')
      .select('*')
      .eq('team_id', teamId)
      .or(`first_name.ilike.%${firstName}%,last_name.ilike.%${lastName}%`)
      .limit(1)
      .single()
    data = partialMatch
  }

  return data
}

// Helper to find event by name
async function findEvent(teamId: string, name: string) {
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('team_id', teamId)
    .ilike('name', `%${name}%`)
    .order('date', { ascending: false })
    .limit(1)
    .single()

  return data
}

// Helper to find practice by date
async function findPractice(teamId: string, date: string) {
  const { data } = await supabase
    .from('practices')
    .select('*')
    .eq('team_id', teamId)
    .eq('date', date)
    .single()

  return data
}

// ============== WRESTLER ACTIONS ==============

async function addWrestler(teamId: string, params: any): Promise<ActionResult> {
  const { first_name, last_name, weight_class, grade, years_experience, stance } = params

  // Check if wrestler already exists
  const existing = await findWrestler(teamId, `${first_name} ${last_name}`)
  if (existing) {
    return { success: false, message: `Wrestler ${first_name} ${last_name} already exists on the roster.` }
  }

  const { data, error } = await supabase
    .from('wrestlers')
    .insert({
      team_id: teamId,
      first_name,
      last_name,
      weight_class: weight_class ? parseInt(weight_class) : null,
      grade: grade ? parseInt(grade) : null,
      years_experience: years_experience ? parseInt(years_experience) : 0,
      stance: stance || null,
      active: true,
      season_wins: 0,
      season_losses: 0,
      career_wins: 0,
      career_losses: 0,
      pins: 0,
      tech_falls: 0,
      major_decisions: 0,
      doctor_clearance: false,
    })
    .select()
    .single()

  if (error) {
    return { success: false, message: `Failed to add wrestler: ${error.message}` }
  }

  return {
    success: true,
    message: `Added ${first_name} ${last_name} to the roster at ${weight_class || 'unassigned'} lbs.`,
    data,
    mutated: true
  }
}

async function updateWrestler(teamId: string, params: any): Promise<ActionResult> {
  const { wrestler_name, field, value } = params

  const wrestler = await findWrestler(teamId, wrestler_name)
  if (!wrestler) {
    return { success: false, message: `Could not find wrestler: ${wrestler_name}` }
  }

  // Parse value based on field type
  let parsedValue: any = value
  if (['weight_class', 'grade', 'years_experience', 'gpa'].includes(field)) {
    parsedValue = parseFloat(value)
  } else if (field === 'active') {
    parsedValue = value === 'true' || value === true
  }

  const { error } = await supabase
    .from('wrestlers')
    .update({ [field]: parsedValue })
    .eq('id', wrestler.id)

  if (error) {
    return { success: false, message: `Failed to update wrestler: ${error.message}` }
  }

  return {
    success: true,
    message: `Updated ${wrestler.first_name} ${wrestler.last_name}'s ${field} to ${value}.`,
    mutated: true
  }
}

async function deactivateWrestler(teamId: string, params: any): Promise<ActionResult> {
  const { wrestler_name, reason } = params

  const wrestler = await findWrestler(teamId, wrestler_name)
  if (!wrestler) {
    return { success: false, message: `Could not find wrestler: ${wrestler_name}` }
  }

  const { error } = await supabase
    .from('wrestlers')
    .update({
      active: false,
      notes: wrestler.notes
        ? `${wrestler.notes}\n\nDeactivated: ${reason || 'No reason provided'}`
        : `Deactivated: ${reason || 'No reason provided'}`
    })
    .eq('id', wrestler.id)

  if (error) {
    return { success: false, message: `Failed to deactivate wrestler: ${error.message}` }
  }

  return {
    success: true,
    message: `Deactivated ${wrestler.first_name} ${wrestler.last_name} from the roster.`,
    mutated: true
  }
}

async function moveWeightClass(teamId: string, params: any): Promise<ActionResult> {
  const { wrestler_name, new_weight_class } = params

  const wrestler = await findWrestler(teamId, wrestler_name)
  if (!wrestler) {
    return { success: false, message: `Could not find wrestler: ${wrestler_name}` }
  }

  const oldWeight = wrestler.weight_class

  const { error } = await supabase
    .from('wrestlers')
    .update({ weight_class: parseInt(new_weight_class) })
    .eq('id', wrestler.id)

  if (error) {
    return { success: false, message: `Failed to move weight class: ${error.message}` }
  }

  return {
    success: true,
    message: `Moved ${wrestler.first_name} ${wrestler.last_name} from ${oldWeight || 'unassigned'} to ${new_weight_class} lbs.`,
    mutated: true
  }
}

// ============== EVENT ACTIONS ==============

async function addEvent(teamId: string, params: any): Promise<ActionResult> {
  const { name, type, date, start_time, location, address, opponent_team, home_away, weigh_in_time, bus_departure_time, importance, peak_event } = params

  // Auto-set importance based on event type if not provided
  let eventImportance = importance
  if (!eventImportance) {
    if (['state', 'regional', 'sectional'].includes(type)) eventImportance = 5
    else if (['conference'].includes(type)) eventImportance = 4
    else if (['tournament', 'dual'].includes(type)) eventImportance = 3
    else if (['scrimmage'].includes(type)) eventImportance = 2
    else eventImportance = 3
  }

  // Auto-set peak_event for high importance
  const isPeakEvent = peak_event !== undefined ? peak_event : eventImportance >= 5

  const { data, error } = await supabase
    .from('events')
    .insert({
      team_id: teamId,
      name,
      type,
      date,
      start_time: start_time || null,
      location: location || null,
      address: address || null,
      opponent_team: opponent_team || null,
      home_away: home_away || null,
      weigh_in_time: weigh_in_time || null,
      bus_departure_time: bus_departure_time || null,
      importance: eventImportance,
      peak_event: isPeakEvent,
    })
    .select()
    .single()

  if (error) {
    return { success: false, message: `Failed to add event: ${error.message}` }
  }

  const importanceLabel = ['', 'Low', 'Med-Low', 'Medium', 'High', 'Peak'][eventImportance]
  return {
    success: true,
    message: `Added "${name}" (${type}) on ${date}${location ? ` at ${location}` : ''}. Importance: ${importanceLabel}${isPeakEvent ? ' [PEAK EVENT]' : ''}.`,
    data,
    mutated: true
  }
}

async function updateEvent(teamId: string, params: any): Promise<ActionResult> {
  const { event_name, field, value } = params

  const event = await findEvent(teamId, event_name)
  if (!event) {
    return { success: false, message: `Could not find event: ${event_name}` }
  }

  const { error } = await supabase
    .from('events')
    .update({ [field]: value })
    .eq('id', event.id)

  if (error) {
    return { success: false, message: `Failed to update event: ${error.message}` }
  }

  return {
    success: true,
    message: `Updated "${event.name}" - ${field} is now "${value}".`,
    mutated: true
  }
}

async function cancelEvent(teamId: string, params: any): Promise<ActionResult> {
  const { event_name, reason } = params

  const event = await findEvent(teamId, event_name)
  if (!event) {
    return { success: false, message: `Could not find event: ${event_name}` }
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', event.id)

  if (error) {
    return { success: false, message: `Failed to cancel event: ${error.message}` }
  }

  return {
    success: true,
    message: `Cancelled "${event.name}" on ${event.date}.${reason ? ` Reason: ${reason}` : ''}`,
    mutated: true
  }
}

async function recordEventResults(teamId: string, params: any): Promise<ActionResult> {
  const { event_name, team_score_us, team_score_them, team_placement, notes } = params

  const event = await findEvent(teamId, event_name)
  if (!event) {
    return { success: false, message: `Could not find event: ${event_name}` }
  }

  const updates: any = {}
  if (team_score_us !== undefined) updates.team_score_us = parseInt(team_score_us)
  if (team_score_them !== undefined) updates.team_score_them = parseInt(team_score_them)
  if (team_placement !== undefined) updates.team_placement = parseInt(team_placement)
  if (notes) updates.notes = notes

  const { error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', event.id)

  if (error) {
    return { success: false, message: `Failed to record results: ${error.message}` }
  }

  let resultMessage = `Recorded results for "${event.name}"`
  if (team_score_us !== undefined && team_score_them !== undefined) {
    resultMessage += `: ${team_score_us}-${team_score_them}`
  }
  if (team_placement) {
    resultMessage += ` (${team_placement}${getOrdinalSuffix(team_placement)} place)`
  }

  return { success: true, message: resultMessage, mutated: true }
}

// ============== PRACTICE ACTIONS ==============

async function addPractice(teamId: string, params: any): Promise<ActionResult> {
  const { date, start_time, end_time, type, location, focus_areas } = params

  // Check if practice already exists on this date
  const existing = await findPractice(teamId, date)
  if (existing) {
    return { success: false, message: `A practice is already scheduled for ${date}.` }
  }

  const { data, error } = await supabase
    .from('practices')
    .insert({
      team_id: teamId,
      date,
      start_time,
      end_time,
      type: type || 'regular',
      location: location || null,
      focus_areas: focus_areas ? (Array.isArray(focus_areas) ? focus_areas : [focus_areas]) : null,
    })
    .select()
    .single()

  if (error) {
    return { success: false, message: `Failed to schedule practice: ${error.message}` }
  }

  return {
    success: true,
    message: `Scheduled ${type || 'regular'} practice for ${date} from ${start_time} to ${end_time}.`,
    data,
    mutated: true
  }
}

async function updatePractice(teamId: string, params: any): Promise<ActionResult> {
  const { date, field, value } = params

  const practice = await findPractice(teamId, date)
  if (!practice) {
    return { success: false, message: `Could not find practice on ${date}` }
  }

  let parsedValue: any = value
  if (field === 'focus_areas') {
    parsedValue = Array.isArray(value) ? value : [value]
  }

  const { error } = await supabase
    .from('practices')
    .update({ [field]: parsedValue })
    .eq('id', practice.id)

  if (error) {
    return { success: false, message: `Failed to update practice: ${error.message}` }
  }

  return {
    success: true,
    message: `Updated practice on ${date} - ${field} is now "${value}".`,
    mutated: true
  }
}

async function cancelPractice(teamId: string, params: any): Promise<ActionResult> {
  const { date, reason } = params

  const practice = await findPractice(teamId, date)
  if (!practice) {
    return { success: false, message: `Could not find practice on ${date}` }
  }

  const { error } = await supabase
    .from('practices')
    .delete()
    .eq('id', practice.id)

  if (error) {
    return { success: false, message: `Failed to cancel practice: ${error.message}` }
  }

  return {
    success: true,
    message: `Cancelled practice on ${date}.${reason ? ` Reason: ${reason}` : ''}`,
    mutated: true
  }
}

async function recordPracticeDetails(teamId: string, params: any): Promise<ActionResult> {
  const { date, technique_taught, conditioning_minutes, live_wrestling_minutes, drilling_minutes, notes } = params

  const practice = await findPractice(teamId, date)
  if (!practice) {
    return { success: false, message: `Could not find practice on ${date}` }
  }

  const updates: any = {}
  if (technique_taught) updates.technique_taught = Array.isArray(technique_taught) ? technique_taught : [technique_taught]
  if (conditioning_minutes !== undefined) updates.conditioning_minutes = parseInt(conditioning_minutes)
  if (live_wrestling_minutes !== undefined) updates.live_wrestling_minutes = parseInt(live_wrestling_minutes)
  if (drilling_minutes !== undefined) updates.drilling_minutes = parseInt(drilling_minutes)
  if (notes) updates.notes = notes

  const { error } = await supabase
    .from('practices')
    .update(updates)
    .eq('id', practice.id)

  if (error) {
    return { success: false, message: `Failed to record practice details: ${error.message}` }
  }

  return {
    success: true,
    message: `Recorded details for practice on ${date}.`,
    mutated: true
  }
}

async function recordAttendance(teamId: string, params: any): Promise<ActionResult> {
  const { date, present, absent, excused } = params

  const practice = await findPractice(teamId, date)
  if (!practice) {
    return { success: false, message: `Could not find practice on ${date}` }
  }

  const attendance = {
    present: Array.isArray(present) ? present : [present],
    absent: absent ? (Array.isArray(absent) ? absent : [absent]) : [],
    excused: excused ? (Array.isArray(excused) ? excused : [excused]) : [],
  }

  const { error } = await supabase
    .from('practices')
    .update({ attendance })
    .eq('id', practice.id)

  if (error) {
    return { success: false, message: `Failed to record attendance: ${error.message}` }
  }

  return {
    success: true,
    message: `Recorded attendance for ${date}: ${attendance.present.length} present, ${attendance.absent.length} absent, ${attendance.excused.length} excused.`,
    mutated: true
  }
}

// ============== WEIGHT MANAGEMENT ACTIONS ==============

async function recordWeight(teamId: string, params: any): Promise<ActionResult> {
  const { wrestler_name, weight, date, hydration_level, notes } = params

  const wrestler = await findWrestler(teamId, wrestler_name)
  if (!wrestler) {
    return { success: false, message: `Could not find wrestler: ${wrestler_name}` }
  }

  const { data, error } = await supabase
    .from('weight_management')
    .insert({
      wrestler_id: wrestler.id,
      date: date || new Date().toISOString().split('T')[0],
      weight: parseFloat(weight),
      hydration_level: hydration_level || null,
      notes: notes || null,
    })
    .select()
    .single()

  if (error) {
    return { success: false, message: `Failed to record weight: ${error.message}` }
  }

  const weightDiff = wrestler.weight_class ? parseFloat(weight) - wrestler.weight_class : null
  let message = `Recorded ${wrestler.first_name} ${wrestler.last_name} at ${weight} lbs.`
  if (weightDiff !== null) {
    if (weightDiff > 0) {
      message += ` (${weightDiff.toFixed(1)} lbs over ${wrestler.weight_class})`
    } else if (weightDiff < 0) {
      message += ` (${Math.abs(weightDiff).toFixed(1)} lbs under ${wrestler.weight_class})`
    } else {
      message += ` (right at weight!)`
    }
  }

  return { success: true, message, data, mutated: true }
}

async function bulkRecordWeights(teamId: string, params: any): Promise<ActionResult> {
  const { weights, date } = params
  const recordDate = date || new Date().toISOString().split('T')[0]

  const results: string[] = []
  let successCount = 0

  for (const entry of weights) {
    const wrestler = await findWrestler(teamId, entry.wrestler_name)
    if (!wrestler) {
      results.push(`${entry.wrestler_name}: not found`)
      continue
    }

    const { error } = await supabase
      .from('weight_management')
      .insert({
        wrestler_id: wrestler.id,
        date: recordDate,
        weight: parseFloat(entry.weight),
      })

    if (error) {
      results.push(`${entry.wrestler_name}: failed`)
    } else {
      successCount++
    }
  }

  return {
    success: successCount > 0,
    message: `Recorded weights for ${successCount}/${weights.length} wrestlers on ${recordDate}.`,
    mutated: successCount > 0
  }
}

// ============== MATCH ACTIONS ==============

async function addMatchResult(teamId: string, params: any): Promise<ActionResult> {
  const { wrestler_name, opponent_name, opponent_team, result, win_type, wrestler_score, opponent_score, event_name } = params

  const wrestler = await findWrestler(teamId, wrestler_name)
  if (!wrestler) {
    return { success: false, message: `Could not find wrestler: ${wrestler_name}` }
  }

  // Find event if provided
  let eventId = null
  if (event_name) {
    const event = await findEvent(teamId, event_name)
    if (event) eventId = event.id
  }

  const { data, error } = await supabase
    .from('matches')
    .insert({
      wrestler_id: wrestler.id,
      event_id: eventId,
      opponent_name,
      opponent_team: opponent_team || null,
      weight_class: wrestler.weight_class || 0,
      result,
      win_type: win_type || null,
      wrestler_score: wrestler_score ? parseInt(wrestler_score) : 0,
      opponent_score: opponent_score ? parseInt(opponent_score) : 0,
      match_type: 'varsity',
    })
    .select()
    .single()

  if (error) {
    return { success: false, message: `Failed to record match: ${error.message}` }
  }

  const winTypeText = win_type ? ` by ${win_type.replace('_', ' ')}` : ''
  return {
    success: true,
    message: `Recorded ${result}${winTypeText} for ${wrestler.first_name} ${wrestler.last_name} vs ${opponent_name}.`,
    data,
    mutated: true
  }
}

// ============== QUERY ACTIONS ==============

async function getUpcomingEvents(teamId: string, params: any): Promise<ActionResult> {
  const { days = 14, type } = params
  const startDate = new Date().toISOString().split('T')[0]
  const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  let query = supabase
    .from('events')
    .select('*')
    .eq('team_id', teamId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (type && type !== 'all') {
    query = query.eq('type', type)
  }

  const { data, error } = await query

  if (error) {
    return { success: false, message: `Failed to fetch events: ${error.message}` }
  }

  if (!data || data.length === 0) {
    return { success: true, message: `No events scheduled in the next ${days} days.`, data: [] }
  }

  const eventList = data.map(e =>
    `- ${e.date}: ${e.name} (${e.type})${e.location ? ` at ${e.location}` : ''}${e.opponent_team ? ` vs ${e.opponent_team}` : ''}`
  ).join('\n')

  return {
    success: true,
    message: `Upcoming events in the next ${days} days:\n${eventList}`,
    data
  }
}

async function getUpcomingPractices(teamId: string, params: any): Promise<ActionResult> {
  const { days = 7 } = params
  const startDate = new Date().toISOString().split('T')[0]
  const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('practices')
    .select('*')
    .eq('team_id', teamId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) {
    return { success: false, message: `Failed to fetch practices: ${error.message}` }
  }

  if (!data || data.length === 0) {
    return { success: true, message: `No practices scheduled in the next ${days} days.`, data: [] }
  }

  const practiceList = data.map(p =>
    `- ${p.date}: ${p.start_time}-${p.end_time} (${p.type})${p.focus_areas ? ` - Focus: ${p.focus_areas.join(', ')}` : ''}`
  ).join('\n')

  return {
    success: true,
    message: `Upcoming practices:\n${practiceList}`,
    data
  }
}

async function getWrestlerStats(teamId: string, params: any): Promise<ActionResult> {
  const { wrestler_name } = params

  const wrestler = await findWrestler(teamId, wrestler_name)
  if (!wrestler) {
    return { success: false, message: `Could not find wrestler: ${wrestler_name}` }
  }

  // Get matches
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('wrestler_id', wrestler.id)

  const wins = matches?.filter(m => m.result === 'win').length || 0
  const losses = matches?.filter(m => m.result === 'loss').length || 0
  const pins = matches?.filter(m => m.result === 'win' && (m.win_type === 'pin' || m.win_type === 'fall')).length || 0
  const techFalls = matches?.filter(m => m.result === 'win' && m.win_type === 'tech_fall').length || 0
  const majors = matches?.filter(m => m.result === 'win' && m.win_type === 'major').length || 0

  return {
    success: true,
    message: `**${wrestler.first_name} ${wrestler.last_name}** (${wrestler.weight_class || '?'} lbs, Grade ${wrestler.grade || '?'})
Record: ${wins}-${losses} (${wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : 0}%)
Pins: ${pins} | Tech Falls: ${techFalls} | Majors: ${majors}
Experience: ${wrestler.years_experience} years`,
    data: { wrestler, wins, losses, pins, techFalls, majors }
  }
}

async function getWeightHistory(teamId: string, params: any): Promise<ActionResult> {
  const { wrestler_name, days = 30 } = params

  const wrestler = await findWrestler(teamId, wrestler_name)
  if (!wrestler) {
    return { success: false, message: `Could not find wrestler: ${wrestler_name}` }
  }

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('weight_management')
    .select('*')
    .eq('wrestler_id', wrestler.id)
    .gte('date', startDate)
    .order('date', { ascending: false })

  if (error) {
    return { success: false, message: `Failed to fetch weight history: ${error.message}` }
  }

  if (!data || data.length === 0) {
    return { success: true, message: `No weight records for ${wrestler.first_name} ${wrestler.last_name} in the last ${days} days.`, data: [] }
  }

  const weightList = data.map(w => `- ${w.date}: ${w.weight} lbs`).join('\n')
  const avgWeight = (data.reduce((sum, w) => sum + w.weight, 0) / data.length).toFixed(1)

  return {
    success: true,
    message: `Weight history for ${wrestler.first_name} ${wrestler.last_name} (target: ${wrestler.weight_class} lbs):
Average: ${avgWeight} lbs
${weightList}`,
    data
  }
}

async function getRosterByWeight(teamId: string, params: any): Promise<ActionResult> {
  const { weight_class } = params

  const { data, error } = await supabase
    .from('wrestlers')
    .select('*')
    .eq('team_id', teamId)
    .eq('weight_class', parseInt(weight_class))
    .eq('active', true)

  if (error) {
    return { success: false, message: `Failed to fetch roster: ${error.message}` }
  }

  if (!data || data.length === 0) {
    return { success: true, message: `No wrestlers at ${weight_class} lbs.`, data: [] }
  }

  const wrestlerList = data.map(w =>
    `- ${w.first_name} ${w.last_name} (Grade ${w.grade || '?'}, ${w.years_experience} yrs exp)`
  ).join('\n')

  return {
    success: true,
    message: `Wrestlers at ${weight_class} lbs:\n${wrestlerList}`,
    data
  }
}

async function getAttendanceReport(teamId: string, params: any): Promise<ActionResult> {
  const { start_date, end_date } = params

  const { data, error } = await supabase
    .from('practices')
    .select('date, attendance')
    .eq('team_id', teamId)
    .gte('date', start_date)
    .lte('date', end_date)
    .not('attendance', 'is', null)
    .order('date', { ascending: true })

  if (error) {
    return { success: false, message: `Failed to fetch attendance: ${error.message}` }
  }

  if (!data || data.length === 0) {
    return { success: true, message: `No attendance records for ${start_date} to ${end_date}.`, data: [] }
  }

  // Aggregate attendance
  const attendanceCounts: Record<string, { present: number, absent: number, excused: number }> = {}

  data.forEach(practice => {
    if (practice.attendance) {
      const att = practice.attendance as any
      att.present?.forEach((name: string) => {
        if (!attendanceCounts[name]) attendanceCounts[name] = { present: 0, absent: 0, excused: 0 }
        attendanceCounts[name].present++
      })
      att.absent?.forEach((name: string) => {
        if (!attendanceCounts[name]) attendanceCounts[name] = { present: 0, absent: 0, excused: 0 }
        attendanceCounts[name].absent++
      })
      att.excused?.forEach((name: string) => {
        if (!attendanceCounts[name]) attendanceCounts[name] = { present: 0, absent: 0, excused: 0 }
        attendanceCounts[name].excused++
      })
    }
  })

  const report = Object.entries(attendanceCounts)
    .sort((a, b) => b[1].present - a[1].present)
    .map(([name, counts]) => {
      const total = counts.present + counts.absent + counts.excused
      const pct = ((counts.present / total) * 100).toFixed(0)
      return `- ${name}: ${counts.present}/${total} practices (${pct}%)`
    })
    .join('\n')

  return {
    success: true,
    message: `Attendance report (${start_date} to ${end_date}):\n${report}`,
    data: attendanceCounts
  }
}

async function getTeamRecord(teamId: string, params: any): Promise<ActionResult> {
  // Get all wrestlers
  const { data: wrestlers } = await supabase
    .from('wrestlers')
    .select('id')
    .eq('team_id', teamId)

  if (!wrestlers || wrestlers.length === 0) {
    return { success: true, message: 'No wrestlers on roster.', data: {} }
  }

  const wrestlerIds = wrestlers.map(w => w.id)

  // Get all matches
  const { data: matches } = await supabase
    .from('matches')
    .select('result, win_type')
    .in('wrestler_id', wrestlerIds)

  if (!matches || matches.length === 0) {
    return { success: true, message: 'No matches recorded yet.', data: {} }
  }

  const wins = matches.filter(m => m.result === 'win').length
  const losses = matches.filter(m => m.result === 'loss').length
  const pins = matches.filter(m => m.result === 'win' && (m.win_type === 'pin' || m.win_type === 'fall')).length
  const techFalls = matches.filter(m => m.result === 'win' && m.win_type === 'tech_fall').length
  const majors = matches.filter(m => m.result === 'win' && m.win_type === 'major').length
  const decisions = matches.filter(m => m.result === 'win' && (m.win_type === 'decision' || !m.win_type)).length

  const bonusPct = wins > 0 ? (((pins + techFalls + majors) / wins) * 100).toFixed(1) : '0'
  const winPct = wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : '0'

  return {
    success: true,
    message: `**Team Record**: ${wins}-${losses} (${winPct}%)
**Win Types**: ${pins} pins, ${techFalls} tech falls, ${majors} majors, ${decisions} decisions
**Bonus Point Rate**: ${bonusPct}%
**Team Points Potential**: ${(pins * 6) + (techFalls * 5) + (majors * 4) + (decisions * 3)} pts`,
    data: { wins, losses, pins, techFalls, majors, decisions }
  }
}

async function getWrestlerMatches(teamId: string, params: any): Promise<ActionResult> {
  const { wrestler_name, limit } = params

  const wrestler = await findWrestler(teamId, wrestler_name)
  if (!wrestler) {
    return { success: false, message: `Could not find wrestler: ${wrestler_name}` }
  }

  let query = supabase
    .from('matches')
    .select('*')
    .eq('wrestler_id', wrestler.id)
    .order('match_date', { ascending: false })

  if (limit) {
    query = query.limit(parseInt(limit))
  }

  const { data: matches, error } = await query

  if (error) {
    return { success: false, message: `Failed to fetch matches: ${error.message}` }
  }

  if (!matches || matches.length === 0) {
    return {
      success: true,
      message: `No matches found for ${wrestler.first_name} ${wrestler.last_name}.`,
      data: []
    }
  }

  // Format match list
  const matchList = matches.map((m, i) => {
    const result = m.result === 'win' ? 'W' : 'L'
    const winType = m.win_type ? ` (${m.win_type.replace('_', ' ')})` : ''
    const score = m.final_score_for !== undefined && m.final_score_against !== undefined
      ? ` ${m.final_score_for}-${m.final_score_against}`
      : ''
    const date = m.match_date || 'Unknown date'
    const opponent = m.opponent_name || 'Unknown'
    const team = m.opponent_team ? ` (${m.opponent_team})` : ''

    return `${i + 1}. ${date}: **${result}**${winType}${score} vs ${opponent}${team}`
  }).join('\n')

  const wins = matches.filter(m => m.result === 'win').length
  const losses = matches.filter(m => m.result === 'loss').length

  return {
    success: true,
    message: `**${wrestler.first_name} ${wrestler.last_name}** - Match History (${wins}-${losses}):\n\n${matchList}`,
    data: matches
  }
}

// Helper function for ordinal suffix
function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

async function getPeakEvents(teamId: string, params: any): Promise<ActionResult> {
  const { min_importance = 4 } = params
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('team_id', teamId)
    .gte('date', today)
    .gte('importance', min_importance)
    .order('date', { ascending: true })

  if (error) {
    return { success: false, message: `Failed to fetch peak events: ${error.message}` }
  }

  if (!data || data.length === 0) {
    return { success: true, message: `No upcoming events with importance ${min_importance}+ found.`, data: [] }
  }

  const importanceLabels = ['', 'Low', 'Med-Low', 'Medium', 'High', 'Peak']
  const eventList = data.map(e => {
    const daysOut = Math.ceil((new Date(e.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return `- **${e.name}** (${e.type}) - ${e.date} [${importanceLabels[e.importance]}] - ${daysOut} days out${e.peak_event ? ' ⭐ PEAK' : ''}`
  }).join('\n')

  return {
    success: true,
    message: `**Upcoming Important Events:**\n${eventList}`,
    data
  }
}

async function suggestPracticePlan(teamId: string, params: any): Promise<ActionResult> {
  const { date, duration_minutes = 120 } = params

  // Get next peak event
  const { data: peakEvents } = await supabase
    .from('events')
    .select('*')
    .eq('team_id', teamId)
    .gte('date', date)
    .gte('importance', 4)
    .order('date', { ascending: true })
    .limit(1)

  const nextPeakEvent = peakEvents?.[0]
  const daysOut = nextPeakEvent
    ? Math.ceil((new Date(nextPeakEvent.date).getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Determine phase based on days out from peak
  let phase = 'build'
  let intensity = 3
  let focusAreas: string[] = []

  if (daysOut !== null) {
    if (daysOut <= 2) {
      phase = 'peak'
      intensity = 2 // Light before competition
      focusAreas = ['visualization', 'light technique', 'weight management', 'mental prep']
    } else if (daysOut <= 7) {
      phase = 'taper'
      intensity = 3
      focusAreas = ['sharpening', 'specific situations', 'game plan review']
    } else if (daysOut <= 14) {
      phase = 'competition'
      intensity = 4
      focusAreas = ['live wrestling', 'match simulation', 'conditioning maintenance']
    } else {
      phase = 'build'
      intensity = 4
      focusAreas = ['technique development', 'conditioning', 'drilling']
    }
  }

  // Calculate time breakdown
  const totalMinutes = duration_minutes
  let warmup = 15
  let technique = Math.round(totalMinutes * 0.25)
  let drilling = Math.round(totalMinutes * 0.20)
  let live = phase === 'peak' ? 0 : Math.round(totalMinutes * 0.20)
  let conditioning = phase === 'taper' || phase === 'peak' ? 10 : Math.round(totalMinutes * 0.15)
  let cooldown = 10

  const plan = {
    date,
    phase,
    intensity,
    duration_minutes: totalMinutes,
    target_event: nextPeakEvent?.name,
    days_to_peak: daysOut,
    focus_areas: focusAreas,
    structure: {
      warmup_minutes: warmup,
      technique_minutes: technique,
      drilling_minutes: drilling,
      live_wrestling_minutes: live,
      conditioning_minutes: conditioning,
      cooldown_minutes: cooldown
    }
  }

  const intensityLabels = ['', 'Recovery', 'Light', 'Medium', 'Hard', 'Max']

  return {
    success: true,
    message: `**Suggested Practice Plan for ${date}**

**Phase:** ${phase.toUpperCase()}${nextPeakEvent ? ` (${daysOut} days to ${nextPeakEvent.name})` : ''}
**Intensity:** ${intensityLabels[intensity]}

**Focus Areas:** ${focusAreas.join(', ')}

**Structure (${totalMinutes} min total):**
- Warmup: ${warmup} min
- Technique: ${technique} min
- Drilling: ${drilling} min
- Live Wrestling: ${live} min
- Conditioning: ${conditioning} min
- Cooldown: ${cooldown} min`,
    data: plan
  }
}

// ============== MAIN EXECUTOR ==============

const ACTION_MAP: Record<string, (teamId: string, params: any) => Promise<ActionResult>> = {
  // Wrestlers
  add_wrestler: addWrestler,
  update_wrestler: updateWrestler,
  deactivate_wrestler: deactivateWrestler,
  move_weight_class: moveWeightClass,

  // Events
  add_event: addEvent,
  update_event: updateEvent,
  cancel_event: cancelEvent,
  record_event_results: recordEventResults,

  // Practices
  add_practice: addPractice,
  update_practice: updatePractice,
  cancel_practice: cancelPractice,
  record_practice_details: recordPracticeDetails,
  record_attendance: recordAttendance,

  // Weight
  record_weight: recordWeight,
  bulk_record_weights: bulkRecordWeights,

  // Matches
  add_match_result: addMatchResult,

  // Queries
  get_upcoming_events: getUpcomingEvents,
  get_upcoming_practices: getUpcomingPractices,
  get_wrestler_stats: getWrestlerStats,
  get_weight_history: getWeightHistory,
  get_roster_by_weight: getRosterByWeight,
  get_attendance_report: getAttendanceReport,
  get_team_record: getTeamRecord,
  get_wrestler_matches: getWrestlerMatches,
  get_peak_events: getPeakEvents,
  suggest_practice_plan: suggestPracticePlan,
}

export async function executeAction(
  teamId: string,
  actionName: string,
  params: Record<string, any>,
  confirmed: boolean = false
): Promise<ActionResult> {
  // Check if action exists
  const actionFn = ACTION_MAP[actionName]
  if (!actionFn) {
    return { success: false, message: `Unknown action: ${actionName}` }
  }

  // Check if confirmation is required
  if (requiresConfirmation(actionName) && !confirmed) {
    const tool = getTool(actionName)
    return {
      success: false,
      requiresConfirmation: true,
      confirmationMessage: `Are you sure you want to ${tool?.description.toLowerCase()}? This action cannot be undone.`,
      message: 'Confirmation required'
    }
  }

  // Execute the action
  try {
    return await actionFn(teamId, params)
  } catch (error: any) {
    return { success: false, message: `Action failed: ${error.message}` }
  }
}
