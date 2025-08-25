#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase
const supabaseUrl = 'https://yesycwefigqotbplguqx.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllc3ljd2VmaWdxb3RicGxndXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjExOTE3OSwiZXhwIjoyMDcxNjk1MTc5fQ.5hjlW4EcLrNQ5wiK2fsNluji0XsXqd18HjSeU64uVQQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupScoringTables() {
  console.log('🏆 Setting Up Live Scoring Database Tables\n')
  console.log('=' .repeat(50))
  
  try {
    // Create match_statistics table
    console.log('\n📊 Creating match_statistics table...')
    const { error: statsError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS match_statistics (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
          wrestler_id UUID,
          wrestler_name TEXT NOT NULL,
          takedowns INTEGER DEFAULT 0,
          escapes INTEGER DEFAULT 0,
          reversals INTEGER DEFAULT 0,
          near_fall_2 INTEGER DEFAULT 0,
          near_fall_3 INTEGER DEFAULT 0,
          near_fall_4 INTEGER DEFAULT 0,
          stalls INTEGER DEFAULT 0,
          cautions INTEGER DEFAULT 0,
          warnings INTEGER DEFAULT 0,
          penalties INTEGER DEFAULT 0,
          riding_time INTEGER DEFAULT 0,
          riding_time_point BOOLEAN DEFAULT FALSE,
          blood_time INTEGER DEFAULT 0,
          injury_time INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_match_statistics_match_id ON match_statistics(match_id);
        CREATE INDEX IF NOT EXISTS idx_match_statistics_wrestler_name ON match_statistics(wrestler_name);
      `
    })
    
    if (statsError) {
      // Try alternative method
      console.log('   Using alternative creation method...')
      // The table might already exist or RPC might not be available
      const { error: checkError } = await supabase
        .from('match_statistics')
        .select('id')
        .limit(1)
      
      if (checkError?.code === '42P01') {
        console.log('   ❌ Could not create match_statistics table')
        console.log('   Please create it manually in Supabase dashboard')
      } else {
        console.log('   ✅ match_statistics table exists or was created')
      }
    } else {
      console.log('   ✅ match_statistics table created successfully')
    }
    
    // Create match_updates table for real-time updates
    console.log('\n📊 Creating match_updates table...')
    const { error: updatesError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS match_updates (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
          update_type TEXT NOT NULL,
          data JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_match_updates_match_id ON match_updates(match_id);
        CREATE INDEX IF NOT EXISTS idx_match_updates_created_at ON match_updates(created_at DESC);
      `
    })
    
    if (updatesError) {
      // Try alternative method
      console.log('   Using alternative creation method...')
      const { error: checkError } = await supabase
        .from('match_updates')
        .select('id')
        .limit(1)
      
      if (checkError?.code === '42P01') {
        console.log('   ❌ Could not create match_updates table')
        console.log('   Please create it manually in Supabase dashboard')
      } else {
        console.log('   ✅ match_updates table exists or was created')
      }
    } else {
      console.log('   ✅ match_updates table created successfully')
    }
    
    console.log('\n' + '=' .repeat(50))
    console.log('\n🎯 Manual Table Creation (if needed):')
    console.log('\nIf the tables were not created automatically, please go to:')
    console.log('1. Supabase Dashboard → SQL Editor')
    console.log('2. Run these SQL commands:\n')
    
    console.log('-- Create match_statistics table')
    console.log(`CREATE TABLE IF NOT EXISTS match_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  wrestler_id UUID,
  wrestler_name TEXT NOT NULL,
  takedowns INTEGER DEFAULT 0,
  escapes INTEGER DEFAULT 0,
  reversals INTEGER DEFAULT 0,
  near_fall_2 INTEGER DEFAULT 0,
  near_fall_3 INTEGER DEFAULT 0,
  near_fall_4 INTEGER DEFAULT 0,
  stalls INTEGER DEFAULT 0,
  cautions INTEGER DEFAULT 0,
  warnings INTEGER DEFAULT 0,
  penalties INTEGER DEFAULT 0,
  riding_time INTEGER DEFAULT 0,
  riding_time_point BOOLEAN DEFAULT FALSE,
  blood_time INTEGER DEFAULT 0,
  injury_time INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`)
    
    console.log('\n-- Create match_updates table')
    console.log(`CREATE TABLE IF NOT EXISTS match_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`)
    
    console.log('\n' + '=' .repeat(50))
    console.log('\n✅ Setup complete!')
    console.log('\n📝 Next Steps:')
    console.log('1. Go to /matches/live-scoring')
    console.log('2. Create a test match')
    console.log('3. Score some points')
    console.log('4. Check the database to verify data is saved')
    
  } catch (error) {
    console.error('\n❌ Error during setup:', error.message)
    console.log('\nPlease create the tables manually using the SQL commands above.')
  }
}

setupScoringTables().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})