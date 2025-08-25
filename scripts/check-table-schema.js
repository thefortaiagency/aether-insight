#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase
const supabaseUrl = 'https://yesycwefigqotbplguqx.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllc3ljd2VmaWdxb3RicGxndXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjExOTE3OSwiZXhwIjoyMDcxNjk1MTc5fQ.5hjlW4EcLrNQ5wiK2fsNluji0XsXqd18HjSeU64uVQQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTableSchema() {
  console.log('📊 Checking Table Schema\n')
  console.log('=' .repeat(50))
  
  try {
    // Get a sample row to see the columns
    console.log('\n🔍 Checking matches table columns...')
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('   Error:', error.message)
    } else {
      if (data && data.length > 0) {
        console.log('   Available columns:')
        Object.keys(data[0]).forEach(col => {
          console.log(`     - ${col}: ${typeof data[0][col]}`)
        })
      } else {
        console.log('   No data in table, trying to insert a minimal record...')
        
        // Try with minimal fields
        const { data: testData, error: testError } = await supabase
          .from('matches')
          .insert({
            opponent_name: 'Test Opponent',
            weight_class: 126,
            match_date: new Date().toISOString(),
            final_score_for: 0,
            final_score_against: 0
          })
          .select()
        
        if (testError) {
          console.error('   Failed with minimal fields:', testError.message)
          
          // Try even more minimal
          console.log('\n   Trying with just opponent_name...')
          const { data: minData, error: minError } = await supabase
            .from('matches')
            .insert({
              opponent_name: 'Test'
            })
            .select()
          
          if (minError) {
            console.error('   Still failed:', minError.message)
          } else {
            console.log('   ✅ Success with minimal data:', minData)
            // Delete the test record
            if (minData && minData[0]) {
              await supabase.from('matches').delete().eq('id', minData[0].id)
            }
          }
        } else {
          console.log('   ✅ Success:', testData)
          // Delete the test record
          if (testData && testData[0]) {
            await supabase.from('matches').delete().eq('id', testData[0].id)
          }
        }
      }
    }
    
    // Try to get column information another way
    console.log('\n🔍 Attempting to query matches with specific columns...')
    const { data: colTest, error: colError } = await supabase
      .from('matches')
      .select('id, opponent_name, weight_class, match_date')
      .limit(1)
    
    if (colError) {
      console.error('   Error with specific columns:', colError.message)
    } else {
      console.log('   ✅ These columns exist: id, opponent_name, weight_class, match_date')
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkTableSchema().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})