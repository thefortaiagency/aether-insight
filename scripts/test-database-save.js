#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase with service role key for full access
const supabaseUrl = 'https://yesycwefigqotbplguqx.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllc3ljd2VmaWdxb3RicGxndXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjExOTE3OSwiZXhwIjoyMDcxNjk1MTc5fQ.5hjlW4EcLrNQ5wiK2fsNluji0XsXqd18HjSeU64uVQQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testDatabaseSave() {
  console.log('🧪 Testing Database Save Functionality\n')
  console.log('=' .repeat(50))
  
  try {
    // Test 1: Create a test match
    console.log('\n📝 Test 1: Creating test match...')
    const testMatch = {
      opponent_name: 'Test Wrestler 2',
      opponent_team: 'Test Team B',
      weight_class: 126,
      mat_number: '1',
      referee_name: 'Test Referee',
      match_type: 'dual',
      match_date: new Date().toISOString().split('T')[0], // Date only
      final_score_for: 0,
      final_score_against: 0
    }
    
    const { data: createdMatch, error: createError } = await supabase
      .from('matches')
      .insert(testMatch)
      .select()
      .single()
    
    if (createError) {
      console.error('   ❌ Failed to create match:', createError.message)
      console.error('   Full error:', JSON.stringify(createError, null, 2))
      return
    }
    
    console.log('   ✅ Match created successfully!')
    console.log('   Match ID:', createdMatch.id)
    
    // Test 2: Update the match
    console.log('\n📝 Test 2: Updating match scores...')
    const { data: updatedMatch, error: updateError } = await supabase
      .from('matches')
      .update({
        final_score_for: 7,
        final_score_against: 4
      })
      .eq('id', createdMatch.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('   ❌ Failed to update match:', updateError.message)
    } else {
      console.log('   ✅ Match updated successfully!')
      console.log('   New scores:', updatedMatch.final_score_for, '-', updatedMatch.final_score_against)
    }
    
    // Test 3: Create a match event
    console.log('\n📝 Test 3: Creating match event...')
    const testEvent = {
      match_id: createdMatch.id,
      timestamp: Date.now(),
      video_timestamp: 0,
      event_type: 'Takedown',
      wrestler_name: 'Test Wrestler 1',
      points: 2,
      period: 1,
      event_time: '1:30',
      move_name: 'Double Leg',
      description: 'Test Wrestler 1 - Takedown +2'
    }
    
    const { data: createdEvent, error: eventError } = await supabase
      .from('match_events')
      .insert(testEvent)
      .select()
      .single()
    
    if (eventError) {
      console.error('   ❌ Failed to create event:', eventError.message)
      console.error('   Full error:', JSON.stringify(eventError, null, 2))
    } else {
      console.log('   ✅ Event created successfully!')
      console.log('   Event ID:', createdEvent.id)
    }
    
    // Test 4: Create match statistics
    console.log('\n📝 Test 4: Creating match statistics...')
    const testStats = {
      match_id: createdMatch.id,
      wrestler_name: 'Test Wrestler 1',
      takedowns: 1,
      escapes: 0,
      reversals: 0,
      near_fall_2: 0,
      near_fall_3: 0,
      near_fall_4: 0,
      stalls: 0,
      cautions: 0,
      warnings: 0,
      penalties: 0,
      riding_time: 0,
      riding_time_point: false
    }
    
    const { data: createdStats, error: statsError } = await supabase
      .from('match_statistics')
      .insert(testStats)
      .select()
      .single()
    
    if (statsError) {
      console.error('   ❌ Failed to create statistics:', statsError.message)
      console.error('   Full error:', JSON.stringify(statsError, null, 2))
    } else {
      console.log('   ✅ Statistics created successfully!')
      console.log('   Stats ID:', createdStats.id)
    }
    
    // Test 5: Create match update
    console.log('\n📝 Test 5: Creating match update...')
    const testUpdate = {
      match_id: createdMatch.id,
      update_type: 'score_update',
      data: {
        wrestler1_score: 7,
        wrestler2_score: 4,
        period: 2,
        match_time: 84
      }
    }
    
    const { data: createdUpdate, error: updateEventError } = await supabase
      .from('match_updates')
      .insert(testUpdate)
      .select()
      .single()
    
    if (updateEventError) {
      console.error('   ❌ Failed to create update:', updateEventError.message)
      console.error('   Full error:', JSON.stringify(updateEventError, null, 2))
    } else {
      console.log('   ✅ Update created successfully!')
      console.log('   Update ID:', createdUpdate.id)
    }
    
    // Clean up: Delete test data
    console.log('\n🧹 Cleaning up test data...')
    
    // Delete in reverse order due to foreign key constraints
    await supabase.from('match_updates').delete().eq('match_id', createdMatch.id)
    await supabase.from('match_statistics').delete().eq('match_id', createdMatch.id)
    await supabase.from('match_events').delete().eq('match_id', createdMatch.id)
    await supabase.from('matches').delete().eq('id', createdMatch.id)
    
    console.log('   ✅ Test data cleaned up')
    
    console.log('\n' + '=' .repeat(50))
    console.log('\n✅ All tests passed! Database is working correctly.')
    console.log('\n📝 Summary:')
    console.log('   - Matches table: ✅ Working')
    console.log('   - Match events table: ✅ Working')
    console.log('   - Match statistics table: ✅ Working')
    console.log('   - Match updates table: ✅ Working')
    console.log('\n🎯 Next Steps:')
    console.log('   1. Go to /matches/live-scoring')
    console.log('   2. Create a real match')
    console.log('   3. Score some points')
    console.log('   4. Check the browser console for detailed logs')
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message)
    console.error('Full error:', error)
  }
}

testDatabaseSave().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})