import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET() {
  try {
    // Use admin client to bypass RLS
    const client = supabaseAdmin || supabase
    
    // Test the connection by fetching images
    const { data: images, error: imagesError, count } = await client
      .from('images')
      .select('*', { count: 'exact' })
      .limit(5)

    // Also try to get categories from images
    const { data: categoryData, error: categoryError } = await client
      .from('images')
      .select('category')
      .not('category', 'is', null)

    return NextResponse.json({ 
      success: true,
      message: 'Database connection successful!',
      images: {
        count: count || 0,
        sample: images?.slice(0, 3) || [],
        error: imagesError?.message || null
      },
      categories: {
        count: categoryData?.length || 0,
        unique: [...new Set(categoryData?.map(img => img.category) || [])],
        error: categoryError?.message || null
      },
      env: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        usingAdminClient: !!supabaseAdmin,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to connect to database',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
