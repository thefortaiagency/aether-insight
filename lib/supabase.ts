import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-ref.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key'

// Check if we have the required environment variables
if (supabaseUrl === 'https://your-project-ref.supabase.co' || !supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
  console.error('⚠️ SUPABASE NOT CONFIGURED! Add environment variables to Vercel. See VERCEL_ENV_SETUP.md')
  if (typeof window !== 'undefined') {
    console.error('Visit Vercel Dashboard → Settings → Environment Variables to add your Supabase credentials')
  }
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any

// For server-side operations requiring elevated privileges
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null as any