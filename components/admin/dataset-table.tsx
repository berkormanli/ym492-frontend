"use client"

import { useState, useEffect } from "react"
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
import { MoreHorizontal, Search, Filter, Download, Trash2, Edit, Eye } from "lucide-react"

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
  const [selectedImage, setSelectedImage] = useState<(typeof mockDataset)[0] | null>(null)
  const [editLabel, setEditLabel] = useState<string>("")
  const [editNotes, setEditNotes] = useState<string>("")

  const itemsPerPage = 10
  const totalPages = Math.ceil(mockDataset.length / itemsPerPage)

  // Filter the dataset based on search query and selected label
  const filteredDataset = mockDataset.filter((item) => {
    const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLabel = selectedLabel ? item.label === selectedLabel : true
    return matchesSearch && matchesLabel
  })

  // Get the current page of data
  const currentData = filteredDataset.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleEditClick = (image: (typeof mockDataset)[0]) => {
    setSelectedImage(image)
    setEditLabel(image.label)
    setEditNotes(image.notes)
    setEditDialogOpen(true)
  }

  const handleViewClick = (image: (typeof mockDataset)[0]) => {
    setSelectedImage(image)
    setViewDialogOpen(true)
  }

  const handleSaveEdit = () => {
    // In a real app, you would save the changes to your backend here
    console.log("Saving changes:", { id: selectedImage?.id, label: editLabel, notes: editNotes })
    setEditDialogOpen(false)
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
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedLabel(null)}>All Images</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedLabel("tumor")}>Tumor Images</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedLabel("no_tumor")}>No Tumor Images</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className="h-9">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

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
            {currentData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <PlaceholderImage
                    width={40}
                    height={40}
                    alt={item.filename}
                    className="w-10 h-10 object-cover rounded-md"
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
                <TableCell className="hidden md:table-cell">{item.uploadDate.toLocaleDateString()}</TableCell>
                <TableCell className="hidden md:table-cell">{item.size} KB</TableCell>
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
                      <DropdownMenuItem className="text-red-600">
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

      {filteredDataset.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No images found matching your search criteria.</p>
        </div>
      )}

      {filteredDataset.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredDataset.length)} of {filteredDataset.length} images
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
            <DialogDescription>Update the label and notes for this image.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex justify-center">
              <PlaceholderImage
                width={256}
                height={256}
                alt={selectedImage?.filename || "Image preview"}
                className="w-64 h-64 object-cover rounded-md"
              />
            </div>

            <div>
              <Label className="text-base">Image Classification</Label>
              <RadioGroup value={editLabel} onValueChange={setEditLabel} className="mt-2 flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no_tumor" id="edit-no-tumor" />
                  <Label
                    htmlFor="edit-no-tumor"
                    className="flex items-center space-x-2 cursor-pointer py-2 px-3 rounded-md hover:bg-gray-100"
                  >
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>No Tumor</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tumor" id="edit-tumor" />
                  <Label
                    htmlFor="edit-tumor"
                    className="flex items-center space-x-2 cursor-pointer py-2 px-3 rounded-md hover:bg-gray-100"
                  >
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Tumor Present</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="edit-notes" className="text-base">
                Additional Notes
              </Label>
              <Textarea
                id="edit-notes"
                placeholder="Add any relevant information about this image..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="mt-2"
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedImage?.filename}</DialogTitle>
            <DialogDescription>Uploaded on {selectedImage?.uploadDate.toLocaleDateString()}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex justify-center">
              <PlaceholderImage
                width={400}
                height={400}
                alt={selectedImage?.filename || "Image preview"}
                className="max-h-[400px] object-contain rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Label</p>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      selectedImage?.label === "tumor" ? "bg-red-500" : "bg-green-500"
                    }`}
                  ></div>
                  <span>{selectedImage?.label === "tumor" ? "Tumor" : "No Tumor"}</span>
                </div>
              </div>

              <div>
                <p className="font-medium">File Size</p>
                <p className="mt-1">{selectedImage?.size} KB</p>
              </div>

              <div className="col-span-2">
                <p className="font-medium">Notes</p>
                <p className="mt-1">
                  {selectedImage?.notes ? selectedImage.notes : <span className="text-gray-400">No notes</span>}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
