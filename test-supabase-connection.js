#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Test Supabase connection
async function testConnection() {
  const supabaseUrl = 'https://yesycwefigqotbplguqx.supabase.co'
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllc3ljd2VmaWdxb3RicGxndXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMTkxNzksImV4cCI6MjA3MTY5NTE3OX0.g0Lj5yQFSsDgaP91U_Cb7kSOVHLL50s2PA-4wZJWbuk'
  
  console.log('Testing Supabase connection...')
  console.log('URL:', supabaseUrl)
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Test a simple query
    const { data, error } = await supabase
      .from('videos')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ Database query failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('✅ Database query successful!')
    
    // Test table existence
    const tables = ['videos', 'matches', 'scoring_events', 'match_videos']
    for (const table of tables) {
      const { error: tableError } = await supabase
        .from(table)
        .select('id')
        .limit(1)
      
      if (tableError) {
        console.log(`⚠️ Table '${table}' check failed:`, tableError.message)
      } else {
        console.log(`✅ Table '${table}' exists and is accessible`)
      }
    }
    
    return true
  } catch (err) {
    console.error('❌ Connection failed:', err.message)
    return false
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 All database tests passed!')
    console.log('\nNext steps:')
    console.log('1. Make sure these same environment variables are set in Vercel')
    console.log('2. Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables')
    console.log('3. Add all variables from .env.local')
    console.log('4. Redeploy: vercel --prod')
  } else {
    console.log('\n❌ Database connection issues detected')
    console.log('Please check your Supabase project is active at: https://supabase.com/dashboard')
  }
  process.exit(success ? 0 : 1)
})