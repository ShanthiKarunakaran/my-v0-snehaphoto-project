import { Button } from "@/components/ui/button"
import { Camera, ArrowRight, DollarSign } from "lucide-react"
import Image from "next/image"
import { SmartOneProsperLink } from "@/components/ui/smart-oneprosper-link"

export function HeroSection() {
  return (
    <section className="relative min-h-[50vh] md:min-h-screen flex items-center px-6 lg:px-8 pt-20 pb-6 md:pb-12 md:pt-16 overflow-hidden bg-background">
      {/* Primary color glow effects - reduced on mobile */}
      <div className="absolute top-20 left-10 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-primary/15 sm:bg-primary/20 md:bg-primary/25 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] animate-[safelight-pulse_4s_ease-in-out_infinite]" />
      {/* Moving glow that sweeps across the image - reduced on mobile */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-primary/20 sm:bg-primary/30 md:bg-primary/40 rounded-full blur-[80px] sm:blur-[100px] md:blur-[140px] animate-[safelight-sweep_8s_ease-in-out_infinite]" />

      {/* Clothesline string (curved) */}
      <div className="pointer-events-none absolute left-0 right-0 top-16 z-10 opacity-60">
        <svg className="w-full h-12" viewBox="0 0 100 20" preserveAspectRatio="none">
          <path d="M 0 6 C 20 12, 40 10, 60 6 S 100 5, 100 6" fill="none" stroke="rgb(82 82 91 / 0.6)" strokeWidth="0.6" />
        </svg>
      </div>

      {/* Hanging photos on clothesline - mobile: single photo on right, desktop: 3 photos centered */}
      {/* Mobile: Single photo on right, smaller */}
      <div className="absolute top-[3.5rem] right-4 sm:right-8 md:hidden opacity-60 z-20">
        <div className="relative group flex flex-col items-center">
          {/* Clothespin - positioned to clip the line and photo */}
          <div className="w-1.5 h-6 sm:w-2 sm:h-8 bg-zinc-700 rounded-full -mb-0.5 z-10" /> {/* Clothespin overlaps line and photo */}
          {/* Photo - positioned directly below clothespin */}
          <div className="w-20 h-24 sm:w-24 sm:h-28 bg-zinc-800 border-2 sm:border-[3px] border-zinc-700 shadow-xl sm:shadow-2xl rotate-[-8deg] hover:rotate-[-4deg] transition-transform duration-500 overflow-hidden relative -mt-1">
            <Image src="/photos/Portraits/portrait-black-dress.jpg" alt="Hanging photo" fill className="object-contain" sizes="128px" />
          </div>
        </div>
      </div>
      
      {/* Desktop: 3 photos centered (original layout) */}
      <div className="hidden md:flex absolute top-[3.5rem] left-0 right-0 justify-center gap-8 opacity-60 z-20">
        <div className="relative group flex flex-col items-center">
          {/* Clothespin - positioned to clip the line and photo */}
          <div className="w-2 h-8 bg-zinc-700 rounded-full -mb-0.5 z-10" /> {/* Clothespin overlaps line and photo */}
          {/* Photo - positioned directly below clothespin */}
          <div className="w-32 h-40 bg-zinc-800 border-4 border-zinc-700 shadow-2xl rotate-[-8deg] hover:rotate-[-4deg] transition-transform duration-500 overflow-hidden relative -mt-1">
            <Image src="/photos/Portraits/portrait-black-dress.jpg" alt="Hanging photo" fill className="object-contain" sizes="128px" />
          </div>
        </div>
        <div className="relative group flex flex-col items-center">
          <div className="w-2 h-8 bg-zinc-700 rounded-full -mb-0.5 z-10" />
          <div className="w-32 h-40 bg-zinc-800 border-4 border-zinc-700 shadow-2xl rotate-[5deg] hover:rotate-[2deg] transition-transform duration-500 overflow-hidden relative -mt-1">
            <Image src="/photos/Portraits/garden-bench.jpg" alt="Hanging photo" fill className="object-contain" sizes="128px" />
          </div>
        </div>
        <div className="relative group hidden lg:flex flex-col items-center">
          <div className="w-2 h-8 bg-zinc-700 rounded-full -mb-0.5 z-10" />
          <div className="w-32 h-40 bg-zinc-800 border-4 border-zinc-700 shadow-2xl rotate-[-3deg] hover:rotate-[0deg] transition-transform duration-500 overflow-hidden relative -mt-1">
            <Image src="/photos/Portraits/stairs-outdoor.jpg" alt="Hanging photo" fill className="object-contain" sizes="128px" />
          </div>
        </div>
      </div>

      {/* Film strip decoration - hidden on mobile */}
      <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-12 h-64 bg-zinc-900 border-l-4 border-r-4 border-zinc-700 opacity-30">
        <div className="flex flex-col justify-around h-full px-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-full h-4 bg-zinc-800" />
          ))}
        </div>
      </div>
      <div className="hidden md:block absolute right-0 top-1/3 w-12 h-64 bg-zinc-900 border-l-4 border-r-4 border-zinc-700 opacity-30">
        <div className="flex flex-col justify-around h-full px-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-full h-4 bg-zinc-800" />
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-16">
          {/* Left: Sneha image */}
          <div className="hidden md:block relative w-[380px] h-[280px] md:w-[440px] md:h-[320px] lg:w-[500px] lg:h-[360px] mx-auto lg:mx-0 lg:translate-x-2 mt-6 overflow-hidden rounded-[50%] rotate-[-3deg] lg:rotate-[-5deg] origin-center group cursor-pointer transition-all duration-1000 ease-in-out hover:rotate-[-1deg] hover:scale-105">
            {/* Background spotlight to lift silhouette */}
            <div className="pointer-events-none absolute -left-10 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-radial from-primary/60 via-primary/20 to-transparent blur-[90px]" />
            {/* Neutral base spotlight for extra contrast */}
            <div className="pointer-events-none absolute -left-8 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-radial from-background/30 via-background/10 to-transparent blur-2xl" />
            <Image
              src="/photos/aboutMe/sneha-silhouette-transparentBg.png"
              alt="Sneha photographing portraits"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 460px"
              className="object-cover hero-object-pos drop-shadow-[0_25px_40px_rgba(0,0,0,0.55)] group-hover:opacity-0 transition-opacity duration-1000 ease-in-out"
              priority
            />
            <Image
              src="/photos/aboutMe/sneha.jpeg"
              alt="Sneha photographing portraits"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 460px"
              className="object-cover hero-object-pos drop-shadow-[0_25px_40px_rgba(0,0,0,0.55)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ease-in-out"
            />
            {/* Artistic oval frame border */}
            <div className="pointer-events-none absolute inset-0 rounded-[50%] border border-primary/15 group-hover:border-primary/25 transition-all duration-1000 ease-in-out blur-[0.5px]" />
            {/* Optional subtle top highlight for cutout depth */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/5 via-transparent to-transparent rounded-t-[50%]" />
            {/* Rim light on left edge */}
            <div className="pointer-events-none absolute -left-6 top-0 h-full w-16 bg-gradient-to-r from-primary/35 via-primary/0 to-transparent blur-lg mix-blend-screen" />
            {/* Foreground sheen to brighten edges */}
            <div className="pointer-events-none absolute -left-6 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-radial from-primary/45 via-primary/20 to-transparent blur-[70px] mix-blend-screen" />
            {/* Additional edge highlight for maximum contrast */}
            <div className="pointer-events-none absolute -left-4 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-radial from-background/40 via-background/15 to-transparent blur-xl mix-blend-screen" />
          </div>

          {/* Right: Text content */}
          <div className="text-left relative">
           

            <div className="relative inline-block">
              <h1
                className="text-4xl sm:text-5xl md:text-7xl lg:text-6xl font-bold text-foreground mb-6 leading-tight text-balance relative z-10"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Turning creative vision into positive change
                <br />
                <span className="text-primary"></span>
              </h1>
              {/* Safelight sheen sweep across headline */}
              <div className="pointer-events-none absolute -inset-x-24 top-0 h-full bg-gradient-to-r from-transparent via-primary/15 to-transparent animate-[shine_6s_linear_infinite]" />
            </div>

            <p className="text-lg sm:text-xl md:text-2xl text-foreground mb-10 max-w-2xl leading-relaxed">
              Every photoshoot supports a cause – funding{" "}
              <SmartOneProsperLink className="text-primary hover:text-primary/80 hover:underline transition-colors">
                OneProsper&apos;s
              </SmartOneProsperLink>{" "}
              education projects.
            </p>

            <div className="flex flex-col items-center md:items-start gap-4 mb-8">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/80 text-primary-foreground text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all group w-auto"
              >
                <a href="#contact" className="relative z-10">
                  Book a Session or Donate
                </a>
              </Button>
              <a
                href="#portfolio"
                className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-primary hover:text-primary/80 transition-all group underline-offset-4 hover:underline decoration-2 decoration-primary/60 hover:decoration-primary"
              >
                View my work
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Donation Impact Stat - moved below buttons, simplified on mobile */}
            <div className="flex items-center gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-border/40">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground tracking-wide mb-0.5 leading-tight">
                    <span className="hidden sm:inline">Amount raised so far to support </span>
                    <span className="sm:hidden">Raised for </span>
                    OneProsper&apos;s education projects
                  </p>
                  <p className="text-base sm:text-xl font-semibold text-primary">$115</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle vignette effect - reduced on mobile */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-foreground/10 sm:to-foreground/15 md:to-foreground/20 pointer-events-none" />
      {/* Low fog at bottom for atmosphere - reduced on mobile */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 sm:h-28 md:h-40 bg-gradient-to-t from-primary/5 sm:from-primary/8 md:from-primary/10 via-background/0 to-transparent blur-xl sm:blur-2xl opacity-50 sm:opacity-60 md:opacity-70" />
    </section>
  )
}
