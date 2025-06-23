"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import CourseCard from "@/components/roadmap/course-card"
import CourseOverview from "@/components/roadmap/course-overview"
import { Button } from "@/components/ui/button"

export default function RoadmapPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("journey") // This state isn't used in the provided JSX.

  // The backend output data (simulated fetch)
  const backendData = {
    "roadmap_title": "Computer Security Learning Journey",
    "intro_paragraph": "**Based on your interest in Computer Security, particularly to enhance your capabilities in writing secure code,** we've curated a selection of courses that cover essential security principles, web application security, secure development practices, cloud security, and identity management. **By the end of this roadmap, you will be equipped with the skills to integrate security into your development processes and manage security in cloud environments.**",
    "recommended_courses": [
      {
        "name": "Introduction to Cybersecurity",
        "description": "This course covers fundamental cybersecurity concepts, including the CIA Triad, threats, vulnerabilities, and common attack vectors. It's an essential starting point for understanding the basic principles and best practices in cybersecurity.",
        "level": "Beginner",
        "stats": {
          "videos": 10,
          "articles": 5,
          "quizzes": 3,
          "estimated_hours": 8,
          "numeric_progress": 45 // Example: set initial progress for this course
        }
      },
      {
        "name": "Web Application Security",
        "description": "Focusing on secure coding practices for web applications, this course delves into the OWASP Top 10 vulnerabilities, authentication, and session management issues, crucial for developers integrating security into their web apps.",
        "level": "Intermediate",
        "stats": {
          "videos": 15,
          "articles": 8,
          "quizzes": 4,
          "estimated_hours": 12,
          "numeric_progress": 10
        }
      },
      {
        "name": "Secure Software Development (DevSecOps)",
        "description": "This course provides insights into integrating security into the Software Development Life Cycle (SDLC), covering threat modeling, SAST, DAST, and secure coding guidelines essential for any developer’s toolkit.",
        "level": "Intermediate",
        "stats": {
          "videos": 12,
          "articles": 7,
          "quizzes": 3,
          "estimated_hours": 10,
          "numeric_progress": 100
        }
      },
      {
        "name": "Cloud Security",
        "description": "Learn about cloud security essentials including the shared responsibility model, IAM in the cloud, and container security basics. This course is crucial if you're working with AWS or Azure, offering insights into securing cloud environments.",
        "level": "Intermediate",
        "stats": {
          "videos": 18,
          "articles": 9,
          "quizzes": 5,
          "estimated_hours": 15,
          "numeric_progress": 0
        }
      },
      {
        "name": "Cryptography Basics",
        "description": "Gain an understanding of encryption algorithms, hashing techniques, PKI, and digital signatures, all fundamental to protecting data and ensuring secure communications within your applications.",
        "level": "Beginner",
        "stats": {
          "videos": 8,
          "articles": 4,
          "quizzes": 2,
          "estimated_hours": 7,
          "numeric_progress": 0
        }
      },
      {
        "name": "Identity & Access Management (IAM)",
        "description": "This course explores advanced authentication techniques such as MFA and SSO, alongside authorization models like RBAC and ABAC. It's essential for managing identities and permissions in modern applications.",
        "level": "Intermediate",
        "stats": {
          "videos": 14,
          "articles": 6,
          "quizzes": 4,
          "estimated_hours": 11,
          "numeric_progress": 0
        }
      }
    ],
    "overall_stats": {
      "videos": 77,
      "articles": 39,
      "quizzes": 21,
      "estimated_hours": 63,
      "numeric_progress": 23 // Overall progress for the roadmap
    }
  };

  // Map backend courses to a format compatible with CourseCard
  const courses = backendData.recommended_courses.map(course => ({
    id: course.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''), // Generate a clean slug for ID
    title: course.name,
    description: course.description,
    level: course.level.toLowerCase(),
    stats: {
      videos: course.stats.videos,
      articles: course.stats.articles,
      quizzes: course.stats.quizzes,
      estimatedHours: course.stats.estimated_hours,
      numericProgress: course.stats.numeric_progress, // New: Course-specific numeric progress
    },
  }));

  // User progress state, directly using backend numeric_progress for initialization
  const [userProgress, setUserProgress] = useState({
  overallProgress: backendData.overall_stats.numeric_progress, // Use overall numeric progress from backend
  coursesProgress: courses.reduce((acc: { [key: string]: { progress: number; level: string; unlockedLevels: any[]; started: boolean; } }, course) => {
    acc[course.id] = {
      progress: course.stats.numericProgress, // Use course-specific numeric progress from backend
      level: course.level,
      unlockedLevels: [], // Keep this for future expansion if needed
      started: course.stats.numericProgress > 0, // Mark as started if progress > 0
    };
      return acc;
    }, {} as { [key: string]: { progress: number; level: string; unlockedLevels: any[]; started: boolean; } }),
  });

  // Overall stats come directly from backendData
  const overallStats = {
    videos: backendData.overall_stats.videos,
    articles: backendData.overall_stats.articles,
    quizzes: backendData.overall_stats.quizzes,
    estimatedHours: backendData.overall_stats.estimated_hours, // <--- CHANGE IS HERE
  };

  const handleStartCourse = () => {
    // Logic to start the first available course or a specific one
    if (courses.length > 0) {
      router.push(`/learn/${courses[0].id}`);
    } else {
      console.log("No courses available to start.");
    }
  }

  const handleContinueCourse = () => {
    // Find the first started but incomplete course to continue
    const startedIncompleteCourses = courses.find(
      (course) => userProgress.coursesProgress[course.id]?.started && userProgress.coursesProgress[course.id]?.progress < 100
    );

    if (startedIncompleteCourses) {
      router.push(`/learn/${startedIncompleteCourses.id}`);
    } else if (courses.length > 0) {
      // If all started courses are complete or none are started, start the first one
      handleStartCourse();
    } else {
      console.log("No courses to continue or start.");
    }
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
      {/* Navigation - No changes here */}

      <main className="container mx-auto px-6 py-12">
        {/* Course Overview Section */}
        <CourseOverview
          title={backendData.roadmap_title}
          description={`${backendData.intro_paragraph}`}
          stats={overallStats}
          progress={userProgress.overallProgress}
          lastCourse={
            courses.find(course => userProgress.coursesProgress[course.id]?.started)?.title || "No course started yet"
          }
          hasStarted={userProgress.overallProgress > 0}
          onStartCourse={handleStartCourse}
          onContinueCourse={handleContinueCourse}
        />

        {/* Detailed Course Overview */}
        <div className="mt-16">
          {/* Centered the heading */}
          <h2 className="text-3xl md:text-4xl font-black mb-8 text-center">Detailed Overview of Courses Generated For You</h2>

          {/* Adjusted grid to be a single column and centered its content */}
          <div className="grid grid-cols-1 gap-8 justify-items-center">
            {/* Removed lg:col-span-2; added max-w-4xl and w-full for centering and width control */}
            <div className="w-full max-w-4xl space-y-8">
              {courses.map((course, index) => {
                const courseProgress = userProgress.coursesProgress[course.id] || { progress: 0, started: false };
                return (
                  <div key={course.id} className="relative">
                    <CourseCard
                      title={course.title}
                      courseDescription={course.description}
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
          </div>
        </div>
      </main>
    </div>
  )
}