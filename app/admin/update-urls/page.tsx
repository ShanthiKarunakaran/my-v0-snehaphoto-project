'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface GraduationPhoto {
  id: number
  filename: string
  cloudinary_url: string
  category: string
  alt_text: string
  currentUrl?: string
  suggestedUrl?: string | null
  needsUpdate?: boolean
}

export default function UpdateUrlsPage() {
  const [photos, setPhotos] = useState<GraduationPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<Record<number, boolean>>({})
  const [newUrls, setNewUrls] = useState<Record<number, string>>({})
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  })

  useEffect(() => {
    fetchGraduationPhotos()
  }, [])

  const fetchGraduationPhotos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/update-graduation-urls')
      const data = await response.json()
      
      if (response.ok) {
        setPhotos(data.graduationPhotos || [])
        // Initialize newUrls with suggested URLs if available, otherwise current URLs
        const urls: Record<number, string> = {}
        data.graduationPhotos?.forEach((photo: GraduationPhoto) => {
          urls[photo.id] = photo.suggestedUrl || photo.currentUrl || photo.cloudinary_url || ''
        })
        setNewUrls(urls)
        if (data.foundUrls > 0) {
          setStatus({ type: 'success', message: `Found ${data.foundUrls} suggested URL(s) from Supabase Storage` })
        }
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to fetch photos' })
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to fetch photos' })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setStatus({ type: 'success', message: 'URL copied to clipboard!' })
    setTimeout(() => setStatus({ type: null, message: '' }), 2000)
  }

  const useSuggestedUrl = (imageId: number, suggestedUrl: string) => {
    setNewUrls(prev => ({ ...prev, [imageId]: suggestedUrl }))
    setStatus({ type: 'success', message: 'Suggested URL filled in. Click Update URL to save.' })
    setTimeout(() => setStatus({ type: null, message: '' }), 2000)
  }

  const updateUrl = async (imageId: number) => {
    const newUrl = newUrls[imageId]
    if (!newUrl) {
      setStatus({ type: 'error', message: 'Please enter a new URL' })
      return
    }

    try {
      setUpdating(prev => ({ ...prev, [imageId]: true }))
      const response = await fetch('/api/update-graduation-urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId,
          newUrl
        })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({ type: 'success', message: `URL updated for image ${imageId}` })
        // Update the local state
        setPhotos(prev => prev.map(photo => 
          photo.id === imageId ? { ...photo, cloudinary_url: newUrl, currentUrl: newUrl, needsUpdate: false } : photo
        ))
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to update URL' })
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to update URL' })
    } finally {
      setUpdating(prev => ({ ...prev, [imageId]: false }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Update Graduation Photo URLs</h1>
        
        {status.type && (
          <div className={`mb-6 p-4 rounded-lg ${
            status.type === 'success' 
              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {status.message}
          </div>
        )}

        <div className="mb-4">
          <p className="text-muted-foreground mb-2">
            Found {photos.length} graduation photo(s)
          </p>
          <Button onClick={fetchGraduationPhotos} variant="outline" size="sm">
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="border border-border rounded-lg p-4 bg-card"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <p className="text-sm font-medium mb-1">ID: {photo.id}</p>
                  <p className="text-sm text-muted-foreground mb-2">{photo.alt_text}</p>
                  <p className="text-xs text-muted-foreground break-all">{photo.filename}</p>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Current URL:</label>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground break-all flex-1">
                        {photo.currentUrl || photo.cloudinary_url}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(photo.currentUrl || photo.cloudinary_url)}
                        className="text-xs"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  
                  {photo.suggestedUrl && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
                      <label className="text-sm font-medium mb-1 block text-green-400">
                        ✓ Suggested URL (from Supabase Storage):
                      </label>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-foreground break-all flex-1 font-mono">
                          {photo.suggestedUrl}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(photo.suggestedUrl!)}
                          className="text-xs"
                        >
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => useSuggestedUrl(photo.id, photo.suggestedUrl!)}
                          className="text-xs"
                        >
                          Use This
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">New URL:</label>
                    <Input
                      value={newUrls[photo.id] || ''}
                      onChange={(e) => setNewUrls(prev => ({ ...prev, [photo.id]: e.target.value }))}
                      placeholder="Enter or paste Supabase Storage URL"
                      className="text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => updateUrl(photo.id)}
                    disabled={updating[photo.id]}
                    className="w-full"
                  >
                    {updating[photo.id] ? 'Updating...' : 'Update URL'}
                  </Button>
                  {photo.needsUpdate && (
                    <span className="text-xs text-yellow-400 text-center">⚠ Needs update</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {photos.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No graduation photos found
          </div>
        )}
      </div>
    </div>
  )
}

