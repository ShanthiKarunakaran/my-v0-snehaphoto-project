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
      .select('*', { count: 'exact' })

    // Apply filters BEFORE pagination
    if (category && category !== 'All') {
      // Trim the category and use exact match
      // Since user updated DB to use exact category names, we'll use exact match
      const trimmedCategory = decodeURIComponent(category.trim())
      
      // For graduation photos, use case-insensitive match as it seems to have issues
      // This is a workaround for potential case/whitespace mismatches
      if (trimmedCategory.toLowerCase().includes('graduation') || trimmedCategory.toLowerCase().includes('grad')) {
        query = query.ilike('category', trimmedCategory)
      } else {
        // Try exact match for other categories
        query = query.eq('category', trimmedCategory)
      }
    }

    if (search) {
      query = query.or(`alt_text.ilike.%${search}%,filename.ilike.%${search}%`)
    }

    // Apply ordering and pagination AFTER filters
    query = query.order('created_at', { ascending: false })
    query = query.range(offset, offset + limit - 1)

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

// POST /api/images - Add a new image to the database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename, alt_text, category, cloudinary_url, storage_url, width, height, file_size } = body

    // Validate required fields
    if (!alt_text || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: alt_text and category are required' },
        { status: 400 }
      )
    }

    // Prioritize storage_url over cloudinary_url (storage_url is from Supabase Storage)
    const imageUrl = storage_url || cloudinary_url || filename

    // Insert the image into the database
    const { data, error } = await supabase
      .from('images')
      .insert([
        {
          filename: filename || imageUrl, // Original filename or path
          alt_text,
          category,
          cloudinary_url: imageUrl, // Store the storage URL here (keeping field name for compatibility)
          width: width || 0, // Default to 0 if not provided (database requires NOT NULL)
          height: height || 0, // Default to 0 if not provided
          file_size: file_size || 0, // Default to 0 if not provided
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, image: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}