import { createClient } from '@supabase/supabase-js'

// Get the environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey)

// Define the types for our database tables
export interface Image {
  id: number
  filename: string
  alt_text: string
  category: string
  cloudinary_url: string
  width: number
  height: number
  file_size: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  description: string
  color: string
  created_at: string
}
