"use client"

interface SmartOneProsperLinkProps {
  children: React.ReactNode
  className?: string
  target?: string
  rel?: string
}

const MAIN_SITE = "https://www.oneprosper.org"

// Since the main site is confirmed working, always use it
// Fallback logic can be added later if needed via server-side check
export function SmartOneProsperLink({ 
  children, 
  className, 
  target = "_blank",
  rel = "noopener noreferrer"
}: SmartOneProsperLinkProps) {
  return (
    <a
      href={MAIN_SITE}
      className={className}
      target={target}
      rel={rel}
    >
      {children}
    </a>
  )
}

