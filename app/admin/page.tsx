"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Upload, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, Lock, DollarSign } from "lucide-react"
import { DonationsManager } from "@/components/admin/donations-manager"

interface UploadedFile {
  file: File
  url: string
  width: number | null
  height: number | null
  file_size: number
  altText: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authError, setAuthError] = useState("")
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [category, setCategory] = useState("Portraits")
  const [folder, setFolder] = useState("photos")
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  })

  // Check if already authenticated on page load
  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin_authenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
    setIsCheckingAuth(false)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError("")
    
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (data.success) {
        setIsAuthenticated(true)
        sessionStorage.setItem('admin_authenticated', 'true')
        setPassword("")
      } else {
        setAuthError(data.error || 'Invalid password')
      }
    } catch (error) {
      setAuthError('Failed to authenticate. Please try again.')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('admin_authenticated')
    setPassword("")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedFiles(files)
      setUploadedFiles([])
      setUploadProgress({})
    }
  }

  const handleBulkUpload = async () => {
    if (selectedFiles.length === 0) {
      setStatus({ type: "error", message: "Please select files first" })
      return
    }

    setIsUploading(true)
    setStatus({ type: null, message: "" })
    setUploadedFiles([])
    setUploadProgress({})

    const uploaded: UploadedFile[] = []

    try {
      // Upload files sequentially to avoid overwhelming the server
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const fileKey = `${file.name}-${i}`

        setUploadProgress((prev) => ({
          ...prev,
          [fileKey]: 0,
        }))

        const formData = new FormData()
        formData.append("file", file)
        formData.append("folder", folder)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (response.ok) {
          // Generate alt text from filename
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
          const altText = nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1)

          uploaded.push({
            file,
            url: data.url,
            width: data.width,
            height: data.height,
            file_size: data.file_size || file.size,
            altText,
          })

          setUploadProgress((prev) => ({
            ...prev,
            [fileKey]: 100,
          }))
        } else {
          setStatus({
            type: "error",
            message: `Failed to upload ${file.name}: ${data.error}`,
          })
        }
      }

      setUploadedFiles(uploaded)
      setStatus({
        type: "success",
        message: `Successfully uploaded ${uploaded.length} of ${selectedFiles.length} files!`,
      })
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to connect to server. Please try again.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleBulkSubmit = async () => {
    if (uploadedFiles.length === 0) {
      setStatus({
        type: "error",
        message: "Please upload files to storage first",
      })
      return
    }

    if (!category) {
      setStatus({
        type: "error",
        message: "Please select a category",
      })
      return
    }

    setIsSubmitting(true)
    setStatus({ type: null, message: "" })

    try {
      // Submit all files to database
      const promises = uploadedFiles.map((uploadedFile) =>
        fetch("/api/images", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: uploadedFile.file.name,
            alt_text: uploadedFile.altText || uploadedFile.file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
            category: category,
            storage_url: uploadedFile.url,
            width: uploadedFile.width || 0,
            height: uploadedFile.height || 0,
            file_size: uploadedFile.file_size || 0,
          }),
        })
      )

      const results = await Promise.allSettled(promises)
      const errors: Array<{ error?: string; message?: string }> = []
      let successful = 0
      
      // Process results and collect errors
      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        if (result.status === 'fulfilled') {
          const response = result.value
          if (response.ok) {
            successful++
          } else {
            try {
              const errorData = await response.json()
              console.error(`Failed to add image ${i + 1} (${uploadedFiles[i].file.name}):`, errorData)
              errors.push(errorData)
            } catch (e) {
              console.error(`Failed to add image ${i + 1}:`, response.statusText)
              errors.push({ error: response.statusText })
            }
          }
        } else {
          console.error(`Promise rejected for image ${i + 1}:`, result.reason)
          errors.push({ error: result.reason?.message || String(result.reason) })
        }
      }
      
      const failed = results.length - successful

      if (successful > 0) {
        setStatus({
          type: "success",
          message: `Successfully added ${successful} image${successful > 1 ? "s" : ""} to database${failed > 0 ? ` (${failed} failed - check console for details)` : ""}!`,
        })
        // Reset form
        setSelectedFiles([])
        setUploadedFiles([])
        setCategory("Portraits")
        setFolder("photos")
        setUploadProgress({})
        const fileInput = document.getElementById("file-input") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      } else {
        // Get first error message for display
        let errorMessage = "Failed to add images to database"
        if (errors.length > 0) {
          const firstError = errors[0]
          if (firstError?.error) {
            errorMessage = `Failed: ${firstError.error}`
          } else if (typeof firstError === 'string') {
            errorMessage = `Failed: ${firstError}`
          }
        }
        setStatus({
          type: "error",
          message: errorMessage,
        })
        console.error('All images failed to add. Full errors:', errors)
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to connect to server. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Admin Access</h1>
          </div>
          <p className="text-muted-foreground mb-6">
            Please enter the admin password to access this page.
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full"
                required
              />
            </div>
            {authError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{authError}</p>
              </div>
            )}
            <Button type="submit" className="w-full" size="lg">
              Login
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // Show admin content if authenticated
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-zinc-950/30 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage images and donations for your portfolio.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="ml-4"
            >
              Logout
            </Button>
          </div>

          <Tabs defaultValue="images" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="images" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Images
              </TabsTrigger>
              <TabsTrigger value="donations" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Donations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="images" className="space-y-6">
            {/* File Input - Multiple */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Image Files (Multiple)
                <span className="text-destructive ml-1">*</span>
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="file-input"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {selectedFiles.length > 0
                      ? `${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""} selected`
                      : "Click to select multiple images"}
                  </span>
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                      {selectedFiles.map((file, i) => (
                        <div key={i} className="text-left">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                      ))}
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Folder Selection */}
            <div>
              <label htmlFor="folder" className="block text-sm font-medium mb-2">
                Storage Folder
              </label>
              <Input
                id="folder"
                type="text"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                placeholder="photos"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Folder path in Supabase Storage (e.g., photos, photos/Animals, photos/Headshots)
              </p>
            </div>

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Upload Progress:</p>
                {selectedFiles.map((file, i) => {
                  const fileKey = `${file.name}-${i}`
                  const progress = uploadProgress[fileKey] || 0
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{file.name}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-400 mb-3">
                  ✓ {uploadedFiles.length} file{uploadedFiles.length > 1 ? "s" : ""} uploaded successfully!
                </p>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {uploadedFiles.map((uploadedFile, i) => (
                    <div key={i} className="relative">
                      <img
                        src={uploadedFile.url}
                        alt={uploadedFile.altText}
                        className="w-full h-24 object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <Button
              type="button"
              onClick={handleBulkUpload}
              disabled={isUploading || selectedFiles.length === 0}
              variant="outline"
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""}...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload {selectedFiles.length > 0 ? `${selectedFiles.length} ` : ""}File{selectedFiles.length !== 1 ? "s" : ""} to Storage
                </>
              )}
            </Button>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Category
                <span className="text-destructive ml-1">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                required
              >
                <option value="Portraits">Portraits</option>
                <option value="Artistic">Artistic</option>
                <option value="Prints">Prints</option>
                <option value="Animals">Animals</option>
                <option value="Headshots">Headshots</option>
                <option value="GraduationPhotos">Graduation Photos</option>
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Or type a custom category name below
              </p>
              <Input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Custom category"
                className="mt-2"
              />
            </div>

            {/* Status Message */}
            {status.type && (
              <div
                className={`flex items-center gap-2 p-4 rounded-lg ${
                  status.type === "success"
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <p className="text-sm">{status.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="button"
              onClick={handleBulkSubmit}
              disabled={isSubmitting || uploadedFiles.length === 0}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding {uploadedFiles.length} image{uploadedFiles.length > 1 ? "s" : ""} to database...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Add {uploadedFiles.length > 0 ? `${uploadedFiles.length} ` : ""}Image{uploadedFiles.length !== 1 ? "s" : ""} to Database
                </>
              )}
            </Button>

          {/* Add Local Images Section */}
          <div className="mt-12 p-6 border-t border-border">
            <h2 className="text-2xl font-bold mb-4">Add Local Images to Database</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Discover all images in your public/photos folder and add them to the database with local paths. You can migrate to Supabase Storage later.
            </p>
            
            <div className="space-y-4">
              <Button
                type="button"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/add-local-images')
                    const data = await response.json()
                    
                    if (response.ok) {
                      setStatus({
                        type: 'success',
                        message: `Preview: Found ${data.total} images. ${data.newImages} new, ${data.alreadyExists} already in database. Check console for details.`
                      })
                      console.log('Add Images Preview:', data)
                    } else {
                      setStatus({ type: 'error', message: data.error || 'Failed to preview' })
                    }
                  } catch (error) {
                    setStatus({ type: 'error', message: 'Failed to preview' })
                  }
                }}
                variant="outline"
                className="w-full"
              >
                Preview Images to Add
              </Button>

              <Button
                type="button"
                onClick={async () => {
                  if (!confirm('Are you sure you want to add all local images to the database? This will scan your public/photos folder and add any images found.')) {
                    return
                  }
                  
                  setIsUploading(true)
                  setStatus({ type: null, message: '' })
                  
                  try {
                    const response = await fetch('/api/add-local-images', {
                      method: 'POST'
                    })
                    const data = await response.json()
                    
                    if (response.ok) {
                      setStatus({
                        type: 'success',
                        message: `Added ${data.summary.successful} images to database! ${data.summary.failed} failed, ${data.summary.skipped} skipped. Check console for details.`
                      })
                      console.log('Add Images Results:', data)
                    } else {
                      setStatus({ type: 'error', message: data.error || 'Failed to add images' })
                    }
                  } catch (error) {
                    setStatus({ type: 'error', message: 'Failed to add images' })
                  } finally {
                    setIsUploading(false)
                  }
                }}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Images...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Add All Local Images to Database
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Migration Section */}
          <div className="mt-12 p-6 border-t border-border">
            <h2 className="text-2xl font-bold mb-4">Migrate Local Images to Supabase Storage</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Convert all image paths in the database from local paths (e.g., /photos/...) to Supabase Storage URLs.
            </p>
            
            <div className="space-y-4">
              <Button
                type="button"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/migrate-all-images-to-storage')
                    const data = await response.json()
                    
                    if (response.ok) {
                      setStatus({
                        type: 'success',
                        message: `Preview: ${data.totalLocalPathImages} images with local paths found. ${data.summary.filesExist} files exist, ${data.summary.filesMissing} files missing. Check console for details.`
                      })
                      console.log('Migration Preview:', data)
                    } else {
                      setStatus({ type: 'error', message: data.error || 'Failed to preview migration' })
                    }
                  } catch (error) {
                    setStatus({ type: 'error', message: 'Failed to preview migration' })
                  }
                }}
                variant="outline"
                className="w-full"
              >
                Preview Migration (Dry Run)
              </Button>

              <Button
                type="button"
                onClick={async () => {
                  if (!confirm('Are you sure you want to migrate all local images to Supabase Storage? This will upload files and update database URLs.')) {
                    return
                  }
                  
                  setIsUploading(true)
                  setStatus({ type: null, message: '' })
                  
                  try {
                    const response = await fetch('/api/migrate-all-images-to-storage', {
                      method: 'POST'
                    })
                    const data = await response.json()
                    
                    if (response.ok) {
                      setStatus({
                        type: 'success',
                        message: `Migration completed! ${data.summary.successful} successful, ${data.summary.failed} failed. Check console for details.`
                      })
                      console.log('Migration Results:', data)
                    } else {
                      setStatus({ type: 'error', message: data.error || 'Migration failed' })
                    }
                  } catch (error) {
                    setStatus({ type: 'error', message: 'Migration failed' })
                  } finally {
                    setIsUploading(false)
                  }
                }}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Migrating Images...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Start Migration
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2">Setup Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Go to Supabase Dashboard → Storage</li>
              <li>Create a new bucket named <code className="bg-muted px-1 py-0.5 rounded">images</code></li>
              <li>Make the bucket public (or configure RLS policies)</li>
              <li>Add <code className="bg-muted px-1 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code> to your <code className="bg-muted px-1 py-0.5 rounded">.env.local</code></li>
            </ol>
          </div>
            </TabsContent>

            <TabsContent value="donations" className="space-y-6">
              <DonationsManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

