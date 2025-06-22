"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { PlaceholderImage } from "@/components/ui/placeholder-image"
import { MoreHorizontal, Search, Filter, Download, Trash2, Edit, Eye, Loader2 } from "lucide-react"

type DatasetItem = {
  id: string
  filename: string
  label: string
  upload_date: string
  size_kb: string
  notes: string
  file_path: string
  thumbnail_path: string
}

export function DatasetTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<DatasetItem | null>(null)
  const [editLabel, setEditLabel] = useState<string>("")
  const [editNotes, setEditNotes] = useState<string>("")
  const [dataset, setDataset] = useState<DatasetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const itemsPerPage = 10
  const [thumbnailUrls, setThumbnailUrls] = useState<{ [id: string]: string }>({})
  const [imageUrls, setImageUrls] = useState<{ [id: string]: string }>({})
  const objectUrlsRef = useRef<string[]>([])

  // Fetch dataset from API
  const fetchDataset = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: itemsPerPage.toString(),
        search: searchQuery,
        label: selectedLabel || '',
      })

      const response = await fetch(`http://localhost:5000/api/dataset?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch dataset')
      }

      const result = await response.json()
      if (result.success) {
        setDataset(result.data.items)
        setTotalItems(result.data.total)
        setTotalPages(result.data.total_pages)
      }
    } catch (error) {
      console.error('Error fetching dataset:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when component mounts or filters change
  useEffect(() => {
    fetchDataset()
  }, [currentPage, searchQuery, selectedLabel])

  // Fetch and cache thumbnails
  useEffect(() => {
    const fetchThumbnails = async () => {
      const newUrls: { [id: string]: string } = {}
      for (const item of dataset) {
        if (item.thumbnail_path && !thumbnailUrls[item.id]) {
          try {
            const res = await fetch(`http://localhost:5000/api/dataset/${item.id}/thumbnail`)
            if (res.ok) {
              const blob = await res.blob()
              const url = URL.createObjectURL(blob)
              newUrls[item.id] = url
              objectUrlsRef.current.push(url)
            }
          } catch {}
        }
      }
      if (Object.keys(newUrls).length > 0) {
        setThumbnailUrls((prev) => ({ ...prev, ...newUrls }))
      }
    }
    if (dataset.length > 0) fetchThumbnails()
    // Clean up object URLs on unmount or dataset change
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      objectUrlsRef.current = []
      setThumbnailUrls({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset])

  // Fetch and cache full image for view dialog
  useEffect(() => {
    const fetchImage = async () => {
      if (selectedImage && !imageUrls[selectedImage.id]) {
        try {
          const res = await fetch(`http://localhost:5000/api/dataset/${selectedImage.id}/image`)
          if (res.ok) {
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            setImageUrls((prev) => ({ ...prev, [selectedImage.id]: url }))
            objectUrlsRef.current.push(url)
          }
        } catch {}
      }
    }
    fetchImage()
    // Clean up image URL when dialog closes
    return () => {
      if (selectedImage && imageUrls[selectedImage.id]) {
        URL.revokeObjectURL(imageUrls[selectedImage.id])
        setImageUrls((prev) => {
          const copy = { ...prev }
          delete copy[selectedImage.id]
          return copy
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage])

  const handleEditClick = (image: DatasetItem) => {
    setSelectedImage(image)
    setEditLabel(image.label)
    setEditNotes(image.notes)
    setEditDialogOpen(true)
  }

  const handleViewClick = (image: DatasetItem) => {
    setSelectedImage(image)
    setViewDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedImage) return

    try {
      const response = await fetch(`http://localhost:5000/api/dataset/${selectedImage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: editLabel,
          notes: editNotes,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update item')
      }

      const result = await response.json()
      if (result.success) {
        // Refresh the dataset
        fetchDataset()
        setEditDialogOpen(false)
      }
    } catch (error) {
      console.error('Error updating item:', error)
      alert('Failed to update item')
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`http://localhost:5000/api/dataset/${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete item')
      }

      const result = await response.json()
      if (result.success) {
        // Refresh the dataset
        fetchDataset()
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search files..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {selectedLabel ? (selectedLabel === "tumor" ? "Tumor" : "No Tumor") : "All Labels"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedLabel(null)}>All Labels</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedLabel("tumor")}>Tumor</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedLabel("no_tumor")}>No Tumor</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dataset...</span>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Preview</TableHead>
                  <TableHead>Filename</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead className="hidden md:table-cell">Upload Date</TableHead>
                  <TableHead className="hidden md:table-cell">Size</TableHead>
                  <TableHead className="hidden md:table-cell">Notes</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataset.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.thumbnail_path && thumbnailUrls[item.id] ? (
                        <img
                          src={thumbnailUrls[item.id]}
                          alt={item.filename}
                          className="w-10 h-10 object-cover rounded-md"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <PlaceholderImage
                        width={40}
                        height={40}
                        alt={item.filename}
                        className={`w-10 h-10 object-cover rounded-md ${item.thumbnail_path && thumbnailUrls[item.id] ? 'hidden' : ''}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.filename}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${item.label === "tumor" ? "bg-red-500" : "bg-green-500"}`}
                        ></div>
                        <span>{item.label === "tumor" ? "Tumor" : "No Tumor"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(item.upload_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{item.size_kb} KB</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {item.notes ? item.notes : <span className="text-gray-400">-</span>}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewClick(item)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(item)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {dataset.length} of {totalItems} items
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
            <DialogDescription>Update the label and notes for this image.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Label</Label>
              <RadioGroup value={editLabel} onValueChange={setEditLabel} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tumor" id="edit-tumor" />
                  <Label htmlFor="edit-tumor">Tumor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no_tumor" id="edit-no-tumor" />
                  <Label htmlFor="edit-no-tumor">No Tumor</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add any notes about this image..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-emerald-600 hover:bg-emerald-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.filename}</DialogTitle>
            <DialogDescription>Image details and preview</DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="flex justify-center">
                {imageUrls[selectedImage.id] ? (
                  <img
                    src={imageUrls[selectedImage.id]}
                    alt={selectedImage.filename}
                    className="max-w-full max-h-96 object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.png'
                    }}
                  />
                ) : (
                  <PlaceholderImage
                    width={200}
                    height={200}
                    alt={selectedImage.filename}
                    className="max-w-full max-h-96 object-contain rounded-lg"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Label:</strong> {selectedImage.label === "tumor" ? "Tumor" : "No Tumor"}
                </div>
                <div>
                  <strong>Size:</strong> {selectedImage.size_kb} KB
                </div>
                <div>
                  <strong>Upload Date:</strong> {new Date(selectedImage.upload_date).toLocaleDateString()}
                </div>
                <div>
                  <strong>Notes:</strong> {selectedImage.notes || "No notes"}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
