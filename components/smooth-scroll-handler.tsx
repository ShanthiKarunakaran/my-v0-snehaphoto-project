"use client"

import { useEffect } from "react"

export function SmoothScrollHandler() {
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash) {
        // Skip portfolio hashes - let portfolio section handle those
        if (hash.startsWith("#portfolio")) {
          return
        }
        
        // Remove the # and any query parameters
        const sectionId = hash.split("?")[0]
        const element = document.querySelector(sectionId)
        
        if (element) {
          // Calculate offset for fixed navigation bar (64px = 4rem)
          const navHeight = 64
          // Get element's position relative to document
          const elementTop = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementTop - navHeight

          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: "smooth"
          })
        }
      }
    }

    // Handle initial hash on mount (but skip portfolio)
    if (window.location.hash && !window.location.hash.startsWith("#portfolio")) {
      // Small delay to ensure DOM is ready
      setTimeout(handleHashChange, 100)
    }

    // Handle hash changes
    window.addEventListener("hashchange", handleHashChange)
    
    return () => {
      window.removeEventListener("hashchange", handleHashChange)
    }
  }, [])

  return null
}

