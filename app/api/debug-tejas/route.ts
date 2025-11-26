import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/debug-tejas - Debug endpoint to check Tejas images
export async function GET() {
  try {
    // Search for images with "tejas" in filename or alt_text (case-insensitive)
    const { data: images, error } = await supabase
      .from('images')
      .select('*')
      .or('filename.ilike.%tejas%,alt_text.ilike.%tejas%')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Check each image URL
    const imagesWithUrlCheck = await Promise.all(
      (images || []).map(async (image) => {
        const url = image.cloudinary_url
        
        // Try to fetch the image to see if it's accessible
        let urlStatus = 'unknown'
        let urlError = null
        
        if (url) {
          try {
            // Only check if it's a full URL (not a local path)
            if (url.startsWith('http://') || url.startsWith('https://')) {
              const response = await fetch(url, { method: 'HEAD' })
              urlStatus = response.ok ? 'accessible' : `error-${response.status}`
              if (!response.ok) {
                urlError = `HTTP ${response.status}`
              }
            } else {
              urlStatus = 'local-path'
            }
          } catch (err) {
            urlStatus = 'fetch-error'
            urlError = err instanceof Error ? err.message : String(err)
          }
        } else {
          urlStatus = 'no-url'
        }

        return {
          id: image.id,
          filename: image.filename,
          alt_text: image.alt_text,
          category: image.category,
          cloudinary_url: image.cloudinary_url,
          urlStatus,
          urlError,
          created_at: image.created_at
        }
      })
    )

    return NextResponse.json({
      tejasImages: imagesWithUrlCheck,
      count: imagesWithUrlCheck.length,
      summary: {
        accessible: imagesWithUrlCheck.filter(img => img.urlStatus === 'accessible').length,
        errors: imagesWithUrlCheck.filter(img => img.urlStatus !== 'accessible' && img.urlStatus !== 'local-path').length,
        localPaths: imagesWithUrlCheck.filter(img => img.urlStatus === 'local-path').length
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}





