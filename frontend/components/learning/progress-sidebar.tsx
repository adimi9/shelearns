"use client"

import { CheckCircle, Circle, Play, BookOpen, FileText } from "lucide-react"

interface SubCourse {
  id: string
  title: string
  description: string
  materials: {
    crashCourse?: { completed: boolean }
    articles?: { completed: boolean; count: number }
    fullCourse?: { completed: boolean; totalVideos: number; completedVideos: number }
  }
  quiz: { completed: boolean; score?: number }
}

interface ProgressSidebarProps {
  subCourses: SubCourse[]
  currentSubCourse: string
  onSubCourseClick: (id: string) => void
}

export default function ProgressSidebar({ subCourses, currentSubCourse, onSubCourseClick }: ProgressSidebarProps) {
  const calculateOverallProgress = () => {
    const totalItems = subCourses.length * 4 // crash course, articles, full course, quiz
    const completedItems = subCourses.reduce((acc, course) => {
      let completed = 0
      if (course.materials.crashCourse?.completed) completed++
      if (course.materials.articles?.completed) completed++
      if (course.materials.fullCourse?.completed) completed++
      if (course.quiz.completed) completed++
      return acc + completed
    }, 0)
    return Math.round((completedItems / totalItems) * 100)
  }

  return (
    <div className="sticky top-6 bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="text-xl font-bold mb-4">Your Progress</h3>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm font-bold">{calculateOverallProgress()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 border-2 border-black">
          <div
            className="bg-pink-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${calculateOverallProgress()}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-4">
        {subCourses.map((course) => (
          <div key={course.id} className="border-2 border-gray-200 rounded-lg p-3">
            <button
              onClick={() => onSubCourseClick(course.id)}
              className={`w-full text-left transition-colors ${
                currentSubCourse === course.id ? "text-pink-600 font-bold" : "hover:text-pink-600"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{course.title}</span>
                {course.quiz.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
              </div>
            </button>

            <div className="space-y-1 ml-2">
              <div className="flex items-center gap-2 text-xs">
                <Play className="w-3 h-3" />
                <span className={course.materials.crashCourse?.completed ? "text-green-600" : "text-gray-500"}>
                  Crash Course
                </span>
                {course.materials.crashCourse?.completed && <CheckCircle className="w-3 h-3 text-green-500" />}
              </div>

              {course.materials.articles && (
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="w-3 h-3" />
                  <span className={course.materials.articles.completed ? "text-green-600" : "text-gray-500"}>
                    Articles ({course.materials.articles.count})
                  </span>
                  {course.materials.articles.completed && <CheckCircle className="w-3 h-3 text-green-500" />}
                </div>
              )}

              {course.materials.fullCourse && (
                <div className="flex items-center gap-2 text-xs">
                  <BookOpen className="w-3 h-3" />
                  <span className={course.materials.fullCourse.completed ? "text-green-600" : "text-gray-500"}>
                    Full Course ({course.materials.fullCourse.completedVideos}/{course.materials.fullCourse.totalVideos}
                    )
                  </span>
                  {course.materials.fullCourse.completed && <CheckCircle className="w-3 h-3 text-green-500" />}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs">
                <Circle className="w-3 h-3" />
                <span className={course.quiz.completed ? "text-green-600" : "text-gray-500"}>
                  Quiz {course.quiz.score ? `(${course.quiz.score}/5)` : ""}
                </span>
                {course.quiz.completed && <CheckCircle className="w-3 h-3 text-green-500" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
