#!/usr/bin/env node

const https = require('https');

// GoDaddy API credentials
const GODADDY_API_KEY = '9jHwmx1uNpS_KYhM4NMXJez63FjXEcjKhu';
const GODADDY_API_SECRET = 'QYDxHfEyfpLCeJsS8r3CzU';

// Domain configuration
const DOMAIN = 'aethervtc.ai';
const SUBDOMAIN = 'insight';

// Vercel deployment - using CNAME to point to Vercel app
const VERCEL_APP_DOMAIN = 'aether-insight-ei5ai8m5f-the-fort-ai.vercel.app';

async function makeGoDaddyRequest(method, path, data = null) {
    const options = {
        hostname: 'api.godaddy.com',
        path: path,
        method: method,
        headers: {
            'Authorization': `sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}`,
            'Content-Type': 'application/json',
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const parsed = body ? JSON.parse(body) : {};
                        resolve(parsed);
                    } catch (e) {
                        resolve(body);
                    }
                } else {
                    reject(new Error(`GoDaddy API error: ${res.statusCode} - ${body}`));
                }
            });
        });

        req.on('error', reject);
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function setupDNS() {
    console.log(`\n🔧 Setting up DNS for ${SUBDOMAIN}.${DOMAIN}...`);
    console.log(`   Target: ${VERCEL_APP_DOMAIN}\n`);

    try {
        // First, check if the domain exists and is accessible
        console.log('1️⃣  Checking domain access...');
        const domainInfo = await makeGoDaddyRequest('GET', `/v1/domains/${DOMAIN}`);
        console.log(`   ✅ Domain ${DOMAIN} is accessible`);

        // Get existing DNS records
        console.log('\n2️⃣  Fetching existing DNS records...');
        const existingRecords = await makeGoDaddyRequest('GET', `/v1/domains/${DOMAIN}/records`);
        console.log(`   Found ${existingRecords.length} existing records`);

        // Check if CNAME record for subdomain already exists
        const existingCNAME = existingRecords.find(
            record => record.type === 'CNAME' && record.name === SUBDOMAIN
        );

        const cnameRecord = {
            type: 'CNAME',
            name: SUBDOMAIN,
            data: VERCEL_APP_DOMAIN,
            ttl: 600,
            priority: 10
        };

        if (existingCNAME) {
            console.log(`\n3️⃣  Updating existing CNAME record for ${SUBDOMAIN}...`);
            // Update existing record
            await makeGoDaddyRequest('PUT', `/v1/domains/${DOMAIN}/records/CNAME/${SUBDOMAIN}`, [cnameRecord]);
            console.log(`   ✅ Updated CNAME: ${SUBDOMAIN}.${DOMAIN} → ${VERCEL_APP_DOMAIN}`);
        } else {
            console.log(`\n3️⃣  Creating new CNAME record for ${SUBDOMAIN}...`);
            // Create new record - need to append to existing records
            const newRecords = [...existingRecords, cnameRecord];
            await makeGoDaddyRequest('PUT', `/v1/domains/${DOMAIN}/records`, newRecords);
            console.log(`   ✅ Created CNAME: ${SUBDOMAIN}.${DOMAIN} → ${VERCEL_APP_DOMAIN}`);
        }

        console.log('\n✨ DNS Configuration Complete!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`\n🌐 Your site will be available at: https://${SUBDOMAIN}.${DOMAIN}`);
        console.log('\n⏱️  DNS propagation can take 5-30 minutes.');
        console.log('   You can check propagation status at: https://dnschecker.org\n');
        
        console.log('📝 Next Steps:');
        console.log('   1. Wait for DNS propagation (5-30 minutes)');
        console.log('   2. Configure custom domain in Vercel:');
        console.log(`      - Go to your Vercel project settings`);
        console.log(`      - Add domain: ${SUBDOMAIN}.${DOMAIN}`);
        console.log(`      - Vercel will automatically provision SSL certificate`);
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('\n❌ Error setting up DNS:', error.message);
        if (error.message.includes('404')) {
            console.error('   Domain not found. Please check that the domain exists in your GoDaddy account.');
        } else if (error.message.includes('401')) {
            console.error('   Authentication failed. Please check your API key and secret.');
        }
        process.exit(1);
    }
}

// Run the setup
console.log('🚀 Aether Insight DNS Configuration');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
setupDNS();