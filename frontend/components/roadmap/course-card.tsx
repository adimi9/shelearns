// components/roadmap/course-card.tsx
"use client"

import { Arrow } from "@radix-ui/react-context-menu"
import { ChevronRight, Play, BookOpen, Brain, Clock, ArrowBigUp } from "lucide-react"
import { useRouter } from "next/navigation"

interface CourseCardProps {
  title: string
  courseDescription: string
  index: number // This helps determine if it's the 1st course
  courseId?: string
  level: string
  progress: number
  stats: {
    videos: number
    docs: number
    notes: number
  }
  hasStarted: boolean
  getLevelColor: (level: string) => string
  getLevelTextColor: (level: string) => string
}

export default function CourseCard({
  title,
  courseDescription,
  index,
  courseId = "html-css-fundamentals",
  level,
  progress,
  stats,
  hasStarted,
  getLevelColor,
  getLevelTextColor,
}: CourseCardProps) {
  const router = useRouter()

  const totalXP = stats.notes * 100 + stats.docs * 100 + stats.videos * 100 + 250 * 5

  const handleStartLearning = () => {
    router.push(`/learn/${courseId}`)
  }

  // Determine the button text based on the refined conditions
  const buttonText = () => {
    if (hasStarted) {
      return "Continue Course"; // If any course has started, always say "Continue Course"
    } else if (index === 1) {
      return "Start Here"; // If it's the 1st course and not started, say "Start Here"
    } else {
      return "Skip Ahead Here"; // For any other course that has not started, say "Skip Ahead Here"
    }
  };

  return (
    <div className="bg-white border-4 border-black rounded-xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:translate-y-[-3px] hover:translate-x-[-1px]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-xl border-2 border-black">
            {index}
          </div>
          <div className="ml-3">
            <h3 className="text-xl font-bold">{title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${getLevelColor(level)} text-white`}>
                {level.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {hasStarted && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 border-2 border-black">
            <div
              className="bg-pink-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Course Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center p-2 bg-pink-50 rounded border">
          <BookOpen className="w-4 h-4 mx-auto text-pink-600 mb-1" />
          <div className="text-xs font-bold">{stats.docs}</div>
          <div className="text-xs text-gray-600">Documentation</div>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded border">
          <Brain className="w-4 h-4 mx-auto text-blue-600 mb-1" />
          <div className="text-xs font-bold">{stats.notes}</div>
          <div className="text-xs text-gray-600">Notes</div>
        </div>
        <div className="text-center p-2 bg-purple-50 rounded border">
          <Brain className="w-4 h-4 mx-auto text-purple-600 mb-1" />
          <div className="text-xs font-bold">{stats.videos}</div>
          <div className="text-xs text-gray-600">Videos</div>
        </div>
        <div className="text-center p-2 bg-green-50 rounded border">
          <ArrowBigUp className="w-4 h-4 mx-auto text-green-600 mb-1" />
          <div className="text-xs font-bold">{totalXP}</div>
          <div className="text-xs text-gray-600">XP</div>
        </div>
      </div>

      {/* RENDER THE MAIN COURSE DESCRIPTION HERE */}
      <div className="space-y-4 mt-6">
        <div className="border-l-4 border-pink-400 pl-4 py-1">
          <p className="text-sm text-gray-600">{courseDescription}</p>
        </div>
      </div>

      <button
        onClick={handleStartLearning}
        className="mt-6 w-full py-3 bg-black text-white font-bold rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors"
      >
        {buttonText()}
        <ChevronRight className="ml-2" />
      </button>
    </div>
  )
}