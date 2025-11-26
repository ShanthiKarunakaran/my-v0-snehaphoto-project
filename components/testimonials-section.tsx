import Image from "next/image"

type Testimonial = {
  name: string
  role: string
  quote: string
  avatarSrc: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sophia Meissner",
    role: "Portrait Client",
    quote:
      "Having my senior pics taken by Sneha was so much fun! We took them at the beach and in a little beach town and they came out so good! I liked her vision for the photos and how she was my hype woman during each pose. Sneha is a very talented and supportive photographer!",
    avatarSrc: "/photos/aboutMe/sneha-silhouette-favicon.png",
  },
  {
    name: "Thien Hong",
    role: "Portrait Client",
    quote:
      "The photoshoot is one of my best experiences to date! Sneha really listened and incorporated my ideas into the photoshoot. She is so open to all concepts, and works very hard to fully research the concepts. Me and my friend opted for a k-pop style photoshoot, and Sneha executed what we had envisioned so well. I will definitely do this again. I can't state how amazing the experience truly was.",
    avatarSrc: "/photos/aboutMe/sneha-silhouette-favicon.png",
  },
  {
    name: "Ms. Hughes",
    role: "Portrait Client",
    quote:
      "Sneha takes absolute pride in her work. She comes to a shoot with a detailed list of shots, she gives clear and concise directions, and creates beautiful and thoughtful images.",
    avatarSrc: "/photos/aboutMe/sneha-silhouette-favicon.png",
  }
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-20 px-6 lg:px-8 bg-gradient-to-b from-background to-zinc-950/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Testimonials
          </h2>
          <p className="mt-3 text-muted-foreground text-base md:text-lg">
            Real experiences from real sessions—captured with care and intention.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="group relative rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-primary/30">
                  <Image src={t.avatarSrc} alt={t.name} fill className="object-cover" />
                </div>
                <div>
                  <figcaption className="font-semibold text-foreground">{t.name}</figcaption>
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                </div>
              </div>

              <blockquote className="text-sm md:text-base leading-relaxed text-foreground">
                “{t.quote}”
              </blockquote>

              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-primary/20 transition-colors" />
            </figure>
          ))}
        </div>
      </div>

      {/* subtle vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
    </section>
  )
}


