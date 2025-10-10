"use server"

import { Resend } from "resend"

export async function sendContactEmail(formData: { name: string; email: string; message: string }) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return {
        success: false,
        error: "Email service not configured. Please add RESEND_API_KEY to environment variables.",
      }
    }

    if (!process.env.CONTACT_EMAIL) {
      return {
        success: false,
        error: "Contact email not configured. Please add CONTACT_EMAIL to environment variables.",
      }
    }

    // Validate input
    if (!formData.name || !formData.email || !formData.message) {
      return { success: false, error: "All fields are required" }
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "Sneha's Photography <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL,
      replyTo: formData.email,
      subject: `New Contact Form Submission from ${formData.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Message:</strong></p>
        <p>${formData.message.replace(/\n/g, "<br>")}</p>
      `,
    })

    if (error) {
      console.error("Error sending email:", error)
      return { success: false, error: "Failed to send message. Please try again." }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in sendContactEmail:", error)
    return { success: false, error: "An unexpected error occurred. Please try again." }
  }
}
