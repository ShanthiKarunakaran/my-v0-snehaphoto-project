import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client with service role key for Storage operations
// This should only be used in API routes and server components
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create admin client with service role key for Storage uploads
// Only create if both URL and service key are available
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

