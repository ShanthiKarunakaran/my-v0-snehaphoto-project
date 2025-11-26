"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Instagram, Camera, CheckCircle2, AlertCircle, Sparkles } from "lucide-react"
import { sendContactEmail } from "@/app/actions/contact"
import { cn } from "@/lib/utils"

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    printDetails: "",
    donationAmount: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })
  const [highlightForm, setHighlightForm] = useState(false)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasAppliedPrefillRef = useRef(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: "" })

    try {
      const composedMessage = [
        `Print details: ${formData.printDetails || "Not specified"}`,
        `Donation amount: ${formData.donationAmount || "Not specified"}`,
        "",
        formData.message,
      ].join("\n")

      const result = await sendContactEmail({
        name: formData.name,
        email: formData.email,
        message: composedMessage,
      })

      if (result.success) {
        setSubmitStatus({
          type: "success",
          message: "Thank you for your message! I'll get back to you soon.",
        })
        // Reset form
        setFormData({ name: "", email: "", printDetails: "", donationAmount: "", message: "" })
      } else {
        setSubmitStatus({
          type: "error",
          message: result.error || "Something went wrong. Please try again.",
        })
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Failed to send message. Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const applyPrefillFromHash = () => {
      if (typeof window === "undefined") return
      const hash = window.location.hash
      if (!hash.startsWith("#contact")) return

      const [, searchPart] = hash.split("?")
      if (!searchPart) {
        // No params, just highlight the form so users know they arrived
        setHighlightForm(true)
        if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
        highlightTimeoutRef.current = setTimeout(() => setHighlightForm(false), 1500)
        return
      }

      const params = new URLSearchParams(searchPart)
      const printParam = params.get("print")
      const typeParam = params.get("type")
      const donationParam = params.get("donation")

      // Only apply once per unique param set to avoid overwriting user edits
      const key = `${printParam ?? ""}|${typeParam ?? ""}|${donationParam ?? ""}`
      if (hasAppliedPrefillRef.current && !printParam && !donationParam && !typeParam) return

      setFormData((prev) => ({
        ...prev,
        printDetails: printParam ? decodeURIComponent(printParam) : prev.printDetails,
        donationAmount: donationParam ? decodeURIComponent(donationParam) : prev.donationAmount,
        message:
          typeParam === "digital-print" && !prev.message
            ? "Hi Sneha! I’d love to purchase this digital print."
            : prev.message,
      }))

      hasAppliedPrefillRef.current = true
      setHighlightForm(true)
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
      highlightTimeoutRef.current = setTimeout(() => setHighlightForm(false), 1800)
    }

    applyPrefillFromHash()
    window.addEventListener("hashchange", applyPrefillFromHash)
    return () => {
      window.removeEventListener("hashchange", applyPrefillFromHash)
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
    }
  }, [])

  return (
    <section
      id="contact"
      className="py-20 md:py-32 px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Get in Touch</span>
          </div>
          <h2
            className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-balance"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Let's Work Together
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto text-pretty leading-relaxed">
            Interested in booking a photoshoot? Have questions? I'd love to hear from you!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {/* Column 1: Book a Session Form */}
          <div>
            <h3
              className="text-2xl md:text-3xl font-bold text-foreground mb-6"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Book a Session
            </h3>
            <div
              className={cn(
                "bg-card/50 backdrop-blur-sm p-8 rounded-3xl border-2 border-border shadow-xl transition-all duration-700",
                highlightForm && "ring-4 ring-offset-4 ring-offset-background ring-primary/60 shadow-[0_0_0_12px_rgba(244,63,94,0.08)]"
              )}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-foreground mb-2">
                  Your Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-background border-2 rounded-xl"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-foreground mb-2">
                  Your Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-background border-2 rounded-xl"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="print-details" className="block text-sm font-bold text-foreground mb-2">
                  Are you interested in a photoshoot?
                </label>
                <Input
                  id="print-details"
                  type="text"
                  placeholder="e.g. Photoshoot – Senior portraits"
                  value={formData.printDetails}
                  onChange={(e) => setFormData({ ...formData, printDetails: e.target.value })}
                  className="bg-background border-2 rounded-xl"
                  disabled={isSubmitting}
                />
                {/* <p className="text-xs text-muted-foreground mt-2">
                  Mention the exact print (name/link) or describe the type of photoshoot you’re looking for.
                </p> */}
              </div>

              <div>
                <label htmlFor="donation-amount" className="block text-sm font-bold text-foreground mb-2">
                  Donation amount (PayPal)
                </label>
                <Input
                  id="donation-amount"
                  type="text"
                  placeholder="e.g. $35"
                  value={formData.donationAmount}
                  onChange={(e) => setFormData({ ...formData, donationAmount: e.target.value })}
                  className="bg-background border-2 rounded-xl"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Donations are processed through PayPal at{" "}
                  <a
                    href="https://www.paypal.com/paypalme/ShanthiKarunakaran"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    paypal.me/ShanthiKarunakaran
                  </a>
                  .
                </p>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-bold text-foreground mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Tell me anything else you'd like me to know about your photoshoot or digital print order..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={6}
                  className="bg-background border-2 rounded-xl resize-none"
                  disabled={isSubmitting}
                />
              </div>

              {submitStatus.type && (
                <div
                  className={`flex items-center gap-2 p-4 rounded-xl ${
                    submitStatus.type === "success"
                      ? "bg-accent/20 text-accent-foreground border-2 border-accent"
                      : "bg-destructive/20 text-destructive-foreground border-2 border-destructive"
                  }`}
                >
                  {submitStatus.type === "success" ? (
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  )}
                  <p className="text-sm font-medium">{submitStatus.message}</p>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-lg py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
              </form>
            </div>
          </div>

          {/* Column 2: Donate CTA */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <h3
                className="text-2xl md:text-3xl font-bold text-foreground mb-4"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Donate
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6 text-pretty">
                Support OneProsper International and help fund education, housing, and more for low-income girls in India. Every contribution makes a difference.
              </p>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm p-8 rounded-3xl border-2 border-border shadow-xl">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">100% of donations go to OneProsper</p>
                    <p className="text-sm text-muted-foreground">
                      All proceeds support girls' education and empowerment programs.
                    </p>
                  </div>
                </div>
                
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-lg py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <a
                    href="https://www.paypal.com/paypalme/ShanthiKarunakaran"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Donate via PayPal
                  </a>
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  Secure payment through PayPal
                </p>
              </div>
            </div>
          </div>

          {/* Commented out: Get in Touch section */}
          {/* <div className="space-y-8">
            <div>
              <h3
                className="text-2xl font-bold text-foreground mb-6"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Get in Touch
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8 text-pretty">
                Whether you're looking for portrait sessions, event coverage, or creative photography, I'm here to help
                bring your vision to life while supporting a great cause!
              </p>
            </div>

            <div className="space-y-4">
              <a
                href="mailto:shanthi.arun@gmail.com"
                className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/10 border-2 border-secondary/20 hover:border-secondary/40 text-foreground transition-all hover:scale-105 group"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                  <Mail className="h-6 w-6 text-secondary-foreground" />
                </div>
                <span className="font-medium">shanthi.arun@gmail.com</span>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-2xl bg-primary/10 border-2 border-primary/20 hover:border-primary/40 text-foreground transition-all hover:scale-105 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                  <Instagram className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="font-medium">@photography</span>
              </a>
            </div>

            <div className="pt-8 border-t-2 border-border">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-accent/10">
                <Camera className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Response time is typically within 24 hours!
                </p>
              </div>
            </div>

            <div className="hidden md:block p-6 rounded-3xl bg-card/40 border-2 border-border/60 space-y-3">
              <h4 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                How to order a digital print
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside leading-relaxed">
                <li>Tap "Select images to download" in the gallery and choose the photos you want.</li>
                <li>Use <span className="font-semibold text-primary">"Review selection & download"</span> to open the download panel.</li>
                <li>Donate via PayPal and use the download buttons to grab the high-resolution files instantly.</li>
                <li>
                  Donations are collected via PayPal:&nbsp;
                  <a
                    href="https://www.paypal.com/paypalme/ShanthiKarunakaran"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    paypal.me/ShanthiKarunakaran
                  </a>
                  .
                </li>
              </ul>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  )
}
