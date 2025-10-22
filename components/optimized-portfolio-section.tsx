"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Image from "next/image"
import { Sparkles, X, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Types
interface ImageData {
  id: number
  filename: string
  alt_text: string
  category: string
  cloudinary_url: string
  width: number
  height: number
  file_size: number
  created_at: string
}

interface Category {
  id: number
  name: string
  description: string
  color: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Custom hook for fetching images with caching
function useImages(page: number, category: string, search: string) {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '12',
          ...(category && category !== 'All' && { category }),
          ...(search && { search })
        })

        const response = await fetch(`/api/images?${params}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch images')
        }

        if (page === 1) {
          setImages(data.images)
        } else {
          setImages(prev => [...prev, ...data.images])
        }
        
        setPagination(data.pagination)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [page, category, search])

  return { images, loading, pagination, error }
}

// Custom hook for categories
function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        setCategories([{ id: 0, name: 'All', description: 'All images', color: '#000' }, ...data.categories])
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading }
}

// Optimized Image Component with lazy loading
const OptimizedImage = ({ image, index }: { image: ImageData; index: number }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    const element = document.getElementById(`image-${image.id}`)
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [image.id])

  return (
    <div
      id={`image-${image.id}`}
      className="group relative min-h-[400px] overflow-hidden rounded-2xl bg-zinc-900 cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {isInView && (
        <Image
          src={image.cloudinary_url}
          alt={image.alt_text}
          fill
          className={`object-contain transition-all duration-500 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          } group-hover:scale-105`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onLoad={() => setIsLoaded(true)}
          priority={index < 6} // Prioritize first 6 images
        />
      )}
      
      {/* Loading skeleton */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/0 to-foreground/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
          {image.category}
        </span>
      </div>
    </div>
  )
}

// Main Portfolio Component
export function OptimizedPortfolioSection() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null)

  // Custom hooks
  const { images, loading, pagination, error } = useImages(page, selectedCategory, searchTerm)
  const { categories, loading: categoriesLoading } = useCategories()

  // Memoized filtered images to prevent unnecessary re-renders
  const filteredImages = useMemo(() => images, [images])

  // Infinite scroll handler
  const handleLoadMore = useCallback(() => {
    if (pagination && page < pagination.totalPages && !loading) {
      setPage(prev => prev + 1)
    }
  }, [page, pagination, loading])

  // Reset page when category or search changes
  useEffect(() => {
    setPage(1)
  }, [selectedCategory, searchTerm])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleCloseModal = () => {
    setSelectedImage(null)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedImage) {
        handleCloseModal()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedImage])

  // Body scroll lock
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

          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Filter className="h-4 w-4 text-muted-foreground self-center" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                {categoriesLoading ? (
                  <option>Loading categories...</option>
                ) : (
                  categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Image Grid */}
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Error loading images: {error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredImages.map((image, index) => (
                <OptimizedImage
                  key={image.id}
                  image={image}
                  index={index}
                />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {pagination && page < pagination.totalPages && (
            <div className="text-center mt-12">
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-8 py-3"
              >
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}

          {/* Pagination Info */}
          {pagination && (
            <div className="text-center mt-8 text-sm text-muted-foreground">
              Showing {images.length} of {pagination.total} images
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" onClick={handleCloseModal} />
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 z-[60] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="absolute inset-0 z-[55] flex items-center justify-center p-4 md:p-8 pointer-events-none">
            <div
              className="relative w-full h-full max-w-7xl max-h-[90vh] pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full">
                <Image
                  src={selectedImage.cloudinary_url}
                  alt={selectedImage.alt_text}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1400px"
                  priority
                />
              </div>
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
