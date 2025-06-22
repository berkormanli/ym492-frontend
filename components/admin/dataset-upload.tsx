"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, X, Check, AlertCircle } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

type ImageLabel = "tumor" | "no_tumor" | null

export function DatasetUpload() {
  // Add the placeholder image constant at the top of the component
  const placeholderImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100' fill='none'%3E%3Crect width='100' height='100' fill='%23E5E7EB'/%3E%3Cpath d='M30 50 L70 50 M50 30 L50 70' stroke='%239CA3AF' strokeWidth='2'/%3E%3C/svg%3E`

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [batchLabel, setBatchLabel] = useState<ImageLabel>("no_tumor")
  const [notes, setNotes] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const newFiles = Array.from(e.target.files)
    setSelectedFiles((prev) => [...prev, ...newFiles])

    // Create previews for the new files
    const newPreviews: string[] = []
    const newNotes: string[] = []

    newFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        newPreviews.push(reader.result as string)
        newNotes.push("")

        if (newPreviews.length === newFiles.length) {
          setPreviews((prev) => [...prev, ...newPreviews])
          setNotes((prev) => [...prev, ...newNotes])
        }
      }
      reader.readAsDataURL(file)
    })

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return

    const newFiles = Array.from(e.dataTransfer.files)
    setSelectedFiles((prev) => [...prev, ...newFiles])

    // Create previews for the new files
    const newPreviews: string[] = []
    const newNotes: string[] = []

    newFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        newPreviews.push(reader.result as string)
        newNotes.push("")

        if (newPreviews.length === newFiles.length) {
          setPreviews((prev) => [...prev, ...newPreviews])
          setNotes((prev) => [...prev, ...newNotes])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
    setNotes((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(false)
    try {
      const batchSize = 50
      let failedFiles: string[] = []
      for (let i = 0; i < selectedFiles.length; i += batchSize) {
        const batchFiles = selectedFiles.slice(i, i + batchSize)
        const batchNotes = notes.slice(i, i + batchSize)
        const formData = new FormData()
        batchFiles.forEach((file) => {
          formData.append('files', file)
        })
        formData.append('labels', batchLabel || '')
        batchNotes.forEach((note) => {
          formData.append('notes', note)
        })
        const response = await fetch('http://localhost:5000/api/dataset/upload', {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`)
        }
        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Upload failed')
        }
        if (result.failed && result.failed.length && result.failed.length > 0) {
          failedFiles = failedFiles.concat(result.failed.map((f: any) => f.filename))
        }
      }
      if (failedFiles.length > 0) {
        setUploadError(`Some files failed to upload: ${failedFiles.join(', ')}`)
      }
      setSelectedFiles([])
      setPreviews([])
      setNotes([])
      setUploadSuccess(true)
      setTimeout(() => {
        setUploadSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Upload failed:", error)
      setUploadError(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {uploadSuccess && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription>Images successfully uploaded to the dataset.</AlertDescription>
        </Alert>
      )}

      {uploadError && (
        <Alert className="bg-red-50 border-red-200 text-red-800">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      <div
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-emerald-400"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-gray-100 rounded-full">
            <Upload className="h-8 w-8 text-gray-500" />
          </div>
          <div>
            <p className="text-gray-700 font-medium">Drag & drop MRI images here</p>
            <p className="text-gray-500 text-sm mt-1">or click to browse files</p>
          </div>
          <p className="text-xs text-gray-400">Supported formats: DICOM, JPG, PNG</p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".dcm,image/dicom,image/jpeg,image/png"
          multiple
          onChange={handleFileChange}
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Selected Images ({selectedFiles.length})</h3>
            <Button variant="outline" size="sm" onClick={() => setSelectedFiles([])}>
              Clear All
            </Button>
          </div>

          <div className="mb-4">
            <Label className="text-base">Batch Image Classification</Label>
            <RadioGroup
              defaultValue="no_tumor"
              className="mt-2 flex space-x-4"
              onValueChange={(value) => setBatchLabel(value as ImageLabel)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no_tumor" id="no_tumor_batch" />
                <Label
                  htmlFor="no_tumor_batch"
                  className="flex items-center space-x-2 cursor-pointer py-2 px-3 rounded-md hover:bg-gray-100"
                >
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>No Tumor</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tumor" id="tumor_batch" />
                <Label
                  htmlFor="tumor_batch"
                  className="flex items-center space-x-2 cursor-pointer py-2 px-3 rounded-md hover:bg-gray-100"
                >
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Tumor Present</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-6">
            {previews.map((preview, index) => (
              <Card key={index} className="p-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="relative">
                    <img
                      src={preview || placeholderImage}
                      alt={`MRI preview ${index + 1}`}
                      className="w-full h-48 object-cover rounded-md bg-gray-100"
                    />
                    <button
                      className="absolute top-2 right-2 p-1 bg-gray-800 bg-opacity-70 rounded-full text-white"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      {selectedFiles[index].name} ({(selectedFiles[index].size / 1024).toFixed(1)} KB)
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button
            onClick={handleUpload}
            disabled={isUploading || selectedFiles.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isUploading ? "Uploading..." : `Upload ${selectedFiles.length} Images to Dataset`}
          </Button>
        </div>
      )}
    </div>
  )
}
