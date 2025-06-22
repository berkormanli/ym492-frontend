"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BrainCircuit, CheckCircle, AlertTriangle, Loader2, Play, Square } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

type TrainingStatus = "idle" | "preparing" | "training" | "evaluating" | "complete" | "failed" | "stopped"

type TrainingConfig = {
  model_name: string
  version: string
  epochs: number
  batch_size: number
  validation_split: number
  base_model_type: string
}

type TrainingStatusData = {
  session_id: string | null
  status: TrainingStatus
  progress: number
  current_epoch: number
  total_epochs: number
  logs: string[]
  metrics: {
    accuracy?: number
    loss?: number
    val_accuracy?: number
    val_loss?: number
  }
}

export function ModelTraining() {
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatusData>({
    session_id: null,
    status: "idle",
    progress: 0,
    current_epoch: 0,
    total_epochs: 0,
    logs: [],
    metrics: {}
  })
  
  const [config, setConfig] = useState<TrainingConfig>({
    model_name: "brain_tumor_model",
    version: "1.0.0",
    epochs: 20,
    batch_size: 32,
    validation_split: 0.2,
    base_model_type: "VGG19"
  })

  const [availableModels, setAvailableModels] = useState<any[]>([])
  const [trainingSessions, setTrainingSessions] = useState<any[]>([])
  const { toast } = useToast()
  const [modelVersions, setModelVersions] = useState<{ [model: string]: any[] }>({})
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [currentModelMetrics, setCurrentModelMetrics] = useState<any>(null)
  const [compareModels, setCompareModels] = useState<{ model_name: string; version?: string }[]>([])
  const [comparisonResult, setComparisonResult] = useState<any>(null)

  // Fetch training status periodically
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/models/training/status')
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setTrainingStatus(result.data)
          }
        }
      } catch (error) {
        console.error('Error fetching training status:', error)
      }
    }

    // Fetch immediately
    fetchStatus()

    // Set up polling when training is active
    let interval: NodeJS.Timeout | null = null
    if (trainingStatus.status === "preparing" || trainingStatus.status === "training" || trainingStatus.status === "evaluating") {
      interval = setInterval(fetchStatus, 2000) // Poll every 2 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [trainingStatus.status])

  // Fetch available models and training sessions
  useEffect(() => {
    fetchModels()
    fetchTrainingSessions()
  }, [])

  // Fetch model versions when a model is selected
  useEffect(() => {
    if (selectedModel) {
      fetch(`http://localhost:5000/api/models/${selectedModel}/versions`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setModelVersions(prev => ({ ...prev, [selectedModel]: data.data.versions }))
          }
        })
    }
  }, [selectedModel])

  // Fetch current model metrics
  useEffect(() => {
    fetch('http://localhost:5000/api/models/current')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCurrentModelMetrics(data.data)
        }
      })
  }, [trainingStatus.status])

  const fetchModels = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/models')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const modelsList = Object.entries(result.data.models).map(([name, data]: [string, any]) => ({
            name,
            ...data
          }))
          setAvailableModels(modelsList)
        }
      }
    } catch (error) {
      console.error('Error fetching models:', error)
    }
  }

  const fetchTrainingSessions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/models/training/sessions')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setTrainingSessions(result.data.sessions.slice(0, 5)) // Last 5 sessions
        }
      }
    } catch (error) {
      console.error('Error fetching training sessions:', error)
    }
  }

  const startTraining = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/models/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        throw new Error('Failed to start training')
      }

      const result = await response.json()
      if (result.success) {
        console.log('Training started:', result.data)
        // Status will be updated by the polling effect
      } else {
        throw new Error(result.error || 'Failed to start training')
      }
    } catch (error) {
      console.error('Error starting training:', error)
      alert(`Failed to start training: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const stopTraining = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/models/training/stop', {
        method: 'POST',
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Training stop requested:', result)
      }
    } catch (error) {
      console.error('Error stopping training:', error)
    }
  }

  const switchModel = async (model_name: string, version?: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/models/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_name, version })
      })
      const result = await response.json()
      if (result.success) {
        toast({ title: 'Model switched', description: result.message })
        fetchModels()
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to switch model', variant: 'destructive' })
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to switch model', variant: 'destructive' })
    }
  }

  const deleteModelVersion = async (model_name: string, version: string) => {
    if (!window.confirm(`Delete version ${version} of model ${model_name}?`)) return
    try {
      const response = await fetch(`http://localhost:5000/api/models/${model_name}/${version}`, { method: 'DELETE' })
      const result = await response.json()
      if (result.success) {
        toast({ title: 'Version deleted', description: result.message })
        fetchModels()
        setModelVersions(prev => ({ ...prev, [model_name]: (prev[model_name] || []).filter(v => v.version !== version) }))
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to delete version', variant: 'destructive' })
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to delete version', variant: 'destructive' })
    }
  }

  const compareSelectedModels = async () => {
    if (compareModels.length < 2) {
      toast({ title: 'Select at least 2 models to compare', variant: 'destructive' })
      return
    }
    try {
      const response = await fetch('http://localhost:5000/api/models/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ models: compareModels })
      })
      const result = await response.json()
      if (result.success) {
        setComparisonResult(result.data.comparison)
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to compare models', variant: 'destructive' })
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to compare models', variant: 'destructive' })
    }
  }

  const getStatusColor = (status: TrainingStatus) => {
    switch (status) {
      case "idle":
        return "text-gray-500"
      case "preparing":
      case "training":
      case "evaluating":
        return "text-blue-500"
      case "complete":
        return "text-green-500"
      case "failed":
        return "text-red-500"
      case "stopped":
        return "text-yellow-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusIcon = (status: TrainingStatus) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "failed":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "preparing":
      case "training":
      case "evaluating":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <BrainCircuit className="h-5 w-5 text-gray-500" />
    }
  }

  const isTrainingActive = ["preparing", "training", "evaluating"].includes(trainingStatus.status)

  return (
    <Tabs defaultValue="training" className="space-y-6">
      <TabsList>
        <TabsTrigger value="training">Start Training</TabsTrigger>
        <TabsTrigger value="status">Training Status</TabsTrigger>
        <TabsTrigger value="history">Training History</TabsTrigger>
        <TabsTrigger value="models">Available Models</TabsTrigger>
      </TabsList>

      <TabsContent value="training" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Training Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="model-name">Model Name</Label>
                <Input
                  id="model-name"
                  value={config.model_name}
                  onChange={(e) => setConfig({ ...config, model_name: e.target.value })}
                  disabled={isTrainingActive}
                />
              </div>
              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={config.version}
                  onChange={(e) => setConfig({ ...config, version: e.target.value })}
                  disabled={isTrainingActive}
                />
              </div>
              <div>
                <Label htmlFor="epochs">Epochs</Label>
                <Input
                  id="epochs"
                  type="number"
                  value={config.epochs}
                  onChange={(e) => setConfig({ ...config, epochs: parseInt(e.target.value) || 20 })}
                  disabled={isTrainingActive}
                />
              </div>
              <div>
                <Label htmlFor="batch-size">Batch Size</Label>
                <Input
                  id="batch-size"
                  type="number"
                  value={config.batch_size}
                  onChange={(e) => setConfig({ ...config, batch_size: parseInt(e.target.value) || 32 })}
                  disabled={isTrainingActive}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={startTraining}
                disabled={isTrainingActive}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Training
              </Button>
              
              {isTrainingActive && (
                <Button
                  onClick={stopTraining}
                  variant="destructive"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Training
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="status" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(trainingStatus.status)}
              Training Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <span className={`text-sm font-medium capitalize ${getStatusColor(trainingStatus.status)}`}>
                {trainingStatus.status}
              </span>
            </div>

            {trainingStatus.progress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{trainingStatus.progress}%</span>
                </div>
                <Progress value={trainingStatus.progress} className="h-2" />
              </div>
            )}

            {trainingStatus.total_epochs > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span>Epoch:</span>
                <span>{trainingStatus.current_epoch} / {trainingStatus.total_epochs}</span>
              </div>
            )}

            {Object.keys(trainingStatus.metrics).length > 0 && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                {trainingStatus.metrics.accuracy && (
                  <div>
                    <span className="font-medium">Accuracy:</span> {(trainingStatus.metrics.accuracy * 100).toFixed(2)}%
                  </div>
                )}
                {trainingStatus.metrics.loss && (
                  <div>
                    <span className="font-medium">Loss:</span> {trainingStatus.metrics.loss.toFixed(4)}
                  </div>
                )}
                {trainingStatus.metrics.val_accuracy && (
                  <div>
                    <span className="font-medium">Val Accuracy:</span> {(trainingStatus.metrics.val_accuracy * 100).toFixed(2)}%
                  </div>
                )}
                {trainingStatus.metrics.val_loss && (
                  <div>
                    <span className="font-medium">Val Loss:</span> {trainingStatus.metrics.val_loss.toFixed(4)}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {trainingStatus.logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Training Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
                {trainingStatus.logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="history" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Training History</CardTitle>
          </CardHeader>
          <CardContent>
            {trainingSessions.length > 0 ? (
              <div className="space-y-4">
                {trainingSessions.map((session, index) => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{session.model_name} v{session.version}</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        session.status === 'complete' ? 'bg-green-100 text-green-800' :
                        session.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>Started: {new Date(session.start_time).toLocaleString()}</div>
                      <div>Epochs: {session.epochs}</div>
                      {session.accuracy && (
                        <div>Accuracy: {(session.accuracy * 100).toFixed(2)}%</div>
                      )}
                      {session.loss && (
                        <div>Loss: {session.loss.toFixed(4)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No training sessions found</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="models" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Models</CardTitle>
          </CardHeader>
          <CardContent>
            {availableModels.length > 0 ? (
              <div className="space-y-4">
                {availableModels.map((model, index) => (
                  <div key={model.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-sm text-gray-500">
                        {model.total_versions} version{model.total_versions !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Current version: {model.current_version || 'None'}
                    </div>
                    <div className="flex gap-2 mb-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedModel(model.name)}>
                        View Versions
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => switchModel(model.name)}>
                        Switch to Model
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setCompareModels(prev => [...prev, { model_name: model.name }])}>
                        Add to Compare
                      </Button>
                    </div>
                    {/* Show versions if selected */}
                    {selectedModel === model.name && modelVersions[model.name] && (
                      <div className="ml-4 mt-2 space-y-2">
                        {modelVersions[model.name].map((ver: any) => (
                          <div key={ver.version} className="flex items-center gap-2">
                            <span className="text-xs">v{ver.version}</span>
                            <Button size="xs" variant="outline" onClick={() => switchModel(model.name, ver.version)}>
                              Switch to Version
                            </Button>
                            <Button size="xs" variant="destructive" onClick={() => deleteModelVersion(model.name, ver.version)}>
                              Delete
                            </Button>
                            <Button size="xs" variant="outline" onClick={() => setCompareModels(prev => [...prev, { model_name: model.name, version: ver.version }])}>
                              Add to Compare
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {/* Compare models UI */}
                {compareModels.length > 0 && (
                  <div className="mt-4 p-2 border rounded">
                    <div className="mb-2 font-medium">Models to Compare:</div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {compareModels.map((m, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {m.model_name}{m.version ? ` v${m.version}` : ''}
                        </span>
                      ))}
                    </div>
                    <Button size="sm" onClick={compareSelectedModels} className="mr-2">Compare</Button>
                    <Button size="sm" variant="outline" onClick={() => { setCompareModels([]); setComparisonResult(null); }}>Clear</Button>
                    {comparisonResult && (
                      <div className="mt-4">
                        <div className="font-medium mb-2">Comparison Result:</div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-xs border">
                            <thead>
                              <tr>
                                <th className="border px-2 py-1">Model</th>
                                <th className="border px-2 py-1">Version</th>
                                <th className="border px-2 py-1">Accuracy</th>
                                <th className="border px-2 py-1">Loss</th>
                                <th className="border px-2 py-1">Parameters</th>
                                <th className="border px-2 py-1">Input Shape</th>
                              </tr>
                            </thead>
                            <tbody>
                              {comparisonResult.map((row: any, i: number) => (
                                <tr key={i}>
                                  <td className="border px-2 py-1">{row.model_name}</td>
                                  <td className="border px-2 py-1">{row.version}</td>
                                  <td className="border px-2 py-1">{row.accuracy}</td>
                                  <td className="border px-2 py-1">{row.loss}</td>
                                  <td className="border px-2 py-1">{row.total_parameters}</td>
                                  <td className="border px-2 py-1">{row.input_shape}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No models available</p>
            )}
            {/* Current model metrics */}
            {currentModelMetrics && currentModelMetrics.current_model && (
              <div className="mt-6 p-4 border rounded">
                <div className="font-medium mb-2">Current Model: {currentModelMetrics.current_model}</div>
                {currentModelMetrics.metrics && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(currentModelMetrics.metrics).map(([k, v]) => (
                      <div key={k}><span className="font-semibold">{k}:</span> {typeof v === 'number' ? v.toFixed(4) : String(v)}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
