import { Instagram, Mail, Facebook, Heart } from "lucide-react"

export function Footer() {
  const socialLinks = [
    { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
    { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
    { href: "mailto:hello@photography.com", icon: Mail, label: "Email" },
  ]

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
          <div className="flex items-center gap-8">
            <a
              href="#portfolio"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Portfolio
            </a>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              About
            </a>
            <a
              href="#contact"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </a>
          </div>

          {/* Copyright with heart */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()} Photography Portfolio</span>
            <Heart className="h-4 w-4 text-primary fill-primary" />
            <span>All proceeds support charitable organization https://www.oneprosper.org  </span>
          </div>

          {/* Fun tagline */}
          <p className="text-xs text-muted-foreground font-medium">{""}</p>
        </div>
      </div>
    </footer>
  )
}
