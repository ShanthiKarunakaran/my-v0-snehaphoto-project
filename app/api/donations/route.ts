import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-server'

// GET /api/donations - Fetch all donations (for admin) or filtered donations
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const includeMessages = searchParams.get('messages') === 'true' // For public display
  const totalOnly = searchParams.get('total') === 'true' // Just get total amount

  try {
    const client = supabaseAdmin || supabase

    // If only total is requested
    if (totalOnly) {
      const { data, error } = await client
        .from('donations')
        .select('amount')
        .eq('is_donation', true)

      if (error) {
        console.error('Error fetching donation total:', error)
        return NextResponse.json(
          { error: error.message, total: 0 },
          { status: 500 }
        )
      }

      const total = data?.reduce((sum, donation) => sum + (donation.amount || 0), 0) || 0
      return NextResponse.json({ total: Math.round(total * 100) / 100 })
    }

    // If messages are requested (for public display)
    if (includeMessages) {
      const { data, error } = await client
        .from('donations')
        .select('*')
        .eq('is_donation', true)
        .not('note', 'is', null)
        .neq('note', '')
        .order('transaction_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching donations with messages:', error)
        return NextResponse.json(
          { error: error.message, donations: [] },
          { status: 500 }
        )
      }

      return NextResponse.json({ donations: data || [] })
    }

    // Otherwise, fetch all donations (for admin)
    const { data, error } = await client
      .from('donations')
      .select('*')
      .order('transaction_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching donations:', error)
      return NextResponse.json(
        { error: error.message, donations: [] },
        { status: 500 }
      )
    }

    return NextResponse.json({ donations: data || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

// POST /api/donations - Add a new donation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      donor_name,
      amount,
      payment_method,
      note,
      transaction_date,
      is_donation = true,
      order_description,
      photoshoot_type,
    } = body

    // Validate required fields
    if (!donor_name || amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'Missing required fields: donor_name and amount are required' },
        { status: 400 }
      )
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    const client = supabaseAdmin || supabase

    if (!supabaseAdmin) {
      console.warn('Using regular supabase client - RLS policies may block inserts.')
    }

    // Insert the donation
    const { data, error } = await client
      .from('donations')
      .insert([
        {
          donor_name,
          amount,
          payment_method: payment_method || null,
          note: note || null,
          transaction_date: transaction_date || null,
          is_donation: is_donation !== false, // Default to true
          order_description: order_description || null,
          photoshoot_type: photoshoot_type || null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error)
      return NextResponse.json(
        {
          error: error.message,
          details: error,
          code: error.code,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, donation: data }, { status: 201 })
  } catch (error) {
    console.error('API catch error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

