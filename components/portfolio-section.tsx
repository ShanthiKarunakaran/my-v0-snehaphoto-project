"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import Image from "next/image"
import { Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Image as ImageType } from "@/lib/supabase"

export function PortfolioSection() {
  //state declarations
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null)

  //state to store the images from database
  const [images, setImages] = useState<ImageType[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{ total: number; totalPages: number } | null>(null);
  const [highlightGallery, setHighlightGallery] = useState(false);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

      console.log('Fetching images with params:', params.toString());
      const response = await fetch(`/api/images?${params}`);
      const data = await response.json();
      
      console.log('Images API response:', { 
        ok: response.ok, 
        status: response.status,
        imageCount: data.images?.length || 0,
        total: data.pagination?.total || 0,
        error: data.error || null
      });

      if (!response.ok) {
        const errorMsg = data.error || data.details || 'Failed to fetch images';
        console.error('Images API error:', errorMsg, data);
        throw new Error(errorMsg);
      }

      // Ensure images is an array (handle null/undefined)
      const imagesArray = Array.isArray(data.images) ? data.images : [];
      
      console.log('Setting images:', imagesArray.length, 'images');

      // If we're on page 1, replace the images. Otherwise, append them (for pagination)
      if (page === 1) {
        setImages(imagesArray);
      } else {
        setImages(prev => [...prev, ...imagesArray]);
      }
      
      setPagination(data.pagination || {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching images:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };



  const flashGallery = useCallback(() => {
    setHighlightGallery(true)
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current)
    }
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightGallery(false)
      highlightTimeoutRef.current = null
    }, 1200)
  }, [])

  //useEffect hook to handle hash change
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash) {
        //split the hash into sectionID and category using ?
        const parts = hash.split("?")
        const sectionID = parts[0]
        const category = parts[1]
        console.log("category", category)

        //scroll to the sectionID
        const section = document.querySelector(sectionID)
        if (section) {
          section.scrollIntoView({ behavior: "smooth" })
          if (sectionID === "#portfolio") {
            flashGallery()
          }
        }
        //extract Portraits from category need the word after = sign
        if (category) {
          const categoryArray = category.split("=")

          if (sectionID === "#portfolio" && category) {
            // Decode URL-encoded category name (e.g., "Graduation%20Photos" -> "Graduation Photos")
            const decodedCategory = decodeURIComponent(categoryArray[1] || "")
            setSelectedCategory(decodedCategory) //sets the category filter in the portfolio section
          }
        }
      }
    }

    handleHashChange()
    window.addEventListener("hashchange", handleHashChange)
    return () => {
      window.removeEventListener("hashchange", handleHashChange)
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
      }
    }
    /*if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }*/
  }, [flashGallery]) //empty dependency array which means run only once on mount

  // useEffect to fetch images when component mounts or category/page changes
  useEffect(() => {
    fetchImages();
  }, [page, selectedCategory]); // Run when page or selectedCategory changes

  // Reset page to 1 when category changes
  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  // Track if categories have been fetched to prevent duplicate fetches
  const categoriesFetchedRef = useRef(false)
  
  // Fetch all unique categories from database (independent of filtered images)
  useEffect(() => {
    if (categoriesFetchedRef.current) return // Already fetched
    categoriesFetchedRef.current = true
    
    let isMounted = true
    
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories...')
        const response = await fetch('/api/categories')
        const data = await response.json()
        console.log('Categories API response:', { ok: response.ok, status: response.status, data })
        
        if (!isMounted) return // Don't update if component unmounted
        
        if (response.ok && data.categories && Array.isArray(data.categories)) {
          // Always set categories, even if empty array (will show just "All")
          const newCategories = data.categories.length > 0 ? ["All", ...data.categories] : ["All"]
          console.log('Setting categories:', newCategories)
          setCategories(newCategories)
        } else {
          console.error('Failed to fetch categories - invalid response:', data)
          // Set default categories on error
          setCategories(["All"])
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err)
        // Set default categories on error
        setCategories(["All"])
        categoriesFetchedRef.current = false // Reset on error so we can retry
      }
    }
    
    fetchCategories()
    
    return () => {
      isMounted = false
    }
  }, []) // Only fetch once on mount

  // Use images directly from database
  const filteredImages = images


  const handleCloseModal = () => {
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
        className={cn(
          "py-20 md:py-32 px-6 lg:px-8 bg-gradient-to-b from-background via-primary/5 to-background relative overflow-visible transition-all duration-700",
          highlightGallery && "ring-4 ring-offset-4 ring-offset-background ring-primary/60 shadow-[0_0_0_12px_rgba(244,63,94,0.08)]"
        )}
      >
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        <div
          className={cn(
            "absolute inset-0 pointer-events-none bg-primary/15 blur-3xl transition-opacity duration-700 ease-out",
            highlightGallery ? "opacity-60" : "opacity-0"
          )}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
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
          <div className="mb-8 border-b border-border/60 overflow-x-auto">
            <nav className="flex justify-center gap-6 text-sm font-medium text-muted-foreground">
              {categories.map((category) => {
                const displayName = category === "All"
                  ? "All"
                  : category.replace(/([A-Z])/g, " $1").trim()
                const isActive = selectedCategory === category

                return (
                  <button
                    key={category}
                    onClick={() => {
                      const newHash = category === "All"
                        ? "#portfolio"
                        : `#portfolio?category=${encodeURIComponent(category)}`
                      window.location.hash = newHash
                      setSelectedCategory(category)
                    }}
                    className={cn(
                      "relative pb-3 transition-colors whitespace-nowrap", 
                      isActive ? "text-foreground" : "hover:text-foreground"
                    )}
                  >
                    {displayName}
                    <span
                      className={cn(
                        "absolute left-0 -bottom-[1px] h-[2px] w-full rounded-full transition-opacity",
                        isActive ? "bg-primary opacity-100" : "bg-transparent opacity-0"
                      )}
                    />
                  </button>
                )
              })}
            </nav>
          </div>


          {/* Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className="group relative min-h-[400px] overflow-hidden rounded-2xl bg-card cursor-pointer shadow-md transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{ animationDelay: `${index * 0.1}s`, position: "relative" }}
              >
                {image.cloudinary_url?.includes('supabase.co') || image.cloudinary_url?.includes('supabase.in') ? (
                  // Use regular img tag for Supabase URLs to avoid Next.js Image optimization issues
                  <img
                    src={image.cloudinary_url}
                    alt={image.alt_text}
                    className="absolute inset-0 w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                ) : (
                  <Image
                    src={image.cloudinary_url || "/placeholder.svg"}
                    alt={image.alt_text}
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                    unoptimized={!image.cloudinary_url?.startsWith('http')}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/0 to-foreground/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="rounded-2xl bg-foreground/65 backdrop-blur-sm p-4 space-y-3">
                    <div>
                      <p className="text-background text-sm font-semibold">{image.alt_text}</p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-background/70">
                        {image.category || "Uncategorized"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full bg-background/90 text-foreground hover:bg-background"
                      onClick={(event) => {
                        event.stopPropagation()
                        setSelectedImage(image)
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination UI */}
          {pagination && (
            <div className="mt-12 space-y-6">
              {/* Load More Button - Only show if there are more pages and more images to load */}
              {pagination.totalPages > page && filteredImages.length < pagination.total ? (
                <div className="text-center">
                  <button
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={isLoading}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Loading...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Load More
                        <span className="text-sm opacity-80">
                          ({pagination.total - filteredImages.length} remaining)
                        </span>
                      </span>
                    )}
                  </button>
                </div>
              ) : (
                // All images loaded message - only show if we have images
                filteredImages.length > 0 && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                      <span>✓</span>
                      <span>All {filteredImages.length} images displayed</span>
                    </div>
                  </div>
                )
              )}

              {/* Pagination Info */}
              <div className="text-center space-y-1">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{filteredImages.length}</span> of{' '}
                  <span className="font-medium text-foreground">{pagination.total}</span> images
                </div>
                {pagination.totalPages > 1 && pagination.totalPages > page && (
                  <div className="text-xs text-muted-foreground">
                    Page {page} of {pagination.totalPages}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="mt-6 text-center text-destructive text-sm">
              Error: {error}
            </div>
          )}
        </div>
      </section>



      {selectedImage && (
        <div className="fixed inset-0 z-50 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-foreground/95 backdrop-blur-sm" onClick={handleCloseModal} />

          {/* Close button - separate layer on top */}
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 z-[60] p-3 rounded-full bg-background/10 hover:bg-background/20 text-background transition-colors backdrop-blur-sm"
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
                {selectedImage.cloudinary_url?.includes('supabase.co') || selectedImage.cloudinary_url?.includes('supabase.in') ? (
                  // Use regular img tag for Supabase URLs to avoid Next.js Image optimization issues
                  <img
                    src={selectedImage.cloudinary_url}
                    alt={selectedImage.alt_text}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                ) : (
                  <Image
                    src={selectedImage.cloudinary_url || "/placeholder.svg"}
                    alt={selectedImage.alt_text}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1400px"
                    priority
                    unoptimized={!selectedImage.cloudinary_url?.startsWith('http')}
                  />
                )}
              </div>

              {/* Image info */}
              <div className="absolute bottom-0 left-0 right-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-foreground/50 backdrop-blur-sm rounded-lg p-4">
                <div>
                  <p className="text-background text-sm md:text-base font-semibold">{selectedImage.alt_text}</p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium uppercase tracking-wide">
                    {selectedImage.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
