import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk } from "next/font/google"
import { DM_Sans } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import FilmStrip from "@/components/ui/film-strip"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Teen Photography | Shots for a Cause ✨",
  description: "Fun, creative photography by a teen photographer. Every photoshoot supports amazing causes!",
  icons: {
    icon: [
      { url: "/favicon-16-light.png", sizes: "16x16", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-16-dark.png", sizes: "16x16", media: "(prefers-color-scheme: dark)" },
      { url: "/favicon-32-light.png", sizes: "32x32", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-32-dark.png", sizes: "32x32", media: "(prefers-color-scheme: dark)" },
    ],
    apple: [
      { url: "/apple-touch-icon-180-light.png", sizes: "180x180", media: "(prefers-color-scheme: light)" },
      { url: "/apple-touch-icon-180-dark.png", sizes: "180x180", media: "(prefers-color-scheme: dark)" },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">{`
          try {
            var stored = localStorage.getItem('theme');
            var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (stored === 'dark' || (!stored && prefersDark)) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          } catch {}
        `}</Script>
      </head>
      <body className={`font-sans ${spaceGrotesk.variable} ${dmSans.variable} antialiased`}>
        {children}
        <FilmStrip />
      </body>
    </html>
  )
}
