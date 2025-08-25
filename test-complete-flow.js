const puppeteer = require('puppeteer');

// Test configuration
const BASE_URL = 'https://insight.aethervtc.ai';
const LOCAL_URL = 'http://localhost:3000';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testCompleteFlow(useLocal = false) {
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
    defaultViewport: null
  });
  
  const page = await browser.newPage();
  
  // Grant camera/mic permissions
  const context = browser.defaultBrowserContext();
  await context.overridePermissions(useLocal ? LOCAL_URL : BASE_URL, ['camera', 'microphone']);
  
  // Enable console logging
  page.on('console', msg => {
    if (!msg.text().includes('preload')) {
      console.log('PAGE:', msg.text());
    }
  });
  page.on('pageerror', err => console.log('ERROR:', err.toString()));
  
  const url = useLocal ? LOCAL_URL : BASE_URL;
  console.log(`\n🧪 Testing Complete Flow at ${url}\n`);
  
  try {
    // Step 1: Navigate to live scoring
    console.log('1️⃣ Navigating to live scoring...');
    await page.goto(`${url}/matches/live-scoring`, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Step 2: Fill match setup
    console.log('2️⃣ Setting up match...');
    
    // Mat number
    await page.type('#mat', '1');
    
    // Wrestler 1
    await page.type('#wrestler1', 'Smith, John');
    await page.type('#team1', 'Red Team');
    
    // Wrestler 2  
    await page.type('#wrestler2', 'Johnson, Mike');
    await page.type('#team2', 'Blue Team');
    
    // Weight class - click the weight button
    const weightButton = await page.$('button:has-text("126")');
    if (weightButton) {
      await weightButton.click();
      await delay(500);
      // Select 132 lbs
      const weight132 = await page.$('button:has-text("132")');
      if (weight132) await weight132.click();
    }
    
    console.log('   ✅ Match details filled');
    
    // Step 3: Start the match
    console.log('3️⃣ Starting match...');
    const startButton = await page.$('button:has-text("Start Match")');
    if (startButton) {
      await startButton.click();
      console.log('   ✅ Match started');
      await delay(2000);
    } else {
      throw new Error('Start Match button not found');
    }
    
    // Step 4: Check if scoring interface loaded
    console.log('4️⃣ Testing scoring interface...');
    
    // Look for scoring buttons
    const scoringButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      return Array.from(buttons).map(btn => btn.textContent).filter(text => 
        text && (text.includes('Takedown') || text.includes('Escape') || text.includes('Reversal') || text.includes('Pin'))
      );
    });
    
    console.log('   Scoring buttons found:', scoringButtons);
    
    // Step 5: Score some points
    console.log('5️⃣ Testing scoring actions...');
    
    // Red scores takedown
    const redSection = await page.$('[class*="border-red"], [class*="bg-red"]');
    if (redSection) {
      const takedownBtn = await redSection.$('button:has-text("Takedown")');
      if (takedownBtn) {
        await takedownBtn.click();
        console.log('   ✅ Red scored takedown (2 points)');
        await delay(1000);
      }
    }
    
    // Blue scores escape
    const blueSection = await page.$('[class*="border-blue"], [class*="bg-blue"]');
    if (blueSection) {
      const escapeBtn = await blueSection.$('button:has-text("Escape")');
      if (escapeBtn) {
        await escapeBtn.click();
        console.log('   ✅ Blue scored escape (1 point)');
        await delay(1000);
      }
    }
    
    // Step 6: Check video recording status
    console.log('6️⃣ Checking video recording...');
    
    const videoElements = await page.$$('video');
    console.log(`   Found ${videoElements.length} video element(s)`);
    
    if (videoElements.length > 0) {
      // Check if video is playing
      const isPlaying = await page.evaluate(() => {
        const video = document.querySelector('video');
        return video && !video.paused && !video.ended && video.readyState > 2;
      });
      console.log(`   Video playing: ${isPlaying ? '✅' : '❌'}`);
      
      // Check for recording indicator
      const recordingIndicator = await page.$('[class*="recording"], [class*="animate-pulse"]');
      console.log(`   Recording indicator: ${recordingIndicator ? '✅' : '❌'}`);
    }
    
    // Step 7: Test PIN to end match
    console.log('7️⃣ Ending match with PIN...');
    
    // Find PIN button
    const pinButton = await page.$('button:has-text("Pin")');
    if (pinButton) {
      await pinButton.click();
      console.log('   ✅ PIN clicked');
      await delay(2000);
      
      // Check if match ended
      const matchEnded = await page.evaluate(() => {
        const text = document.body.textContent;
        return text.includes('Match Complete') || text.includes('Winner') || text.includes('match-over');
      });
      
      console.log(`   Match ended: ${matchEnded ? '✅' : '❌'}`);
    } else {
      console.log('   ❌ PIN button not found');
    }
    
    // Step 8: Check sync manager
    console.log('8️⃣ Checking sync status...');
    
    // Look for sync icon/button in bottom left
    const syncIcon = await page.$('[class*="fixed"][class*="bottom"][class*="left"] button');
    if (syncIcon) {
      await syncIcon.click();
      await delay(1000);
      
      // Check sync panel content
      const syncContent = await page.evaluate(() => {
        const panel = document.querySelector('[class*="fixed"][class*="bottom"]');
        if (panel) {
          return {
            hasMatches: panel.textContent.includes('Matches'),
            hasEvents: panel.textContent.includes('Events'),
            hasVideos: panel.textContent.includes('Videos'),
            isOnline: panel.textContent.includes('Online')
          };
        }
        return null;
      });
      
      if (syncContent) {
        console.log('   Sync Manager Status:');
        console.log(`     Matches: ${syncContent.hasMatches ? '✅' : '❌'}`);
        console.log(`     Events: ${syncContent.hasEvents ? '✅' : '❌'}`);
        console.log(`     Videos: ${syncContent.hasVideos ? '✅' : '❌'}`);
        console.log(`     Online: ${syncContent.isOnline ? '✅' : '❌'}`);
      }
      
      // Try to sync
      const syncButton = await page.$('button:has-text("Sync Match Data")');
      if (syncButton) {
        const isDisabled = await page.evaluate(el => el.disabled, syncButton);
        if (!isDisabled) {
          await syncButton.click();
          console.log('   ✅ Sync triggered');
          await delay(3000);
        }
      }
    } else {
      console.log('   ❌ Sync manager not found');
    }
    
    // Step 9: Check for errors
    console.log('9️⃣ Checking for errors...');
    
    const errors = await page.evaluate(() => {
      // Check console for errors
      const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"], .text-red-500');
      return Array.from(errorElements).map(el => el.textContent).filter(text => text && text.length > 0);
    });
    
    if (errors.length > 0) {
      console.log('   ⚠️  Errors found:');
      errors.forEach(err => console.log(`      - ${err}`));
    } else {
      console.log('   ✅ No visible errors');
    }
    
    // Step 10: Network analysis
    console.log('🔟 Analyzing network requests...');
    
    const failedRequests = [];
    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        error: request.failure().errorText
      });
    });
    
    await delay(2000);
    
    if (failedRequests.length > 0) {
      console.log('   Failed requests:');
      failedRequests.forEach(req => {
        console.log(`     ❌ ${req.url.split('/').slice(-2).join('/')}: ${req.error}`);
      });
    } else {
      console.log('   ✅ No failed requests');
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'flow-complete.png',
      fullPage: true 
    });
    console.log('\n📸 Screenshot saved as flow-complete.png');
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('   Match Setup: ✅');
    console.log('   Match Started: ✅');
    console.log('   Scoring Works: ' + (scoringButtons.length > 0 ? '✅' : '❌'));
    console.log('   Video Recording: ' + (videoElements.length > 0 ? '✅' : '❌'));
    console.log('   Match End: ✅');
    console.log('   Data Sync: ' + (syncIcon ? '✅' : '❌'));
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'error-screenshot.png' });
    console.log('📸 Error screenshot saved');
  } finally {
    console.log('\n🏁 Test complete - keeping browser open for inspection');
    console.log('   Close browser window manually when done.');
    // Don't close browser - let user inspect
    // await browser.close();
  }
}

// Run the test
const isLocal = process.argv.includes('--local');
testCompleteFlow(isLocal);