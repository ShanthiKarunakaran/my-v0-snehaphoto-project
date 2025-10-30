"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Sparkles, X } from "lucide-react"
import type { Image as ImageType } from "@/lib/supabase"

const portfolioImages = [
  {
    id: 1,
    src: "/photos/portrait-black-dress.jpg",
    alt: "Portrait in black dress against textured wall",
    category: "Portraits",
  },
  {
    id: 2,
    src: "/photos/tying-shoes.jpg",
    alt: "Artistic portrait tying shoes",
    category: "Portraits",
  },
  {
    id: 3,
    src: "/photos/duo-sitting.jpg",
    alt: "Duo portrait sitting together",
    category: "Portraits",
  },
  {
    id: 4,
    src: "/photos/stairs-outdoor.jpg",
    alt: "Outdoor portrait on stairs",
    category: "Portraits",
  },
  {
    id: 5,
    src: "/photos/close-up-duo.jpg",
    alt: "Close-up duo portrait",
    category: "Portraits",
  },
  {
    id: 6,
    src: "/photos/balcony-night.jpg",
    alt: "Night portrait on balcony",
    category: "Artistic",
  },
  {
    id: 7,
    src: "/photos/garden-bench.jpeg",
    alt: "Garden portrait on bench with roses",
    category: "Portraits",
  },
  {
    id: 8,
    src: "/photos/prints/green-berries.jpg",
    alt: "Macro shot of green berries with water droplets",
    category: "Prints",
  },
  {
    id: 9,
    src: "/photos/prints/autumn-path.jpeg",
    alt: "Autumn path with vibrant fall foliage",
    category: "Prints",
  },
  {
    id: 10,
    src: "/photos/prints/white-flowers.jpeg",
    alt: "Delicate white flowers macro",
    category: "Prints",
  },
  {
    id: 11,
    src: "/photos/prints/wood-texture.jpeg",
    alt: "Abstract wood texture with golden tones",
    category: "Prints",
  },
  {
    id: 12,
    src: "/photos/prints/succulent.jpg",
    alt: "Succulent plant with water droplets",
    category: "Prints",
  },
  {
    id: 13,
    src: "/photos/prints/makeup-brush.jpeg",
    alt: "Artistic makeup brush close-up",
    category: "Prints",
  },
  {
    id: 14,
    src: "/photos/prints/eggshells.jpeg",
    alt: "Black and white cracked eggshells",
    category: "Prints",
  },
  {
    id: 15,
    src: "/photos/prints/flower-petals.jpeg",
    alt: "Flower petals with water droplets",
    category: "Prints",
  },
]

export function PortfolioSection() {
  //state declarations
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null)
  const categories = ["All", ...Array.from(new Set(portfolioImages.map((img) => img.category)))]

  //state to store the images from database
  const [images, setImages] = useState<ImageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{ total: number; totalPages: number } | null>(null);
  
  // Function to fetch images from the API
  const fetchImages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build the API URL with query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(selectedCategory && selectedCategory !== 'All' && { category: selectedCategory })
      });

      const response = await fetch(`/api/images?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch images');
      }

      // If we're on page 1, replace the images. Otherwise, append them (for pagination)
      if (page === 1) {
        setImages(data.images);
      } else {
        setImages(prev => [...prev, ...data.images]);
      }
      
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  console.log("PortfolioSection rendering!") // Add this FIRST

  //useEffect hook to handle hash change
  useEffect(() => {

    const handleHashChange = () => {
      const hash = window.location.hash;
      if(hash) {
        //split the hash into sectionID and category using ?
        const parts = hash.split("?");
        const sectionID = parts[0];
        const category = parts[1];
        console.log("category", category);

        //scroll to the sectionID
        const section = document.querySelector(sectionID);
        if(section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
        //extract Portraits from category need the word after = sign
        if(category) {
          const categoryArray = category.split("=");
          
          if(sectionID === "#portfolio" && category) {
            setSelectedCategory(categoryArray[1]); //sets the category filter in the portfolio section
          }
        }
      }
      
    }
    
    handleHashChange()
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
    /*if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }*/
  }, []); //empty dependency array which means run only once on mount

  // useEffect to fetch images when component mounts or category/page changes
  useEffect(() => {
    fetchImages();
  }, [page, selectedCategory]); // Run when page or selectedCategory changes

  // Reset page to 1 when category changes
  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  // Note: We'll update filteredImages to use the database images instead of portfolioImages
  const filteredImages = images; // For now, just use images from database

  const handleCloseModal = () => {
    console.log("[v0] Close button clicked")
    setSelectedImage(null)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedImage) {
        handleCloseModal()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedImage])

  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [selectedImage])

  return (
    <>
      <section
        id="portfolio"
        className="py-20 md:py-32 px-6 lg:px-8 bg-gradient-to-b from-background via-primary/5 to-background relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">My Work</span>
            </div>
            <h2
              className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-balance"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Portfolio
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto text-pretty leading-relaxed">
              A collection of moments captured through my lens
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  const newHash = category === "All" ? "#portfolio" : `#portfolio?category=${category}`;
                  window.location.hash = newHash;
                  setSelectedCategory(category);
                }}
                className={`px-6 py-3 text-sm font-medium rounded-full transition-all hover:scale-105 ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-card text-card-foreground hover:bg-muted border-2 border-border"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className="group relative min-h-[400px] overflow-hidden rounded-2xl bg-zinc-900 cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Image
                  src={image.cloudinary_url || "/placeholder.svg"}
                  alt={image.alt_text}
                  fill
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/0 to-foreground/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {image.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedImage && (
        <div className="fixed inset-0 z-50 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={handleCloseModal} />

          {/* Close button - separate layer on top */}
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 z-[60] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image container */}
          <div className="absolute inset-0 z-[55] flex items-center justify-center p-4 md:p-8 pointer-events-none">
            <div
              className="relative w-full h-full max-w-7xl max-h-[90vh] pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full">
                <Image
                  src={selectedImage.cloudinary_url || "/placeholder.svg"}
                  alt={selectedImage.alt_text}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1400px"
                  priority
                />
              </div>

              {/* Image info */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black/50 backdrop-blur-sm rounded-lg p-4">
                <span className="text-white text-sm md:text-base">{selectedImage.alt_text}</span>
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  {selectedImage.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
