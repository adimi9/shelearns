"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import CourseCard from "@/components/roadmap/course-card"
import CourseOverview from "@/components/roadmap/course-overview"
import { Button } from "@/components/ui/button"

export default function RoadmapPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("journey")

  // Sample progress data - in real app this would come from user state/API
  const [userProgress, setUserProgress] = useState({
    lastCourse: "html-css-fundamentals",
    lastSubCourse: "HTML5 Structure & Semantics",
    overallProgress: 23, // percentage
    coursesProgress: {
      "html-css-fundamentals": {
        progress: 45,
        level: "beginner",
        unlockedLevels: ["beginner"],
        started: true,
      },
      "javascript-essentials": {
        progress: 0,
        level: "intermediate",
        unlockedLevels: [],
        started: false,
      },
      "react-frameworks": {
        progress: 0,
        level: "intermediate",
        unlockedLevels: [],
        started: false,
      },
      "frontend-tooling": {
        progress: 0,
        level: "advanced",
        unlockedLevels: [],
        started: false,
      },
    },
  })

  const courses = [
    {
      id: "html-css-fundamentals",
      title: "HTML & CSS Fundamentals",
      level: "beginner",
      subCourses: [
        {
          title: "HTML5 Structure & Semantics",
          description: "Learn to create structured, accessible web pages with modern HTML5",
        },
        {
          title: "CSS Styling & Layout",
          description: "Master CSS styling, flexbox, grid, and responsive design principles",
        },
      ],
      stats: {
        videos: 13,
        articles: 8,
        quizzes: 4,
        estimatedHours: 12,
      },
    },
    {
      id: "javascript-essentials",
      title: "JavaScript Essentials",
      level: "intermediate",
      subCourses: [
        {
          title: "JavaScript Fundamentals",
          description: "Core concepts, data types, functions, and modern ES6+ syntax",
        },
        {
          title: "DOM Manipulation",
          description: "Learn to interact with and modify web pages dynamically",
        },
      ],
      stats: {
        videos: 18,
        articles: 12,
        quizzes: 6,
        estimatedHours: 16,
      },
    },
    {
      id: "react-frameworks",
      title: "React Frameworks",
      level: "intermediate",
      subCourses: [
        {
          title: "React Fundamentals",
          description: "Components, props, state, and the React ecosystem",
        },
        {
          title: "Application State Management",
          description: "Managing complex state with hooks, context, and external libraries",
        },
      ],
      stats: {
        videos: 22,
        articles: 15,
        quizzes: 8,
        estimatedHours: 20,
      },
    },
    {
      id: "frontend-tooling",
      title: "Frontend Tooling",
      level: "advanced",
      subCourses: [
        {
          title: "Build Tools & Bundlers",
          description: "Modern development workflow with Vite, npm, and package management",
        },
        {
          title: "Version Control with Git",
          description: "Collaborative development using Git and GitHub",
        },
      ],
      stats: {
        videos: 16,
        articles: 10,
        quizzes: 6,
        estimatedHours: 14,
      },
    },
  ]

  // Calculate overall stats
  const overallStats = courses.reduce(
    (acc, course) => ({
      videos: acc.videos + course.stats.videos,
      articles: acc.articles + course.stats.articles,
      quizzes: acc.quizzes + course.stats.quizzes,
      estimatedHours: acc.estimatedHours + course.stats.estimatedHours,
    }),
    { videos: 0, articles: 0, quizzes: 0, estimatedHours: 0 },
  )

  const handleStartCourse = () => {
    router.push("/learn/html-css-fundamentals")
  }

  const handleContinueCourse = () => {
    router.push(`/learn/${userProgress.lastCourse}`)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-500"
      case "intermediate":
        return "bg-yellow-500"
      case "advanced":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getLevelTextColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "text-green-700"
      case "intermediate":
        return "text-yellow-700"
      case "advanced":
        return "text-red-700"
      default:
        return "text-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Navigation */}


      <main className="container mx-auto px-6 py-12">
        {/* Course Overview Section */}
        <CourseOverview
          title="Front End Web Development Learning Journey"
          description="Master modern frontend development from HTML basics to advanced React applications. Build real projects and gain the skills needed for a successful career in web development."
          stats={overallStats}
          progress={userProgress.overallProgress}
          lastCourse={userProgress.lastSubCourse}
          hasStarted={userProgress.overallProgress > 0}
          onStartCourse={handleStartCourse}
          onContinueCourse={handleContinueCourse}
        />

        {/* Detailed Course Overview */}
        <div className="mt-16">
          <h2 className="text-3xl md:text-4xl font-black mb-8">Detailed Overview of Courses Generated For You</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {courses.map((course, index) => {
                const courseProgress = userProgress.coursesProgress[course.id]
                return (
                  <div key={course.id} className="relative">
                    <CourseCard
                      title={course.title}
                      subCourses={course.subCourses}
                      index={index + 1}
                      courseId={course.id}
                      level={course.level}
                      progress={courseProgress.progress}
                      stats={course.stats}
                      hasStarted={courseProgress.started}
                      getLevelColor={getLevelColor}
                      getLevelTextColor={getLevelTextColor}
                    />
                  </div>
                )
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sticky top-6">
                <h3 className="text-xl font-bold mb-4">Create a profile to save your progress!</h3>
                <p className="mb-6 text-gray-700">Track your learning journey and pick up where you left off.</p>

                <div className="space-y-3">
                  <Button
                    className="w-full bg-pink-600 hover:bg-black text-white font-bold py-3 rounded-xl transition-all"
                    onClick={() => router.push("/signup")}
                  >
                    Create a Profile!
                  </Button>

                  <Button
                    className="w-full bg-white border-2 border-black hover:bg-black hover:text-white text-black font-bold py-3 rounded-xl transition-all"
                    onClick={() => router.push("/login")}
                  >
                    Sign In!
                  </Button>
                </div>

                {/* Learning Tips */}
                <div className="mt-8 p-4 bg-pink-50 border-2 border-pink-200 rounded-lg">
                  <h4 className="font-bold text-pink-800 mb-2">💡 Learning Tips</h4>
                  <ul className="text-sm text-pink-700 space-y-1">
                    <li>• Complete courses in order for best results</li>
                    <li>• Practice coding along with videos</li>
                    <li>• Don't skip the quizzes - they reinforce learning</li>
                    <li>• Join our community for help and motivation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
