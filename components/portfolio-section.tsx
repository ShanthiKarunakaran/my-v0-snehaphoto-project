"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import Image from "next/image"
import { Sparkles, X, DownloadCloud } from "lucide-react"
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
  const [galleryMode, setGalleryMode] = useState<"browse" | "select">("browse")
  const [selectedImages, setSelectedImages] = useState<Record<number, ImageType>>({})
  const [showSelectionSheet, setShowSelectionSheet] = useState(false)
  const [selectionToast, setSelectionToast] = useState<string | null>(null)
  const selectionToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  const selectionMode = galleryMode === "select"

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


  const toggleImageSelection = useCallback((image: ImageType) => {
    setSelectedImages((prev) => {
      const next = { ...prev }
      if (next[image.id]) {
        delete next[image.id]
      } else {
        next[image.id] = image
      }
      return next
    })
  }, [])

  const addImageToSelection = useCallback((image: ImageType) => {
    setSelectedImages((prev) => {
      if (prev[image.id]) {
        return prev
      }
      return {
        ...prev,
        [image.id]: image
      }
    })
  }, [])

  const showSelectionToast = useCallback(() => {
    setSelectionToast("Added to your selection — Review & download →")
    if (selectionToastTimeoutRef.current) {
      clearTimeout(selectionToastTimeoutRef.current)
    }
    selectionToastTimeoutRef.current = setTimeout(() => {
      setSelectionToast(null)
      selectionToastTimeoutRef.current = null
    }, 3200)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedImages({})
    setShowSelectionSheet(false)
    setGalleryMode("browse")
  }, [])

  const selectedCount = Object.keys(selectedImages).length
  const selectedImageList = useMemo(() => Object.values(selectedImages), [selectedImages])

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

  const siteUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.location.origin
    }
    return process.env.NEXT_PUBLIC_SITE_URL || "https://snehaaprints.vercel.app"
  }, [])

  const getPrintLabel = useCallback((image: ImageType) => {
    const name = image.alt_text || image.filename || "digital print"
    return image.category ? `${image.category} → ${name}` : name
  }, [])

  const getImageDownloadUrl = useCallback(
    (image: ImageType) => {
      if (!image.cloudinary_url) return "#"
      if (image.cloudinary_url.startsWith("http")) return image.cloudinary_url
      return `${siteUrl}${image.cloudinary_url}`
    },
    [siteUrl]
  )

  const getDownloadFileName = useCallback((image: ImageType) => {
    const base = image.filename || image.alt_text || "image"
    const sanitized = base.replace(/[^a-zA-Z0-9-_\.]+/g, "_")
    if (sanitized.includes(".")) return sanitized
    return `${sanitized}.jpg`
  }, [])

  const handleDownloadImage = useCallback(
    async (image: ImageType) => {
      const url = getImageDownloadUrl(image)
      if (!url || url === "#") return

      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`)

        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = objectUrl
        link.download = getDownloadFileName(image)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(objectUrl)
      } catch (error) {
        console.error("Image download failed", error)
      }
    },
    [getDownloadFileName, getImageDownloadUrl]
  )

  const handleDownloadAll = useCallback(async () => {
    if (selectedImageList.length === 0) return
    for (const image of selectedImageList) {
      await handleDownloadImage(image)
    }
  }, [handleDownloadImage, selectedImageList])

  const selectionSummary = useMemo(() => {
    if (selectedImageList.length === 0) return ""
    return selectedImageList
      .map((img, index) => `${index + 1}. ${getPrintLabel(img)}`)
      .join("\n")
  }, [selectedImageList, getPrintLabel])

  const copySelectionSummary = useCallback(async () => {
    if (!selectionSummary) return
    try {
      await navigator.clipboard.writeText(selectionSummary)
    } catch (err) {
      console.error("Failed to copy selection summary", err)
    }
  }, [selectionSummary])

  const handleAddFromBrowse = useCallback((image: ImageType) => {
    addImageToSelection(image)
    if (!selectedImage) {
      setShowSelectionSheet(true)
    }
    showSelectionToast()
  }, [addImageToSelection, selectedImage, showSelectionToast])

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

  useEffect(() => {
    return () => {
      if (selectionToastTimeoutRef.current) {
        clearTimeout(selectionToastTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (showSelectionSheet && selectionToast) {
      setSelectionToast(null)
      if (selectionToastTimeoutRef.current) {
        clearTimeout(selectionToastTimeoutRef.current)
        selectionToastTimeoutRef.current = null
      }
    }
  }, [showSelectionSheet, selectionToast])

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
            <p className="mt-4 text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Pick the images you love, then donate to support OneProsper and the girls they serve.
            </p>
            {selectionMode && (
              <p className="mt-6 text-center text-xs text-muted-foreground uppercase tracking-wide">
                Add to selection mode active · Tap each image to add it
              </p>
            )}
          </div>

          {/* <div className="mb-10">
            <ol className="flex flex-wrap items-center justify-center gap-8 text-sm font-semibold text-foreground">
              {["Browse", "Select", "Download", "Support"].map((label, index) => {
                const stepNumber = index + 1
                const isActive = (() => {
                  if (stepNumber === 1) return galleryMode === "browse"
                  if (stepNumber === 2) return galleryMode === "select"
                  if (stepNumber === 3) return showSelectionSheet && selectedCount > 0
                  if (stepNumber === 4) return showSelectionSheet && selectedCount > 0
                  return false
                })()
                return (
                  <li key={label} className={cn("flex items-center gap-2", !isActive && "text-muted-foreground")}
                  >
                    <span>{`Step ${stepNumber}:`}</span>
                    <span>{label}</span>
                  </li>
                )
              })}
            </ol>
          </div> */}

          <div className="mb-12 flex flex-col items-center gap-4 text-center">
            <h3 className="text-3xl font-semibold text-foreground">Choose your prints</h3>
            <div className="inline-flex items-center gap-2 text-sm font-semibold">
              {[{ label: "Browse", value: "browse" as const }, { label: "Add to selection", value: "select" as const }].map(({ label, value }) => {
                const isActive = galleryMode === value
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => {
                      setGalleryMode(value)
                      if (value === "browse") {
                        setShowSelectionSheet(false)
                      }
                    }}
                    className={cn(
                      "min-w-[150px] rounded-2xl px-6 py-3 transition-colors",
                      isActive
                        ? "bg-[#A50F4D] text-white shadow-sm"
                        : "bg-[#F8CFE0] text-[#B13864] hover:bg-[#F4BDD3]"
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
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

        {selectionMode && selectedCount > 0 && (
          <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
            <div className="flex items-center gap-4 rounded-full border border-border bg-background/95 px-6 py-3 shadow-xl shadow-primary/15">
              <span className="text-sm font-medium text-muted-foreground">
                {selectedCount} image{selectedCount === 1 ? "" : "s"} selected
              </span>
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-5 text-sm font-semibold shadow-primary/40"
                onClick={() => setShowSelectionSheet(true)}
              >
                Review & download
              </Button>
            </div>
          </div>
        )}

        {!selectionMode && selectedCount > 0 && (
          <div className="fixed bottom-6 right-6 z-30">
            <Button
              className="rounded-full bg-[#A50F4D] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#A50F4D]/30 hover:bg-[#8F0C41]"
              onClick={() => setShowSelectionSheet(true)}
            >
              Review & download ({selectedCount})
            </Button>
          </div>
        )}

        {selectionToast && (
          <div className="fixed bottom-24 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4">
            <div className="flex items-center justify-between gap-4 rounded-full bg-black/85 px-5 py-3 text-sm text-white shadow-2xl shadow-black/40">
              <span>{selectionToast}</span>
              <Button
                size="sm"
                className="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-black hover:bg-white"
                onClick={() => {
                  setSelectionToast(null)
                  setSelectedImage(null)
                  setShowSelectionSheet(true)
                }}
              >
                Review now
              </Button>
            </div>
          </div>
        )}

          {/* Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image, index) => {
              const isSelected = !!selectedImages[image.id]
              return (
                <div
                  key={image.id}
                  onClick={() => {
                    if (selectionMode) {
                      toggleImageSelection(image)
                    } else {
                      setSelectedImage(image)
                    }
                  }}
                  className={cn(
                    "group relative min-h-[400px] overflow-hidden rounded-2xl bg-zinc-900 cursor-pointer shadow-md transition-all duration-300",
                    selectionMode ? "hover:ring-2 hover:ring-primary/40" : "hover:scale-105 hover:shadow-2xl",
                    isSelected && "ring-2 ring-primary shadow-lg shadow-primary/30"
                  )}
                  style={{ animationDelay: `${index * 0.1}s`, position: "relative" }}
                >
                  {selectionMode && (
                    <div
                      className={cn(
                        "absolute top-4 right-4 z-30 flex h-9 w-9 items-center justify-center rounded-full border-2 bg-black/40 text-sm font-semibold",
                        isSelected ? "border-primary bg-primary text-primary-foreground" : "border-white/70 text-transparent"
                      )}
                    >
                      ✓
                    </div>
                  )}
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
                  <div className="rounded-2xl bg-black/65 backdrop-blur-sm p-4 space-y-3">
                    <div>
                      <p className="text-white text-sm font-semibold">{image.alt_text}</p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-white/70">
                        {image.category || "Uncategorized"}
                      </p>
                    </div>
                    {selectionMode ? (
                       <Button
                         size="sm"
                         variant={isSelected ? "default" : "secondary"}
                         className={cn(
                           "w-full flex items-center justify-center gap-2",
                           isSelected ? "bg-primary text-primary-foreground" : "bg-white/90 text-black hover:bg-white"
                         )}
                         onClick={(event) => {
                           event.stopPropagation()
                           toggleImageSelection(image)
                         }}
                       >
                        {isSelected ? "Added" : "Add to selection"}
                       </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/90 text-black hover:bg-white"
                          onClick={(event) => {
                            event.stopPropagation()
                            setSelectedImage(image)
                          }}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className={cn(
                            "bg-white/90 text-black hover:bg-white",
                            isSelected && "pointer-events-none opacity-70"
                          )}
                          onClick={(event) => {
                            event.stopPropagation()
                            handleAddFromBrowse(image)
                          }}
                        >
                          {isSelected ? "In selection" : "Add to My Selection"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              )
            })}
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

      {showSelectionSheet && (
        <div className="fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSelectionSheet(false)} />
          <aside className="relative ml-auto flex h-full w-full max-w-xl flex-col bg-background shadow-2xl">
            <div className="flex items-start justify-between border-b border-border px-6 py-5">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground shadow shadow-primary/40">
                  <DownloadCloud className="h-4 w-4" />
                  Step 3 · Download
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Your Selected Prints</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Download anything you’ve picked, then donate only if you’d like.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSelectionSheet(false)}
                className="rounded-full bg-muted p-2 text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {selectedCount === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You haven’t picked any images yet. Switch to “Select multiple” or tap “Add to My Selection” in Browse mode to get started.
                </p>
              ) : (
                <div className="space-y-5 text-sm text-muted-foreground">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Selected images ({selectedCount})</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Preview your picks below, then choose Download to save them all together.
                      </p>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {selectedImageList.map((img) => (
                        <div key={img.id} className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border/50">
                          {img.cloudinary_url ? (
                            <img src={img.cloudinary_url} alt={img.alt_text} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No preview</div>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleImageSelection(img)}
                            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white text-xs"
                            aria-label="Remove from selection"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedImageList.map((img) => (
                        <button
                          key={`${img.id}-chip`}
                          type="button"
                          onClick={() => toggleImageSelection(img)}
                          className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground hover:border-destructive/60 hover:text-destructive transition-colors"
                        >
                          <span className="font-medium text-foreground/80 group-hover:text-destructive">{img.alt_text || img.filename}</span>
                          <span className="text-muted-foreground/70 group-hover:text-destructive">×</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <p className="font-semibold text-primary">Step 3 · Download selected images</p>
                    <p className="mt-2 text-primary/80">
                      Download everything you’ve selected in a couple of clicks. High-resolution files are saved straight to your device.
                    </p>
                    <Button
                      size="sm"
                      className="mt-3 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={handleDownloadAll}
                    >
                      Download selected
                    </Button>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                    <p className="font-medium text-foreground">Step 4 · Support the cause (optional)</p>
                    <p className="mt-2">
                      You can download your photos for free. If my photography inspired you, consider supporting girls’
                      education through OneProsper International.
                    </p>
                    <a
                      href="https://www.paypal.com/paypalme/ShanthiKarunakaran"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Donate via PayPal
                    </a>
                    <p className="mt-2 text-center text-xs text-muted-foreground italic">Optional</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-foreground">Need help or a different format?</p>
                    <p>Have questions before donating? I’m happy to help.</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowSelectionSheet(false)
                        const contactSection = document.querySelector("#contact")
                        if (contactSection) {
                          contactSection.scrollIntoView({ behavior: "smooth" })
                        }
                      }}
                    >
                      Ask a question
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border px-6 py-4 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowSelectionSheet(false)}>
                Close
              </Button>
              <Button variant="ghost" onClick={clearSelection}>
                Clear selection
              </Button>
            </div>
          </aside>
        </div>
      )}


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
              <div className="absolute bottom-0 left-0 right-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-black/50 backdrop-blur-sm rounded-lg p-4">
                <div>
                  <p className="text-white text-sm md:text-base font-semibold">{selectedImage.alt_text}</p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium uppercase tracking-wide">
                    {selectedImage.category}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="secondary"
                    className="bg-white/90 text-black hover:bg-white whitespace-nowrap"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleAddFromBrowse(selectedImage)
                    }}
                  >
                    Donate for this print
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={(event) => {
                      event.stopPropagation()
                      const contactSection = document.querySelector("#contact")
                      if (contactSection) {
                        contactSection.scrollIntoView({ behavior: "smooth" })
                      }
                    }}
                  >
                    Ask a question
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
