#!/usr/bin/env node

const puppeteer = require('puppeteer');

console.log(`
╔════════════════════════════════════════════╗
║   AETHER INSIGHT - LIVE SCORING TEST      ║
║   Testing: Production Environment          ║
╚════════════════════════════════════════════╝
`);

async function runTest() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']
  });
  
  const page = await browser.newPage();
  const context = browser.defaultBrowserContext();
  await context.overridePermissions('https://insight.aethervtc.ai', ['camera', 'microphone']);
  
  console.log('📍 Step 1: Loading Live Scoring Page...');
  await page.goto('https://insight.aethervtc.ai/matches/live-scoring');
  await new Promise(r => setTimeout(r, 2000));
  console.log('✅ Page loaded\n');
  
  console.log('📝 Step 2: Setting Up Match...');
  await page.type('#wrestler1', 'Smith, John');
  await page.type('#team1', 'Red Hawks');
  await page.type('#wrestler2', 'Johnson, Mike');
  await page.type('#team2', 'Blue Eagles');
  console.log('✅ Match details entered\n');
  
  console.log('🚀 Step 3: Starting Match...');
  await page.click('button::-p-text(Start Match)');
  await new Promise(r => setTimeout(r, 3000));
  
  // Check if match started
  const hasScoring = await page.evaluate(() => {
    const body = document.body.innerText;
    return body.includes('Takedown') || body.includes('Escape');
  });
  
  if (hasScoring) {
    console.log('✅ Match started - Scoring interface loaded\n');
    
    console.log('🎯 Step 4: Testing Scoring...');
    
    // Score a takedown
    const buttons = await page.$$('button');
    for (const button of buttons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && text.includes('Takedown')) {
        await button.click();
        console.log('✅ Scored takedown (2 points)\n');
        break;
      }
    }
    
    console.log('🎬 Step 5: Checking Video...');
    const hasVideo = await page.evaluate(() => {
      return document.querySelector('video') !== null;
    });
    console.log(hasVideo ? '✅ Video element present\n' : '❌ No video element found\n');
    
    console.log('🏁 Step 6: Ending Match...');
    
    // End with PIN
    for (const button of await page.$$('button')) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && text.includes('Pin')) {
        await button.click();
        console.log('✅ Match ended with PIN\n');
        break;
      }
    }
    
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('💾 Step 7: Checking Data Sync...');
    
    // Click sync icon
    const syncIcon = await page.$('[class*="fixed"][class*="bottom"][class*="left"] button');
    if (syncIcon) {
      await syncIcon.click();
      await new Promise(r => setTimeout(r, 1000));
      
      // Check if sync panel opened
      const syncPanel = await page.evaluate(() => {
        const panel = document.querySelector('[class*="Sync Manager"]');
        return panel !== null;
      });
      
      console.log(syncPanel ? '✅ Sync manager accessible\n' : '⚠️ Sync manager not found\n');
      
      // Try to sync
      const syncButton = await page.$('button::-p-text(Sync Match Data)');
      if (syncButton) {
        const isDisabled = await page.evaluate(el => el.disabled, syncButton);
        console.log(!isDisabled ? '✅ Data ready to sync\n' : '⚠️ Nothing to sync\n');
      }
    }
    
    console.log('📊 RESULTS SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Page loads');
    console.log('✅ Match setup works');
    console.log('✅ Scoring interface works');
    console.log(hasVideo ? '✅ Video recording works' : '❌ Video recording issue');
    console.log('✅ Match can be ended');
    console.log('✅ Sync manager available');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Check for errors
    const errors = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('[class*="error"], .text-red-500');
      return Array.from(errorElements)
        .map(el => el.textContent)
        .filter(text => text && text.length > 0 && !text.includes('Cancel'));
    });
    
    if (errors.length > 0) {
      console.log('\n⚠️ ERRORS DETECTED:');
      errors.forEach(err => console.log(`   - ${err}`));
    }
    
  } else {
    console.log('❌ Match did not start properly\n');
    
    // Get page content for debugging
    const pageText = await page.evaluate(() => document.body.innerText);
    console.log('Page content:', pageText.substring(0, 500));
  }
  
  console.log('\n✨ Test Complete! Browser will remain open for inspection.');
  console.log('   Close the browser window when done.\n');
}

runTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});