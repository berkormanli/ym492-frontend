"use client"
import { formatDistanceToNow } from "date-fns"
import { CheckCircle, AlertTriangle } from "lucide-react"

interface HistoryItem {
  id: string
  timestamp: Date
  imageUrl: string
  result: {
    hasTumor: boolean
    confidence: number
    tumor_percentage: number
  }
}

interface HistoryPanelProps {
  history: HistoryItem[]
}

export function HistoryPanel({ history }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div className="col-span-full text-center py-8 text-gray-500">
        <p>Henüz analiz geçmişi yok</p>
        <p className="text-sm mt-1">Analiz edilmiş MR'lar burada gözükecek.</p>
      </div>
    )
  }

  return (
    <>
      {history.map((item) => (
        <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="aspect-video bg-gray-100 relative">
            <img src={item.imageUrl || "/placeholder.svg"} alt="MRI" className="w-full h-full object-cover" />
            <div
              className={`absolute top-2 right-2 p-1 rounded-full ${
                item.result.hasTumor ? "bg-red-100" : "bg-green-100"
              }`}
            >
              {item.result.hasTumor ? (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>
          <div className="p-3">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">{item.result.hasTumor ? "Tümör Tespit Edildi" : "Tümör Tespit Edilmedi"}</div>
              <div className="text-xs text-gray-500">{formatDistanceToNow(item.timestamp, { addSuffix: true })}</div>
            </div>
            <div className="text-xs text-gray-500 mt-1">Güven skoru: {item.result.hasTumor ? item.result.tumor_percentage : Math.round(item.result.confidence * 100)}%</div>
          </div>
        </div>
      ))}
    </>
  )
}
