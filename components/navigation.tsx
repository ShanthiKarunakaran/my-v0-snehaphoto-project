"use client"

import { useState } from "react"
import { Menu, X, Instagram, Facebook, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { name: "Portfolio", href: "#portfolio" },
    { name: "About", href: "#about" },
    { name: "Artist Statement", href: "https://snehaarunphotographyii.weebly.com/light-and-shadow.html", external: true },
    { name: "Contact", href: "#contact" },
  ]

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Mail, href: "#contact", label: "Email" },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="text-xl font-semibold text-foreground">
            Photography
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm font-medium"
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
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}

              {/* Mobile Social Icons */}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
