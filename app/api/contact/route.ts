import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// In-memory rate limiting store (in production, use Redis or database)
// IP capture removed - not needed for simple contact form validation
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

// Spam keywords to detect
const SPAM_KEYWORDS = [
  'viagra', 'cialis', 'casino', 'poker', 'lottery', 'winner', 'prize',
  'click here', 'buy now', 'limited time', 'act now', 'urgent',
  'make money', 'work from home', 'get rich', 'free money',
  'nigerian prince', 'inheritance', 'lottery winner',
  'bitcoin', 'crypto', 'investment opportunity', 'guaranteed',
  'seo services', 'backlinks', 'website traffic', 'increase sales',
  'weight loss', 'miracle', 'guaranteed results', 'no risk'
]

function isSpamContent(text: string): boolean {
  const lowerText = text.toLowerCase()
  return SPAM_KEYWORDS.some(keyword => lowerText.includes(keyword))
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return false
  
  // Additional checks
  if (email.length > 254) return false // RFC 5321 limit
  if (email.split('@')[0].length > 64) return false // Local part limit
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /^[a-z0-9]+@[a-z0-9]+\.(tk|ml|ga|cf|gq)$/i, // Free disposable email domains
    /\d{10,}/, // Too many consecutive numbers
    /(.)\1{5,}/, // Repeated characters
    /^[a-z]@[a-z]\./i, // Single character emails like "s@s.com"
    /^.{1,3}@.{1,3}\./i, // Very short emails
  ]
  
  return !suspiciousPatterns.some(pattern => pattern.test(email))
}

function looksLikeEmail(text: string): boolean {
  // Check if name field looks like an email address
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim())
}

function isGibberish(text: string): boolean {
  // Check for random character patterns, keyboard mashing, etc.
  const trimmed = text.trim()
  
  // Too many special characters in a row
  if (/[^\w\s]{5,}/.test(trimmed)) return true
  
  // Repeated patterns like "asdfasdf" or "f;'sld;'fl"
  if (/(.{2,})\1{2,}/.test(trimmed)) return true
  
  // Too many random special characters relative to text
  const specialCharCount = (trimmed.match(/[^\w\s]/g) || []).length
  const wordCharCount = (trimmed.match(/[\w]/g) || []).length
  if (wordCharCount > 0 && specialCharCount / wordCharCount > 0.5) return true
  
  // Random keyboard patterns (like "qwerty", "asdf", etc.)
  const keyboardPatterns = [
    /qwerty/i,
    /asdf/i,
    /zxcv/i,
    /hjkl/i,
    /[qwertyuiop]{5,}/i,
    /[asdfghjkl]{5,}/i,
    /[zxcvbnm]{5,}/i,
  ]
  if (keyboardPatterns.some(pattern => pattern.test(trimmed))) return true
  
  // Check for too many repeated characters
  if (/(.)\1{4,}/.test(trimmed)) return true
  
  return false
}

function hasMinimumWords(text: string, minWords: number = 2): boolean {
  // Check if message has minimum meaningful words
  const words = text.trim().split(/\s+/).filter(word => word.length > 2)
  return words.length >= minWords
}

// IP capture logic commented out - not needed for simple contact form
// function getClientIP(request: NextRequest): string {
//   // Get IP from headers (NextRequest doesn't have .ip property)
//   const forwarded = request.headers.get('x-forwarded-for')
//   if (forwarded) {
//     // x-forwarded-for can contain multiple IPs, first one is the original client
//     return forwarded.split(',')[0].trim()
//   }
//   
//   const realIP = request.headers.get('x-real-ip')
//   if (realIP) {
//     return realIP
//   }
//   
//   // Cloudflare/Vercel header
//   const cfIP = request.headers.get('cf-connecting-ip')
//   if (cfIP) {
//     return cfIP
//   }
//   
//   // Fallback if no IP headers are present
//   return 'unknown'
// }

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 500 }
      )
    }

    if (!process.env.CONTACT_EMAIL) {
      console.error('CONTACT_EMAIL not configured')
      return NextResponse.json(
        { success: false, error: 'Contact email not configured' },
        { status: 500 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { name, email, message, interestedInPhotoshoot, photoshootTypes, donationAmount, website, timestamp } = body

    // Honeypot check - if this field is filled, it's a bot
    if (website) {
      console.warn('Spam detected: honeypot field filled', { email })
      return NextResponse.json(
        { success: false, error: 'Invalid submission detected' },
        { status: 400 }
      )
    }

    // Validate required fields (donationAmount is optional)
    if (!name || !email || !message || !interestedInPhotoshoot) {
      return NextResponse.json(
        { success: false, error: 'All fields except donation amount are required' },
        { status: 400 }
      )
    }

    // Trim and validate inputs
    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedMessage = message.trim()

    // Validate interestedInPhotoshoot
    if (interestedInPhotoshoot !== 'yes' && interestedInPhotoshoot !== 'no') {
      return NextResponse.json(
        { success: false, error: 'Please indicate if you\'re interested in a photoshoot' },
        { status: 400 }
      )
    }

    // If Yes, validate that at least one photoshoot type is selected
    if (interestedInPhotoshoot === 'yes' && (!photoshootTypes || photoshootTypes.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Please select at least one type of photoshoot you\'re interested in' },
        { status: 400 }
      )
    }

    // Name validation
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Name must be between 2 and 100 characters' },
        { status: 400 }
      )
    }

    // Check if name looks like an email (common spam pattern)
    if (looksLikeEmail(trimmedName)) {
      console.warn('Spam detected: name field contains email', { name: trimmedName, email: trimmedEmail })
      return NextResponse.json(
        { success: false, error: 'Please provide a valid name' },
        { status: 400 }
      )
    }

    // Email validation
    if (!isValidEmail(trimmedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Message validation
    if (trimmedMessage.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Message must be at least 10 characters long' },
        { status: 400 }
      )
    }

    if (trimmedMessage.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Message is too long (maximum 5000 characters)' },
        { status: 400 }
      )
    }

    // Validate donation amount (required if yes, optional if no)
    if (donationAmount && donationAmount.trim()) {
      const cleanedDonation = donationAmount.trim().replace(/[$,\s]/g, '')
      const donationNumber = parseFloat(cleanedDonation)
      
      if (isNaN(donationNumber)) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid donation amount (e.g., $35 or 35)' },
          { status: 400 }
        )
      }

      if (donationNumber <= 0) {
        return NextResponse.json(
          { success: false, error: 'Donation amount must be greater than $0' },
          { status: 400 }
        )
      }

      if (donationNumber > 10000) {
        return NextResponse.json(
          { success: false, error: 'Donation amount seems unusually high. Please contact directly for large donations.' },
          { status: 400 }
        )
      }

      if (donationNumber < 1) {
        return NextResponse.json(
          { success: false, error: 'Donation amount must be at least $1' },
          { status: 400 }
        )
      }
    }

    // Check for gibberish/random characters in message
    if (isGibberish(trimmedMessage)) {
      console.warn('Spam detected: gibberish message', { email: trimmedEmail, message: trimmedMessage.substring(0, 50) })
      return NextResponse.json(
        { success: false, error: 'Please provide a meaningful message' },
        { status: 400 }
      )
    }

    // Check for minimum meaningful words in message
    if (!hasMinimumWords(trimmedMessage, 2)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a more detailed message with at least 2 words' },
        { status: 400 }
      )
    }

    // Spam content detection
    const fullText = `${trimmedName} ${trimmedEmail} ${trimmedMessage}`.toLowerCase()
    if (isSpamContent(fullText)) {
      console.warn('Spam detected: suspicious keywords found', { email: trimmedEmail })
      // Don't reveal we detected spam, just fail silently
      return NextResponse.json(
        { success: false, error: 'Unable to send message. Please try again later.' },
        { status: 400 }
      )
    }

    // IP-based rate limiting commented out - not needed for simple contact form
    // Rate limiting by IP
    // const clientIP = getClientIP(request)
    // const rateLimitKey = `contact:${clientIP}`
    // const now = Date.now()
    // const rateLimit = rateLimitStore.get(rateLimitKey)

    // if (rateLimit) {
    //   if (now < rateLimit.resetTime) {
    //     if (rateLimit.count >= 3) {
    //       console.warn('Rate limit exceeded', { ip: clientIP, count: rateLimit.count })
    //       return NextResponse.json(
    //         { success: false, error: 'Too many requests. Please try again later.' },
    //         { status: 429 }
    //       )
    //     }
    //     rateLimit.count += 1
    //   } else {
    //     // Reset expired rate limit
    //     rateLimitStore.set(rateLimitKey, { count: 1, resetTime: now + 3600000 }) // 1 hour
    //   }
    // } else {
    //   rateLimitStore.set(rateLimitKey, { count: 1, resetTime: now + 3600000 })
    // }
    
    const now = Date.now()

    // Rate limiting by email
    const emailRateLimitKey = `contact:email:${trimmedEmail}`
    const emailRateLimit = rateLimitStore.get(emailRateLimitKey)

    if (emailRateLimit) {
      if (now < emailRateLimit.resetTime) {
        if (emailRateLimit.count >= 2) {
          console.warn('Email rate limit exceeded', { email: trimmedEmail, count: emailRateLimit.count })
          return NextResponse.json(
            { success: false, error: 'Too many requests from this email. Please try again later.' },
            { status: 429 }
          )
        }
        emailRateLimit.count += 1
      } else {
        rateLimitStore.set(emailRateLimitKey, { count: 1, resetTime: now + 3600000 })
      }
    } else {
      rateLimitStore.set(emailRateLimitKey, { count: 1, resetTime: now + 3600000 })
    }

    // Time-based validation - check if form was filled too quickly
    if (timestamp) {
      const timeSpent = (now - timestamp) / 1000
      if (timeSpent < 3) {
        console.warn('Spam detected: form filled too quickly', { timeSpent, email: trimmedEmail })
        return NextResponse.json(
          { success: false, error: 'Please take your time filling out the form.' },
          { status: 400 }
        )
      }
    }

    // All checks passed - send email
    const resend = new Resend(process.env.RESEND_API_KEY)

      const photoshootInfo = interestedInPhotoshoot === 'yes' 
        ? `Interested in photoshoot: Yes\nPhotoshoot types: ${photoshootTypes.join(', ')}`
        : `Interested in photoshoot: No`

      // Format donation amount with $ sign
      const formattedDonation = donationAmount 
        ? (donationAmount.startsWith('$') ? donationAmount : `$${donationAmount}`)
        : 'Not specified'

      const composedMessage = [
        photoshootInfo,
        `Donation amount: ${formattedDonation}`,
        '',
        trimmedMessage,
      ].join('\n')

    const { data, error } = await resend.emails.send({
      from: "Sneha's Photography <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL,
      replyTo: trimmedEmail,
      subject: `New Contact Form Submission from ${escapeHtml(trimmedName)}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(trimmedName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(trimmedEmail)}</p>
        <p><strong>Interested in photoshoot:</strong> ${interestedInPhotoshoot === 'yes' ? 'Yes' : 'No'}</p>
        ${interestedInPhotoshoot === 'yes' ? `<p><strong>Photoshoot types:</strong> ${escapeHtml(photoshootTypes.join(', '))}</p>` : ''}
        <p><strong>Donation amount:</strong> ${escapeHtml(donationAmount ? (donationAmount.startsWith('$') ? donationAmount : `$${donationAmount}`) : 'Not specified')}</p>
        <p><strong>Time Spent:</strong> ${timestamp ? Math.round((now - timestamp) / 1000) : 'N/A'} seconds</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(trimmedMessage).replace(/\n/g, '<br>')}</p>
      `,
    })

    if (error) {
      console.error('Error sending email:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to send message. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error in contact API:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

