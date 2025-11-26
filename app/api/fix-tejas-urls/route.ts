import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-server'

// GET /api/fix-tejas-urls - Find and suggest correct URLs for Tejas images
export async function GET() {
  try {
    // Get Tejas images
    const { data: images, error } = await supabase
      .from('images')
      .select('*')
      .or('filename.ilike.%tejas%,alt_text.ilike.%tejas%')
      .order('id', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const imagesWithUrls: Array<{ id: number; filename: string; alt_text: string; currentUrl: string; suggestedUrl?: string | null; suggestedPath?: string | null; needsUpdate?: boolean }> = []

    if (supabaseAdmin && images) {
      // Check in Supabase Storage
      const folders = ['photos/GraduationPhotos', 'photos/graduation', 'photos/Graduation', 'photos']
      
      for (const image of images) {
        let foundUrl = null
        let foundPath = null
        
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
              // Try to match by filename - Tejas images
              const matchedFile = files.find(file => {
                const dbFilename = image.filename.toLowerCase()
                const storageFilename = file.name.toLowerCase()
                
                // Look for tejas in the filename
                if (storageFilename.includes('tejas') && dbFilename.includes('tejas')) {
                  // Match by number (1, 2, 3)
                  const dbNum = dbFilename.match(/tejas(\d)/)?.[1]
                  const storageNum = storageFilename.match(/tejas(\d)/)?.[1]
                  if (dbNum && storageNum && dbNum === storageNum) return true
                  
                  // Or exact match
                  if (storageFilename === dbFilename) return true
                }
                
                return false
              })
              
              if (matchedFile) {
                const filePath = folder ? `${folder}/${matchedFile.name}` : matchedFile.name
                const { data: urlData } = supabaseAdmin.storage
                  .from('images')
                  .getPublicUrl(filePath)
                
                foundUrl = urlData.publicUrl
                foundPath = filePath
                break
              }
            }
          } catch (err) {
            continue
          }
        }
        
        imagesWithUrls.push({
          id: image.id,
          filename: image.filename,
          alt_text: image.alt_text,
          currentUrl: image.cloudinary_url,
          suggestedUrl: foundUrl,
          suggestedPath: foundPath,
          needsUpdate: !!(foundUrl && foundUrl !== image.cloudinary_url)
        })
      }
    }

    return NextResponse.json({
      tejasImages: imagesWithUrls,
      count: imagesWithUrls.length,
      foundUrls: imagesWithUrls.filter(img => img.suggestedUrl).length
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}

// POST /api/fix-tejas-urls - Update Tejas image URLs
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { imageId, newUrl } = body

    if (!imageId || !newUrl) {
      return NextResponse.json(
        { error: 'imageId and newUrl are required' },
        { status: 400 }
      )
    }

    // Update the cloudinary_url
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





