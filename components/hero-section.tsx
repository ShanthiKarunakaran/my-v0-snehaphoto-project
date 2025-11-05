import { Button } from "@/components/ui/button"
import { Camera, ArrowRight } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative min-h-[30vh] md:min-h-screen flex items-center px-6 lg:px-8 pt-20 pb-12 md:pt-16 overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Red safelight glow effects */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-red-600/25 rounded-full blur-[120px] animate-[safelight-pulse_4s_ease-in-out_infinite]" />
      {/* Moving safelight glow that sweeps across the image */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-red-600/40 rounded-full blur-[140px] animate-[safelight-sweep_8s_ease-in-out_infinite]" />

      {/* Clothesline string (curved) */}
      <div className="pointer-events-none absolute left-0 right-0 top-16 z-0 opacity-60">
        <svg className="w-full h-12" viewBox="0 0 100 20" preserveAspectRatio="none">
          <path d="M 0 6 C 20 12, 40 10, 60 6 S 100 5, 100 6" fill="none" stroke="rgb(82 82 91 / 0.6)" strokeWidth="0.6" />
        </svg>
      </div>

      {/* Hanging photos on clothesline */}
      <div className="absolute top-20 left-0 right-0 flex justify-center gap-8 opacity-60 z-20">
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

      <div className="max-w-6xl mx-auto relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-16">
          {/* Left: Sneha image */}
          <div className="hidden md:block relative w-full md:max-w-[520px] lg:max-w-[460px] mx-auto lg:mx-0 lg:translate-x-2 mt-6 aspect-[4/5] overflow-visible rotate-[-3deg] lg:rotate-[-5deg] origin-center group cursor-pointer transition-all duration-1000 ease-in-out hover:rotate-[-1deg] hover:scale-105">
            {/* Background spotlight to lift silhouette from dark bg */}
            <div className="pointer-events-none absolute -left-10 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-radial from-red-600/60 via-red-500/20 to-transparent blur-[90px]" />
            {/* Neutral white base spotlight for extra contrast */}
            <div className="pointer-events-none absolute -left-8 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-radial from-white/30 via-white/10 to-transparent blur-2xl" />
            <Image
              src="/photos/aboutMe/sneha-silhouette-transparentBg.png"
              alt="Sneha photographing portraits"
              fill
              className="object-cover hero-object-pos drop-shadow-[0_25px_40px_rgba(0,0,0,0.55)] group-hover:opacity-0 transition-opacity duration-1000 ease-in-out rounded-[50%] animate-[safelight-hide_8s_ease-in-out_infinite]"
              priority
            />
            <Image
              src="/photos/aboutMe/sneha.jpeg"
              alt="Sneha photographing portraits"
              fill
              className="object-cover hero-object-pos drop-shadow-[0_25px_40px_rgba(0,0,0,0.55)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ease-in-out rounded-[50%] animate-[safelight-reveal_8s_ease-in-out_infinite]"
            />
            {/* Artistic oval frame border */}
            <div className="pointer-events-none absolute inset-0 rounded-[50%] border border-red-400/15 group-hover:border-red-300/25 transition-all duration-1000 ease-in-out blur-[0.5px]" />
            {/* Optional subtle top highlight for cutout depth */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/5 via-transparent to-transparent rounded-t-[50%]" />
            {/* Safelight rim light on left edge */}
            <div className="pointer-events-none absolute -left-6 top-0 h-full w-16 bg-gradient-to-r from-red-400/35 via-red-400/0 to-transparent blur-lg mix-blend-screen" />
            {/* Foreground sheen to brighten black silhouette edges */}
            <div className="pointer-events-none absolute -left-6 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-radial from-red-300/45 via-red-300/20 to-transparent blur-[70px] mix-blend-screen" />
            {/* Additional white edge highlight for maximum contrast */}
            <div className="pointer-events-none absolute -left-4 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-radial from-white/40 via-white/15 to-transparent blur-xl mix-blend-screen" />
          </div>

          {/* Right: Text content */}
          <div className="text-left relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/50 mb-6 border border-red-900/50 backdrop-blur-sm text-zinc-100">
              <Camera className="h-4 w-4" />
              <span className="text-sm font-medium">Photography with Purpose</span>
            </div>

            <div className="relative inline-block">
              <h1
                className="text-6xl md:text-7xl lg:text-8xl font-bold text-zinc-100 mb-6 leading-tight text-balance relative z-10"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Bold. Creative.
                <br />
                <span className="text-red-400">Capturing You!</span>
              </h1>
              {/* Safelight sheen sweep across headline */}
              <div className="pointer-events-none absolute -inset-x-24 top-0 h-full bg-gradient-to-r from-transparent via-red-400/15 to-transparent animate-[shine_6s_linear_infinite]" />
            </div>

            <p className="text-xl md:text-2xl text-zinc-300 mb-10 max-w-2xl leading-relaxed">
              Turning creative vision into positive change. Every photoshoot supports a cause.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/80 text-primary-foreground text-base px-8 rounded-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all group"
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
                className="text-base px-8 rounded-lg border-2 border-primary/40 bg-card/60 backdrop-blur-sm hover:bg-primary/10 hover:border-primary text-foreground hover:text-primary-foreground transition-all"
              >
                <a href="#contact">Book a Session</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/70 pointer-events-none" />
      {/* Low fog at bottom for darkroom atmosphere */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-red-900/25 via-zinc-900/0 to-transparent blur-2xl opacity-70" />
    </section>
  )
}
