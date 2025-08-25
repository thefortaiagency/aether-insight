#!/usr/bin/env node

/**
 * Test script to verify database tables exist
 * Run this to check if tables were created properly
 */

require('dotenv').config({ path: '.env.local' })

async function testDatabase() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing environment variables')
    console.log('SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌')
    console.log('SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? '✅' : '❌')
    process.exit(1)
  }

  console.log('🔍 Testing database connection...')
  console.log('URL:', SUPABASE_URL)

  // Test each table
  const tables = ['teams', 'wrestlers', 'season_records', 'match_statistics', 'match_updates']

  for (const table of tables) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/${table}?limit=1`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        console.log(`✅ ${table} table exists and is accessible`)
      } else if (response.status === 404) {
        console.log(`❌ ${table} table does not exist`)
      } else {
        const error = await response.text()
        console.log(`⚠️ ${table} table error (${response.status}): ${error}`)
      }
    } catch (error) {
      console.log(`❌ ${table} - Connection error:`, error.message)
    }
  }

  console.log('\n📋 Next steps:')
  console.log('1. If tables are missing, run scripts/URGENT-create-tables.sql in Supabase')
  console.log('2. Make sure RLS policies are enabled')
  console.log('3. Check that service role key has proper permissions')
}

testDatabase()