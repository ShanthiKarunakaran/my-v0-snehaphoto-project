import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/debug-categories - Debug endpoint to see all categories and graduation photos
export async function GET() {
  try {
    // Get all categories
    const { data: images, error } = await supabase
      .from('images')
      .select('id, category, alt_text')
      .not('category', 'is', null)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group by category
    const categoryMap: Record<string, any[]> = {}
    images.forEach(img => {
      const cat = img.category
      if (!categoryMap[cat]) {
        categoryMap[cat] = []
      }
      categoryMap[cat].push({ id: img.id, alt_text: img.alt_text })
    })

    // Check graduation photos specifically
    const graduationKeys = Object.keys(categoryMap).filter(k => 
      k.toLowerCase().includes('graduation') || k.toLowerCase().includes('grad')
    )

    // Get raw category values with character codes
    const categoryDetails = Object.keys(categoryMap).map(cat => ({
      category: cat,
      display: cat,
      length: cat.length,
      charCodes: Array.from(cat).map(c => c.charCodeAt(0)),
      imageCount: categoryMap[cat].length,
      sampleImages: categoryMap[cat].slice(0, 3)
    }))

    return NextResponse.json({
      allCategories: categoryDetails,
      graduationPhotos: graduationKeys.map(key => ({
        category: key,
        display: key,
        length: key.length,
        charCodes: Array.from(key).map(c => c.charCodeAt(0)),
        imageCount: categoryMap[key].length,
        images: categoryMap[key]
      })),
      categoryMap: categoryMap
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

