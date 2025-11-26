import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { supabase } from '@/lib/supabase'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Helper function to determine storage path from local path
function getStoragePath(localPath: string, category: string, filename: string): string {
  // Remove leading slash if present
  const cleanPath = localPath.startsWith('/') ? localPath.slice(1) : localPath
  
  // If the path already has a photos/ structure, use it
  if (cleanPath.startsWith('photos/')) {
    return cleanPath
  }
  
  // Otherwise, map by category
  const categoryMap: Record<string, string> = {
    'Graduation Photos': 'photos/GraduationPhotos',
    'GraduationPhotos': 'photos/GraduationPhotos',
    'Animals': 'photos/Animals',
    'Prints': 'photos/prints',
    'Portraits': 'photos/Portraits',
    'Artistic': 'photos/Artistic',
    'Headshots': 'photos/Headshots',
    'aboutMe': 'photos/aboutMe',
  }
  
  const folder = categoryMap[category] || 'photos'
  return `${folder}/${filename}`
}

// GET /api/migrate-all-images-to-storage - Preview what will be migrated (dry run)
export async function GET() {
  try {
    // Get all images with local paths
    const { data: images, error: fetchError } = await supabase
      .from('images')
      .select('*')

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // Filter images with local paths
    const localPathImages = (images || []).filter(img => {
      const url = img.cloudinary_url
      return url && !url.startsWith('http://') && !url.startsWith('https://')
    })

    const preview = []

    for (const image of localPathImages) {
      const localPath = image.cloudinary_url
      const cleanPath = localPath.startsWith('/') ? localPath.slice(1) : localPath
      const filePath = join(process.cwd(), 'public', cleanPath)
      const storagePath = getStoragePath(localPath, image.category, image.filename)
      
      preview.push({
        id: image.id,
        filename: image.filename,
        category: image.category,
        currentLocalPath: localPath,
        storagePath,
        fileExists: existsSync(filePath),
        filePath,
      })
    }

    return NextResponse.json({
      preview: true,
      totalLocalPathImages: localPathImages.length,
      totalImages: images?.length || 0,
      images: preview,
      summary: {
        filesExist: preview.filter(p => p.fileExists).length,
        filesMissing: preview.filter(p => !p.fileExists).length,
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}

// POST /api/migrate-all-images-to-storage - Upload all local path images to Supabase Storage
export async function POST() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin client not configured' }, { status: 500 })
    }

    // Get all images with local paths
    const { data: images, error: fetchError } = await supabase
      .from('images')
      .select('*')

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // Filter images with local paths
    const localPathImages = (images || []).filter(img => {
      const url = img.cloudinary_url
      return url && !url.startsWith('http://') && !url.startsWith('https://')
    })

    const results = []

    for (const image of localPathImages) {
      try {
        const localPath = image.cloudinary_url
        // Remove leading slash if present
        const cleanPath = localPath.startsWith('/') ? localPath.slice(1) : localPath
        
        // Build file path
        const filePath = join(process.cwd(), 'public', cleanPath)
        
        // Check if file exists
        if (!existsSync(filePath)) {
          results.push({ 
            id: image.id, 
            filename: image.filename, 
            success: false, 
            error: 'File not found in public folder',
            path: filePath
          })
          continue
        }

        // Read the file
        const fileBuffer = await readFile(filePath)
        
        // Determine storage path using helper function
        const storagePath = getStoragePath(localPath, image.category, image.filename)

        // Determine content type
        const ext = image.filename.split('.').pop()?.toLowerCase()
        const contentType = ext === 'png' ? 'image/png' : 
                           ext === 'gif' ? 'image/gif' : 
                           ext === 'webp' ? 'image/webp' : 'image/jpeg'

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('images')
          .upload(storagePath, fileBuffer, {
            contentType,
            upsert: true // Overwrite if exists
          })

        if (uploadError) {
          results.push({ 
            id: image.id, 
            filename: image.filename, 
            success: false, 
            error: uploadError.message 
          })
          continue
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
          .from('images')
          .getPublicUrl(storagePath)

        // Update database record
        const { data: imageData, error: dbError } = await supabase
          .from('images')
          .update({ cloudinary_url: urlData.publicUrl })
          .eq('id', image.id)
          .select()
          .single()

        if (dbError) {
          results.push({ 
            id: image.id, 
            filename: image.filename, 
            success: false, 
            error: `Uploaded but DB update failed: ${dbError.message}`,
            storageUrl: urlData.publicUrl
          })
        } else {
          results.push({ 
            id: image.id, 
            filename: image.filename, 
            success: true, 
            storageUrl: urlData.publicUrl
          })
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

