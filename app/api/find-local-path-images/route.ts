import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/find-local-path-images - Find all images with local paths instead of Supabase Storage URLs
export async function GET() {
  try {
    // Get all images
    const { data: images, error } = await supabase
      .from('images')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter images that have local paths (not starting with http/https)
    const localPathImages = (images || []).filter(img => {
      const url = img.cloudinary_url
      return url && !url.startsWith('http://') && !url.startsWith('https://')
    })

    // Group by category for easier viewing
    const byCategory: Record<string, Array<{ id: number; filename: string; category: string; alt_text: string; currentUrl: string; path: string }>> = {}
    localPathImages.forEach(img => {
      const cat = img.category || 'Uncategorized'
      if (!byCategory[cat]) {
        byCategory[cat] = []
      }
      byCategory[cat].push({
        id: img.id,
        filename: img.filename,
        alt_text: img.alt_text,
        category: img.category,
        currentUrl: img.cloudinary_url,
        path: img.cloudinary_url
      })
    })

    return NextResponse.json({
      totalImages: images?.length || 0,
      localPathImages: localPathImages.length,
      imagesWithUrls: (images || []).length - localPathImages.length,
      byCategory,
      allLocalPathImages: localPathImages.map(img => ({
        id: img.id,
        filename: img.filename,
        alt_text: img.alt_text,
        category: img.category,
        currentUrl: img.cloudinary_url
      }))
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}





