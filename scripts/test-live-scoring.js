#!/usr/bin/env node

/**
 * Test script for live scoring database integration
 * Run this after setting up the database tables to verify everything works
 * 
 * Usage: node scripts/test-live-scoring.js
 */

const API_BASE = 'https://insight.aethervtc.ai/api';
// For local testing, uncomment this line:
// const API_BASE = 'http://localhost:3000/api';

async function testLiveScoring() {
  console.log('🎯 Testing Live Scoring Database Integration\n');
  console.log('API Base:', API_BASE);
  console.log('=' . repeat(50));

  try {
    // Step 1: Create a test match
    console.log('\n1️⃣ Creating test match...');
    const matchData = {
      event_name: 'Database Test Event',
      weight_class: 152,
      round: 'Final',
      wrestler1: 'Test Wrestler 1',
      wrestler1_team: 'Test Team A',
      wrestler2: 'Test Wrestler 2', 
      wrestler2_team: 'Test Team B',
      date: new Date().toISOString().split('T')[0],
      mat_number: 1
    };

    const createResponse = await fetch(`${API_BASE}/matches/live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matchData)
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Failed to create match: ${createResponse.status} - ${error}`);
    }

    const { data: match } = await createResponse.json();
    console.log('✅ Match created:', {
      id: match.id,
      wrestler1: match.wrestler1,
      wrestler2: match.wrestler2
    });

    // Step 2: Add a scoring event
    console.log('\n2️⃣ Adding scoring event...');
    const eventData = {
      match_id: match.id,
      event_type: 'takedown',
      wrestler_id: null,
      wrestler_name: match.wrestler1,
      points: 2,
      period: 1,
      event_time: '00:01:30'
    };

    const eventResponse = await fetch(`${API_BASE}/matches/live/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });

    if (!eventResponse.ok) {
      const error = await eventResponse.text();
      throw new Error(`Failed to save event: ${eventResponse.status} - ${error}`);
    }

    const eventResult = await eventResponse.json();
    console.log('✅ Event saved:', eventResult.data || eventResult);

    // Step 3: Update match scores
    console.log('\n3️⃣ Updating match scores...');
    const updateData = {
      id: match.id,
      wrestler1_score: 2,
      wrestler2_score: 0,
      period: 1,
      time_remaining: 90
    };

    const updateResponse = await fetch(`${API_BASE}/matches/live`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(`Failed to update match: ${updateResponse.status} - ${error}`);
    }

    const updateResult = await updateResponse.json();
    console.log('✅ Match updated:', {
      wrestler1_score: updateResult.data.wrestler1_score,
      wrestler2_score: updateResult.data.wrestler2_score
    });

    // Step 4: Fetch match events
    console.log('\n4️⃣ Fetching match events...');
    const fetchResponse = await fetch(`${API_BASE}/matches/live/event?match_id=${match.id}`);
    
    if (!fetchResponse.ok) {
      const error = await fetchResponse.text();
      throw new Error(`Failed to fetch events: ${fetchResponse.status} - ${error}`);
    }

    const { data: events } = await fetchResponse.json();
    console.log(`✅ Found ${events?.length || 0} events`);
    if (events?.length > 0) {
      events.forEach((event, i) => {
        console.log(`  Event ${i + 1}:`, {
          type: event.event_type,
          points: event.points_scored,
          time: event.event_time
        });
      });
    }

    // Step 5: Test team endpoint
    console.log('\n5️⃣ Testing teams endpoint...');
    const teamsResponse = await fetch(`${API_BASE}/teams`);
    
    if (!teamsResponse.ok) {
      console.log('⚠️ Teams endpoint returned:', teamsResponse.status);
      console.log('   (This is expected if teams table is not yet created)');
    } else {
      const teamsData = await teamsResponse.json();
      console.log('✅ Teams endpoint working');
    }

    // Step 6: Test wrestlers endpoint
    console.log('\n6️⃣ Testing wrestlers endpoint...');
    const wrestlersResponse = await fetch(`${API_BASE}/wrestlers`);
    
    if (!wrestlersResponse.ok) {
      console.log('⚠️ Wrestlers endpoint returned:', wrestlersResponse.status);
      console.log('   (This is expected if wrestlers table is not yet created)');
    } else {
      const wrestlersData = await wrestlersResponse.json();
      console.log('✅ Wrestlers endpoint working');
    }

    console.log('\n' + '=' . repeat(50));
    console.log('🎉 Live scoring test completed successfully!');
    console.log('\nSummary:');
    console.log('  ✅ Match creation working');
    console.log('  ✅ Event saving working');
    console.log('  ✅ Score updates working');
    console.log('  ✅ Event retrieval working');
    
    if (teamsResponse.ok && wrestlersResponse.ok) {
      console.log('  ✅ All database tables configured');
    } else {
      console.log('  ⚠️ Some tables may need to be created (run setup-all-missing-tables.sql)');
    }

    console.log('\nYour live scoring system is ready for testing! 🎯');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure you ran setup-all-missing-tables.sql in Supabase');
    console.log('2. Check that environment variables are set on Vercel');
    console.log('3. Verify the API is deployed and accessible');
    process.exit(1);
  }
}

// Run the test
testLiveScoring();