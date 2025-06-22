"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImagePreviewProps {
  imageUrl: string
  result: {
    hasTumor?: boolean
    regions?: {
      x: number
      y: number
      width: number
      height: number
    }[]
  } | null
}

export function ImagePreview({ imageUrl, result }: ImagePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  // Load the image
  useEffect(() => {
    if (!imageUrl) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      setDimensions({
        width: img.width,
        height: img.height,
      })
      setImage(img)
      setZoom(1)
      setPosition({ x: 0, y: 0 })
    }
    img.src = imageUrl
  }, [imageUrl])

  // Draw the image with current zoom and position
  useEffect(() => {
    if (!canvasRef.current || !image) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Save the current state
    ctx.save()

    // Translate to the center of the canvas
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Apply transformations (translate to center, apply zoom and position, translate back)
    ctx.translate(centerX, centerY)
    ctx.scale(zoom, zoom)
    ctx.translate(-centerX + position.x, -centerY + position.y)

    // Draw the image centered
    const x = (canvas.width - image.width) / 2
    const y = (canvas.height - image.height) / 2
    ctx.drawImage(image, x, y, image.width, image.height)

    // If we have results with regions, draw them
    if (result?.regions && result.regions.length > 0) {
      ctx.strokeStyle = "rgba(255, 0, 0, 0.8)"
      ctx.lineWidth = 3 / zoom // Adjust line width based on zoom

      result.regions.forEach((region) => {
        ctx.beginPath()
        ctx.rect(x + region.x, y + region.y, region.width, region.height)
        ctx.stroke()

        // Add a semi-transparent overlay
        ctx.fillStyle = "rgba(255, 0, 0, 0.2)"
        ctx.fill()
      })
    }

    // Restore the state
    ctx.restore()
  }, [image, zoom, position, result])

  // Prevent default scroll behavior when mouse is over the canvas container
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const preventScroll = (e: WheelEvent) => {
      e.preventDefault()
    }

    // Add event listener with passive: false to allow preventDefault
    container.addEventListener("wheel", preventScroll, { passive: false })

    // Clean up
    return () => {
      container.removeEventListener("wheel", preventScroll)
    }
  }, [])

  // Handle mouse/touch events for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return
    e.preventDefault() // Prevent scrolling while dragging
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Handle zoom in/out
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 5)) // Limit max zoom to 5x
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.5)) // Limit min zoom to 0.5x
  }

  const handleReset = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    // No need to call preventDefault() here as it's handled by the useEffect
    if (e.deltaY < 0) {
      setZoom((prev) => Math.min(prev * 1.1, 5))
    } else {
      setZoom((prev) => Math.max(prev / 1.1, 0.5))
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div
        ref={containerRef}
        className="relative border border-gray-300 rounded-lg overflow-hidden bg-gray-100 max-w-full"
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width || 512}
          height={dimensions.height || 512}
          className="max-w-full h-auto cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        />
      </div>

      <div className="flex items-center gap-2 mt-3">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
          aria-label="Zoom out"
          className="h-8 w-8"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <div className="text-sm text-gray-600 min-w-[60px] text-center">{Math.round(zoom * 100)}%</div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          disabled={zoom >= 5}
          aria-label="Zoom in"
          className="h-8 w-8"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="icon" onClick={handleReset} aria-label="Reset zoom" className="h-8 w-8 ml-2">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-xs text-gray-500 mt-2">Sürükle çek • Kaydırıp yakınlaştır • Çift tıklayıp MR'ı orijinal hale getir</p>
    </div>
  )
}
