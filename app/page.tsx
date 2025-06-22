"use client"

import { MriAnalyzer } from "@/components/mri-analyzer"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8 text-center">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <Button onClick={() => router.push("/admin/dashboard")}>Yönetim Paneli</Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">TumorScan</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Yapay zeka destekli tümör algılama/analizi için MR sonuçlarınızı sisteme yükleyin. Bu araç sağlık çalışanlarının ön eleme yapabilmesini sağlamaktadır.
          </p>
        </header>

        <MriAnalyzer />

        <footer className="mt-16 text-center text-sm text-gray-500">
          <p className="mb-2">
            <strong>UYARI:</strong> Bu araç sağlık çalışanlarına destek amaçlı üretildi ve onların yerini alamaz. Her zaman bu alanda uzman bir sağlık çalışanına danışın.
          </p>
          <p>© {new Date().getFullYear()} TumorScan - Beyin Tümörü Algılama Asistanı</p>
        </footer>
      </div>
    </main>
  )
}
