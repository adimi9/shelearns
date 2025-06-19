"use client"

import { Brain, TrendingUp, Target, AlertCircle } from "lucide-react"

interface AIProgressSummaryProps {
  userData: {
    totalStudyTime: number
    loginStreak: number
    totalXP: number
    currentLevel: string
    coursesCompleted: number
    coursesInProgress: number
  }
}

export default function AIProgressSummary({ userData }: AIProgressSummaryProps) {
  // AI-generated insights based on user data
  const generateInsights = () => {
    const insights = {
      strengths: [],
      improvements: [],
      recommendations: [],
      motivationalMessage: "",
    }

    // Analyze study consistency
    if (userData.loginStreak >= 7) {
      insights.strengths.push("Excellent consistency with daily learning")
    } else if (userData.loginStreak >= 3) {
      insights.strengths.push("Good learning habit formation")
    } else {
      insights.improvements.push("Try to maintain a daily learning streak")
    }

    // Analyze study time
    if (userData.totalStudyTime >= 40) {
      insights.strengths.push("Strong time investment in learning")
    } else if (userData.totalStudyTime >= 20) {
      insights.strengths.push("Solid foundation building")
    } else {
      insights.improvements.push("Consider increasing daily study time")
    }

    // Analyze progress
    if (userData.coursesCompleted >= 1) {
      insights.strengths.push("Great job completing courses!")
    }

    if (userData.coursesInProgress > 2) {
      insights.improvements.push("Focus on completing current courses before starting new ones")
    }

    // Generate recommendations
    if (userData.currentLevel === "Beginner") {
      insights.recommendations.push("Focus on HTML & CSS fundamentals")
      insights.recommendations.push("Practice coding daily, even if just 30 minutes")
    }

    // Motivational message
    if (userData.loginStreak >= 7) {
      insights.motivationalMessage =
        "You're on fire! 🔥 Your consistency is paying off. Keep building on this momentum!"
    } else if (userData.totalXP >= 5000) {
      insights.motivationalMessage = "Impressive progress! 🚀 You're well on your way to becoming a skilled developer."
    } else {
      insights.motivationalMessage = "Great start! 🌟 Every expert was once a beginner. Keep pushing forward!"
    }

    return insights
  }

  const insights = generateInsights()

  return (
    <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-6 h-6 text-purple-500" />
        <h3 className="text-xl font-bold">AI Progress Analysis</h3>
        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-bold">Powered by AI</span>
      </div>

      <div className="space-y-6">
        {/* Motivational Message */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg">
          <p className="text-purple-800 font-medium text-center">{insights.motivationalMessage}</p>
        </div>

        {/* Strengths */}
        {insights.strengths.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h4 className="font-bold text-green-700">Your Strengths</h4>
            </div>
            <div className="space-y-2">
              {insights.strengths.map((strength, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-green-600">✅</span>
                  <span className="text-green-700 text-sm">{strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Areas for Improvement */}
        {insights.improvements.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-orange-500" />
              <h4 className="font-bold text-orange-700">Areas to Focus On</h4>
            </div>
            <div className="space-y-2">
              {insights.improvements.map((improvement, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <span className="text-orange-600">🎯</span>
                  <span className="text-orange-700 text-sm">{improvement}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {insights.recommendations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              <h4 className="font-bold text-blue-700">Recommendations</h4>
            </div>
            <div className="space-y-2">
              {insights.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-blue-600">💡</span>
                  <span className="text-blue-700 text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
