"use client"

import { ChevronRight, Play, BookOpen, Brain, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

interface SubCourse {
  title: string
  description: string
}

interface CourseCardProps {
  title: string
  subCourses: SubCourse[]
  index: number
  courseId?: string
  level: string
  progress: number
  stats: {
    videos: number
    articles: number
    quizzes: number
    estimatedHours: number
  }
  hasStarted: boolean
  getLevelColor: (level: string) => string
  getLevelTextColor: (level: string) => string
}

export default function CourseCard({
  title,
  subCourses,
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

  const handleStartLearning = () => {
    router.push(`/learn/${courseId}`)
  }

  return (
    <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:translate-y-[-3px] hover:translate-x-[-1px]">
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
              <span className="text-sm text-gray-500">{stats.estimatedHours}h estimated</span>
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
          <Play className="w-4 h-4 mx-auto text-pink-600 mb-1" />
          <div className="text-xs font-bold">{stats.videos}</div>
          <div className="text-xs text-gray-600">Videos</div>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded border">
          <BookOpen className="w-4 h-4 mx-auto text-blue-600 mb-1" />
          <div className="text-xs font-bold">{stats.articles}</div>
          <div className="text-xs text-gray-600">Articles</div>
        </div>
        <div className="text-center p-2 bg-purple-50 rounded border">
          <Brain className="w-4 h-4 mx-auto text-purple-600 mb-1" />
          <div className="text-xs font-bold">{stats.quizzes}</div>
          <div className="text-xs text-gray-600">Quizzes</div>
        </div>
        <div className="text-center p-2 bg-green-50 rounded border">
          <Clock className="w-4 h-4 mx-auto text-green-600 mb-1" />
          <div className="text-xs font-bold">{stats.estimatedHours}h</div>
          <div className="text-xs text-gray-600">Time</div>
        </div>
      </div>

      <div className="space-y-4 mt-6">
        {subCourses.map((subCourse, idx) => (
          <div key={idx} className="border-l-4 border-pink-400 pl-4 py-1">
            <h4 className="font-bold">{subCourse.title}</h4>
            <p className="text-sm text-gray-600">{subCourse.description}</p>
          </div>
        ))}
      </div>

      <button
        onClick={handleStartLearning}
        className="mt-6 w-full py-3 bg-black text-white font-bold rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors"
      >
        {hasStarted ? "Continue Course" : "Skip Ahead Here"}
        <ChevronRight className="ml-2" />
      </button>
    </div>
  )
}
