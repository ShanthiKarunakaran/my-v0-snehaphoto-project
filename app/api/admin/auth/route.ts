import { NextRequest, NextResponse } from 'next/server'

// Simple password check - in production, use proper authentication
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    // Get password from environment variable
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123' // Default for development

    if (!password || password !== adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Return success - in production, you'd set a secure session cookie here
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

