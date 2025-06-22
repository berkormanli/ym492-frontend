"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface ImageUploaderProps {
  onImageUpload: (imageUrls: string[], label: string) => void
}

export function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [label, setLabel] = useState("tumor")

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const imageUrls: string[] = [];
      Promise.all(
        acceptedFiles.map(async (file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              imageUrls.push(reader.result as string);
              resolve(reader.result as string);
            };
            reader.onerror = () => {
              reject();
            };
            reader.readAsDataURL(file);
          });
        })
      ).then(() => {
        onImageUpload(imageUrls, label);
      });
    },
    [onImageUpload, label],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/dicom": [],
      ".dcm": [],
    },
    maxFiles: 10,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? "border-emerald-500 bg-emerald-50" : "border-gray-300 hover:border-emerald-400"
      }`}
    >
      <input {...getInputProps()} multiple />
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="p-3 bg-gray-100 rounded-full">
          <Upload className="h-8 w-8 text-gray-500" />
        </div>
        <div>
          <p className="text-gray-700 font-medium">MR sonucunuzu buraya sürükleyip bırakın</p>
          <p className="text-gray-500 text-sm mt-1">ya da buraya basıp sonucu yükleyin.</p>
        </div>
        <p className="text-xs text-gray-400">Desteklenen dosya formatları: DICOM, JPG, PNG</p>
      </div>
    </div>
  )
}
