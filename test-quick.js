const puppeteer = require('puppeteer');

async function quickTest() {
  console.log('🚀 Quick Live Scoring Test\n');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  // Grant permissions
  const context = browser.defaultBrowserContext();
  await context.overridePermissions('https://insight.aethervtc.ai', ['camera', 'microphone']);
  
  try {
    // 1. Load page
    console.log('1. Loading live scoring page...');
    await page.goto('https://insight.aethervtc.ai/matches/live-scoring', { 
      waitUntil: 'networkidle2',
      timeout: 15000 
    });
    console.log('   ✅ Page loaded\n');
    
    // 2. Fill form
    console.log('2. Filling match form...');
    await page.type('#wrestler1', 'Test Red');
    await page.type('#wrestler2', 'Test Blue');
    await page.type('#team1', 'Red Team');
    await page.type('#team2', 'Blue Team');
    console.log('   ✅ Form filled\n');
    
    // 3. Start match
    console.log('3. Starting match...');
    await page.click('button::-p-text(Start Match)');
    await new Promise(r => setTimeout(r, 2000));
    
    // Check what happened
    const currentUrl = page.url();
    const pageContent = await page.content();
    
    // Look for scoring interface
    const hasScoring = pageContent.includes('Takedown') || pageContent.includes('takedown');
    const hasVideo = pageContent.includes('<video') || pageContent.includes('video-recorder');
    const hasError = pageContent.includes('error') || pageContent.includes('Error');
    
    console.log('   URL: ' + currentUrl);
    console.log('   Has Scoring UI: ' + (hasScoring ? '✅' : '❌'));
    console.log('   Has Video: ' + (hasVideo ? '✅' : '❌'));
    console.log('   Has Errors: ' + (hasError ? '⚠️ Yes' : '✅ No'));
    
    if (!hasScoring) {
      // Get page text to see what's there
      const bodyText = await page.evaluate(() => document.body.innerText);
      console.log('\n   Page shows:', bodyText.substring(0, 200));
    }
    
    // 4. Try scoring if interface loaded
    if (hasScoring) {
      console.log('\n4. Testing scoring...');
      
      // Find and click takedown
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await page.evaluate(el => el.textContent, button);
        if (text && text.includes('Takedown')) {
          await button.click();
          console.log('   ✅ Clicked Takedown');
          break;
        }
      }
      
      // Check score
      await new Promise(r => setTimeout(r, 1000));
      const scores = await page.evaluate(() => {
        const elements = document.querySelectorAll('[class*="text-3xl"], [class*="text-4xl"], .score');
        return Array.from(elements).map(el => el.textContent);
      });
      console.log('   Scores found:', scores);
    }
    
    // 5. Check sync status
    console.log('\n5. Checking sync manager...');
    const syncButton = await page.$('[class*="fixed"][class*="bottom"][class*="left"]');
    console.log('   Sync button: ' + (syncButton ? '✅ Found' : '❌ Not found'));
    
    // Take screenshot
    await page.screenshot({ path: 'quick-test.png' });
    console.log('\n📸 Screenshot saved as quick-test.png');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'quick-test-error.png' });
  } finally {
    await browser.close();
    console.log('\n✅ Test complete');
  }
}

quickTest();