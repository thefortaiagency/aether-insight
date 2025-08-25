# Vercel Environment Variables Setup

## Required Environment Variables for Vercel Deployment

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Cloudflare Stream Configuration (for Video Features)
```
NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
NEXT_PUBLIC_CLOUDFLARE_STREAM_TOKEN=your_cloudflare_stream_token
NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN=your_cloudflare_customer_subdomain
```

### Optional: AI Features
```
OPENAI_API_KEY=your_openai_api_key
```

## Setting Environment Variables in Vercel

1. Go to your project dashboard in Vercel
2. Navigate to Settings → Environment Variables
3. Add each variable listed above with your actual values
4. Make sure to select the appropriate environment(s):
   - Production
   - Preview
   - Development

## Cloudflare Stream Setup

1. Sign up for Cloudflare Stream at https://dash.cloudflare.com/
2. Get your Account ID from the Cloudflare dashboard
3. Generate an API token with Stream:Read permissions
4. Your customer subdomain is provided in the Stream dashboard

## Important Notes

- All `NEXT_PUBLIC_` variables are exposed to the browser
- Keep your `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` secure (server-side only)
- The Cloudflare variables are required for video upload and playback features
- Without Cloudflare configuration, video features will fall back to basic HTML5 video

## Testing Your Configuration

After setting up environment variables in Vercel:

1. Trigger a new deployment
2. Check the build logs for any missing variable warnings
3. Test video features on the deployed site
4. Verify Supabase connectivity in the live scoring features