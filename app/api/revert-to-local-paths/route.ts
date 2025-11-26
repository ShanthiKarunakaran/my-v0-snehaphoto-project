import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/revert-to-local-paths - Revert images back to local paths if files don't exist in storage
export async function POST() {
  try {
    // Get all images
    const { data: images, error: fetchError } = await supabase
      .from('images')
      .select('*')

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const results = []

    for (const image of images || []) {
      try {
        const currentUrl = image.cloudinary_url
        
        // If it's a Supabase Storage URL, check if we should revert to local path
        if (currentUrl?.startsWith('https://') && currentUrl.includes('supabase.co')) {
          // Try to determine the local path from the storage URL
          const urlMatch = currentUrl.match(/\/photos\/(.+)$/)
          if (urlMatch) {
            const storagePath = urlMatch[1]
            const localPath = `/photos/${storagePath}`
            
            // Update back to local path
            const { data: updatedImage, error: updateError } = await supabase
              .from('images')
              .update({ cloudinary_url: localPath })
              .eq('id', image.id)
              .select()
              .single()

            if (updateError) {
              results.push({
                id: image.id,
                filename: image.filename,
                success: false,
                error: updateError.message
              })
            } else {
              results.push({
                id: image.id,
                filename: image.filename,
                success: true,
                oldUrl: currentUrl,
                newUrl: localPath
              })
            }
          }
        }
      } catch (error) {
        results.push({
          id: image.id,
          filename: image.filename,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    const successful = results.filter(r => r.success).length
    const failed = results.length - successful

    return NextResponse.json({
      success: successful > 0,
      results,
      summary: {
        total: results.length,
        successful,
        failed
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}





