import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-server'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// POST /api/add-local-images - Discover local images and add them to database
export async function POST() {
  try {
    const photosDir = join(process.cwd(), 'public', 'photos')
    
    if (!existsSync(photosDir)) {
      return NextResponse.json({ error: 'Photos directory not found' }, { status: 404 })
    }

    const results = []
    const categories = ['Portraits', 'GraduationPhotos', 'Animals', 'Headshots', 'prints', 'aboutMe']

    // Scan all category folders
    for (const category of categories) {
      const categoryDir = join(photosDir, category)
      
      if (!existsSync(categoryDir)) {
        continue
      }

      try {
        const files = await readdir(categoryDir)
        
        for (const file of files) {
          // Only process image files
          if (!/\.(jpg|jpeg|png|gif|webp|JPG|JPEG|PNG)$/i.test(file)) {
            continue
          }

          const filePath = join(categoryDir, file)
          const stats = await stat(filePath)
          
          // Skip if not a file
          if (!stats.isFile()) {
            continue
          }

          // Build the public URL path
          const publicPath = `/photos/${category}/${file}`
          
          // Normalize category name for database
          let dbCategory = category
          if (category === 'GraduationPhotos') {
            dbCategory = 'Graduation Photos'
          } else if (category === 'prints') {
            dbCategory = 'Prints'
          } else if (category === 'aboutMe') {
            dbCategory = 'About Me'
          }

          // Check if image already exists in database
          const { data: existing } = await supabase
            .from('images')
            .select('id')
            .eq('cloudinary_url', publicPath)
            .limit(1)
            .single()

          if (existing) {
            results.push({
              filename: file,
              category: dbCategory,
              path: publicPath,
              success: false,
              skipped: true,
              reason: 'Already exists in database'
            })
            continue
          }

          // Generate alt text from filename
          const altText = file
            .replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())

          // Insert into database using admin client to bypass RLS
          const client = supabaseAdmin || supabase
          const { data, error } = await client
            .from('images')
            .insert([
              {
                filename: file,
                alt_text: altText,
                category: dbCategory,
                cloudinary_url: publicPath,
                width: 0,
                height: 0,
                file_size: stats.size
              }
            ])
            .select()
            .single()

          if (error) {
            results.push({
              filename: file,
              category: dbCategory,
              path: publicPath,
              success: false,
              error: error.message
            })
          } else {
            results.push({
              filename: file,
              category: dbCategory,
              path: publicPath,
              success: true,
              id: data.id
            })
          }
        }
      } catch (err) {
        results.push({
          category,
          success: false,
          error: err instanceof Error ? err.message : String(err)
        })
      }
    }

    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success && !r.skipped).length
    const skipped = results.filter(r => r.skipped).length

    return NextResponse.json({
      success: successful > 0,
      summary: {
        total: results.length,
        successful,
        failed,
        skipped
      },
      results
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

// GET /api/add-local-images - Preview what will be added
export async function GET() {
  try {
    const photosDir = join(process.cwd(), 'public', 'photos')
    
    if (!existsSync(photosDir)) {
      return NextResponse.json({ error: 'Photos directory not found' }, { status: 404 })
    }

    const preview = []
    const categories = ['Portraits', 'GraduationPhotos', 'Animals', 'Headshots', 'prints', 'aboutMe']

    for (const category of categories) {
      const categoryDir = join(photosDir, category)
      
      if (!existsSync(categoryDir)) {
        continue
      }

      try {
        const files = await readdir(categoryDir)
        const imageFiles = files.filter(file => 
          /\.(jpg|jpeg|png|gif|webp|JPG|JPEG|PNG)$/i.test(file)
        )

        for (const file of imageFiles) {
          const publicPath = `/photos/${category}/${file}`
          
          // Check if already in database
          const { data: existing } = await supabase
            .from('images')
            .select('id')
            .eq('cloudinary_url', publicPath)
            .limit(1)
            .single()

          let dbCategory = category
          if (category === 'GraduationPhotos') {
            dbCategory = 'Graduation Photos'
          } else if (category === 'prints') {
            dbCategory = 'Prints'
          } else if (category === 'aboutMe') {
            dbCategory = 'About Me'
          }

          preview.push({
            filename: file,
            category: dbCategory,
            path: publicPath,
            alreadyExists: !!existing
          })
        }
      } catch (err) {
        // Skip category on error
        continue
      }
    }

    const alreadyExists = preview.filter(p => p.alreadyExists).length
    const newImages = preview.filter(p => !p.alreadyExists).length

    return NextResponse.json({
      preview: true,
      total: preview.length,
      newImages,
      alreadyExists,
      images: preview
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

