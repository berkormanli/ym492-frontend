"use client"

import { useState, useRef, useEffect } from "react"
import { ImageUploader } from "./image-uploader"
import { ImagePreview } from "./image-preview"
import { ResultsDisplay } from "./results-display"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { HistoryPanel } from "./history-panel"
import { useIsMobile } from "@/hooks/use-mobile"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

type AnalysisResult = {
  hasTumor: boolean
  confidence: number
  tumor_percentage: number
  heatmapUrl?: string
  regions?: {
    x: number
    y: number
    width: number
    height: number
  }[]
}

type HistoryItem = {
  id: string
  timestamp: Date
  imageUrl: string
  result: AnalysisResult
}

export function MriAnalyzer() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [models, setModels] = useState<any>({})
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const imageUploadRef = useRef<HTMLDivElement>(null)

  const handleImageUpload = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setResult(null)
  }

  const handleAnalyze = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)

    try {
      // Convert data URL to blob
      const response = await fetch(selectedImage)
      const blob = await response.blob()

      // Create form data
      const formData = new FormData()
      formData.append('file', blob, 'mri_image.jpg')
      formData.append('save_to_history', 'true')

      // Call the prediction API
      const { apiCall, API_ENDPOINTS } = await import('@/lib/api')
      const apiResult = await apiCall(API_ENDPOINTS.predict, {
        method: 'POST',
        body: formData,
      })

      if (!apiResult.success) {
        throw new Error(apiResult.error || 'Prediction failed')
      }

      const predictionData = apiResult.data

      // Convert API result to our format
      const analysisResult: AnalysisResult = {
        hasTumor: predictionData.hasTumor,
        confidence: predictionData.confidence,
        tumor_percentage: predictionData.tumor_percentage,
        heatmapUrl: predictionData.heatmap_url ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${predictionData.heatmap_url}` : selectedImage,
        regions: predictionData.regions || [],
      }

      setResult(analysisResult)

      // Add to history
      const historyItem: HistoryItem = {
        id: predictionData.id,
        timestamp: new Date(predictionData.timestamp),
        imageUrl: predictionData.image_url ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${predictionData.image_url}` : selectedImage,
        result: analysisResult,
      }

      setHistory((prev) => [historyItem, ...prev])
    } catch (error) {
      console.error("Analysis failed:", error)
      // Show error to user
      alert(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Fetch models and versions from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/models")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setModels(data.data.models)
          // Set default selection to current model/version if available
          if (data.data.current_model) setSelectedModel(data.data.current_model)
          if (data.data.current_version) setSelectedVersion(data.data.current_version)
        }
      })
      .catch((e) => console.error("Failed to fetch models", e))
  }, [])

  useEffect(() => {
    // Scroll to results when analysis is complete and results exist
    if (!isAnalyzing && result && resultsRef.current) {
      // Add a small delay to ensure the DOM has updated, especially important for mobile
      setTimeout(() => {
        resultsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }, 100)
    }
  }, [isAnalyzing, result])

  const isMobile = useIsMobile()

  useEffect(() => {
    // Additional mobile-specific scrolling logic
    if (isMobile && !isAnalyzing && result && resultsRef.current) {
      // Use a slightly longer delay for mobile to ensure layout has settled
      setTimeout(() => {
        // On mobile, we need to be more aggressive with scrolling
        window.scrollTo({
          top: resultsRef.current.offsetTop - 20,
          behavior: "smooth",
        })
      }, 300)
    }
  }, [isMobile, isAnalyzing, result])

  // Add this new useEffect for scrolling when an image is uploaded
  useEffect(() => {
    // Scroll to results section when an image is uploaded
    if (selectedImage && imageUploadRef.current) {
      imageUploadRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [selectedImage])

  // Switch model/version when user selects from dropdown
  const handleModelSelect = async (modelName: string, version: string) => {
    setSelectedModel(modelName)
    setSelectedVersion(version)
    try {
      const response = await fetch("http://localhost:5000/api/models/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model_name: modelName, version }),
      })
      const result = await response.json()
      if (!result.success) {
        alert(result.error || "Model switch failed")
      } else {
        // Refetch models to update 'Aktif' tag
        fetch("http://localhost:5000/api/models")
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setModels(data.data.models)
              if (data.data.current_model) setSelectedModel(data.data.current_model)
              if (data.data.current_version) setSelectedVersion(data.data.current_version)
            }
          })
      }
    } catch (e) {
      alert("Model switch failed")
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">MR Sonucunu Yükleyin</h2>
        <ImageUploader onImageUpload={handleImageUpload} />
      </div>

      {selectedImage && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200" ref={imageUploadRef}>
            <h3 className="text-lg font-medium text-gray-700 mb-3">MR Önizleme</h3>
            <ImagePreview imageUrl={selectedImage} result={result} />

            <div className="mt-4 flex justify-center gap-2">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !selectedImage}
                className="bg-emerald-600 hover:bg-emerald-700"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    MR inceleniyor...
                  </>
                ) : (
                  "İncele"
                )}
              </Button>
              {/* Model selection dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg" className="flex items-center gap-2">
                    {selectedModel ? `${selectedModel}${selectedVersion ? ` v${selectedVersion}` : ''}` : 'Model Seç'} <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-64 overflow-y-auto min-w-[220px]">
                  {Object.keys(models).length === 0 && (
                    <DropdownMenuItem disabled>Model bulunamadı</DropdownMenuItem>
                  )}
                  {Object.entries(models).map(([modelName, modelData]: [string, any]) => (
                    <div key={modelName}>
                      <div className="px-3 py-1 text-xs font-semibold text-gray-500">{modelName}</div>
                      {modelData.versions.map((ver: any) => (
                        <DropdownMenuItem
                          key={ver.version}
                          onClick={() => handleModelSelect(modelName, ver.version)}
                          className={
                            selectedModel === modelName && selectedVersion === ver.version
                              ? 'bg-emerald-100 text-emerald-700'
                              : ''
                          }
                        >
                          v{ver.version} {ver.is_current ? <span className="ml-2 text-xs text-emerald-600">(Aktif)</span> : null}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {result ? (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200" ref={resultsRef}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Analiz Sonuçları</h2>
              <ResultsDisplay result={result} />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-500 py-12">
                <h3 className="text-lg font-medium mb-2">Herhangi Bir Analiz Sonucu Mevcut Değil</h3>
                <p>"İncele"ye basarak sonucu görebilirsiniz.</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Analiz Geçmişi</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <HistoryPanel history={history} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
