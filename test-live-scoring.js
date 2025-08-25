const puppeteer = require('puppeteer');

// Test configuration
const BASE_URL = 'https://insight.aethervtc.ai';
const LOCAL_URL = 'http://localhost:3000';

async function testLiveScoring(useLocal = false) {
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set viewport and user agent
  await page.setViewport({ width: 1280, height: 800 });
  
  // Enable console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('requestfailed', req => console.log('REQUEST FAILED:', req.url(), req.failure().errorText));
  
  const url = useLocal ? LOCAL_URL : BASE_URL;
  console.log(`\n🧪 Testing Live Scoring at ${url}\n`);
  
  try {
    // Step 1: Navigate to live scoring page
    console.log('1️⃣ Navigating to live scoring page...');
    await page.goto(`${url}/matches/live-scoring`, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Step 2: Check what's on the page
    console.log('2️⃣ Checking page content...');
    
    // Get page title and check for any auth redirects
    const pageTitle = await page.title();
    const pageUrl = page.url();
    console.log(`   Page Title: ${pageTitle}`);
    console.log(`   Current URL: ${pageUrl}`);
    
    // Check if we need to login first
    if (pageUrl.includes('login') || pageUrl.includes('auth')) {
      console.log('   ⚠️  Redirected to login page - need authentication');
      return;
    }
    
    // Get all input fields on the page
    const inputs = await page.evaluate(() => {
      const inputElements = document.querySelectorAll('input');
      return Array.from(inputElements).map(input => ({
        placeholder: input.placeholder,
        name: input.name,
        type: input.type,
        id: input.id
      }));
    });
    
    console.log('   Found inputs:', inputs);
    
    // Try different selectors
    let redInput = await page.$('input[placeholder*="Red"]') || 
                   await page.$('input[placeholder*="red"]') ||
                   await page.$('input[name*="red"]') ||
                   await page.$('#red-wrestler');
                   
    if (!redInput) {
      console.log('   ❌ Could not find Red wrestler input');
      console.log('   Trying to start match with button first...');
      
      // Look for any button that might start the match
      const buttons = await page.evaluate(() => {
        const buttonElements = document.querySelectorAll('button');
        return Array.from(buttonElements).map(btn => btn.textContent);
      });
      console.log('   Available buttons:', buttons);
      
      return;
    }
    
    // Fill in match details
    await page.type('input[placeholder*="Red"]', 'Test Red Wrestler');
    
    await page.waitForSelector('input[placeholder*="Blue"]', { timeout: 5000 });
    await page.type('input[placeholder*="Blue"]', 'Test Blue Wrestler');
    
    // Select weight class
    const weightSelect = await page.$('select');
    if (weightSelect) {
      await weightSelect.select('125');
    }
    
    // Start match
    const startButton = await page.$('button:has-text("Start Match")');
    if (startButton) {
      await startButton.click();
      console.log('   ✅ Match started');
    } else {
      console.log('   ❌ Could not find Start Match button');
    }
    
    // Wait for match to start
    await page.waitForTimeout(2000);
    
    // Step 3: Test scoring actions
    console.log('3️⃣ Testing scoring actions...');
    
    // Test takedown
    const takedownButton = await page.$('button:has-text("Takedown")');
    if (takedownButton) {
      await takedownButton.click();
      console.log('   ✅ Takedown scored');
      await page.waitForTimeout(1000);
    }
    
    // Test escape
    const escapeButton = await page.$('button:has-text("Escape")');
    if (escapeButton) {
      await escapeButton.click();
      console.log('   ✅ Escape scored');
      await page.waitForTimeout(1000);
    }
    
    // Step 4: Test video recording
    console.log('4️⃣ Testing video recording...');
    
    // Check if video element exists
    const videoElement = await page.$('video');
    if (videoElement) {
      console.log('   ✅ Video element found');
      
      // Check if recording started
      const recordingIndicator = await page.$('.recording-indicator, [class*="recording"]');
      if (recordingIndicator) {
        console.log('   ✅ Recording appears to be active');
      } else {
        console.log('   ⚠️  No recording indicator found');
      }
    } else {
      console.log('   ❌ No video element found');
    }
    
    // Step 5: Test match end
    console.log('5️⃣ Testing match end (PIN)...');
    
    // Look for PIN button
    const pinButton = await page.$('button:has-text("Pin")');
    if (pinButton) {
      await pinButton.click();
      console.log('   ✅ PIN clicked');
      await page.waitForTimeout(2000);
    } else {
      console.log('   ❌ Could not find PIN button');
    }
    
    // Step 6: Check data persistence
    console.log('6️⃣ Checking data persistence...');
    
    // Check network requests for API calls
    const requests = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        requests.push({
          url: response.url(),
          status: response.status(),
          ok: response.ok()
        });
      }
    });
    
    await page.waitForTimeout(3000);
    
    console.log('\n📊 API Requests Summary:');
    requests.forEach(req => {
      const icon = req.ok ? '✅' : '❌';
      console.log(`   ${icon} ${req.status} - ${req.url.split('/').slice(-2).join('/')}`);
    });
    
    // Step 7: Test sync manager
    console.log('\n7️⃣ Testing sync manager...');
    
    const syncButton = await page.$('[class*="sync"], button:has-text("Sync")');
    if (syncButton) {
      const syncStatus = await page.evaluate(el => {
        return window.getComputedStyle(el).display !== 'none';
      }, syncButton);
      
      if (syncStatus) {
        console.log('   ✅ Sync manager is visible');
      } else {
        console.log('   ⚠️  Sync manager is hidden');
      }
    } else {
      console.log('   ⚠️  No sync manager found');
    }
    
    // Step 8: Check for errors
    console.log('\n8️⃣ Checking for errors...');
    
    const errors = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('[class*="error"], .text-red-500, .text-red-600');
      return Array.from(errorElements).map(el => el.textContent);
    });
    
    if (errors.length > 0) {
      console.log('   ❌ Errors found:');
      errors.forEach(err => console.log(`      - ${err}`));
    } else {
      console.log('   ✅ No visible errors');
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'live-scoring-test.png',
      fullPage: true 
    });
    console.log('\n📸 Screenshot saved as live-scoring-test.png');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await page.screenshot({ path: 'error-screenshot.png' });
    console.log('📸 Error screenshot saved');
  } finally {
    console.log('\n🏁 Test complete');
    await browser.close();
  }
}

// Run the test
const isLocal = process.argv.includes('--local');
testLiveScoring(isLocal);