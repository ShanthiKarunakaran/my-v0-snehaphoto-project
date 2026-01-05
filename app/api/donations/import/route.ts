import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-server'

// POST /api/donations/import - Import donations from CSV
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Read file content
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file must have at least a header row and one data row' },
        { status: 400 }
      )
    }

    // Parse CSV (simple parser - handles quoted fields)
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = []
      let current = ''
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        const nextChar = line[i + 1]

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            current += '"'
            i++ // Skip next quote
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }

    // Parse header row
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim())
    
    // Find column indices (case-insensitive, flexible matching)
    const findColumn = (possibleNames: string[]): number => {
      for (const name of possibleNames) {
        const index = headers.findIndex(h => 
          h.includes(name.toLowerCase()) || name.toLowerCase().includes(h)
        )
        if (index !== -1) return index
      }
      return -1
    }

    const donorNameIndex = findColumn(['who ordered', 'donor', 'donor_name', 'name'])
    const amountIndex = findColumn(['amount', 'amount collected', 'amount_collected'])
    const paymentMethodIndex = findColumn(['mode of payment', 'payment_method', 'payment method', 'payment'])
    const noteIndex = findColumn(['note', 'message', 'notes'])
    const transactionDateIndex = findColumn(['transaction date', 'transaction_date', 'date', 'transaction'])
    const isDonationIndex = findColumn(['donated', 'donated?', 'is_donation', 'is donation'])
    const orderDescriptionIndex = findColumn(['what was ordered', 'what_was_ordered', 'order', 'order_description', 'order description'])
    const photoshootTypeIndex = findColumn(['photoshoot type', 'photoshoot_type', 'photoshoot'])

    if (donorNameIndex === -1 || amountIndex === -1) {
      return NextResponse.json(
        { 
          error: 'CSV must have "Donor Name" (or "Who ordered") and "Amount" (or "Amount collected") columns',
          headers: headers
        },
        { status: 400 }
      )
    }

    // Parse data rows
    const donations: any[] = []
    const errors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i])
      
      // Skip empty rows
      if (row.every(cell => !cell.trim())) continue

      const donorName = row[donorNameIndex]?.trim()
      const amountStr = row[amountIndex]?.trim().replace(/[^0-9.]/g, '') // Remove $ and other chars

      // Validate required fields
      if (!donorName) {
        errors.push(`Row ${i + 1}: Missing donor name`)
        continue
      }

      const amount = parseFloat(amountStr)
      if (isNaN(amount) || amount <= 0) {
        errors.push(`Row ${i + 1}: Invalid amount "${row[amountIndex]}"`)
        continue
      }

      // Parse is_donation (handle "yes", "Yes", "YES", "true", etc.)
      let isDonation = true
      if (isDonationIndex !== -1 && row[isDonationIndex]) {
        const donatedValue = row[isDonationIndex].toLowerCase().trim()
        isDonation = donatedValue === 'yes' || donatedValue === 'true' || donatedValue === '1' || donatedValue === ''
      }

      // Parse transaction date (handle various formats)
      let transactionDate: string | null = null
      if (transactionDateIndex !== -1 && row[transactionDateIndex]) {
        const dateStr = row[transactionDateIndex].trim()
        if (dateStr) {
          try {
            const date = new Date(dateStr)
            if (!isNaN(date.getTime())) {
              transactionDate = date.toISOString().split('T')[0] // YYYY-MM-DD format
            }
          } catch (e) {
            // If date parsing fails, skip it
          }
        }
      }

      donations.push({
        donor_name: donorName,
        amount: amount,
        payment_method: paymentMethodIndex !== -1 ? row[paymentMethodIndex]?.trim() || null : null,
        note: noteIndex !== -1 ? row[noteIndex]?.trim() || null : null,
        transaction_date: transactionDate,
        is_donation: isDonation,
        order_description: orderDescriptionIndex !== -1 ? row[orderDescriptionIndex]?.trim() || null : null,
        photoshoot_type: photoshootTypeIndex !== -1 ? row[photoshootTypeIndex]?.trim() || null : null,
      })
    }

    if (donations.length === 0) {
      return NextResponse.json(
        { error: 'No valid donations found in CSV file', errors },
        { status: 400 }
      )
    }

    // Insert donations into database
    const client = supabaseAdmin || supabase

    if (!supabaseAdmin) {
      console.warn('Using regular supabase client - RLS policies may block inserts.')
    }

    const { data, error } = await client
      .from('donations')
      .insert(donations)
      .select()

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

    return NextResponse.json({
      success: true,
      imported: data?.length || 0,
      total: donations.length,
      errors: errors.length > 0 ? errors : undefined,
    })
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

