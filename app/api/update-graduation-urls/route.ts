import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-server'

// GET /api/update-graduation-urls - Check graduation photos and find correct URLs
export async function GET() {
  try {
    // Get all graduation photos (case-insensitive)
    const { data: images, error } = await supabase
      .from('images')
      .select('id, filename, cloudinary_url, category, alt_text')
      .or('category.ilike.%graduation%,category.ilike.%grad%')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Try to find files in Supabase Storage
    const photosWithUrls: any[] = []
    
    if (supabaseAdmin && images) {
      // List all folders in the images bucket
      const folders = ['photos/GraduationPhotos', 'photos/graduation', 'photos/Graduation', 'photos']
      
      for (const image of images) {
        let foundUrl = null
        
        // Try to find the file in different possible locations
        for (const folder of folders) {
          try {
            // List files in this folder
            const { data: files, error: listError } = await supabaseAdmin.storage
              .from('images')
              .list(folder, {
                limit: 1000,
                sortBy: { column: 'name', order: 'asc' }
              })
            
            if (!listError && files) {
              // Try to match by filename
              const matchedFile = files.find(file => {
                const dbFilename = image.filename.toLowerCase()
                const storageFilename = file.name.toLowerCase()
                
                // Exact match
                if (storageFilename === dbFilename) return true
                
                // Match without extension
                const dbBase = dbFilename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')
                const storageBase = storageFilename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')
                if (dbBase === storageBase) return true
                
                // Match if filename is contained in storage name
                if (storageFilename.includes(dbBase) || dbBase.includes(storageBase)) return true
                
                return false
              })
              
              if (matchedFile) {
                const filePath = folder ? `${folder}/${matchedFile.name}` : matchedFile.name
                const { data: urlData } = supabaseAdmin.storage
                  .from('images')
                  .getPublicUrl(filePath)
                
                foundUrl = urlData.publicUrl
                break
              }
            }
          } catch (err) {
            // Continue to next folder
            continue
          }
        }
        
        photosWithUrls.push({
          ...image,
          currentUrl: image.cloudinary_url,
          suggestedUrl: foundUrl,
          needsUpdate: foundUrl && foundUrl !== image.cloudinary_url
        })
      }
    } else {
      // If no admin client, just return images without URL suggestions
      photosWithUrls.push(...images.map(img => ({
        ...img,
        currentUrl: img.cloudinary_url,
        suggestedUrl: null,
        needsUpdate: false
      })))
    }

    return NextResponse.json({
      graduationPhotos: photosWithUrls,
      count: photosWithUrls.length,
      foundUrls: photosWithUrls.filter(p => p.suggestedUrl).length
    })
  } catch (error) {
    console.error('Error in update-graduation-urls:', error)
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

// POST /api/update-graduation-urls - Update graduation photo URLs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageId, newUrl } = body

    if (!imageId || !newUrl) {
      return NextResponse.json(
        { error: 'imageId and newUrl are required' },
        { status: 400 }
      )
    }

    // Update the cloudinary_url for the specified image
    const { data, error } = await supabase
      .from('images')
      .update({ cloudinary_url: newUrl })
      .eq('id', imageId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      image: data,
      message: 'URL updated successfully'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

