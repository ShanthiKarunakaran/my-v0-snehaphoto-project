"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, AlertCircle, Sparkles, DollarSign, TrendingUp } from "lucide-react"
// Form now submits to /api/contact API route
import { cn } from "@/lib/utils"
import { SmartOneProsperLink } from "@/components/ui/smart-oneprosper-link"

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    interestedInPhotoshoot: "", // "yes" or "no"
    photoshootTypes: [] as string[], // Array of selected photoshoot types
    donationAmount: "",
    donationType: "" as "" | "preset" | "custom", // Track if using preset or custom
    message: "",
    website: "", // Honeypot field - hidden from users
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })
  const [highlightForm, setHighlightForm] = useState(false)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasAppliedPrefillRef = useRef(false)
  const formStartTimeRef = useRef<number | null>(null)

  // Track when form becomes visible/interactive
  useEffect(() => {
    if (!formStartTimeRef.current) {
      formStartTimeRef.current = Date.now()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Honeypot check - if this field is filled, it's a bot
    if (formData.website) {
      console.warn("Spam detected: honeypot field filled")
      setSubmitStatus({
        type: "error",
        message: "Invalid submission detected.",
      })
      return
    }

    // Time-based validation - if form filled too quickly (< 3 seconds), likely a bot
    if (formStartTimeRef.current) {
      const timeSpent = (Date.now() - formStartTimeRef.current) / 1000
      if (timeSpent < 3) {
        console.warn("Spam detected: form filled too quickly")
        setSubmitStatus({
          type: "error",
          message: "Please take your time filling out the form.",
        })
        return
      }
    }

    // Validate interestedInPhotoshoot (required)
    if (!formData.interestedInPhotoshoot) {
      setSubmitStatus({
        type: "error",
        message: "Please indicate if you're interested in a photoshoot.",
      })
      return
    }

    // If Yes, validate that at least one photoshoot type is selected
    if (formData.interestedInPhotoshoot === "yes" && formData.photoshootTypes.length === 0) {
      setSubmitStatus({
        type: "error",
        message: "Please select at least one type of photoshoot you're interested in.",
      })
      return
    }

    // If Yes, donation amount is required
    if (formData.interestedInPhotoshoot === "yes") {
      if (!formData.donationAmount || !formData.donationAmount.trim()) {
        setSubmitStatus({
          type: "error",
          message: "Please select a donation amount or choose Custom to enter your own.",
        })
        return
      }
    }

    // Validate donation amount if provided
    if (formData.donationAmount && formData.donationAmount.trim()) {
      const donationValue = formData.donationAmount.trim()
      // Remove currency symbols and whitespace
      const cleanedDonation = donationValue.replace(/[$,\s]/g, '')
      const donationNumber = parseFloat(cleanedDonation)
      
      if (isNaN(donationNumber)) {
        setSubmitStatus({
          type: "error",
          message: "Please enter a valid donation amount (e.g., $35 or 35).",
        })
        return
      }

      if (donationNumber <= 0) {
        setSubmitStatus({
          type: "error",
          message: "Donation amount must be greater than $0.",
        })
        return
      }

      if (donationNumber > 10000) {
        setSubmitStatus({
          type: "error",
          message: "Donation amount seems unusually high. Please contact directly for large donations.",
        })
        return
      }

      if (donationNumber < 1) {
        setSubmitStatus({
          type: "error",
          message: "Donation amount must be at least $1.",
        })
        return
      }
    }

    // Content validation
    const messageLength = formData.message.length
    if (messageLength < 10) {
      setSubmitStatus({
        type: "error",
        message: "Please provide a more detailed message (at least 10 characters).",
      })
      return
    }

    if (messageLength > 5000) {
      setSubmitStatus({
        type: "error",
        message: "Message is too long. Please keep it under 5000 characters.",
      })
      return
    }

    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: "" })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          interestedInPhotoshoot: formData.interestedInPhotoshoot,
          photoshootTypes: formData.photoshootTypes,
          donationAmount: formData.donationAmount,
          website: formData.website, // Honeypot field
          timestamp: formStartTimeRef.current || Date.now(),
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus({
          type: "success",
          message: "Thank you for your message! I'll get back to you soon.",
        })
        // Reset form
        setFormData({ name: "", email: "", interestedInPhotoshoot: "", photoshootTypes: [], donationAmount: "", donationType: "", message: "", website: "" })
        formStartTimeRef.current = Date.now() // Reset timer for next submission
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
        interestedInPhotoshoot: printParam ? "yes" : prev.interestedInPhotoshoot,
        photoshootTypes: printParam ? [decodeURIComponent(printParam)] : prev.photoshootTypes,
        donationAmount: donationParam ? decodeURIComponent(donationParam) : prev.donationAmount,
        message:
          typeParam === "digital-print" && !prev.message
            ? "Hi Sneha! I'd love to purchase this digital print."
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
          <h2
            className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-balance"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Let&apos;s Work Together
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto text-pretty leading-relaxed">
            Interested in booking a photoshoot? Have questions? I&apos;d love to hear from you!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {/* Column 1: Book a Session Form */}
          <div className="flex flex-col">
            <h3
              className="text-2xl md:text-3xl font-bold text-foreground mb-6"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Book a Session
            </h3>
            <div
              className={cn(
                "bg-background/60 backdrop-blur-md p-8 rounded-3xl border border-border/50 shadow-lg shadow-foreground/5 transition-all duration-700",
                highlightForm && "ring-4 ring-offset-4 ring-offset-background ring-primary/60 shadow-[0_0_0_12px_rgba(244,63,94,0.08)]"
              )}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-foreground mb-2">
                  Your Name <span className="text-destructive">*</span>
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
                  Your Email <span className="text-destructive">*</span>
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
                <label className="block text-sm font-bold text-foreground mb-2">
                  Are you interested in a photoshoot? <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="interestedInPhotoshoot"
                      value="yes"
                      checked={formData.interestedInPhotoshoot === "yes"}
                      onChange={(e) => setFormData({ ...formData, interestedInPhotoshoot: e.target.value, photoshootTypes: [] })}
                      className="w-4 h-4 text-primary border-2 border-border focus:ring-primary"
                      disabled={isSubmitting}
                      required
                    />
                    <span className="text-foreground">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="interestedInPhotoshoot"
                      value="no"
                      checked={formData.interestedInPhotoshoot === "no"}
                      onChange={(e) => setFormData({ ...formData, interestedInPhotoshoot: e.target.value, photoshootTypes: [] })}
                      className="w-4 h-4 text-primary border-2 border-border focus:ring-primary"
                      disabled={isSubmitting}
                      required
                    />
                    <span className="text-foreground">No</span>
                  </label>
                </div>

                {/* Show options if Yes */}
                {formData.interestedInPhotoshoot === "yes" && (
                  <div className="mb-4 p-4 rounded-xl bg-background/40 border border-border/50">
                    <label className="block text-sm font-semibold text-foreground mb-3">
                      What type of photoshoot are you interested in? <span className="text-destructive">*</span>
                    </label>
                    <div className="space-y-2">
                      {[
                        "Senior Portraits",
                        "Headshots",
                        "Portrait Session",
                        "Graduation Photos",
                        "Family Photos",
                        "Event Photography",
                        "Other (specify in message)",
                      ].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.photoshootTypes.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  photoshootTypes: [...formData.photoshootTypes, type],
                                })
                              } else {
                                setFormData({
                                  ...formData,
                                  photoshootTypes: formData.photoshootTypes.filter((t) => t !== type),
                                })
                              }
                            }}
                            className="w-4 h-4 text-primary border-2 border-border rounded focus:ring-primary"
                            disabled={isSubmitting}
                          />
                          <span className="text-foreground text-sm">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show message if No */}
                {formData.interestedInPhotoshoot === "no" && (
                  <div className="mb-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-sm text-foreground">
                      No worries, feel free to simply send me a message.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Donation amount (PayPal)
                  {formData.interestedInPhotoshoot === "yes" && (
                    <span className="text-destructive"> *</span>
                  )}
                </label>
                
                {/* Preset donation buttons */}
                <div className="flex flex-wrap gap-3 mb-3">
                  {[
                    { label: "$15", value: "15" },
                    { label: "$35", value: "35" },
                    { label: "$50", value: "50" },
                    { label: "Custom", value: "custom" },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => {
                        if (preset.value === "custom") {
                          setFormData({
                            ...formData,
                            donationType: "custom",
                            donationAmount: "",
                          })
                        } else {
                          setFormData({
                            ...formData,
                            donationType: "preset",
                            donationAmount: preset.value,
                          })
                        }
                      }}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.donationType === "preset" && formData.donationAmount === preset.value
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : preset.value === "custom" && formData.donationType === "custom"
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "bg-background/60 border-2 border-border text-foreground hover:border-primary hover:bg-primary/10"
                      }`}
                      disabled={isSubmitting}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom input - only show when Custom is selected */}
                {formData.donationType === "custom" && (
                  <div className="mb-3">
                    <Input
                      id="donation-amount"
                      type="text"
                      placeholder="e.g. $25"
                      value={formData.donationAmount}
                      onChange={(e) => setFormData({ ...formData, donationAmount: e.target.value })}
                      required={formData.interestedInPhotoshoot === "yes"}
                      className="bg-background border-2 rounded-xl"
                      disabled={isSubmitting}
                    />
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-2">
                  {formData.donationType === "custom" || formData.donationType === ""
                    ? "You can choose an amount above or type your own. "
                    : ""}
                  Donations support OneProsper&apos;s education projects. Donations are processed through PayPal at{" "}
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
                  Message <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="message"
                  placeholder="Tell me anything else you'd like me to know about your photoshoot or digital print order..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={6}
                  maxLength={5000}
                  className="bg-background border-2 rounded-xl resize-none"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {formData.message.length}/5000 characters
                </p>
              </div>

              {/* Honeypot field - hidden from users, bots will fill it */}
              <div style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}>
                <label htmlFor="website">Website (leave blank)</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              {submitStatus.type && (
                <div
                  className={`flex items-center gap-2 p-4 rounded-xl ${
                    submitStatus.type === "success"
                      ? "bg-accent/20 border-2 border-accent"
                      : "bg-destructive/20 border-2 border-destructive"
                  }`}
                >
                  {submitStatus.type === "success" ? (
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-accent" />
                  ) : (
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
                  )}
                  <p className={`text-sm font-medium ${
                    submitStatus.type === "success" 
                      ? "text-accent" 
                      : "text-destructive"
                  }`}>{submitStatus.message}</p>
                </div>
              )}

              <div className="flex justify-center">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-lg py-6 px-8 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </div>
              </form>
            </div>
          </div>

          {/* Column 2: Donate CTA */}
          <div className="flex flex-col">
            <h3
              className="text-2xl md:text-3xl font-bold text-foreground mb-6"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Donate
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6 text-pretty">
              Support <SmartOneProsperLink className="text-primary hover:underline">OneProsper</SmartOneProsperLink> International and help fund education, housing, and more for low-income girls in India. Every contribution makes a difference.
            </p>
            
            <div className="bg-background/60 backdrop-blur-md p-8 rounded-3xl border border-border/50 shadow-lg shadow-foreground/5">
              <div className="space-y-6">
                {/* Donation Impact Stat */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Total Raised</span>
                    </div>
                    <TrendingUp className="h-4 w-4 text-primary/70" />
                  </div>
                  <p className="text-4xl font-bold text-primary mb-1">$115</p>
                  <p className="text-xs text-muted-foreground">Supporting OneProsper&apos;s education programs</p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">100% of donations go to OneProsper</p>
                    <p className="text-sm text-muted-foreground">
                      All proceeds support girls&apos; education and empowerment programs.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-lg py-6 px-8 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    <a
                      href="https://www.paypal.com/paypalme/ShanthiKarunakaran"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Donate via PayPal
                    </a>
                  </Button>
                </div>
                
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
