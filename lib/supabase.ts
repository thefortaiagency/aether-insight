import { createClient } from '@supabase/supabase-js'

// Use placeholder values if environment variables are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Create a mock client if environment variables are missing
export const supabase = (supabaseUrl === 'https://placeholder.supabase.co') 
  ? {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
        eq: () => ({
          select: () => Promise.resolve({ data: [], error: null }),
          single: () => Promise.resolve({ data: null, error: null })
        })
      }),
      channel: () => ({
        on: () => ({ subscribe: () => {} })
      })
    } as any
  : createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations requiring elevated privileges
export const getServiceSupabase = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
  
  if (supabaseUrl === 'https://placeholder.supabase.co') {
    return supabase
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}