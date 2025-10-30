"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

export default function ThemeToggle(): JSX.Element {
  const [isDark, setIsDark] = useState<boolean>(true)

  useEffect(() => {
    // Initialize from localStorage or media; default to dark
    try {
      const stored = localStorage.getItem("theme")
      if (stored === "light") setIsDark(false)
      else if (stored === "dark") setIsDark(true)
      else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) setIsDark(true)
    } catch {}
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add("dark")
      try { localStorage.setItem("theme", "dark") } catch {}
    } else {
      root.classList.remove("dark")
      try { localStorage.setItem("theme", "light") } catch {}
    }
  }, [isDark])

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setIsDark((v) => !v)}
      className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border bg-card/60 hover:bg-muted transition-colors"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}
