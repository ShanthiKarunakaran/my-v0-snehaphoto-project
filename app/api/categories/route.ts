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
    const allCategories = images.map(img => img.category).filter(Boolean)
    
    // Normalize categories - merge "Graduation Photos" and "GraduationPhotos"
    const normalizedMap = new Map<string, string>() // normalized key -> display name
    
    allCategories.forEach(cat => {
      // Normalize by removing spaces and converting to lowercase for comparison
      const normalizedKey = cat.toLowerCase().replace(/\s+/g, '')
      
      // Handle "GraduationPhotos" variations - prefer "Graduation Photos" format
      if (normalizedKey.includes('graduationphoto')) {
        const displayName = 'Graduation Photos'
        if (!normalizedMap.has('graduationphotos')) {
          normalizedMap.set('graduationphotos', displayName)
        }
      } else {
        // For other categories, use the original name but normalize the key
        if (!normalizedMap.has(normalizedKey)) {
          normalizedMap.set(normalizedKey, cat)
        }
      }
    })
    
    // Convert to array and sort
    const uniqueCategories = Array.from(normalizedMap.values()).sort()

    return NextResponse.json({ categories: uniqueCategories })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
