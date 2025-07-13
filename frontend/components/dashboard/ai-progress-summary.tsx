"use client"

import { Brain, TrendingUp, Target, AlertCircle } from "lucide-react"

// Define the interface for the AI analysis data received from the backend
interface AIProgressSummaryProps {
  aiAnalysis: {
    overall_paragraph: string // Maps to the motivational message
    strengths: string[]
    recommendations: string[]
  }
}

export default function AIProgressSummary({ aiAnalysis }: AIProgressSummaryProps) {
  // Destructure the AI analysis data for easier access
  const { overall_paragraph, strengths, recommendations } = aiAnalysis

  return (
    <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-inter">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-6 h-6 text-purple-500" />
        <h3 className="text-xl font-bold text-gray-800">AI Progress Analysis</h3>
        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-bold">Powered by AI</span>
      </div>

      <div className="space-y-6">
        {/* Overall Paragraph / Motivational Message */}
        {overall_paragraph && (
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg shadow-sm">
            <p className="text-purple-800 font-medium text-center leading-relaxed">
              {overall_paragraph}
            </p>
          </div>
        )}

        {/* Strengths */}
        {strengths && strengths.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h4 className="font-bold text-green-700">Your Strengths</h4>
            </div>
            <div className="space-y-2">
              {strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                  <span className="text-green-600 flex-shrink-0 mt-0.5">✅</span>
                  <span className="text-green-700 text-sm leading-snug">{strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations (previously "Areas for Improvement" and "Recommendations" combined) */}
        {recommendations && recommendations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-blue-500" /> {/* Changed icon to Target for recommendations */}
              <h4 className="font-bold text-blue-700">Recommendations</h4>
            </div>
            <div className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-sm"
                >
                  <span className="text-blue-600 flex-shrink-0 mt-0.5">💡</span>
                  <span className="text-blue-700 text-sm leading-snug">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optional: Add a message if no insights are available */}
        {(!overall_paragraph && (!strengths || strengths.length === 0) && (!recommendations || recommendations.length === 0)) && (
          <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-center text-gray-600">
            <AlertCircle className="w-5 h-5 inline-block mr-2 text-gray-500" />
            No AI insights available at this time. Keep learning to generate your personalized analysis!
          </div>
        )}
      </div>
    </div>
  )
}
