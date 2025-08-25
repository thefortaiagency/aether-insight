#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase
const supabaseUrl = 'https://yesycwefigqotbplguqx.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllc3ljd2VmaWdxb3RicGxndXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjExOTE3OSwiZXhwIjoyMDcxNjk1MTc5fQ.5hjlW4EcLrNQ5wiK2fsNluji0XsXqd18HjSeU64uVQQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getActualSchema() {
  console.log('📊 Getting Actual Table Schema\n')
  console.log('=' .repeat(50))
  
  try {
    // Create a test match first
    const { data: match } = await supabase
      .from('matches')
      .insert({
        opponent_name: 'Schema Test',
        weight_class: 126,
        match_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single()
    
    if (!match) {
      console.error('Could not create test match')
      return
    }
    
    // Try with event_time which we know is required
    console.log('\n🔍 Testing match_events with event_time...')
    const { data, error } = await supabase
      .from('match_events')
      .insert({
        match_id: match.id,
        event_type: 'test',
        event_time: '1:30'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Still failed:', error.message)
      console.error('Full error:', JSON.stringify(error, null, 2))
    } else {
      console.log('\n✅ Success! Actual schema for match_events:')
      console.log('-'.repeat(50))
      Object.keys(data).forEach(col => {
        const value = data[col]
        const type = value === null ? 'null' : typeof value
        console.log(`${col}: ${type} = ${JSON.stringify(value)}`)
      })
      
      // Clean up
      await supabase.from('match_events').delete().eq('id', data.id)
    }
    
    // Clean up test match
    await supabase.from('matches').delete().eq('id', match.id)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

getActualSchema().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})