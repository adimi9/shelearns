"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import CourseCard from "@/components/roadmap/course-card"
import CourseOverview from "@/components/roadmap/course-overview"
import { Button } from "@/components/ui/button"

import { useRoadmapStore } from "@/stores/roadmapStore";
import { useEffect } from "react";

export default function RoadmapPage() {
  const data = useRoadmapStore((state) => state.data);
  const router = useRouter();

  useEffect(() => {
    if (!data) {
      router.replace("/"); // Redirect home if no data
    }
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading roadmap...
      </div>
    );
  }

  // Prepare data in the shape your component expects
  const backendData = {
    roadmap_title: "Your Custom Roadmap",
    intro_paragraph: data.introParagraph,
    recommended_courses: data.courses.map((course) => ({
      name: course.name,
      description: course.description,
      level: "beginner", // Or adapt if backend sends level
      stats: {
        videos: course.numVideos,
        articles: course.numDocs,
        quizzes: course.numNotes,
        estimated_hours: Math.round(course.totalXP / 150),
        numeric_progress: 0,
      },
    })),
    overall_stats: {
      videos: data.courses.reduce((sum, c) => sum + c.numVideos, 0),
      articles: data.courses.reduce((sum, c) => sum + c.numDocs, 0),
      quizzes: data.courses.reduce((sum, c) => sum + c.numNotes, 0),
      estimated_hours: Math.round(data.courses.reduce((sum, c) => sum + c.totalXP, 0) / 150),
      numeric_progress: 0,
    },
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