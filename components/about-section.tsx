"use client"


export function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-32 px-6 lg:px-8 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-4 border border-accent/20">
              <span className="text-sm font-medium">About Me</span>
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              <span className="text-primary">{"About Me"}</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed text-pretty">
              Since I picked up my camera in middle school, I&apos;ve been on a journey to capture how I see the world
              through my lens—from still life to portraits of family and friends. 
            </p>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed text-pretty">
             I have photographed several photoshoots featured in my <a href="#portfolio?category=Portraits" onClick={() => console.log("Gallery link clicked! Hash before:", window.location.hash)} className="text-primary hover:underline">gallery</a>, where you can see my work and style.
            </p>
            <h3 className="text-2xl font-bold text-foreground mb-6">My Services</h3>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed text-pretty">
              I am offering photoshoots for senior portraits, headshots, &quot;choose-your-own-theme&quot; portraits, and more!
            </p>
            <h3 className="text-2xl font-bold text-foreground mb-6">My Mission</h3>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed text-pretty">All proceeds are donated to <a href="https://www.instagram.com/oneprosper/?hl=en" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OneProsper International</a>, a nonprofit
              organization that funds education, housing, and more for low-income girls in India. I am an active
              volunteer with this organization, and every donation helps bring another girl&apos;s dream to life.
            </p>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed text-pretty">
              <a href="#contact" className="text-primary hover:underline">Contact me</a> to book a shoot or ask any questions.
            </p>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed text-pretty">
              If you like to learn more about my work process, check out <a href="https://snehaarunphotographyii.weebly.com/choice.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              My Photography Techniques</a>.
            </p>
          </div>
          {/* Second column with feature cards */}

          <div className="space-y-6">
          <div className="flex gap-4 p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition-all hover:shadow-md">

            <img src="/photos/aboutMe/sneha.jpeg" alt="About Me" className="w-full h-full object-cover" />
          </div>
          </div>

          {/* <div className="space-y-6">
             <div className="flex gap-4 p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition-all hover:shadow-md">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3
                  className="text-lg font-bold text-foreground mb-2"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  Pro Quality
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  High-quality photos for portraits, events, and special occasions
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-xl bg-card border border-border hover:border-accent/40 transition-all hover:shadow-md">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div>
                <h3
                  className="text-lg font-bold text-foreground mb-2"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  100% for Good
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every dollar supports meaningful causes and community initiatives
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition-all hover:shadow-md">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3
                  className="text-lg font-bold text-foreground mb-2"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  Personal Touch
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Dedicated service that captures your unique story
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  )
}
