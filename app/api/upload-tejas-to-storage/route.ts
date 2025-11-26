import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { supabase } from '@/lib/supabase'
import { readFile } from 'fs/promises'
import { join } from 'path'

// POST /api/upload-tejas-to-storage - Upload Tejas images from public folder to Supabase Storage
export async function POST() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin client not configured' }, { status: 500 })
    }

    const tejasFiles = [
      'GradPics-Tejas1.jpg',
      'GradPics-Tejas2.jpg',
      'GradPics-Tejas3.jpg'
    ]

    const results = []

    for (const filename of tejasFiles) {
      try {
        // Read the file from public folder
        const filePath = join(process.cwd(), 'public', 'photos', 'GraduationPhotos', filename)
        const fileBuffer = await readFile(filePath)

        // Upload to Supabase Storage
        const storagePath = `photos/GraduationPhotos/${filename}`
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('images')
          .upload(storagePath, fileBuffer, {
            contentType: 'image/jpeg',
            upsert: true // Overwrite if exists
          })

        if (uploadError) {
          results.push({ filename, success: false, error: uploadError.message })
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
          .eq('filename', filename)
          .select()
          .single()

        if (dbError) {
          results.push({ 
            filename, 
            success: false, 
            error: `Uploaded but DB update failed: ${dbError.message}`,
            storageUrl: urlData.publicUrl
          })
        } else {
          results.push({ 
            filename, 
            success: true, 
            storageUrl: urlData.publicUrl,
            imageId: imageData.id
          })
        }
      } catch (error) {
        results.push({ 
          filename, 
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
        successful,
        failed,
        total: results.length
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}





