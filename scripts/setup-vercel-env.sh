#!/bin/bash

# Setup Vercel Environment Variables for Aether Insight
# This script adds all necessary environment variables to the Vercel project

echo "🚀 Setting up Vercel environment variables for Aether Insight..."

# Cloudflare Stream Variables (from aether_beta_2_obe_fork)
echo "📹 Adding Cloudflare Stream variables..."
echo "jZumEn7YxddYkFGeuJ6ZnVSSQaayuZ6Vqni4rcAZ" | vercel env add CLOUDFLARE_STREAM_TOKEN production
echo "e3e4a97ae2752b669920518d97069116" | vercel env add CLOUDFLARE_ACCOUNT_ID production
echo "customer-gozi8qaaq1gycqie.cloudflarestream.com" | vercel env add CLOUDFLARE_CUSTOMER_SUBDOMAIN production

# Stream.io Variables (from aether_beta_2_obe_fork)
echo "💬 Adding Stream.io variables..."
echo "mmhfdzb5evj2" | vercel env add NEXT_PUBLIC_STREAM_API_KEY production
echo "ubvgp2q6tg9d9but8h8sg2njqskfcbgja8r84e4k4ckradp7m82n5q9r3vq923ep" | vercel env add STREAM_API_SECRET production
echo "1366514" | vercel env add NEXT_PUBLIC_STREAM_APP_ID production

# OpenAI API Key (for AI analysis and image generation)
echo "🤖 Adding OpenAI API key..."
# NOTE: Replace with your actual OpenAI API key
echo "your-openai-api-key-here" | vercel env add OPENAI_API_KEY production

# Supabase Placeholder Variables (to be replaced with actual values when database is created)
echo "🗄️ Adding Supabase placeholder variables..."
echo "https://your-project-ref.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "your-anon-key" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "your-service-role-key" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

# NextAuth Secret (generate a new one for production)
echo "🔐 Adding NextAuth secret..."
# Generate a random 32-character string for AUTH_SECRET
AUTH_SECRET=$(openssl rand -base64 32)
echo "$AUTH_SECRET" | vercel env add AUTH_SECRET production

echo "✅ Environment variables added successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Run the SQL script in scripts/create-supabase-database.sql"
echo "3. Update the Supabase environment variables in Vercel:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "🎯 Your app is ready to deploy with video capabilities!"