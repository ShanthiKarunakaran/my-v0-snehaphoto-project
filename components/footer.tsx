"use client"

import { useState, useEffect } from "react"
import { Instagram, Mail, Heart, X } from "lucide-react"
import Image from "next/image"

export function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleOpenModal = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setImageError(false)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        handleCloseModal()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isModalOpen])

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isModalOpen])
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
              <span>Website designed and developed by <a href="https://github.com/ShanthiKarunakaran" onClick={handleOpenModal} className="text-primary hover:underline cursor-pointer">Shanthi Karunakaran</a></span>
              <span className="hidden sm:inline">—</span>
              <span className="hidden sm:inline">All rights reserved.</span>
              <Heart className="h-4 w-4 text-primary fill-primary" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-1 sm:gap-x-2 gap-y-1">
              <span className="sm:hidden">All rights reserved. </span>
              <span className="hidden sm:inline">All proceeds support charitable organization </span>
              <span className="sm:hidden">Proceeds support </span>
              <span>OneProsper</span>
            </div>
          </div>

          {/* Fun tagline */}
          <p className="text-xs text-muted-foreground font-medium">{""}</p>
        </div>
      </div>

      {/* GitHub Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-foreground/95 backdrop-blur-sm" onClick={handleCloseModal} />

          {/* Close button */}
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 z-[60] p-3 rounded-full bg-background/10 hover:bg-background/20 text-background transition-colors backdrop-blur-sm"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Modal content */}
          <div className="absolute inset-0 z-[55] flex items-center justify-center p-2 sm:p-3 pointer-events-none">
            <div
              className="relative w-full max-w-[98vw] sm:max-w-[90vw] md:max-w-4xl lg:max-w-5xl max-h-[90vh] pointer-events-auto bg-background/60 backdrop-blur-md rounded-2xl border border-border/50 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 sm:p-4 md:p-5">
                <h3
                  className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2 sm:mb-3 text-center"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  Developer Profile
                </h3>
                <div className="relative w-full min-h-[250px] sm:min-h-[350px] md:min-h-[450px] rounded-lg overflow-hidden border border-border/50 shadow-lg bg-muted/20">
                  {imageError ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 md:p-8 text-center">
                      <p className="text-muted-foreground mb-4">Image not found</p>
                      <p className="text-sm text-muted-foreground">Please add your GitHub profile screenshot as:</p>
                      <code className="text-xs text-primary mt-2 bg-muted px-3 py-1 rounded">/public/photos/aboutMe/github-profile.png</code>
                    </div>
                  ) : (
                    <Image
                      src="/photos/aboutMe/github-profile.png"
                      alt="Shanthi Karunakaran GitHub Profile"
                      fill
                      className="object-contain"
                      priority
                      onError={() => setImageError(true)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  )
}
