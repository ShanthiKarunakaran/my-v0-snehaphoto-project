import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-server'

// PUT /api/donations/[id] - Update a donation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid donation ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      donor_name,
      amount,
      payment_method,
      note,
      transaction_date,
      is_donation,
      order_description,
      photoshoot_type,
    } = body

    // Validate amount if provided
    if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    const client = supabaseAdmin || supabase

    if (!supabaseAdmin) {
      console.warn('Using regular supabase client - RLS policies may block updates.')
    }

    // Build update object (only include provided fields)
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (donor_name !== undefined) updateData.donor_name = donor_name
    if (amount !== undefined) updateData.amount = amount
    if (payment_method !== undefined) updateData.payment_method = payment_method || null
    if (note !== undefined) updateData.note = note || null
    if (transaction_date !== undefined) updateData.transaction_date = transaction_date || null
    if (is_donation !== undefined) updateData.is_donation = is_donation
    if (order_description !== undefined) updateData.order_description = order_description || null
    if (photoshoot_type !== undefined) updateData.photoshoot_type = photoshoot_type || null

    const { data, error } = await client
      .from('donations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database update error:', error)
      return NextResponse.json(
        {
          error: error.message,
          details: error,
          code: error.code,
        },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, donation: data })
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

// DELETE /api/donations/[id] - Delete a donation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid donation ID' },
        { status: 400 }
      )
    }

    const client = supabaseAdmin || supabase

    if (!supabaseAdmin) {
      console.warn('Using regular supabase client - RLS policies may block deletes.')
    }

    const { error } = await client
      .from('donations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database delete error:', error)
      return NextResponse.json(
        {
          error: error.message,
          details: error,
          code: error.code,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
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

