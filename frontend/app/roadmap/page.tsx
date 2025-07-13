"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import CourseCard from "@/components/roadmap/course-card"
import CourseOverview from "@/components/roadmap/course-overview"
import { Button } from "@/components/ui/button"

import { useRoadmapStore } from "@/stores/roadmapStore";

// Define the type for a processed course object
interface ProcessedCourse {
  id: string; // This will now store the courseLevelId as a string
  title: string;
  description: string;
  level: string;
  stats: {
    videos: number;
    docs: number;
    notes: number;
    numericProgress: number;
  };
}

export default function RoadmapPage() {
  const router = useRouter();
  const setRoadmapData = useRoadmapStore((state) => state.setData);
  const storedRoadmapData = useRoadmapStore((state) => state.data);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roadmapDisplayData, setRoadmapDisplayData] = useState<any | null>(null);

  const BASE_BACKEND_URL = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BACKEND_URL
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : 'http://localhost:8080';

  useEffect(() => {
    const fetchRoadmap = async () => {
      setIsLoading(true);
      setError(null);

      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setError("Authentication required. Please log in to view your roadmap.");
        setIsLoading(false);
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(`${BASE_BACKEND_URL}/api/roadmap`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${authToken}`,
          },
        });

        const responseText = await response.text();
        console.log("Roadmap Backend Raw Response:", responseText);

        if (!response.ok) {
          let errorData;
          try {
            if (responseText) {
              errorData = JSON.parse(responseText);
            } else {
              errorData = { message: `Failed to load roadmap with status: ${response.status}. No error response body.` };
            }
          } catch (jsonParseError: any) {
            console.error("Error response JSON parsing error:", jsonParseError);
            errorData = { message: `Server error: Could not parse error response for roadmap. Status: ${response.status}.` };
          }
          throw new Error(errorData.message || `Failed to load roadmap with status: ${response.status}`);
        }

        let backendResponseData;
        try {
          if (responseText) {
            backendResponseData = JSON.parse(responseText);
          } else {
            console.error("Successful roadmap response had an empty body.");
            throw new Error("Roadmap loaded, but no data received.");
          }
        } catch (jsonParseError: any) {
          console.error("Successful response JSON parsing error for roadmap:", jsonParseError);
          throw new Error("Roadmap loaded, but failed to parse server response.");
        }

        console.log("Roadmap data received:", backendResponseData);

        setRoadmapData(backendResponseData);

        // Map backend data to frontend ProcessedCourse format, using courseLevelId as the ID
        const processedCourses: ProcessedCourse[] = backendResponseData.courses.map((course: any) => ({
          id: String(course.courseLevelId), // Use courseLevelId as the unique ID
          title: course.courseName,
          description: course.description,
          level: course.levelName.toLowerCase(),
          stats: {
            videos: course.numVideos,
            docs: course.numDocs,
            notes: course.numNotes,
            numericProgress: course.progress,
          },
        }));

        const overallStats = {
          videos: backendResponseData.courses.reduce((sum: number, c: any) => sum + c.numVideos, 0),
          docs: backendResponseData.courses.reduce((sum: number, c: any) => sum + c.numDocs, 0),
          notes: backendResponseData.courses.reduce((sum: number, c: any) => sum + c.numNotes, 0),
        };

        const overallProgress = processedCourses.length > 0
          ? Math.round(processedCourses.reduce((sum: number, c: ProcessedCourse) => sum + c.stats.numericProgress, 0) / processedCourses.length)
          : 0;


        setRoadmapDisplayData({
          roadmap_title: `Your Custom ${backendResponseData.category} Roadmap`, // Use template literal
          intro_paragraph: backendResponseData.introParagraph,
          recommended_courses: processedCourses,
          overall_stats: overallStats,
          overall_progress: overallProgress,
        });

      } catch (err: any) {
        console.error("Failed to fetch roadmap:", err);
        setError(err.message || "An unexpected error occurred while loading your roadmap.");
      } finally {
        setIsLoading(false);
      }
    };

    console.log("Stored roadmap data:", storedRoadmapData);
    fetchRoadmap();

  }, [router, setRoadmapData, BASE_BACKEND_URL]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-600 border-t-transparent"></div>
        <span className="ml-4 text-pink-700 font-bold text-lg">Loading your roadmap...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
          <p className="mt-2">Please ensure you are logged in and try again.</p>
          <Button onClick={() => router.push('/login')} className="mt-4 bg-pink-600 hover:bg-black text-white font-bold py-2 px-4 rounded-xl">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (!roadmapDisplayData || roadmapDisplayData.recommended_courses.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 text-center p-6">
        <h2 className="text-3xl font-black text-gray-800 mb-4">No Personalized Roadmap Yet!</h2>
        <p className="text-gray-600 mb-6">
          It looks like you haven't completed the onboarding questionnaire or your roadmap is still being generated.
          Please complete the onboarding to get your custom learning path.
        </p>
        <Button onClick={() => router.push('/onboarding')} className="bg-pink-600 hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition-all hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(219,39,119)]">
          Go to Onboarding
        </Button>
      </div>
    );
  }


  const courses: ProcessedCourse[] = roadmapDisplayData.recommended_courses;
  const overallStats = roadmapDisplayData.overall_stats;
  const userOverallProgress = roadmapDisplayData.overall_progress;


  const userProgress = {
    overallProgress: userOverallProgress,
    coursesProgress: courses.reduce((acc: { [key: string]: { progress: number; level: string; unlockedLevels: any[]; started: boolean; } }, course: ProcessedCourse) => {
      acc[course.id] = {
        progress: course.stats.numericProgress,
        level: course.level,
        unlockedLevels: [],
        started: course.stats.numericProgress > 0,
      };
      return acc;
    }, {} as { [key: string]: { progress: number; level: string; unlockedLevels: any[]; started: boolean; } }),
  };


  const handleStartCourse = () => {
    if (courses.length > 0) {
      router.push(`/learn/${courses[0].id}`); // This will now use courseLevelId
    } else {
      console.log("No courses available to start.");
    }
  }

  const handleContinueCourse = () => {
    const startedIncompleteCourses = courses.find(
      (course: ProcessedCourse) => userProgress.coursesProgress[course.id]?.started && userProgress.coursesProgress[course.id]?.progress < 100
    );

    if (startedIncompleteCourses) {
      router.push(`/learn/${startedIncompleteCourses.id}`); // This will now use courseLevelId
    } else if (courses.length > 0) {
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
    <main className="container mx-auto px-6 py-12 max-w-7xl">
      <CourseOverview
        // No wrapper needed if you want CourseOverview to remain its current width
        title={roadmapDisplayData.roadmap_title}
        description={`${roadmapDisplayData.intro_paragraph}`}
        stats={overallStats}
        progress={userOverallProgress}
        lastCourse={
          courses.find((course: ProcessedCourse) => userProgress.coursesProgress[course.id]?.started)?.title || "No course started yet"
        }
        hasStarted={userOverallProgress > 0}
        onStartCourse={handleStartCourse}
        onContinueCourse={handleContinueCourse}
      />

      <div className="mt-16">
        <h2 className="text-3xl md:text-4xl font-black mb-8 text-center">Detailed Overview of Courses Generated For You</h2>
        <div className="grid grid-cols-1 gap-8 justify-items-center">
          {/* REMOVE max-w-4xl from this div to allow CourseCards to be wider */}
          <div className="max-w-7xl space-y-8">
            {courses.map((course: ProcessedCourse, index: number) => {
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
)}