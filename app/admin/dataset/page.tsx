"use client"

import { DatasetUpload } from "@/components/admin/dataset-upload"
import { DatasetTable } from "@/components/admin/dataset-table-new"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import React, { useEffect, useState } from "react"

export default function DatasetManagementPage() {
  const [stats, setStats] = useState<{
    total_images: number
    tumor_images: number
    no_tumor_images: number
    total_size_mb: number
    distribution: { tumor: number; no_tumor: number }
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch("http://localhost:5000/api/dataset/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data)
          setError(null)
        } else {
          setError(data.error || "Failed to fetch stats")
        }
      })
      .catch(() => setError("Failed to fetch stats"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dataset Management</h1>
        <p className="text-gray-500">Upload and manage MRI images for model training.</p>
      </div>

      <Tabs defaultValue="upload">
        <TabsList>
          <TabsTrigger value="upload">Upload Images</TabsTrigger>
          <TabsTrigger value="manage">Manage Dataset</TabsTrigger>
          <TabsTrigger value="stats">Dataset Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload MRI Images</CardTitle>
              <CardDescription>
                Upload new MRI images and label them for inclusion in the training dataset.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DatasetUpload />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Dataset Images</CardTitle>
              <CardDescription>View, edit, and manage all images in the training dataset.</CardDescription>
            </CardHeader>
            <CardContent>
              <DatasetTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Dataset Overview</CardTitle>
                <CardDescription>Current dataset composition and statistics.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-gray-400">Loading...</div>
                ) : error ? (
                  <div className="text-red-500">{error}</div>
                ) : stats ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Total Images</p>
                        <p className="text-2xl font-bold">{stats.total_images}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Total Size</p>
                        <p className="text-2xl font-bold">{stats.total_size_mb} MB</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Tumor Images</span>
                        <span>
                          {stats.tumor_images} ({stats.distribution.tumor}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="bg-red-500 h-full"
                          style={{ width: `${stats.distribution.tumor}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">No Tumor Images</span>
                        <span>
                          {stats.no_tumor_images} ({stats.distribution.no_tumor}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="bg-green-500 h-full"
                          style={{ width: `${stats.distribution.no_tumor}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Distribution</CardTitle>
                <CardDescription>Distribution of images across different categories.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center bg-gray-50">
                {loading ? (
                  <div className="text-gray-400">Loading...</div>
                ) : error ? (
                  <div className="text-red-500">{error}</div>
                ) : stats ? (
                  <div className="w-full flex flex-col items-center">
                    <div className="w-40 h-40 relative">
                      {/* Simple donut chart using CSS */}
                      <svg viewBox="0 0 36 36" className="w-full h-full">
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="4"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="4"
                          strokeDasharray={`${stats.distribution.tumor} ${100 - stats.distribution.tumor}`}
                          strokeDashoffset="25"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-red-500">
                          {stats.distribution.tumor}%
                        </span>
                        <span className="text-xs text-gray-500">Tumor</span>
                        <span className="text-lg font-bold text-green-500">
                          {stats.distribution.no_tumor}%
                        </span>
                        <span className="text-xs text-gray-500">No Tumor</span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Tumor: {stats.tumor_images} | No Tumor: {stats.no_tumor_images}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
