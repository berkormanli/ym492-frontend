"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Activity, Brain, Database, TrendingUp } from "lucide-react"

type DashboardStats = {
  total_scans: number
  detected_tumors: number
  detection_rate: number
  model_accuracy: number
  dataset_size: number
  dataset_tumor_ratio: number
  completed_trainings: number
  current_model: string
  system_status: string
}

type RecentActivity = {
  type: string
  timestamp: string
  description: string
  details: any
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:5000/api/dashboard/stats')
      const statsResult = await statsResponse.json()
      
      // Fetch recent activity
      const activityResponse = await fetch('http://localhost:5000/api/dashboard/recent?limit=5')
      const activityResult = await activityResponse.json()
      
      if (statsResult.success) {
        setStats(statsResult.data)
      }
      
      if (activityResult.success) {
        setRecentActivity(activityResult.data.activities)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_scans || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.detected_tumors || 0} tumors detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Detection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.detection_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Tumor detection percentage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.model_accuracy || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Current model: {stats?.current_model || 'None'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dataset Size</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.dataset_size || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.dataset_tumor_ratio || 0}% tumor images
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current system health and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${
              stats?.system_status === 'online' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="font-medium">
              {stats?.system_status === 'online' ? 'System Online' : 'System Offline'}
            </span>
            <span className="text-sm text-muted-foreground">
              • {stats?.completed_trainings || 0} completed trainings
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system activities and events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'prediction' ? 'bg-blue-500' :
                    activity.type === 'training' ? 'bg-green-500' :
                    activity.type === 'dataset' ? 'bg-purple-500' : 'bg-gray-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                    {activity.details && (
                      <div className="text-xs text-gray-400 mt-1">
                        {activity.type === 'prediction' && activity.details.confidence && (
                          <span>Confidence: {(activity.details.confidence * 100).toFixed(1)}%</span>
                        )}
                        {activity.type === 'training' && activity.details.accuracy && (
                          <span>Accuracy: {(activity.details.accuracy * 100).toFixed(1)}%</span>
                        )}
                        {activity.type === 'dataset' && activity.details.label && (
                          <span>Label: {activity.details.label}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
