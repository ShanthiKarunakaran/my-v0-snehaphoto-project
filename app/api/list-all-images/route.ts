import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { supabase } from '@/lib/supabase'

// GET /api/list-all-images - List all images with their details
export async function GET() {
  try {
    const client = supabaseAdmin || supabase
    
    const { data: images, error } = await client
      .from('images')
      .select('id, filename, alt_text, category')
      .order('id', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group by category
    const byCategory: Record<string, Array<{ id: number; filename: string; alt_text: string }>> = {}
    images?.forEach(img => {
      const cat = img.category || 'Uncategorized'
      if (!byCategory[cat]) {
        byCategory[cat] = []
      }
      byCategory[cat].push({
        id: img.id,
        filename: img.filename,
        alt_text: img.alt_text
      })
    })

    return NextResponse.json({
      total: images?.length || 0,
      byCategory,
      allImages: images?.map(img => ({
        id: img.id,
        filename: img.filename,
        alt_text: img.alt_text,
        category: img.category
      })) || []
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}

