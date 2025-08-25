#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase
const supabaseUrl = 'https://yesycwefigqotbplguqx.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllc3ljd2VmaWdxb3RicGxndXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjExOTE3OSwiZXhwIjoyMDcxNjk1MTc5fQ.5hjlW4EcLrNQ5wiK2fsNluji0XsXqd18HjSeU64uVQQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkMatchEventsSchema() {
  console.log('📊 Checking match_events Table Schema\n')
  console.log('=' .repeat(50))
  
  try {
    // Try to insert a minimal record to see what columns exist
    console.log('\n🔍 Testing match_events table with minimal data...')
    
    // First, we need a match to reference
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
    
    console.log('Test match created:', match.id)
    
    // Try different combinations of fields
    const testConfigs = [
      {
        name: 'Minimal',
        data: {
          match_id: match.id,
          event_type: 'test'
        }
      },
      {
        name: 'With timestamp',
        data: {
          match_id: match.id,
          event_type: 'test',
          timestamp: Date.now()
        }
      },
      {
        name: 'With video_timestamp',
        data: {
          match_id: match.id,
          event_type: 'test',
          video_timestamp: 0
        }
      },
      {
        name: 'With wrestler_name',
        data: {
          match_id: match.id,
          event_type: 'test',
          wrestler_name: 'Test Wrestler'
        }
      },
      {
        name: 'With points',
        data: {
          match_id: match.id,
          event_type: 'test',
          points: 2
        }
      }
    ]
    
    for (const config of testConfigs) {
      console.log(`\nTrying ${config.name}...`)
      const { data, error } = await supabase
        .from('match_events')
        .insert(config.data)
        .select()
      
      if (error) {
        console.log(`   ❌ Failed: ${error.message}`)
      } else {
        console.log(`   ✅ Success! Columns present:`)
        if (data && data[0]) {
          Object.keys(data[0]).forEach(col => {
            const value = data[0][col]
            console.log(`      - ${col}: ${value === null ? 'null' : typeof value}`)
          })
          // Clean up
          await supabase.from('match_events').delete().eq('id', data[0].id)
          break // Found working config
        }
      }
    }
    
    // Clean up test match
    await supabase.from('matches').delete().eq('id', match.id)
    console.log('\n✅ Cleanup complete')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkMatchEventsSchema().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})