"use client"

interface PlaceholderImageProps {
  className?: string
  width?: number
  height?: number
  alt?: string
}

export function PlaceholderImage({
  className,
  width = 100,
  height = 100,
  alt = "Placeholder image",
}: PlaceholderImageProps) {
  // Create a simple placeholder SVG with a plus sign
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
      <rect width="${width}" height="${height}" fill="#E5E7EB"/>
      <path d="${width * 0.3} ${height * 0.5} L${width * 0.7} ${height * 0.5} M${width * 0.5} ${height * 0.3} L${width * 0.5} ${height * 0.7}" stroke="#9CA3AF" strokeWidth="2"/>
    </svg>
  `

  // Convert SVG to a data URI
  const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`

  return <img src={dataUri || "/placeholder.svg"} alt={alt} className={className} />
}
