import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const imageUrl = searchParams.get('src')
    const maxWidth = parseInt(searchParams.get('w') || '1600')

    if (!imageUrl) {
      return NextResponse.json({ error: 'Missing src parameter' }, { status: 400 })
    }

    // Security: Only allow Supabase URLs
    const allowedDomains = ['supabase.co', 'supabase.in', 'storage.googleapis.com']
    try {
      const url = new URL(imageUrl)
      if (!allowedDomains.some(domain => url.hostname.includes(domain))) {
        return NextResponse.json({ error: 'Invalid image source' }, { status: 400 })
      }
    } catch {
      // If URL parsing fails, it might be a relative path or invalid URL
      console.error('Invalid URL format:', imageUrl)
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Fetch the original image
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 })
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata()
    const { width, height } = metadata

    if (!width || !height) {
      return NextResponse.json({ error: 'Invalid image' }, { status: 500 })
    }

    // Calculate resize dimensions (maintain aspect ratio)
    let targetWidth = width
    let targetHeight = height
    if (width > maxWidth) {
      targetWidth = maxWidth
      targetHeight = Math.round((height * maxWidth) / width)
    }

    // Create watermark text
    const watermarkText = 'Sneha Arun'
    const watermarkFontSize = Math.max(28, Math.round(targetWidth * 0.022)) // 2.2% of image width, min 28px
    const padding = Math.round(targetWidth * 0.025) // 2.5% padding from edges
    const letterSpacing = watermarkFontSize * 0.08 // Elegant letter spacing

    // Create artistic watermark SVG with simpler, more reliable styling
    const watermarkSvg = `
      <svg width="${targetWidth}" height="${targetHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="wmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.95)" stop-opacity="1" />
            <stop offset="100%" stop-color="rgba(255,255,255,0.85)" stop-opacity="1" />
          </linearGradient>
          <filter id="wmShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="1" dy="1" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.6"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <!-- Subtle background for readability -->
        <rect
          x="${targetWidth - padding - watermarkFontSize * 4.5}"
          y="${targetHeight - padding - watermarkFontSize * 1.5}"
          width="${watermarkFontSize * 4.5}"
          height="${watermarkFontSize * 1.8}"
          rx="${watermarkFontSize * 0.3}"
          fill="rgba(0,0,0,0.25)"
          opacity="0.5"
        />
        <!-- Main watermark text -->
        <text
          x="${targetWidth - padding}"
          y="${targetHeight - padding}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${watermarkFontSize}"
          font-weight="600"
          letter-spacing="${letterSpacing}px"
          fill="url(#wmGrad)"
          text-anchor="end"
          dominant-baseline="bottom"
          filter="url(#wmShadow)"
          opacity="0.9"
        >${watermarkText}</text>
      </svg>
    `

    // Process image: resize, then overlay watermark
    const processedImage = await sharp(imageBuffer)
      .resize(targetWidth, targetHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .composite([
        {
          input: Buffer.from(watermarkSvg),
          top: 0,
          left: 0,
        },
      ])
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer()

    // Return the processed image with caching headers
    return new NextResponse(processedImage as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Watermark error:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    )
  }
}

