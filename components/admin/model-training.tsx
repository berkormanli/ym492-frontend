"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BrainCircuit, CheckCircle, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type TrainingStatus = "idle" | "preparing" | "training" | "evaluating" | "complete" | "failed"

export function ModelTraining() {
  const [status, setStatus] = useState<TrainingStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])

  const startTraining = async () => {
    setStatus("preparing")
    setProgress(0)
    setLogs(["Initializing training environment..."])

    // Simulate the training process
    await simulateTrainingStep("preparing", 10, [
      "Loading training dataset...",
      "Validating data integrity...",
      "Initializing model architecture...",
    ])

    await simulateTrainingStep("training", 70, [
      "Starting training process...",
      "Epoch 1/10: loss=0.342, accuracy=0.876",
      "Epoch 2/10: loss=0.298, accuracy=0.891",
      "Epoch 3/10: loss=0.267, accuracy=0.903",
      "Epoch 4/10: loss=0.243, accuracy=0.912",
      "Epoch 5/10: loss=0.221, accuracy=0.921",
      "Epoch 6/10: loss=0.205, accuracy=0.928",
      "Epoch 7/10: loss=0.192, accuracy=0.934",
      "Epoch 8/10: loss=0.181, accuracy=0.939",
      "Epoch 9/10: loss=0.173, accuracy=0.943",
      "Epoch 10/10: loss=0.167, accuracy=0.946",
      "Training complete!",
    ])

    await simulateTrainingStep("evaluating", 20, [
      "Evaluating model on test dataset...",
      "Computing performance metrics...",
      "Generating confusion matrix...",
      "Calculating ROC curve...",
      "Final accuracy: 94.3%",
      "Final precision: 92.7%",
      "Final recall: 95.1%",
      "Final F1 score: 93.9%",
    ])

    // Randomly succeed or fail for demonstration
    const success = Math.random() > 0.2
    if (success) {
      setStatus("complete")
      setLogs((prev) => [...prev, "Model training successfully completed!"])
    } else {
      setStatus("failed")
      setLogs((prev) => [
        ...prev,
        "Error: Training process failed due to insufficient GPU memory.",
        "Please try again with a smaller batch size or contact system administrator.",
      ])
    }
  }

  const simulateTrainingStep = async (newStatus: TrainingStatus, progressIncrement: number, newLogs: string[]) => {
    setStatus(newStatus)

    for (const log of newLogs) {
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))
      setLogs((prev) => [...prev, log])
      setProgress((prev) => Math.min(prev + progressIncrement / newLogs.length, 100))
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-emerald-100 rounded-full">
                  <BrainCircuit className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-medium">Current Model</h3>
                  <p className="text-sm text-gray-500">v1.2.4 (Last updated: 2 weeks ago)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Accuracy</p>
                  <p className="font-medium">92.1%</p>
                </div>
                <div>
                  <p className="text-gray-500">Precision</p>
                  <p className="font-medium">90.3%</p>
                </div>
                <div>
                  <p className="text-gray-500">Recall</p>
                  <p className="font-medium">93.8%</p>
                </div>
                <div>
                  <p className="text-gray-500">F1 Score</p>
                  <p className="font-medium">92.0%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="font-medium">Training Dataset</h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Total Images</p>
                  <p className="font-medium">12,458</p>
                </div>
                <div>
                  <p className="text-gray-500">With Tumors</p>
                  <p className="font-medium">3,842 (30.8%)</p>
                </div>
                <div>
                  <p className="text-gray-500">Without Tumors</p>
                  <p className="font-medium">8,616 (69.2%)</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p className="font-medium">3 days ago</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => alert("This would open the dataset management page")}
              >
                Manage Dataset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Train New Model</h3>

          {status === "complete" && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle className="h-4 w-4" />
              Training Complete
            </div>
          )}

          {status === "failed" && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4" />
              Training Failed
            </div>
          )}
        </div>

        <div className="space-y-4">
          {status !== "idle" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {status === "preparing" && "Preparing..."}
                  {status === "training" && "Training in progress..."}
                  {status === "evaluating" && "Evaluating model..."}
                  {status === "complete" && "Training complete"}
                  {status === "failed" && "Training failed"}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Options</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Training Type</label>
                  <select className="w-full rounded-md border border-gray-300 p-2">
                    <option>Full Training</option>
                    <option>Fine Tuning</option>
                    <option>Transfer Learning</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Dataset Version</label>
                  <select className="w-full rounded-md border border-gray-300 p-2">
                    <option>Latest (v2.4)</option>
                    <option>v2.3</option>
                    <option>v2.2</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={startTraining}
                disabled={status !== "idle" && status !== "complete" && status !== "failed"}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {status === "idle" || status === "complete" || status === "failed"
                  ? "Start Training"
                  : "Training in Progress..."}
              </Button>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 pt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Epochs</label>
                  <input
                    type="number"
                    defaultValue={10}
                    min={1}
                    max={100}
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Batch Size</label>
                  <input
                    type="number"
                    defaultValue={32}
                    min={1}
                    max={256}
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Learning Rate</label>
                  <input
                    type="number"
                    defaultValue={0.001}
                    step={0.0001}
                    min={0.0001}
                    max={0.1}
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Validation Split</label>
                  <input
                    type="number"
                    defaultValue={0.2}
                    step={0.05}
                    min={0.1}
                    max={0.5}
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
              </div>

              <Button
                onClick={startTraining}
                disabled={status !== "idle" && status !== "complete" && status !== "failed"}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {status === "idle" || status === "complete" || status === "failed"
                  ? "Start Training with Advanced Options"
                  : "Training in Progress..."}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Training Logs</h3>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
            {logs.map((log, i) => (
              <div key={i} className="pb-1">
                <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
