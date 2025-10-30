import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/categories - Fetch all categories
export async function GET() {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ categories })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
