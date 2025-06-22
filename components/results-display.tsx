"use client"

import { AlertTriangle, CheckCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface ResultsDisplayProps {
  result: {
    hasTumor: boolean
    confidence: number
    tumor_percentage: number
    regions?: {
      x: number
      y: number
      width: number
      height: number
    }[]
  }
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const confidencePercent = result.hasTumor ? result.tumor_percentage : Math.round(result.confidence * 100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <div
          className={`flex items-center justify-center p-4 rounded-full ${
            result.hasTumor ? "bg-red-100" : "bg-green-100"
          }`}
        >
          {result.hasTumor ? (
            <AlertTriangle className="h-12 w-12 text-red-500" />
          ) : (
            <CheckCircle className="h-12 w-12 text-green-500" />
          )}
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">{result.hasTumor ? "Tümör Algılandı" : "Tümör Algılanmadı"}</h3>
        <p className="text-gray-600">
          {result.hasTumor
            ? (result.tumor_percentage == 100.0
                ? "Model, görüntüde %100 oranında tümör tespiti yapmıştır. Tıbbi uzman tarafından acilen değerlendirilmesi önerilir."
                : (result.tumor_percentage > 70
                    ? "Model, görüntüde yüksek olasılıkla tümör bulunduğunu tahmin etmektedir. Kesin tanı için uzman incelemesi önerilir."
                    : "Orta düzeyde tümör ihtimali gözlemlenmiştir.")
              )
            : "Tümör Tespit Edilmedi"}
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Yapay Zeka Güven Skoru</span>
          <span className="text-sm font-bold">{confidencePercent}%</span>
        </div>
        <Progress value={confidencePercent} className="h-2" />
      </div>

      {result.hasTumor && result.regions && result.regions.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Tespit Edilen Bölgeler</h4>
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            {result.regions.map((region, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 mb-1">
                <div>Bölge {index + 1}:</div>
                <div>x: {region.x}</div>
                <div>y: {region.y}</div>
                <div>
                  Boyut: {region.width}×{region.height}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-sm text-blue-700">
        <p className="font-bold">Tıbbi Uyarı</p>
        <p>
          Bu sonucu yapay zeka üretmiş olup tıbbi uzmanlarca onaylanması gerekmektedir. Bu araç uzmanların yerini almak için değil, onlara destek olması amacıyla geliştirilmiştir.
        </p>
      </div>
    </div>
  )
}
