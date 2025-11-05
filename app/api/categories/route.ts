import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/categories - Fetch all unique categories from images table
export async function GET() {
  try {
    // Get all unique categories from images table
    const { data: images, error } = await supabase
      .from('images')
      .select('category')
      .not('category', 'is', null)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Extract unique categories
    const uniqueCategories = Array.from(new Set(images.map(img => img.category).filter(Boolean)))
      .sort()

    return NextResponse.json({ categories: uniqueCategories })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
