# Vercel Environment Variables Setup

## Required Environment Variables

Add these environment variables in your Vercel project settings:
**Dashboard → Project → Settings → Environment Variables**

### 1. Supabase Database (REQUIRED)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres
```

**Used for:**
- Mat Ops sync API (`/api/matops/sync`)
- All database operations (wrestlers, matches, teams, videos)
- Authentication

### 2. Cloudflare Stream (Video Features)
```bash
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_STREAM_TOKEN=your_cloudflare_stream_token
CLOUDFLARE_CUSTOMER_SUBDOMAIN=your_cloudflare_customer_subdomain
```

**Used for:**
- Video upload and streaming
- AI video analysis features
- Match recording

### 3. Stream.io (Chat & Real-time)
```bash
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
NEXT_PUBLIC_STREAM_APP_ID=your_stream_app_id
```

**Used for:**
- Real-time chat
- Team communication
- Live match updates

### 4. Authentication Secret
```bash
AUTH_SECRET=your_random_secret_string
```

**Used for:**
- Session encryption
- JWT token signing
- Generate with: `openssl rand -base64 32`

### 5. OpenAI (Optional AI Features)
```bash
OPENAI_API_KEY=sk-...
```

**Used for:**
- Optional AI analysis features
- Text processing

## Setup Instructions

### Step 1: Access Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your `aether-insight` project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Each Variable
For each environment variable above:
1. Click **Add New**
2. Enter the **Key** name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
3. Enter the **Value** (the actual secret/URL)
4. Select environments: **Production**, **Preview**, **Development** (all three)
5. Click **Save**

### Step 3: Redeploy
After adding all variables:
1. Go to **Deployments** tab
2. Click **•••** menu on latest deployment
3. Select **Redeploy**
4. Check "Use existing Build Cache" ❌ (uncheck to ensure fresh build)
5. Click **Redeploy**

## Verifying Setup

### Test Mat Ops Sync API
```bash
curl -X POST https://aether-insight.vercel.app/api/matops/sync \
  -H "Content-Type: application/json" \
  -d '{
    "source": "USABracketing",
    "teamId": "test-team-id",
    "wrestlers": []
  }'
```

Expected response:
```json
{
  "error": "Team not found"
}
```
(This confirms the API is working and connecting to database)

### Check Vercel Build Logs
1. Go to **Deployments** tab
2. Click on latest deployment
3. Check **Build Logs** for any environment variable errors

## Security Notes

⚠️ **NEVER commit these values to Git!**

✅ **DO:**
- Store secrets in Vercel dashboard only
- Use `.env.local` for local development (already in `.gitignore`)
- Keep `.env.example` updated with variable names (not values)
- Rotate secrets periodically

❌ **DON'T:**
- Commit `.env.local` to Git
- Share secrets in Slack/Discord/Email
- Hardcode API keys in code
- Use production keys for development

## Mat Ops Extension Configuration

The Chrome extension handles its own API keys:

### Extension API Key Setup (User Side)
Users need to configure their own Anthropic API key in the extension:

```javascript
// In Chrome DevTools Console on any page:
chrome.storage.local.set({
  anthropicApiKey: 'sk-ant-api03-...',
  teamId: 'your-team-uuid-from-platform'
})
```

Or create a settings page in the extension popup for easier configuration.

## Troubleshooting

### Error: "Supabase URL is required"
- Check that `NEXT_PUBLIC_SUPABASE_URL` is set in Vercel
- Redeploy after adding the variable

### Error: "Service role key is required"
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set
- Verify the key is correct (should start with `eyJ...`)

### Extension Sync Fails
1. Check extension is pointing to correct URL in `background.js`:
   - Production: `https://aether-insight.vercel.app/api/matops`
   - Local: `http://localhost:3000/api/matops`
2. Verify team ID is configured in extension
3. Check browser console for errors
4. Check Vercel function logs

### Database Connection Errors
- Verify `DATABASE_URL` format is correct
- Check Supabase project is active
- Verify IP allowlist in Supabase (should allow all for Vercel)

## Next Steps

After setting up Vercel:
1. ✅ Commit and push code to GitHub
2. ✅ Vercel auto-deploys from GitHub
3. ✅ Add all environment variables in Vercel dashboard
4. ✅ Redeploy with new variables
5. ✅ Test Mat Ops sync from extension
6. ✅ Verify video upload works
7. ✅ Check live scoring features

## Support

If you need help with setup:
- Check Vercel build logs: [vercel.com/dashboard/deployments](https://vercel.com/dashboard/deployments)
- Check Supabase logs: [supabase.com/dashboard/project/_/logs](https://supabase.com/dashboard/project/_/logs)
- Check extension console: Chrome DevTools → Extensions → Mat Ops → Inspect views: service worker

---

**Last Updated:** November 21, 2025
**Vercel Project:** aether-insight
**Repository:** https://github.com/thefortaiagency/aether-insight
