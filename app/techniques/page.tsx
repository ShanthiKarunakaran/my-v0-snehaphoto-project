import { Lightbulb, Palette, Camera, BookOpen, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const techniques = [
  {
    id: "light-shadow",
    title: "Light and Shadow",
    description: "Exploring how light shapes emotion and creates depth in my photographs, using natural and artificial lighting to tell compelling stories.",
    icon: Lightbulb,
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/40",
    href: "https://snehaarunphotographyii.weebly.com/light-and-shadow.html",
    external: true
  },
  {
    id: "color-theory",
    title: "Color Theory",
    description: "Understanding color relationships helps me create harmonious compositions that evoke specific moods and emotions in my work.",
    icon: Palette,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/40",
    href: "https://snehaarunphotographyii.weebly.com/color-theory.html",
    external: true
  },
  {
    id: "alternate-techniques",
    title: "Alternate Techniques",
    description: "Exploring unconventional approaches to photography through experimental methods and creative processes.",
    icon: BookOpen,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/40",
    href: "https://snehaarunphotographyii.weebly.com/alternate-techniques.html",
    external: true
  }
]

const photoJournals = [
  {
    title: "Photo Journal: Light and Shadow",
    description: "A detailed exploration of my lighting techniques and experiments",
    href: "https://snehaarunphotographyii.weebly.com/photo-journals.html",
    external: true
  },
  {
    title: "Photo Journal: Color Theory",
    description: "My journey understanding color relationships in photography",
    href: "https://snehaarunphotographyii.weebly.com/photo-journals.html",
    external: true
  },
  {
    title: "Photo Journal: Alternate Techniques",
    description: "Exploring unconventional approaches to photography",
    href: "https://snehaarunphotographyii.weebly.com/photo-journals.html",
    external: true
  }
]

export default function TechniquesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20">
              <Camera className="h-4 w-4" />
              <span className="text-sm font-medium">My Techniques</span>
            </div>
            <h1
              className="text-5xl md:text-7xl font-bold text-foreground mb-6 text-balance"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              <span className="text-primary">Artistic</span>{" "}
              <span className="text-foreground">Exploration</span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto text-pretty leading-relaxed">
              Dive deep into my photographic techniques and creative processes. Each method represents years of experimentation and artistic growth.
            </p>
          </div>
        </div>
      </section>

      {/* Techniques Grid */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Explore My Techniques
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Click on any technique to learn about my approach, methods, and creative philosophy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {techniques.map((technique) => {
              const Icon = technique.icon
              return technique.external ? (
                <a
                  key={technique.id}
                  href={technique.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className={`p-8 rounded-3xl bg-card/50 backdrop-blur-sm border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 ${technique.borderColor} hover:${technique.borderColor.replace('/40', '/60')}`}>
                    <div className="flex items-start gap-6">
                      <div className={`w-16 h-16 rounded-2xl ${technique.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`h-8 w-8 ${technique.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3
                          className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors"
                          style={{ fontFamily: "var(--font-space-grotesk)" }}
                        >
                          {technique.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          {technique.description}
                        </p>
                        <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                          <span>Learn More</span>
                          <ExternalLink className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              ) : (
                <Link
                  key={technique.id}
                  href={technique.href}
                  className="group block"
                >
                  <div className={`p-8 rounded-3xl bg-card/50 backdrop-blur-sm border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 ${technique.borderColor} hover:${technique.borderColor.replace('/40', '/60')}`}>
                    <div className="flex items-start gap-6">
                      <div className={`w-16 h-16 rounded-2xl ${technique.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`h-8 w-8 ${technique.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3
                          className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors"
                          style={{ fontFamily: "var(--font-space-grotesk)" }}
                        >
                          {technique.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          {technique.description}
                        </p>
                        <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                          <span>Learn More</span>
                          <ExternalLink className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Photo Journals Section */}
      <section className="py-20 px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Photo Journals
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Detailed documentation of my creative process and artistic discoveries.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {photoJournals.map((journal, index) => (
              <a
                key={index}
                href={journal.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-6 rounded-2xl bg-card/50 backdrop-blur-sm border-2 border-border hover:border-primary/40 transition-all hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {journal.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {journal.description}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Artist Statement Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Artist Statement
            </h2>
          </div>
          
          <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/5 via-background to-accent/5 border-2 border-primary/10">
          <div className="space-y-8 text-muted-foreground leading-relaxed">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Exploration
              </h3>
              <p className="text-lg mb-4">
                Throughout the semester, I discovered that I took better pictures when I brainstormed thoroughly and relied less on Lightroom for editing. When brainstorming, the mind map always worked the best when I was developing an idea, because I was able to dive deeper into the process of taking a creative picture once I had many ideas written down in front of me.
              </p>
              <p className="mb-4">
                For example, I had a detailed mind map for the alternative techniques project, and though I did not end up using some of my original ideas, I created new, even better pictures by combining the ideas I had written down in my map. I enjoyed using Lightroom, but I found that my pictures looked better and more natural when I did not heavily edit the picture.
              </p>
              <p>
                I like that my pictures look slightly imperfect when I do not heavily edit them; I believe it adds to the character of the picture, as seen with my picture of the egg for the choice project. I could have increased the exposure of the picture so that the egg was clearly visible, but it is more interesting that half of the egg is shrouded in shadow.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Voice
              </h3>
              <p className="text-lg mb-4">
                I enjoyed focusing on portrait lighting for the photomontage project and photo journal, particularly because I loved having people "model" for me. One of the best parts of my final photomontage series is the portraits themselves, because I was able to convey a different emotion based on the lighting.
              </p>
              <p>
                It was also fun to take pictures focusing on light and shadow, because I have always found the use of shadows in pictures very intriguing. In the final series, I focused on GOBOS and the shadows of objects themselves, and I appreciate that these techniques helped bring out the theme of the series.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Growth
              </h3>
              <p className="text-lg mb-4">
                I experienced the most growth in the photomontage project by improving my Photoshop skills. Last semester, I didn't enjoy Photoshop, because I did not spend enough time trying to learn its features and experiment with different pictures.
              </p>
              <p>
                However, this semester, I put several hours into using Photoshop, experimenting with several tools that ultimately made my pictures look more realistic. My portraits also improved, as compared to last semester, because I took more creative risks and experimented thoroughly with different lighting techniques before choosing ones that would convey the theme of the series well.
              </p>
            </div>
          </div>
          </div>
        </div>
      </section>
    </div>
  )
}
