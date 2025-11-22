#!/usr/bin/env node

/**
 * Script to add match stats columns to Supabase
 * Run with: node scripts/add-match-stats-columns.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yesycwefigqotbplguqx.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllc3ljd2VmaWdxb3RicGxndXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjExOTE3OSwiZXhwIjoyMDcxNjk1MTc5fQ.5hjlW4EcLrNQ5wiK2fsNluji0XsXqd18HjSeU64uVQQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const columns = [
  // Takedowns
  'takedowns_for',
  'takedowns_against',
  // Escapes
  'escapes_for',
  'escapes_against',
  // Reversals
  'reversals_for',
  'reversals_against',
  // Near Falls
  'nearfall_2_for',
  'nearfall_2_against',
  'nearfall_3_for',
  'nearfall_3_against',
  'nearfall_4_for',
  'nearfall_4_against',
  // Penalties
  'penalties_for',
  'penalties_against',
  // Overtime
  'ot_sudden_victory_score_for',
  'ot_sudden_victory_score_against',
  'ot_tiebreaker1_score_for',
  'ot_tiebreaker1_score_against',
  'ot_tiebreaker2_score_for',
  'ot_tiebreaker2_score_against',
  'ot_ultimate_score_for',
  'ot_ultimate_score_against',
];

async function checkAndAddColumns() {
  console.log('🤼 Mat Ops - Adding match stats columns to database...\n');

  // Check which columns exist
  const { data: sample, error: sampleError } = await supabase
    .from('matches')
    .select('*')
    .limit(1);

  if (sampleError) {
    console.error('Error fetching sample:', sampleError.message);
    return;
  }

  const existingColumns = sample && sample[0] ? Object.keys(sample[0]) : [];
  const missingColumns = columns.filter(col => !existingColumns.includes(col));

  if (missingColumns.length === 0) {
    console.log('✅ All columns already exist!');
    return;
  }

  console.log(`Found ${missingColumns.length} missing columns:`);
  missingColumns.forEach(col => console.log(`  - ${col}`));
  console.log('');

  // Generate SQL
  const sql = missingColumns
    .map(col => `ALTER TABLE matches ADD COLUMN IF NOT EXISTS ${col} INTEGER DEFAULT 0;`)
    .join('\n');

  console.log('📋 Run this SQL in Supabase Dashboard > SQL Editor:\n');
  console.log('─'.repeat(60));
  console.log(sql);
  console.log('─'.repeat(60));
  console.log('\n🔗 https://supabase.com/dashboard/project/yesycwefigqotbplguqx/sql/new\n');

  // Try to run via RPC if available
  const { error: rpcError } = await supabase.rpc('exec_sql', { query: sql });

  if (!rpcError) {
    console.log('✅ Columns added successfully via RPC!');
  } else if (rpcError.message.includes('Could not find')) {
    console.log('⚠️  Cannot run SQL directly. Please copy the SQL above and run it in Supabase Dashboard.');
  } else {
    console.log('Error:', rpcError.message);
  }
}

checkAndAddColumns().catch(console.error);
