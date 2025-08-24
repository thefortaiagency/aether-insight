#!/usr/bin/env node

/**
 * Generate Wrestling Statistics Background Image using OpenAI DALL-E
 * 
 * Usage: 
 * 1. Set your OpenAI API key: export OPENAI_API_KEY="your-key-here"
 * 2. Run: node scripts/generate-background.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// The optimized prompt from our AI team consensus
const DALLE_PROMPT = `Create a high-resolution, ethereal wrestling statistics dashboard background image with a deep cosmic theme. Dark purple-black gradient background with swirling golden nebulae. Floating holographic wrestling statistics in glowing gold text: '87% WIN RATE', '342 PINS', '1,249 TAKEDOWNS', 'POWER INDEX +5.1'. Include translucent 3D bar charts and pie charts with gold accents showing performance metrics. Add subtle wrestling silhouettes in the mist. Scattered golden particles and data streams flowing like constellations. Weight class numbers (106, 113, 120, 126, 132) floating as golden numerals. Trophy icons with ethereal glow. Hexagonal grid pattern overlay at 10% opacity. Style: Modern dashboard UI background, mystical sports analytics visualization, professional dark theme with luxury gold accents, 4K resolution, cinematic lighting`;

// Configuration
const config = {
  model: "dall-e-3",
  prompt: DALLE_PROMPT,
  n: 1,
  size: "1792x1024", // Use 1024x1024, 1024x1792, or 1792x1024
  quality: "hd", // "standard" or "hd"
  style: "vivid" // "vivid" or "natural"
};

async function generateImage() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ Error: OPENAI_API_KEY environment variable is not set');
    console.log('💡 Set it with: export OPENAI_API_KEY="your-key-here"');
    process.exit(1);
  }

  console.log('🎨 Generating wrestling statistics background with DALL-E 3...');
  console.log('📝 Prompt:', DALLE_PROMPT.substring(0, 100) + '...');

  const data = JSON.stringify(config);

  const options = {
    hostname: 'api.openai.com',
    port: 443,
    path: '/v1/images/generations',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          
          if (response.error) {
            console.error('❌ API Error:', response.error.message);
            reject(response.error);
            return;
          }

          if (response.data && response.data[0]) {
            const imageUrl = response.data[0].url;
            const revisedPrompt = response.data[0].revised_prompt;
            
            console.log('✅ Image generated successfully!');
            console.log('🔗 Image URL:', imageUrl);
            console.log('📝 Revised prompt:', revisedPrompt);
            
            resolve({ url: imageUrl, revised_prompt: revisedPrompt });
          } else {
            console.error('❌ Unexpected response format');
            reject(new Error('Unexpected response format'));
          }
        } catch (error) {
          console.error('❌ Failed to parse response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filename);
    
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Image saved to: ${filename}`);
        resolve(filename);
      });
    }).on('error', (err) => {
      fs.unlink(filename, () => {}); // Delete the file on error
      console.error('❌ Download failed:', err.message);
      reject(err);
    });
  });
}

async function main() {
  try {
    console.log('🚀 Starting Aether Insight background generation...\n');
    
    // Generate the image
    const result = await generateImage();
    
    // Save the image URL and revised prompt
    const outputDir = path.join(__dirname, '..', 'public', 'backgrounds');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save metadata
    const metadata = {
      generated_at: new Date().toISOString(),
      url: result.url,
      revised_prompt: result.revised_prompt,
      original_prompt: DALLE_PROMPT,
      config: config
    };
    
    const metadataPath = path.join(outputDir, 'wrestling-stats-bg-metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`📄 Metadata saved to: ${metadataPath}`);
    
    // Download the image
    const imagePath = path.join(outputDir, 'wrestling-stats-bg.png');
    await downloadImage(result.url, imagePath);
    
    console.log('\n✨ Background generation complete!');
    console.log('📍 Image location: public/backgrounds/wrestling-stats-bg.png');
    console.log('\n💡 To use in your app:');
    console.log('   backgroundImage: "url(/backgrounds/wrestling-stats-bg.png)"');
    
  } catch (error) {
    console.error('\n❌ Generation failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { generateImage, downloadImage };