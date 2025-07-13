"use client"

import { Play, BookOpen, Brain, Clock, TrendingUp, Zap, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown' // Import Components type for better type safety

interface CourseOverviewProps {
  title: string
  description: string
  stats: {
    videos: number
    articles: number
    quizzes: number
    estimatedHours: number
  }
  progress: number
  lastCourse?: string
  hasStarted: boolean
  onStartCourse: () => void
  onContinueCourse: () => void
}

export default function CourseOverview({
  title,
  description,
  stats,
  progress,
  lastCourse,
  hasStarted,
  onStartCourse,
  onContinueCourse,
}: CourseOverviewProps) {

  const totalXP = stats.videos * 50 + stats.articles * 30 + stats.quizzes * 100 + stats.estimatedHours * 25
  const totalBadges = Math.floor(stats.videos / 3) + Math.floor(stats.articles / 2) + stats.quizzes + 2

  // Define custom components for ReactMarkdown to apply Tailwind classes
  const customComponents: Components = {
    // Override the default paragraph rendering
    p: ({ node, ...props }) => <p className="text-lg text-gray-600 mb-6 px-4" {...props} />,
    // You can also add more custom components for other HTML tags if needed, e.g.:
    // h1: ({ node, ...props }) => <h1 className="text-xl font-bold" {...props} />,
    // a: ({ node, ...props }) => <a className="text-blue-500 hover:underline" {...props} />,
    // strong: ({ node, ...props }) => <strong className="font-extrabold" {...props} />, // Example for bold
  }

  return (
    <div className="bg-white border-4 border-black rounded-xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-black mb-4">{title}</h1>
        {/* Render ReactMarkdown without an outer <p> tag */}
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={customComponents}>
          {description}
        </ReactMarkdown>
      </div>

      

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-0">
        {/* Left side - Earn While You Learn! */}
        <div>
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg">
            <h4 className="font-bold text-yellow-800 mb-3">🎮 Earn While You Learn!</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-700">Earn <strong>XP</strong> for every lesson completed</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-orange-600" />
                <span className="text-orange-700">Unlock <strong>badges</strong> for achievements</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-700"><strong>Level up</strong> as you progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Learning Tips */}
        <div>
          <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
            <h4 className="font-bold text-purple-800 mb-3">💡 Learning Tips</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span className="text-purple-700">Complete courses in order for <strong>best results</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span className="text-purple-700"><strong>Practice coding</strong> along with videos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span className="text-purple-700">Don't skip the <strong>quizzes</strong> - they reinforce learning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}