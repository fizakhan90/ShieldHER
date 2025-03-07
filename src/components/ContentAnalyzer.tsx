"use client"

import { useState } from "react"
import { analyzeText, type AnalysisResult, getFeedback, isMisogynistic } from "@/utils/perspectiveApi"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Bar } from "react-chartjs-2"
import { AlertTriangle, CheckCircle, Info } from "lucide-react"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function ContentAnalyzer() {
  const [text, setText] = useState("")
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState("")

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("Please enter some text to analyze")
      return
    }

    setError("")
    setIsAnalyzing(true)

    try {
      const analysisResult = await analyzeText(text)
      setResult(analysisResult)
    } catch (err) {
      setError("An error occurred during analysis. Please try again.")
      console.error(err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getChartData = (result: AnalysisResult) => {
    return {
      labels: ["Toxicity", "Identity Attack", "Insult", "Threat", "Sexually Explicit", "Severe Toxicity", "Profanity"],
      datasets: [
        {
          label: "Score",
          data: [
            result.toxicity,
            result.identity_attack,
            result.insult,
            result.threat,
            result.sexually_explicit,
            result.severe_toxicity,
            result.profanity,
          ],
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
            "rgba(199, 199, 199, 0.6)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(199, 199, 199, 1)",
          ],
          borderWidth: 1,
        },
      ],
    }
  }

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: (value: number) => `${(value * 100).toFixed(0)}%`,
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `Score: ${(context.raw * 100).toFixed(1)}%`
          },
        },
      },
    },
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Enter text to analyze
        </label>
        <textarea
          id="content"
          rows={6}
          className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:border-gray-600"
          placeholder="Type or paste content here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Content"}
        </button>
      </div>

      {isAnalyzing && (
        <div className="mt-8 flex justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-indigo-200 dark:bg-indigo-700"></div>
            <div className="mt-4 h-4 w-36 bg-indigo-200 dark:bg-indigo-700 rounded"></div>
          </div>
        </div>
      )}

      {result && !isAnalyzing && (
        <div className="mt-8 space-y-6">
          <div
            className={`p-4 rounded-lg flex items-start ${
              isMisogynistic(result)
                ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
            }`}
          >
            {isMisogynistic(result) ? (
              <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-6 w-6 mr-3 flex-shrink-0" />
            )}
            <div>
              <h3 className="font-medium text-lg">
                {isMisogynistic(result) ? "Potentially Harmful Content Detected" : "Content Appears Safe"}
              </h3>
              <p className="mt-1">{getFeedback(result)}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Detailed Analysis</h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <Bar data={getChartData(result)} options={chartOptions as any} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {Object.entries(result).map(([key, value]) => (
                <div key={key} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium capitalize">{key.replace("_", " ")}</h4>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        value > 0.7
                          ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                          : value > 0.4
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                            : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                      }`}
                    >
                      {(value * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        value > 0.7 ? "bg-red-500" : value > 0.4 ? "bg-yellow-500" : "bg-green-500"
                      }`}
                      style={{ width: `${value * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex">
            <Info className="h-6 w-6 text-blue-500 dark:text-blue-400 mr-3 flex-shrink-0" />
            <div className="text-blue-700 dark:text-blue-300 text-sm">
              <p>
                <strong>Note:</strong> This analysis is based on automated detection and may not be 100% accurate.
                Context matters, and some content may be flagged incorrectly. Always review the results and use your
                judgment when interpreting the analysis.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



