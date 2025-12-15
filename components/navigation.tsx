"use client"

import { useState } from "react"
import { Menu, X, Mail } from "lucide-react"
import { FaInstagram } from "react-icons/fa";
import Image from "next/image"

import { Button } from "@/components/ui/button"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { name: "Portfolio", href: "/#portfolio" },
    { name: "About", href: "/#about" },
    { name: "Testimonials", href: "/#testimonials" },
    // { name: "Techniques", href: "/techniques" },
    { name: "Contact", href: "/#contact" },
  ]

  const socialLinks = [
   
    { icon: Mail, href: "mailto:shanthi.arun@gmail.com", label: "Email" },
    { icon: FaInstagram, href: "https://instagram.com/snehaa.prints", label: "Instagram" }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/70 backdrop-blur-md border-b border-primary/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity flex-shrink-0">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full overflow-hidden ring-2 ring-white/20 flex-shrink-0">
              <Image 
                src="/photos/aboutMe/sneha-silhouette.png" 
                alt="Sneha's Photography" 
                fill 
                className="object-cover"
              />
            </div>
            <span className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold whitespace-nowrap">
              <span className="hidden md:inline">Sneha&apos;s Photography</span>
              <span className="md:hidden">Sneha&apos;s</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-white/90 hover:text-primary-foreground transition-colors duration-200 text-sm font-medium"
              >
                {item.name}
              </a>
            ))}

            {/* Social Icons */}
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  className="text-white/80 hover:text-primary-foreground transition-colors duration-200"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Mobile Social Icons & Menu Button */}
          <div className="md:hidden flex items-center gap-4 relative z-10">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-primary-foreground transition-colors duration-200 relative z-10"
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="relative z-10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-white/90 hover:text-white transition-colors duration-200 text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
