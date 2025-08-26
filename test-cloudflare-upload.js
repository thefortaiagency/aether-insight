#!/usr/bin/env node

// Test script to verify Cloudflare Stream upload process
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_STREAM_TOKEN = process.env.CLOUDFLARE_STREAM_TOKEN;

console.log('\n🎥 Cloudflare Stream Upload Test\n');
console.log('Account ID:', CLOUDFLARE_ACCOUNT_ID ? '✅ Set' : '❌ Missing');
console.log('Stream Token:', CLOUDFLARE_STREAM_TOKEN ? '✅ Set' : '❌ Missing');

async function testDirectUpload() {
  console.log('\n1️⃣ Requesting Direct Upload URL...');
  
  try {
    // Step 1: Get direct upload URL
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_STREAM_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxDurationSeconds: 3600,
          requireSignedURLs: false
        })
      }
    );
    
    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ Failed to get upload URL:', data.errors);
      return;
    }
    
    console.log('✅ Got upload URL');
    console.log('   Video ID:', data.result.uid);
    console.log('   Upload URL:', data.result.uploadURL.substring(0, 50) + '...');
    
    // Step 2: Create a test video file (small WebM)
    console.log('\n2️⃣ Creating test video...');
    
    // Create a minimal valid WebM file (this is just a tiny valid WebM header)
    const webmHeader = Buffer.from([
      0x1a, 0x45, 0xdf, 0xa3, // EBML header
      0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x1f, // size
      0x42, 0x86, 0x81, 0x01, // EBMLVersion
      0x42, 0xf7, 0x81, 0x01, // EBMLReadVersion
      0x42, 0xf2, 0x81, 0x04, // EBMLMaxIDLength
      0x42, 0xf3, 0x81, 0x08, // EBMLMaxSizeLength
      0x42, 0x82, 0x88, 0x6d, 0x61, 0x74, 0x72, 0x6f, 0x73, 0x6b, 0x61, // DocType: matroska
      0x42, 0x87, 0x81, 0x04, // DocTypeVersion
      0x42, 0x85, 0x81, 0x02  // DocTypeReadVersion
    ]);
    
    // Step 3: Upload the test video
    console.log('\n3️⃣ Uploading to Cloudflare...');
    
    const formData = new FormData();
    const blob = new Blob([webmHeader], { type: 'video/webm' });
    formData.append('file', blob, 'test.webm');
    
    const uploadResponse = await fetch(data.result.uploadURL, {
      method: 'POST',
      body: formData
    });
    
    console.log('   Upload status:', uploadResponse.status);
    
    if (uploadResponse.ok) {
      console.log('✅ Upload successful!');
      
      // Step 4: Check video status
      console.log('\n4️⃣ Checking video status...');
      
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
      
      const statusResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${data.result.uid}`,
        {
          headers: {
            'Authorization': `Bearer ${CLOUDFLARE_STREAM_TOKEN}`,
          }
        }
      );
      
      const statusData = await statusResponse.json();
      
      if (statusData.success) {
        console.log('✅ Video details:');
        console.log('   Status:', statusData.result.status?.state || 'processing');
        console.log('   Ready:', statusData.result.readyToStream ? 'Yes' : 'No');
        console.log('   Duration:', statusData.result.duration || 'N/A');
        console.log('   Size:', statusData.result.size || 'N/A');
        console.log('   Playback URL:', `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${data.result.uid}/manifest/video.m3u8`);
        console.log('   Dashboard URL:', `https://dash.cloudflare.com/${CLOUDFLARE_ACCOUNT_ID}/stream/videos/${data.result.uid}`);
      } else {
        console.log('❌ Could not get video status:', statusData.errors);
      }
      
    } else {
      console.log('❌ Upload failed:', uploadResponse.status, uploadResponse.statusText);
      const errorText = await uploadResponse.text();
      console.log('   Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testDirectUpload();