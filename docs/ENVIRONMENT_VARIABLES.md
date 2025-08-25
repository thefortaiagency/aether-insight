# Environment Variables Documentation

## Overview
This document describes all environment variables required for Aether Insight Wrestling Platform.

## ✅ Already Configured in Vercel

The following environment variables have been automatically added to your Vercel project:

### 📹 Cloudflare Stream (Video Analysis)
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account identifier
- `CLOUDFLARE_STREAM_TOKEN` - API token for Cloudflare Stream
- `CLOUDFLARE_CUSTOMER_SUBDOMAIN` - Custom subdomain for video streaming

**Used for:** AI video analysis of wrestling matches, move detection, and video storage

### 💬 Stream.io (Real-time Features)
- `NEXT_PUBLIC_STREAM_API_KEY` - Public API key for Stream.io
- `STREAM_API_SECRET` - Secret key for server-side Stream.io operations
- `NEXT_PUBLIC_STREAM_APP_ID` - Your Stream.io application ID

**Used for:** Team chat, video conferencing, real-time match updates

### 🤖 OpenAI (AI Analysis)
- `OPENAI_API_KEY` - API key for OpenAI services ✅ **Already configured in Vercel**

**Used for:** AI move detection, match analysis, performance insights, image generation

> **Note:** The OpenAI API key has been securely added to your Vercel environment. For local development, you'll need to obtain the key from Vercel dashboard or contact the administrator.

### 🔐 Authentication
- `AUTH_SECRET` - NextAuth.js secret for session encryption (auto-generated)

**Used for:** Secure user authentication and session management

## ⚠️ Required Setup: Supabase Database

You need to create a Supabase project and update these placeholder values:

### 🗄️ Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations
- `DATABASE_URL` - Direct PostgreSQL connection string

### How to Set Up Supabase:

1. **Create a Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign up/login and create a new project
   - Choose a strong database password

2. **Get Your API Keys**
   - Go to Settings → API in your Supabase dashboard
   - Copy the Project URL, anon key, and service_role key

3. **Run the Database Schema**
   - Go to SQL Editor in Supabase
   - Copy the contents of `scripts/create-supabase-database.sql`
   - Run the SQL to create all tables

4. **Update Vercel Environment Variables**
   ```bash
   # Update each variable with your actual values
   vercel env rm NEXT_PUBLIC_SUPABASE_URL production
   echo "https://your-project.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
   
   vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production
   echo "your-anon-key" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   
   vercel env rm SUPABASE_SERVICE_ROLE_KEY production
   echo "your-service-key" | vercel env add SUPABASE_SERVICE_ROLE_KEY production
   ```

5. **Redeploy Your Application**
   ```bash
   vercel --prod
   ```

## 🚀 Features Enabled by Each Service

### With Cloudflare Stream:
- Record and upload match videos
- AI analysis of wrestling techniques
- Automatic move detection and tagging
- Video highlights generation
- Performance replay and review

### With Stream.io:
- Real-time team chat
- Video calls for remote coaching
- Live match commentary
- Parent/fan engagement features
- Team announcements and notifications

### With OpenAI:
- Automated match analysis
- Performance predictions
- Training recommendations
- Opponent scouting insights
- Natural language match summaries

### With Supabase:
- Complete wrestler profiles
- Match history and statistics
- Team management
- Tournament brackets
- Weight tracking
- Practice scheduling
- Injury management
- Academic tracking

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Rotate API keys regularly
- Use different keys for development and production
- Monitor API usage to prevent abuse
- Enable Row Level Security (RLS) in Supabase

## 📞 Support

If you need help with any environment variables:
1. Check the service's official documentation
2. Verify the key format and permissions
3. Ensure the service is active and not rate-limited
4. Check Vercel deployment logs for specific errors

## Quick Test

To verify all services are connected:
1. Check Vercel deployment: Should show "✓ Ready"
2. Visit `/api/health` endpoint (once implemented)
3. Try uploading a test video
4. Send a test chat message
5. View wrestler statistics page