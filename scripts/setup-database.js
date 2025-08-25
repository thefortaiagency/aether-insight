#!/usr/bin/env node

/**
 * Setup Aether Insight Database Tables in Supabase
 * Run this script to create all necessary tables
 * 
 * Usage: node scripts/setup-database.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🚀 Setting up Aether Insight database...\n')

  try {
    // Read the schema file
    const schemaPath = join(dirname(__dirname), 'supabase', 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf8')

    // Split the schema into individual statements
    // Remove comments and empty lines
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))
      .map(s => s + ';')

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`)

    let successCount = 0
    let errorCount = 0

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Skip empty statements
      if (!statement.trim() || statement.trim() === ';') continue

      // Extract table/function name for logging
      let entityName = 'Statement'
      if (statement.includes('CREATE TABLE')) {
        entityName = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/i)?.[1] || 'Table'
      } else if (statement.includes('CREATE INDEX')) {
        entityName = statement.match(/CREATE INDEX (?:IF NOT EXISTS )?(\w+)/i)?.[1] || 'Index'
      } else if (statement.includes('CREATE FUNCTION')) {
        entityName = statement.match(/CREATE (?:OR REPLACE )?FUNCTION (\w+)/i)?.[1] || 'Function'
      } else if (statement.includes('CREATE TRIGGER')) {
        entityName = statement.match(/CREATE TRIGGER (\w+)/i)?.[1] || 'Trigger'
      }

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          // Check if it's a "already exists" error which we can ignore
          if (error.message.includes('already exists')) {
            console.log(`⚠️  ${entityName} already exists (skipping)`)
          } else {
            throw error
          }
        } else {
          console.log(`✅ Created ${entityName}`)
          successCount++
        }
      } catch (error) {
        console.error(`❌ Failed to create ${entityName}: ${error.message}`)
        errorCount++
        
        // For critical tables, we might want to stop
        if (entityName === 'teams' || entityName === 'wrestlers' || entityName === 'matches') {
          console.error('\n❌ Critical table creation failed. Stopping...')
          process.exit(1)
        }
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`✅ Successfully executed: ${successCount} statements`)
    if (errorCount > 0) {
      console.log(`⚠️  Errors encountered: ${errorCount} statements`)
    }
    console.log('='.repeat(50))

    // Test the connection by querying tables
    console.log('\n🔍 Verifying tables...\n')
    
    const tables = [
      'teams',
      'wrestlers', 
      'matches',
      'match_events',
      'match_statistics',
      'season_records',
      'videos'
    ]

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.log(`❌ Table '${table}' - Error: ${error.message}`)
      } else {
        console.log(`✅ Table '${table}' exists (${count || 0} records)`)
      }
    }

    console.log('\n🎉 Database setup complete!')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

// Run the setup
setupDatabase()