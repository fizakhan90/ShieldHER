"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { analyzeText, isMisogynistic, getFeedback } from "@/utils/perspectiveApi"
import { AlertTriangle, CheckCircle } from "lucide-react"

export default function KeyboardPrevention() {
  const [text, setText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isMisogynisticContent, setIsMisogynisticContent] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debounce the analysis to avoid too many API calls
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (text.trim().length > 10) {
      setIsAnalyzing(true)

      timeoutRef.current = setTimeout(async () => {
        try {
          const result = await analyzeText(text)
          const isMisogynistic_ = isMisogynistic(result)
          setIsMisogynisticContent(isMisogynistic_)
          setFeedback(getFeedback(result))
          setShowFeedback(isMisogynistic_)
        } catch (error) {
          console.error("Error analyzing text:", error)
        } finally {
          setIsAnalyzing(false)
        }
      }, 500) // 500ms debounce
    } else {
      setShowFeedback(false)
      setIsAnalyzing(false)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [text])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isMisogynisticContent) {
      alert("Please revise your message before sending. It may contain harmful content.")
    } else {
      alert("Message sent successfully!")
      setText("")
      setShowFeedback(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type your message
          </label>
          <div className="relative">
            <textarea
              id="message"
              rows={6}
              className={`w-full px-3 py-2 text-gray-700 dark:text-gray-300 border rounded-lg focus:outline-none focus:ring-2 ${
                showFeedback && isMisogynisticContent
                  ? "border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10"
                  : showFeedback && !isMisogynisticContent
                    ? "border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/10"
                    : "border-gray-300 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:border-gray-600"
              }`}
              placeholder="Start typing your message here..."
              value={text}
              onChange={handleTextChange}
            />
            {isAnalyzing && (
              <div className="absolute top-2 right-2">
                <div className="animate-spin h-5 w-5 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
              </div>
            )}
          </div>
        </div>

        {showFeedback && (
          <div
            className={`mb-4 p-3 rounded-lg flex items-start ${
              isMisogynisticContent
                ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
            }`}
          >
            {isMisogynisticContent ? (
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            )}
            <span>{feedback}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {isAnalyzing ? "Analyzing your message..." : "Real-time analysis enabled"}
          </div>
          <button
            type="submit"
            className={`px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
              isMisogynisticContent
                ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500"
            }`}
            disabled={isMisogynisticContent || isAnalyzing}
          >
            Send Message
          </button>
        </div>
      </form>
    </div>
  )
}

