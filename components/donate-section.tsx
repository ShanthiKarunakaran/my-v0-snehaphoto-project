"use client"

import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, Sparkles } from "lucide-react"
import { SmartOneProsperLink } from "@/components/ui/smart-oneprosper-link"

export function DonateSection() {
  return (
    <section
      id="donate"
      className="py-12 md:py-20 px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <h2
            className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-balance"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Support the Cause
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto text-pretty leading-relaxed">
            Every donation helps fund education, housing, and empowerment programs for girls in India through{" "}
            <SmartOneProsperLink className="text-primary hover:underline">OneProsper International</SmartOneProsperLink>.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {/* Column 1: Donation Info */}
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

          {/* Column 2: How It Works */}
          <div className="flex flex-col">
            <h3
              className="text-2xl md:text-3xl font-bold text-foreground mb-6"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              How It Works
            </h3>
            <div className="bg-background/60 backdrop-blur-md p-8 rounded-3xl border border-border/50 shadow-lg shadow-foreground/5 space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Digital Prints
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside leading-relaxed">
                  <li>Select images you want from the gallery</li>
                  <li>Use &quot;Review selection & download&quot; to open the download panel</li>
                  <li>Donate via PayPal and download high-resolution files instantly</li>
                  <li>
                    Donations are collected via PayPal:{" "}
                    <a
                      href="https://www.paypal.com/paypalme/ShanthiKarunakaran"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      paypal.me/ShanthiKarunakaran
                    </a>
                  </li>
                </ul>
              </div>

              <div className="pt-6 border-t border-border/50">
                <h4 className="text-lg font-semibold text-foreground mb-3" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Direct Donations
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You can also make a direct donation without purchasing prints. Every dollar supports OneProsper&apos;s mission to provide education and housing for girls in India.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

