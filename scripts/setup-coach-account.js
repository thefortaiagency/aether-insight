#!/usr/bin/env node
/**
 * Setup Coach Account Script
 * Creates a coach account and team in the Aether Insights database
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupCoachAccount() {
  console.log('🏋️ Setting up Coach Account for Aether Insights...\n')

  // 1. Create or update the coach record
  // Using only core fields that exist in the table
  const coachData = {
    email: 'aoberlin@fortwrestling.com',
    first_name: 'Andy',
    last_name: 'O'
  }

  // Check if coach already exists
  console.log('📝 Checking for existing coach...')
  const { data: existingCoach } = await supabase
    .from('coaches')
    .select()
    .eq('email', coachData.email)
    .single()

  if (existingCoach) {
    console.log('✅ Coach already exists:', existingCoach.id)
    return setupTeam(existingCoach.id)
  }

  // Create new coach
  console.log('📝 Creating coach record...')
  const { data: coach, error: coachError } = await supabase
    .from('coaches')
    .insert(coachData)
    .select()
    .single()

  if (coachError) {
    console.error('Error creating coach:', coachError)
    return
  }

  console.log('✅ Coach created:', coach.id)
  await setupTeam(coach.id)
}

async function setupTeam(coachId) {
  // 2. Create the team
  const teamData = {
    name: 'Fort Wrestling',
    school_name: 'Fort Wrestling Academy',
    mascot: 'Warriors',
    colors: { primary: '#D4AF37', secondary: '#000000' },
    conference: 'Independent',
    state: 'IN',
    coach_name: 'Andy O'
  }

  // Check if team already exists
  console.log('\n📝 Checking for existing team...')
  const { data: existingTeam } = await supabase
    .from('teams')
    .select()
    .eq('name', teamData.name)
    .single()

  if (existingTeam) {
    console.log('✅ Team already exists:', existingTeam.id)
    await linkCoachToTeam(coachId, existingTeam.id)
    return existingTeam.id
  }

  // Create new team
  console.log('📝 Creating team...')
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert(teamData)
    .select()
    .single()

  if (teamError) {
    console.error('Error creating team:', teamError)
    return null
  }

  console.log('✅ Team created:', team.id)
  await linkCoachToTeam(coachId, team.id)
  return team.id
}

async function linkCoachToTeam(coachId, teamId) {
  // 3. Link coach to team
  // Check if link already exists
  console.log('\n📝 Checking for existing coach-team link...')
  const { data: existingLink } = await supabase
    .from('team_coaches')
    .select()
    .eq('coach_id', coachId)
    .eq('team_id', teamId)
    .single()

  if (existingLink) {
    console.log('✅ Coach already linked to team')
    return
  }

  console.log('📝 Linking coach to team...')
  const { error: linkError } = await supabase
    .from('team_coaches')
    .insert({
      coach_id: coachId,
      team_id: teamId,
      role: 'head'
    })

  if (linkError) {
    console.error('Error linking coach to team:', linkError)
    return
  }

  console.log('✅ Coach linked to team as HEAD coach')

  // 4. Show summary
  console.log('\n' + '='.repeat(50))
  console.log('🎉 SETUP COMPLETE!')
  console.log('='.repeat(50))
  console.log(`
Coach: Andy O (aoberlin@fortwrestling.com)
Team: Fort Wrestling
Role: Head Coach

Next Steps:
1. Go to the dashboard and start adding wrestlers
2. Use the Chrome extension to import stats from USABracketing
3. Start tracking matches and stats!

Dashboard: https://aether-insight.vercel.app/dashboard
  `)
}

// Run the setup
setupCoachAccount().catch(console.error)
