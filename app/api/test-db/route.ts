import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test the connection by fetching categories
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful!',
      categories: categories 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to connect to database' 
    }, { status: 500 })
  }
}
