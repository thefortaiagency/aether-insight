#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase
const supabaseUrl = 'https://yesycwefigqotbplguqx.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllc3ljd2VmaWdxb3RicGxndXF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjExOTE3OSwiZXhwIjoyMDcxNjk1MTc5fQ.5hjlW4EcLrNQ5wiK2fsNluji0XsXqd18HjSeU64uVQQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Cloudflare credentials
const CLOUDFLARE_ACCOUNT_ID = 'e3e4a97ae2752b669920518d97069116'
const CLOUDFLARE_STREAM_TOKEN = 'jZumEn7YxddYkFGeuJ6ZnVSSQaayuZ6Vqni4rcAZ'

async function checkVideoReviewData() {
  console.log('🎬 Checking Video Review Data\n')
  console.log('=' .repeat(50))
  
  try {
    // 1. Check matches table
    console.log('\n📊 Matches in Database:')
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (matchError) {
      console.log(`   ❌ Error: ${matchError.message}`)
    } else {
      console.log(`   ✅ Found ${matches?.length || 0} matches`)
      if (matches && matches.length > 0) {
        matches.forEach((match, idx) => {
          console.log(`   ${idx + 1}. ID: ${match.id}`)
          console.log(`      - Wrestlers: ${match.wrestler_name || 'Unknown'} vs ${match.opponent_name || 'Unknown'}`)
          console.log(`      - Video ID: ${match.video_id || 'None'}`)
          console.log(`      - Has Video: ${match.has_video || false}`)
        })
      }
    }
    
    // 2. Check videos in Cloudflare
    console.log('\n☁️ Videos in Cloudflare:')
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${CLOUDFLARE_STREAM_TOKEN}`,
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.result) {
          console.log(`   ✅ Found ${data.result.length} videos in Cloudflare`)
          data.result.forEach((video, idx) => {
            console.log(`   ${idx + 1}. ID: ${video.uid}`)
            console.log(`      - Title: ${video.meta?.name || 'Untitled'}`)
            console.log(`      - Duration: ${video.duration ? `${Math.floor(video.duration / 60)}:${Math.floor(video.duration % 60).toString().padStart(2, '0')}` : 'Unknown'}`)
            console.log(`      - Status: ${video.status?.state || 'Unknown'}`)
            console.log(`      - Match ID in metadata: ${video.meta?.matchId || 'None'}`)
            console.log(`      - Watermark: ${video.watermark ? '✅ Applied' : '❌ Not applied'}`)
          })
        }
      }
    } catch (err) {
      console.log(`   ❌ Error fetching Cloudflare videos: ${err.message}`)
    }
    
    // 3. Check match_videos table
    console.log('\n🔗 Match-Video Links:')
    const { data: matchVideos, error: mvError } = await supabase
      .from('match_videos')
      .select('*')
      .limit(10)
    
    if (mvError) {
      console.log(`   ❌ Error: ${mvError.message}`)
    } else {
      console.log(`   ✅ Found ${matchVideos?.length || 0} match-video links`)
      if (matchVideos && matchVideos.length > 0) {
        matchVideos.forEach((mv, idx) => {
          console.log(`   ${idx + 1}. Match: ${mv.match_id} → Video: ${mv.cloudflare_video_id}`)
        })
      }
    }
    
    // 4. Check match_events table
    console.log('\n📝 Match Events (for scoring):')
    const { data: events, error: eventError } = await supabase
      .from('match_events')
      .select('*')
      .limit(10)
    
    if (eventError) {
      console.log(`   ❌ Error: ${eventError.message}`)
    } else {
      console.log(`   ✅ Found ${events?.length || 0} match events`)
    }
    
    console.log('\n' + '=' .repeat(50))
    console.log('📊 Summary:')
    console.log(`   - Matches in DB: ${matches?.length || 0}`)
    console.log(`   - Videos in Cloudflare: 3 (based on previous check)`)
    console.log(`   - Match-Video links: ${matchVideos?.length || 0}`)
    console.log(`   - Scoring events: ${events?.length || 0}`)
    
    console.log('\n💡 Troubleshooting:')
    console.log('   1. Videos exist in Cloudflare but may not be linked to matches')
    console.log('   2. Check if matches have video_id field populated')
    console.log('   3. Check if match_videos table has entries')
    console.log('   4. Video Review page needs either:')
    console.log('      - Matches with video_id field set')
    console.log('      - OR match_videos table entries')
    console.log('      - OR videos with matchId in metadata')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
  }
}

// Run the check
checkVideoReviewData().then(() => {
  process.exit(0)
}).catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})