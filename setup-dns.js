#!/usr/bin/env node

/**
 * MULTI-DOMAIN DNS AUTOMATION FOR 20+ DOMAINS
 * 
 * Leverages GoDaddy API access with bulk operations
 * Handles multiple domains and subdomains efficiently
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const path = require('path');

class MultiDomainDNS {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = 'https://api.godaddy.com/v1';
    this.requestCount = 0;
    this.lastMinute = Date.now();
  }

  // Rate limiting (60 requests per minute)
  async rateLimitCheck() {
    const now = Date.now();
    if (now - this.lastMinute > 60000) {
      this.requestCount = 0;
      this.lastMinute = now;
    }

    if (this.requestCount >= 55) { // Leave buffer
      const waitTime = 60000 - (now - this.lastMinute);
      console.log(`⏳ Rate limit approaching, waiting ${Math.ceil(waitTime/1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastMinute = Date.now();
    }
    
    this.requestCount++;
  }

  // Make authenticated API request
  async makeRequest(endpoint, method = 'GET', body = null) {
    await this.rateLimitCheck();
    
    const options = {
      method,
      headers: {
        'Authorization': `sso-key ${this.apiKey}:${this.apiSecret}`,
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GoDaddy API Error ${response.status}: ${errorText}`);
    }

    return response.status === 204 ? null : response.json();
  }

  // Get all domains in account
  async getAllDomains() {
    console.log('📋 Fetching all domains from GoDaddy account...');
    
    try {
      const domains = await this.makeRequest('/domains');
      console.log(`✅ Found ${domains.length} domains in account`);
      
      return domains.map(domain => ({
        name: domain.domain,
        status: domain.status,
        expiry: domain.expires,
        privacy: domain.privacy
      }));
    } catch (error) {
      console.error('❌ Failed to fetch domains:', error.message);
      throw error;
    }
  }

  // Get existing DNS records for a domain
  async getDNSRecords(domain, recordType = null) {
    console.log(`🔍 Fetching DNS records for ${domain}...`);
    
    const endpoint = recordType 
      ? `/domains/${domain}/records/${recordType}`
      : `/domains/${domain}/records`;
    
    try {
      const records = await this.makeRequest(endpoint);
      console.log(`📋 Found ${records.length} ${recordType || 'total'} records for ${domain}`);
      return records;
    } catch (error) {
      console.error(`❌ Failed to fetch DNS records for ${domain}:`, error.message);
      throw error;
    }
  }

  // Create/Update CNAME record
  async setCNAME(domain, subdomain, target, ttl = 600) {
    console.log(`🔧 Setting ${subdomain}.${domain} → ${target}`);
    
    try {
      await this.makeRequest(
        `/domains/${domain}/records/CNAME/${subdomain}`,
        'PUT',
        [{ data: target, ttl }]
      );
      
      console.log(`✅ CNAME record created: ${subdomain}.${domain} → ${target}`);
      return { success: true, domain, subdomain, target };
    } catch (error) {
      console.error(`❌ Failed to set CNAME for ${subdomain}.${domain}:`, error.message);
      return { success: false, domain, subdomain, target, error: error.message };
    }
  }

  // Bulk DNS operations for multiple domains
  async bulkDeployment(deployments) {
    console.log(`🚀 Starting bulk deployment for ${deployments.length} configurations...`);
    
    const results = [];
    const errors = [];
    
    for (const deployment of deployments) {
      const { domain, subdomain, vercelUrl, ttl } = deployment;
      
      try {
        const result = await this.setCNAME(domain, subdomain, vercelUrl, ttl);
        results.push(result);
        
        if (!result.success) {
          errors.push(result);
        }
        
        // Small delay between operations
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        const errorResult = { 
          success: false, 
          domain, 
          subdomain, 
          vercelUrl, 
          error: error.message 
        };
        results.push(errorResult);
        errors.push(errorResult);
      }
    }
    
    // Generate summary report
    this.generateReport(results, errors);
    
    return { results, errors, success: errors.length === 0 };
  }

  // Generate deployment report
  generateReport(results, errors) {
    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: errors.length,
      results,
      errors
    };

    // Save detailed report
    const reportFile = path.join(__dirname, `dns-report-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    // Console summary
    console.log('\n📊 DEPLOYMENT SUMMARY');
    console.log('=' .repeat(50));
    console.log(`✅ Successful: ${report.successful}/${report.total}`);
    console.log(`❌ Failed: ${report.failed}/${report.total}`);
    console.log(`📁 Detailed report: ${reportFile}`);
    
    if (errors.length > 0) {
      console.log('\n❌ FAILED DEPLOYMENTS:');
      errors.forEach(error => {
        console.log(`  • ${error.subdomain}.${error.domain}: ${error.error}`);
      });
    }
    
    console.log('=' .repeat(50));
  }

  // Smart domain management - automatically configure popular subdomains
  async autoConfigureDomain(domain, vercelUrl, options = {}) {
    const {
      subdomains = ['www', 'app', 'staging', 'dev'],
      ttl = 600,
      skipExisting = true
    } = options;

    console.log(`🔄 Auto-configuring ${domain} with ${subdomains.length} subdomains...`);

    const deployments = subdomains.map(subdomain => ({
      domain,
      subdomain,
      vercelUrl,
      ttl
    }));

    // Check existing records if skipExisting is true
    if (skipExisting) {
      try {
        const existingRecords = await this.getDNSRecords(domain, 'CNAME');
        const existingNames = existingRecords.map(r => r.name);
        
        const newDeployments = deployments.filter(d => !existingNames.includes(d.subdomain));
        
        if (newDeployments.length < deployments.length) {
          console.log(`⏭️  Skipping ${deployments.length - newDeployments.length} existing records`);
        }
        
        return await this.bulkDeployment(newDeployments);
      } catch (error) {
        console.warn('⚠️  Could not check existing records, proceeding with all deployments');
        return await this.bulkDeployment(deployments);
      }
    }

    return await this.bulkDeployment(deployments);
  }
}

// CLI Interface for bulk operations
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  // Load API credentials
  const apiKey = process.env.GODADDY_API_KEY;
  const apiSecret = process.env.GODADDY_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    console.error('❌ Missing GoDaddy API credentials');
    console.log('Set environment variables:');
    console.log('  export GODADDY_API_KEY=your-api-key');
    console.log('  export GODADDY_API_SECRET=your-api-secret');
    process.exit(1);
  }
  
  const dns = new MultiDomainDNS(apiKey, apiSecret);
  
  switch (command) {
    case 'list':
      // List all domains
      const domains = await dns.getAllDomains();
      console.table(domains);
      break;
      
    case 'records':
      // Show DNS records for a domain
      if (!args[1]) {
        console.error('Usage: node multi-domain-dns.js records <domain>');
        process.exit(1);
      }
      const records = await dns.getDNSRecords(args[1]);
      console.table(records);
      break;
      
    case 'deploy':
      // Single deployment
      if (args.length < 4) {
        console.error('Usage: node multi-domain-dns.js deploy <domain> <subdomain> <vercel-url>');
        process.exit(1);
      }
      const result = await dns.setCNAME(args[1], args[2], args[3]);
      console.log(result);
      break;
      
    case 'auto':
      // Auto-configure domain with common subdomains
      if (args.length < 3) {
        console.error('Usage: node multi-domain-dns.js auto <domain> <vercel-url>');
        process.exit(1);
      }
      await dns.autoConfigureDomain(args[1], args[2]);
      break;
      
    case 'bulk':
      // Bulk deployment from config file
      const configFile = args[1] || 'bulk-deployments.json';
      if (!fs.existsSync(configFile)) {
        console.error(`❌ Config file not found: ${configFile}`);
        process.exit(1);
      }
      const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      await dns.bulkDeployment(config.deployments);
      break;
      
    default:
      console.log('Multi-Domain DNS Automation for GoDaddy');
      console.log('');
      console.log('Commands:');
      console.log('  list                              - List all domains');
      console.log('  records <domain>                  - Show DNS records');
      console.log('  deploy <domain> <sub> <vercel>    - Single deployment');
      console.log('  auto <domain> <vercel>            - Auto-configure common subdomains');
      console.log('  bulk <config.json>                - Bulk deployment from config');
      console.log('');
      console.log('Examples:');
      console.log('  node multi-domain-dns.js list');
      console.log('  node multi-domain-dns.js deploy example.com www app-abc123.vercel.app');
      console.log('  node multi-domain-dns.js auto example.com app-abc123.vercel.app');
      break;
  }
}

// Export for use as module
module.exports = { MultiDomainDNS };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}