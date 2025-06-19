"use client"

import { Play, BookOpen, Brain, Clock, TrendingUp, Zap, Award } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  // Calculate total XP and badges available
  const totalXP = stats.videos * 50 + stats.articles * 30 + stats.quizzes * 100 + stats.estimatedHours * 25
  const totalBadges = Math.floor(stats.videos / 3) + Math.floor(stats.articles / 2) + stats.quizzes + 2 // +2 for completion badges

  return (
    <div className="bg-white border-4 border-black rounded-xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Course info */}
        <div>
          <h1 className="text-3xl md:text-4xl font-black mb-4">{title}</h1>
          <p className="text-lg text-gray-600 mb-6">{description}</p>

          {/* Course Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 p-3 bg-pink-50 rounded-lg border-2 border-pink-200">
              <Play className="w-5 h-5 text-pink-600" />
              <div>
                <div className="font-bold text-pink-800">{stats.videos}</div>
                <div className="text-sm text-pink-600">Videos</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-bold text-blue-800">{stats.articles}</div>
                <div className="text-sm text-blue-600">Articles</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
              <Brain className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-bold text-purple-800">{stats.quizzes}</div>
                <div className="text-sm text-purple-600">Quizzes</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border-2 border-green-200">
              <Clock className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-bold text-green-800">{stats.estimatedHours}h</div>
                <div className="text-sm text-green-600">Est. Time</div>
              </div>
            </div>
          </div>

          {/* XP and Badges Preview */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border-2 border-yellow-200">
              <Zap className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="font-bold text-yellow-800">{totalXP.toLocaleString()}</div>
                <div className="text-sm text-yellow-600">XP to Earn</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border-2 border-orange-200">
              <Award className="w-5 h-5 text-orange-600" />
              <div>
                <div className="font-bold text-orange-800">{totalBadges}</div>
                <div className="text-sm text-orange-600">Badges</div>
              </div>
            </div>
          </div>

          {/* Expected Learning Outcomes */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">🎯 What You'll Learn</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-pink-600 font-bold">•</span>
                Build responsive, accessible websites from scratch
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 font-bold">•</span>
                Master modern CSS techniques including Flexbox and Grid
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 font-bold">•</span>
                Create interactive web applications with JavaScript
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 font-bold">•</span>
                Build dynamic UIs with React and modern frameworks
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600 font-bold">•</span>
                Use professional development tools and workflows
              </li>
            </ul>
          </div>
        </div>

        {/* Right side - Progress and action */}
        <div className="flex flex-col justify-center">
          {hasStarted ? (
            <div className="text-center">
              <div className="mb-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <TrendingUp className="w-6 h-6 text-pink-600" />
                  <h3 className="text-xl font-bold">Your Progress</h3>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-6 border-2 border-black">
                    <div
                      className="bg-pink-500 h-full rounded-full transition-all duration-500 flex items-center justify-center"
                      style={{ width: `${progress}%` }}
                    >
                      <span className="text-sm font-bold text-white">{progress}%</span>
                    </div>
                  </div>
                </div>
                {lastCourse && <p className="text-sm text-gray-600 mt-3">Last studied: {lastCourse}</p>}
              </div>

              <Button
                onClick={onContinueCourse}
                className="w-full bg-pink-600 hover:bg-black text-white font-bold py-4 px-8 rounded-xl shadow-[4px_4px_0px_0px_rgba(219,39,119)] transition-all hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(219,39,119)] text-lg"
              >
                Continue Learning
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Ready to Start Your Journey?</h3>
                <p className="text-gray-600">
                  Join thousands of women learning to code. Start with the fundamentals and build your way up to
                  advanced concepts.
                </p>
              </div>

              <Button
                onClick={onStartCourse}
                className="w-full bg-black hover:bg-pink-600 text-white font-bold py-4 px-8 rounded-xl shadow-[4px_4px_0px_0px_rgba(219,39,119)] transition-all hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(219,39,119)] text-lg"
              >
                🚀 Start Course
              </Button>
            </div>
          )}

          {/* Gamification Preview */}
          <div className="mt-8 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg">
            <h4 className="font-bold text-yellow-800 mb-3">🎮 Earn While You Learn!</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-700">Earn XP for every lesson completed</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-orange-600" />
                <span className="text-orange-700">Unlock badges for achievements</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-700">Level up as you progress</span>
              </div>
            </div>
          </div>

          {/* Course Path Preview */}
          <div className="mt-6 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
            <h4 className="font-bold text-gray-800 mb-3">📚 Course Path</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-green-700 font-medium">Beginner</span>
                <span className="text-gray-600">HTML & CSS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-yellow-700 font-medium">Intermediate</span>
                <span className="text-gray-600">JavaScript & React</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-red-700 font-medium">Advanced</span>
                <span className="text-gray-600">Tools & Deployment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
