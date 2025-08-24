#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// OpenAI API Key from environment
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// New prompt without text - focusing on visual elements only
const DALLE_PROMPT = `Create a high-resolution ethereal sports analytics dashboard background. Deep cosmic purple-black gradient with swirling golden nebulae. Abstract data visualizations: floating translucent 3D bar charts, pie charts, and line graphs in gold and amber. Holographic hexagonal grid patterns. Flowing data streams like golden constellations. Subtle silhouettes of wrestlers in action poses faded in the background mist. Floating numbers only: 87, 342, 1249, 5.1, 106, 113, 120, 126, 132 in glowing gold. Trophy and medal icons with ethereal glow. Particle effects and light streams. No text or words, only numbers and visual elements. Style: Modern dashboard UI background, mystical sports visualization, professional dark theme with luxury gold accents, cinematic lighting, 4K resolution`;

async function generateImage() {
  if (!OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY environment variable is not set');
    console.log('💡 Set it with: export OPENAI_API_KEY="your-key-here"');
    process.exit(1);
  }

  console.log('🎨 Generating wrestling statistics background V2 (no text)...');
  console.log('📝 Focus: Visual elements, numbers only, no words');

  const data = JSON.stringify({
    model: "dall-e-3",
    prompt: DALLE_PROMPT,
    n: 1,
    size: "1792x1024",
    quality: "hd",
    style: "vivid"
  });

  const options = {
    hostname: 'api.openai.com',
    port: 443,
    path: '/v1/images/generations',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
      fs.unlink(filename, () => {});
      console.error('❌ Download failed:', err.message);
      reject(err);
    });
  });
}

async function main() {
  try {
    console.log('🚀 Starting Aether Insight background generation V2...\n');
    
    // Generate the image
    const result = await generateImage();
    
    // Create directory if it doesn't exist
    const outputDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Backup old image if it exists
    const imagePath = path.join(outputDir, 'wrestling-stats-bg.png');
    if (fs.existsSync(imagePath)) {
      const backupPath = path.join(outputDir, 'wrestling-stats-bg-v1.png');
      fs.renameSync(imagePath, backupPath);
      console.log('📦 Backed up old image to wrestling-stats-bg-v1.png');
    }
    
    // Download the new image
    await downloadImage(result.url, imagePath);
    
    // Save metadata
    const metadata = {
      version: 2,
      generated_at: new Date().toISOString(),
      url: result.url,
      revised_prompt: result.revised_prompt,
      original_prompt: DALLE_PROMPT,
      changes: 'No text/words, only numbers and visual elements, subtle wrestler silhouettes'
    };
    
    const metadataPath = path.join(outputDir, 'wrestling-stats-bg-metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`📄 Metadata saved to: ${metadataPath}`);
    
    console.log('\n✨ Background generation V2 complete!');
    console.log('📍 Image location: public/wrestling-stats-bg.png');
    console.log('🎯 Changes: No text, numbers only, better visual elements');
    
  } catch (error) {
    console.error('\n❌ Generation failed:', error);
    process.exit(1);
  }
}

// Run the script
main();