import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-server'

// GET /api/categories - Fetch all unique categories from images table
export async function GET() {
  try {
    // Use admin client to bypass RLS
    const client = supabaseAdmin || supabase
    
    console.log('Categories API: Using admin client:', !!supabaseAdmin)
    
    // Get all unique categories from images table
    // Try without the .not() filter first to see if that's the issue
    const { data: images, error } = await client
      .from('images')
      .select('category')

    console.log('Categories API query result:', { 
      imageCount: images?.length || 0, 
      error: error?.message || null,
      sampleCategories: images?.slice(0, 5).map(img => img.category) || []
    })

    if (error) {
      console.error('Categories API error:', error)
      return NextResponse.json({ error: error.message, categories: [] }, { status: 500 })
    }

    // Handle empty results
    if (!images || images.length === 0) {
      console.log('Categories API: No images found')
      return NextResponse.json({ categories: [] })
    }

    // Extract unique categories and clean them
    const allCategories = images
      .map(img => img.category)
      .filter(Boolean)
      .map(cat => cat.trim().replace(/\n/g, '')) // Remove whitespace and newlines
    
    // Normalize categories - merge "Graduation Photos" and "GraduationPhotos"
    const normalizedMap = new Map<string, string>() // normalized key -> display name
    
    allCategories.forEach(cat => {
      // Clean the category name
      const cleanedCat = cat.trim().replace(/\n/g, '')
      
      // Normalize by removing spaces and converting to lowercase for comparison
      const normalizedKey = cleanedCat.toLowerCase().replace(/\s+/g, '')
      
      // Handle "GraduationPhotos" variations - prefer "Graduation Photos" format
      if (normalizedKey.includes('graduationphoto')) {
        const displayName = 'Graduation Photos'
        if (!normalizedMap.has('graduationphotos')) {
          normalizedMap.set('graduationphotos', displayName)
        }
      } else {
        // For other categories, use the cleaned name but normalize the key
        if (!normalizedMap.has(normalizedKey)) {
          normalizedMap.set(normalizedKey, cleanedCat)
        }
      }
    })
    
    // Convert to array and sort
    const uniqueCategories = Array.from(normalizedMap.values()).sort()
    
    console.log('Categories API: Final categories:', uniqueCategories)

    return NextResponse.json({ categories: uniqueCategories })
  } catch (error) {
    console.error('Categories API catch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      categories: [],
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}
