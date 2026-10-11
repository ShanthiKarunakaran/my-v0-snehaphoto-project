"use client"

import { Instagram, Mail, Heart } from "lucide-react"
import { SmartOneProsperLink } from "@/components/ui/smart-oneprosper-link"

export function Footer() {
  const socialLinks = [
    { href: "https://www.instagram.com/snehaa.prints/", icon: Instagram, label: "Instagram" },
    { href: "mailto:shanthi.arun@gmail.com", icon: Mail, label: "Email" },
  ]

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Only handle hash links
    if (href.startsWith("#")) {
      e.preventDefault()
      const sectionId = href
      const element = document.querySelector(sectionId)
      
      if (element) {
        const navHeight = 64
        const elementTop = element.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = elementTop - navHeight
        
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: "smooth"
        })
        
        // Update URL hash without triggering scroll
        window.history.pushState(null, "", href)
      }
    }
  }

  return (
    <footer className="border-t-2 border-border py-12 px-6 lg:px-8 bg-gradient-to-t from-primary/5 to-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-8">
          {/* Social Links - Featured */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="w-12 h-12 rounded-full bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary flex items-center justify-center transition-all hover:scale-110 shadow-md hover:shadow-lg"
                  aria-label={social.label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              )
            })}
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4 sm:gap-8 flex-wrap justify-center">
            <a
              href="#portfolio"
              onClick={(e) => handleNavClick(e, "#portfolio")}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Portfolio
            </a>
            <a 
              href="#about" 
              onClick={(e) => handleNavClick(e, "#about")}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              About
            </a>
            <a
              href="#testimonials"
              onClick={(e) => handleNavClick(e, "#testimonials")}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Testimonials
            </a>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "#contact")}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </a>
          </div>

          {/* Copyright / Credits */}
          <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground text-center px-4 max-w-2xl">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <span>© {new Date().getFullYear()}</span>
              <span className="hidden sm:inline">—</span>
              <span>Copyright © Shanthi Karunakaran</span>
              <span className="hidden sm:inline">—</span>
              <span className="hidden sm:inline">All rights reserved.</span>
              <Heart className="h-4 w-4 text-primary fill-primary" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-1 sm:gap-x-2 gap-y-1">
              <span className="sm:hidden">All rights reserved. </span>
              <span className="hidden sm:inline">All proceeds support charitable organization </span>
              <span className="sm:hidden">Proceeds support </span>
              <SmartOneProsperLink className="text-primary hover:underline">OneProsper</SmartOneProsperLink>
            </div>
          </div>

          {/* Fun tagline */}
          <p className="text-xs text-muted-foreground font-medium">{""}</p>
        </div>
      </div>
    </footer>
  )
}
