import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// Upload file to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase Storage not configured. Please add SUPABASE_SERVICE_ROLE_KEY to .env.local' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'photos'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Generate unique filename with timestamp to avoid conflicts
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    // Get image dimensions
    let width = null
    let height = null
    try {
      const sharp = await import('sharp')
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const metadata = await sharp.default(buffer).metadata()
      width = metadata.width || null
      height = metadata.height || null
      
      // Upload to Supabase Storage
      const { data, error } = await supabaseAdmin.storage
        .from('images') // Bucket name - you'll need to create this in Supabase
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false, // Don't overwrite existing files
        })

      if (error) {
        console.error('Storage upload error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('images')
        .getPublicUrl(filePath)

      return NextResponse.json({
        success: true,
        path: filePath,
        url: urlData.publicUrl,
        filename: fileName,
        width,
        height,
        file_size: file.size,
      }, { status: 200 })
    } catch (error) {
      // If sharp fails, upload anyway without dimensions
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      const { data, error: uploadError } = await supabaseAdmin.storage
        .from('images')
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        return NextResponse.json({ error: uploadError.message }, { status: 500 })
      }

      const { data: urlData } = supabaseAdmin.storage
        .from('images')
        .getPublicUrl(filePath)

      return NextResponse.json({
        success: true,
        path: filePath,
        url: urlData.publicUrl,
        filename: fileName,
        width: null,
        height: null,
        file_size: file.size,
      }, { status: 200 })
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

