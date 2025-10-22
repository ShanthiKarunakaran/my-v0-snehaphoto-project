import { Button } from "@/components/ui/button"
import { Camera, ArrowRight } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 lg:px-8 pt-16 overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Red safelight glow effects */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-red-600/20 rounded-full blur-[120px] animate-pulse" />
      <div
        className="absolute bottom-20 right-10 w-80 h-80 bg-red-500/15 rounded-full blur-[140px] animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      {/* Hanging photos on clothesline */}
      <div className="absolute top-24 left-0 right-0 flex justify-center gap-8 opacity-40">
        <div className="relative group">
          <div className="w-2 h-8 bg-zinc-700 rounded-full" /> {/* Clothespin */}
          <div className="w-32 h-40 bg-zinc-800 border-4 border-zinc-700 shadow-2xl rotate-[-8deg] hover:rotate-[-4deg] transition-transform duration-500 mt-2 overflow-hidden">
            <Image src="/photos/portrait-black-dress.jpg" alt="Hanging photo" fill className="object-contain" />
          </div>
        </div>
        <div className="relative group hidden md:block">
          <div className="w-2 h-8 bg-zinc-700 rounded-full" />
          <div className="w-32 h-40 bg-zinc-800 border-4 border-zinc-700 shadow-2xl rotate-[5deg] hover:rotate-[2deg] transition-transform duration-500 mt-2 overflow-hidden">
            <Image src="/photos/garden-bench.jpeg" alt="Hanging photo" fill className="object-contain" />
          </div>
        </div>
        <div className="relative group hidden lg:block">
          <div className="w-2 h-8 bg-zinc-700 rounded-full" />
          <div className="w-32 h-40 bg-zinc-800 border-4 border-zinc-700 shadow-2xl rotate-[-3deg] hover:rotate-[0deg] transition-transform duration-500 mt-2 overflow-hidden">
            <Image src="/photos/stairs-outdoor.jpg" alt="Hanging photo" fill className="object-contain" />
          </div>
        </div>
      </div>

      {/* Film strip decoration */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-64 bg-zinc-900 border-l-4 border-r-4 border-zinc-700 opacity-30">
        <div className="flex flex-col justify-around h-full px-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-full h-4 bg-zinc-800" />
          ))}
        </div>
      </div>
      <div className="absolute right-0 top-1/3 w-12 h-64 bg-zinc-900 border-l-4 border-r-4 border-zinc-700 opacity-30">
        <div className="flex flex-col justify-around h-full px-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-full h-4 bg-zinc-800" />
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/50 mb-6 border border-red-900/50 backdrop-blur-sm text-card">
          <Camera className="h-4 w-4" />
          <span className="text-sm font-medium">Photography with Purpose</span>
        </div>

        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-zinc-100 mb-6 text-balance leading-tight drop-shadow-2xl"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Capturing Moments,
          <br />
          <span className="text-primary">Creating Impact</span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto text-pretty leading-relaxed">
         Turning creative vision into positive change. Every photoshoot supports a cause.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="hover:bg-primary/80 text-white text-base px-8 rounded-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all group bg-primary"
          >
            <a href="#portfolio" className="flex items-center gap-2">
              View My Work
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="text-base px-8 rounded-lg border-2 border-primary/40 hover:bg-primary/10 hover:border-primary text-zinc-300 hover:text-primary-foreground transition-all bg-zinc-900/50 backdrop-blur-sm"
          >
            <a href="#contact">Book a Session</a>
          </Button>
        </div>
      </div>

      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/60 pointer-events-none" />
    </section>
  )
}
