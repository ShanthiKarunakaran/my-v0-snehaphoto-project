import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/images - Fetch images with pagination and filtering
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  const offset = (page - 1) * limit

  try {
    let query = supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (category && category !== 'All') {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`alt_text.ilike.%${search}%,filename.ilike.%${search}%`)
    }

    const { data: images, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      images,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/images - Add new image (for admin use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename, alt_text, category, cloudinary_url, width, height, file_size } = body

    const { data, error } = await supabase
      .from('images')
      .insert([{
        filename,
        alt_text,
        category,
        cloudinary_url,
        width,
        height,
        file_size
      }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ image: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
