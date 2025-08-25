# Vercel Environment Variables Setup

## Required Environment Variables

You need to add these environment variables in your Vercel project settings:

### 1. Go to Vercel Dashboard
- Visit https://vercel.com/dashboard
- Select your `aether-insight` project
- Go to Settings → Environment Variables

### 2. Add These Variables

#### Supabase (REQUIRED - app won't work without these)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

To get these values:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy the values:
   - Project URL → NEXT_PUBLIC_SUPABASE_URL
   - anon public key → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - service_role key → SUPABASE_SERVICE_ROLE_KEY

#### Cloudflare Stream (for video upload)
```
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_STREAM_TOKEN=your_cloudflare_api_token
NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN=your_subdomain
```

To get these values:
1. Go to https://dash.cloudflare.com
2. Select your account
3. Go to Stream → API
4. Copy your Account ID and create an API token

### 3. Apply to All Environments
Make sure to check these boxes for each variable:
- [x] Production
- [x] Preview
- [x] Development

### 4. Redeploy
After adding all variables, redeploy your project:
```bash
vercel --prod
```

## Quick Check
Your app is currently failing because it's trying to connect to:
- `https://your-project-ref.supabase.co` (placeholder URL)

Once you add the real Supabase URL and keys, the app will work properly.
