import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-server'

// GET /api/images - Fetch images with pagination and filtering
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  const offset = (page - 1) * limit

  try {
    console.log('Images API called:', { page, limit, category, search, offset })
    
    // Use admin client to bypass RLS for reads, fallback to regular client
    const client = supabaseAdmin || supabase
    
    let query = client
      .from('images')
      .select('*', { count: 'exact' })

    // Apply filters BEFORE pagination
    if (category && category !== 'All') {
      // Trim the category and use exact match
      // Since user updated DB to use exact category names, we'll use exact match
      const trimmedCategory = decodeURIComponent(category.trim())
      console.log('Filtering by category:', trimmedCategory)
      
      // Handle "Graduation Photos" category - match both "Graduation Photos" and "GraduationPhotos"
      if (trimmedCategory.toLowerCase().replace(/\s+/g, '') === 'graduationphotos') {
        // Match both variations
        query = query.or('category.eq.Graduation Photos,category.eq.GraduationPhotos')
      } else {
        // Exact match for other categories
        query = query.eq('category', trimmedCategory)
      }
    }

    if (search) {
      query = query.or(`alt_text.ilike.%${search}%,filename.ilike.%${search}%`)
    }

    // Order by id (most reliable) - created_at might have nulls or ordering issues
    query = query.order('id', { ascending: false })
    
    query = query.range(offset, offset + limit - 1)

    const { data: images, error, count } = await query

    console.log('Query result:', { 
      imageCount: images?.length || 0, 
      totalCount: count,
      error: error?.message || null,
      hasData: !!images
    })

    if (error) {
      console.error('Images API error:', error)
      return NextResponse.json({ 
        error: error.message, 
        images: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        },
        debug: {
          errorDetails: error,
          queryParams: { page, limit, category, search }
        }
      }, { status: 500 })
    }

    // Deduplicate images by filename
    // If same filename exists with both local path and Supabase URL, prefer Supabase URL
    const imageMap = new Map<string, typeof images[0]>()
    
    if (images) {
      for (const image of images) {
        const filename = image.filename?.toLowerCase() || ''
        const existing = imageMap.get(filename)
        
        if (!existing) {
          // First occurrence of this filename
          imageMap.set(filename, image)
        } else {
          // Duplicate found - prefer Supabase Storage URL over local path
          const existingIsSupabase = existing.cloudinary_url?.includes('supabase.co') || existing.cloudinary_url?.includes('supabase.in')
          const currentIsSupabase = image.cloudinary_url?.includes('supabase.co') || image.cloudinary_url?.includes('supabase.in')
          
          if (currentIsSupabase && !existingIsSupabase) {
            // Replace local path with Supabase URL
            imageMap.set(filename, image)
          } else if (!currentIsSupabase && existingIsSupabase) {
            // Keep existing Supabase URL
            // Do nothing
          } else {
            // Both are same type, prefer newer one
            const existingDate = new Date(existing.created_at || 0)
            const currentDate = new Date(image.created_at || 0)
            if (currentDate > existingDate) {
              imageMap.set(filename, image)
            }
          }
        }
      }
    }
    
    const deduplicatedImages = Array.from(imageMap.values())
    
    // Use the original count from database for pagination
    // The deduplication happens per page, so we can't accurately adjust the total
    // The frontend will handle showing the correct count based on displayed images
    // For now, use the original count - the UI will show the actual displayed count
    const totalCount = count || 0

    return NextResponse.json({
      images: deduplicatedImages,
      pagination: {
        page,
        limit,
        total: totalCount, // Use original database count
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('Images API catch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error),
      images: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0
      }
    }, { status: 500 })
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

    // Use admin client to bypass RLS policies, fallback to regular client if admin not available
    const client = supabaseAdmin || supabase
    
    if (!supabaseAdmin) {
      console.warn('Using regular supabase client - RLS policies may block inserts. Set SUPABASE_SERVICE_ROLE_KEY to bypass RLS.')
    }

    // Insert the image into the database
    const { data, error } = await client
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
      console.error('Database insert error:', error)
      return NextResponse.json({ 
        error: error.message,
        details: error,
        code: error.code
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, image: data }, { status: 201 })
  } catch (error) {
    console.error('API catch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// DELETE /api/images - Delete images by filename pattern
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    const id = searchParams.get('id')

    if (!filename && !id) {
      return NextResponse.json(
        { error: 'Missing required parameter: filename or id' },
        { status: 400 }
      )
    }

    // Use admin client to bypass RLS policies
    const client = supabaseAdmin || supabase
    
    if (!supabaseAdmin) {
      console.warn('Using regular supabase client - RLS policies may block deletes. Set SUPABASE_SERVICE_ROLE_KEY to bypass RLS.')
    }

    let query = client.from('images').delete()

    if (id) {
      query = query.eq('id', id)
    } else if (filename) {
      // Match filename (case-insensitive, partial match)
      query = query.ilike('filename', `%${filename}%`)
    }

    const { data, error } = await query.select()

    if (error) {
      console.error('Database delete error:', error)
      return NextResponse.json({ 
        error: error.message,
        details: error,
        code: error.code
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      deleted: data?.length || 0,
      images: data 
    }, { status: 200 })
  } catch (error) {
    console.error('API catch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}