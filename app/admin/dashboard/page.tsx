"use client"
import React, { useEffect, useState, useRef } from "react"
import { ModelTraining } from "@/components/admin/model-training-new"
import { DashboardOverview } from "@/components/admin/dashboard-overview"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import { Clock, Activity, UploadCloud, Brain } from "lucide-react"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    total_scans: number
    detected_tumors: number
    detection_rate: number
    model_accuracy: number
    dataset_size: number
    dataset_tumor_ratio: number
    completed_trainings: number
    current_model: string
    system_status: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)
  const [recent, setRecent] = useState<any>(null)
  const [recentLoading, setRecentLoading] = useState(true)
  const [recentError, setRecentError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch("http://localhost:5000/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data)
          setError(null)
        } else {
          setError(data.error || "Failed to fetch dashboard stats")
        }
      })
      .catch(() => setError("Failed to fetch dashboard stats"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setAnalyticsLoading(true)
    fetch("http://localhost:5000/api/dashboard/usage?period=week")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAnalytics(data.data)
          setAnalyticsError(null)
        } else {
          setAnalyticsError(data.error || "Failed to fetch analytics")
        }
      })
      .catch(() => setAnalyticsError("Failed to fetch analytics"))
      .finally(() => setAnalyticsLoading(false))
  }, [])

  useEffect(() => {
    setRecentLoading(true)
    fetch("http://localhost:5000/api/dashboard/recent?limit=10")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRecent(data.data)
          setRecentError(null)
        } else {
          setRecentError(data.error || "Failed to fetch recent activity")
        }
      })
      .catch(() => setRecentError("Failed to fetch recent activity"))
      .finally(() => setRecentLoading(false))
  }, [])

  // Helper for time ago
  function timeAgo(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-gray-500">Manage your AI model and application settings.</p>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="model-training">Model Training</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : stats ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_scans}</div>
                  {/* You can add a trend here if available */}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Detected Tumors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.detected_tumors}</div>
                  <p className="text-xs text-muted-foreground">{stats.detection_rate}% of total scans</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.model_accuracy}%</div>
                  {/* You can add a trend here if available */}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stats.system_status === 'online' ? 'text-green-600' : 'text-red-600'}`}>{stats.system_status.charAt(0).toUpperCase() + stats.system_status.slice(1)}</div>
                  <p className="text-xs text-muted-foreground">All systems operational</p>
                </CardContent>
              </Card>
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Usage Analytics</CardTitle>
                <CardDescription>System usage over the last 30 days.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center bg-gray-50">
                {analyticsLoading ? (
                  <div className="text-gray-400">Loading analytics...</div>
                ) : analyticsError ? (
                  <div className="text-red-500">{analyticsError}</div>
                ) : analytics && analytics.time_series && analytics.time_series.length > 0 ? (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <svg viewBox="0 0 400 200" width="100%" height="200" className="bg-white rounded shadow">
                      {/* X and Y axis */}
                      <line x1="40" y1="10" x2="40" y2="180" stroke="#e5e7eb" strokeWidth="2" />
                      <line x1="40" y1="180" x2="390" y2="180" stroke="#e5e7eb" strokeWidth="2" />
                      {/* Total predictions line */}
                      {(() => {
                        const points = analytics.trends.total_predictions
                        const maxY = Math.max(...points, 1)
                        const stepX = (350 / (points.length - 1))
                        const polyPoints = points.map((y: number, i: number) => `${40 + i * stepX},${180 - (y / maxY) * 150}`).join(' ')
                        return <polyline fill="none" stroke="#6366f1" strokeWidth="2" points={polyPoints} />
                      })()}
                      {/* Tumor detections line */}
                      {(() => {
                        const points = analytics.trends.tumor_detections
                        const maxY = Math.max(...analytics.trends.total_predictions, 1)
                        const stepX = (350 / (points.length - 1))
                        const polyPoints = points.map((y: number, i: number) => `${40 + i * stepX},${180 - (y / maxY) * 150}`).join(' ')
                        return <polyline fill="none" stroke="#ef4444" strokeWidth="2" points={polyPoints} />
                      })()}
                      {/* Labels */}
                      <text x="50" y="30" fill="#6366f1" fontSize="12">Total</text>
                      <text x="100" y="50" fill="#ef4444" fontSize="12">Tumor</text>
                    </svg>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center"><span className="w-3 h-1.5 bg-indigo-500 inline-block mr-1"></span>Total Predictions</span>
                      <span className="flex items-center"><span className="w-3 h-1.5 bg-red-500 inline-block mr-1"></span>Tumor Detections</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">No analytics data</div>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events and activities.</CardDescription>
              </CardHeader>
              <CardContent>
                {recentLoading ? (
                  <div className="text-gray-400">Loading activity...</div>
                ) : recentError ? (
                  <div className="text-red-500">{recentError}</div>
                ) : recent && recent.activities && recent.activities.length > 0 ? (
                  <div className="space-y-4">
                    {recent.activities.map((activity: any, i: number) => (
                      <div key={i} className="flex items-center gap-4">
                        {/* Icon by type */}
                        {activity.type === 'prediction' ? (
                          <Brain className="w-5 h-5 text-indigo-500" />
                        ) : activity.type === 'training' ? (
                          <Activity className="w-5 h-5 text-emerald-500" />
                        ) : activity.type === 'dataset' ? (
                          <UploadCloud className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{activity.description}</p>
                          <p className="text-xs text-gray-500">{activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</p>
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap">{timeAgo(activity.timestamp)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400">No recent activity</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="model-training">
          <Card>
            <CardHeader>
              <CardTitle>AI Model Training</CardTitle>
              <CardDescription>
                Train a new model with the latest dataset or fine-tune the existing model.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ModelTraining />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
