// components/learning/learning-dashboard.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import SectionSidebar from "@/components/learning/section-sidebar";
import OfficialDocsSection from "@/components/learning/official-docs-section";
import NotesSection from "@/components/learning/notes-section";
import CourseSection from "@/components/learning/course-section";
import QuizSection from "@/components/learning/quiz-section";
import ToastNotification from "@/components/learning/toast-notification";
import { Button } from "@/components/ui/button";

// --- Backend API Response Interfaces (unchanged) ---
interface ResourceBackend {
  resourceId: number;
  name: string;
  description: string;
  link: string;
  resourceType: "DOC" | "NOTE" | "VIDEO" | "QUIZ";
  resourceXp: number;
  resourceOrder: number;
  completed: boolean;
}

interface VideoResourceBackend extends ResourceBackend {
  duration: string;
}

interface QuizResourceBackend extends ResourceBackend {
  questionText: string;
  correctAnswerOption: number;
  hint: string;
  userAnsweredOption?: string;
  scoreAwarded?: number;
  options: string[];
  correctlyAnswered?: boolean;
}

interface CourseDetailsBackend {
  id: number;
  title: string;
  levelName: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  sections: {
    officialDocs: ResourceBackend[];
    notes: ResourceBackend[];
    course: VideoResourceBackend[];
    quiz: QuizResourceBackend[];
  };
}

interface QuizSubmissionResponse {
  userId: number;
  totalQuestionsAttempted: number;
  totalScore: number;
  questionResults: Array<{
    resourceId: number;
    questionText: string;
    submittedOption: number;
    correctOption: number;
    scoreAwarded: number;
    message: string;
    correct: boolean;
  }>;
  overallMessage: string;
}

// --- Frontend Data Interfaces ---
interface DocItem {
  id: string;
  title: string;
  description: string;
  readTime: string;
  url: string;
  completed: boolean;
}

interface NoteItem {
  id: string;
  title: string;
  description: string;
  readTime: string;
  url: string;
  completed: boolean;
}

interface VideoItem {
  id: string;
  title: string;
  duration: string;
  youtubeId: string;
  completed: boolean;
}

interface QuizQuestionItem {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerOption: number;
  hint: string;
  relatedArticles?: Array<{
    title: string;
    url: string;
  }>;
  resourceId: number;
  resourceType: "DOC" | "NOTE" | "VIDEO" | "QUIZ";
  resourceXp: number;
  resourceOrder: number;
  completed: boolean;
  userAnsweredOption?: string;
  scoreAwarded?: number;
  correctlyAnswered?: boolean;
}

interface CourseDataFrontend {
  id: string;
  title: string;
  description: string;
  levelName: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  sections: {
    officialDocs: { available: boolean; docs: DocItem[] };
    notes: { available: boolean; data: NoteItem[] };
    course: { available: boolean; videos: VideoItem[] };
    quiz: { available: boolean };
  };
  quizQuestions: QuizQuestionItem[];
}

export default function LearningDashboard({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const courseIdParam = params.courseId;

  const [courseDetails, setCourseDetails] = useState<CourseDataFrontend | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState("course");
  const [activeVideoId, setActiveVideoId] = useState("");

  const [currentLevel, setCurrentLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("BEGINNER");
  const [unlockedLevels, setUnlockedLevels] = useState<Array<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">>(["BEGINNER"]);

  const [userXP, setUserXP] = useState(1250);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const [detailedQuizResults, setDetailedQuizResults] = useState<QuizSubmissionResponse["questionResults"] | null>(null);
  const [overallQuizScore, setOverallQuizScore] = useState<number | null>(null);

  const BASE_BACKEND_URL =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_BACKEND_URL
      ? process.env.NEXT_PUBLIC_BACKEND_URL
      : "http://localhost:8080";

  const getYoutubeId = (url: string): string => {
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/;
    const match = url.match(regExp);
    return match && match[1].length === 11 ? match[1] : "";
  };

  const processBackendData = useCallback(
    (backendData: CourseDetailsBackend): CourseDataFrontend => {
      const sortedOfficialDocs = [...backendData.sections.officialDocs].sort(
        (a, b) => a.resourceOrder - b.resourceOrder
      );
      const sortedNotes = [...backendData.sections.notes].sort((a, b) => a.resourceOrder - b.resourceOrder);
      const sortedVideos = [...backendData.sections.course].sort((a, b) => a.resourceOrder - b.resourceOrder);
      const sortedQuizzes = [...backendData.sections.quiz].sort((a, b) => a.resourceOrder - b.resourceOrder);

      const processedDocs: DocItem[] = sortedOfficialDocs.map((doc) => ({
        id: String(doc.resourceId),
        title: doc.name,
        description: doc.description,
        url: doc.link,
        readTime: "5 min",
        completed: doc.completed,
      }));

      const processedNotes: NoteItem[] = sortedNotes.map((note) => ({
        id: String(note.resourceId),
        title: note.name,
        description: note.description,
        url: note.link,
        readTime: "5 min",
        completed: note.completed,
      }));

      const processedVideos: VideoItem[] = sortedVideos.map((video) => ({
        id: String(video.resourceId),
        title: video.name,
        duration: video.duration,
        youtubeId: getYoutubeId(video.link),
        completed: video.completed,
      }));

      const processedQuizzes: QuizQuestionItem[] = sortedQuizzes.map((quiz) => ({
        id: String(quiz.resourceId),
        questionText: quiz.questionText,
        options: quiz.options,
        correctAnswerOption: quiz.correctAnswerOption,
        hint: quiz.hint,
        relatedArticles: [],
        resourceId: quiz.resourceId,
        resourceType: quiz.resourceType,
        resourceXp: quiz.resourceXp,
        resourceOrder: quiz.resourceOrder,
        completed: quiz.completed,
        userAnsweredOption: quiz.userAnsweredOption,
        scoreAwarded: quiz.scoreAwarded,
        correctlyAnswered: quiz.correctlyAnswered,
      }));

      return {
        id: courseIdParam,
        title: backendData.title,
        description: "Master foundational concepts for " + backendData.title,
        levelName: backendData.levelName,
        sections: {
          officialDocs: { available: processedDocs.length > 0, docs: processedDocs },
          notes: { available: processedNotes.length > 0, data: processedNotes },
          course: { available: processedVideos.length > 0, videos: processedVideos },
          quiz: { available: processedQuizzes.length > 0 },
        },
        quizQuestions: processedQuizzes,
      };
    },
    [courseIdParam]
  );

  const fetchCourseData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      setError("Authentication required. Please log in to view this course.");
      setIsLoading(false);
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${BASE_BACKEND_URL}/api/courses/${courseIdParam}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorData;
        try {
          errorData = responseText ? JSON.parse(responseText) : { message: `Failed to load course with status: ${response.status}. No error response body.` };
        } catch (jsonParseError: any) {
          console.error("Error response JSON parsing error for course details:", jsonParseError);
          errorData = { message: `Server error: Could not parse error response for course. Status: ${response.status}.` };
        }
        throw new Error(errorData.message || `Failed to load course with status: ${response.status}`);
      }

      let backendResponseData: CourseDetailsBackend;
      try {
        backendResponseData = responseText ? JSON.parse(responseText) : (() => {
          console.error("Successful course details response had an empty body.");
          throw new Error("Course loaded, but no data received.");
        })();
      } catch (jsonParseError: any) {
        console.error("Successful response JSON parsing error for course details:", jsonParseError);
        throw new Error("Course loaded, but failed to parse server response.");
      }

      setCourseDetails(processBackendData(backendResponseData));
    } catch (err: any) {
      console.error("Failed to fetch course details:", err);
      setError(err.message || "An unexpected error occurred while loading course details.");
    } finally {
      setIsLoading(false);
    }
  }, [courseIdParam, router, BASE_BACKEND_URL, processBackendData]);

  useEffect(() => {
    if (courseIdParam) {
      fetchCourseData();
    } else {
      setError("No course ID provided.");
      setIsLoading(false);
    }
  }, [courseIdParam, fetchCourseData]);

  const completedVideos = useMemo(() => {
    if (!courseDetails?.sections.course.available) return new Set<string>();
    return new Set(courseDetails.sections.course.videos.filter(v => v.completed).map(v => v.id));
  }, [courseDetails]);

  const completedDocs = useMemo(() => {
    if (!courseDetails) return new Set<string>();
    const docs = courseDetails.sections.officialDocs.docs.filter(d => d.completed).map(d => d.id);
    const notes = courseDetails.sections.notes.data.filter(n => n.completed).map(n => n.id);
    return new Set([...docs, ...notes]);
  }, [courseDetails]);

  const completedQuizzes = useMemo(() => {
    if (!courseDetails) return new Set<string>();
    return new Set(courseDetails.quizQuestions.filter(q => q.completed).map(q => q.id));
  }, [courseDetails]);

  const calculatedProgress = useMemo(() => {
    if (!courseDetails) return { officialDocs: false, notes: false, course: false, quiz: false };

    return {
      officialDocs: courseDetails.sections.officialDocs.docs.every(doc => doc.completed),
      notes: courseDetails.sections.notes.data.every(note => note.completed),
      course: courseDetails.sections.course.videos.every(video => video.completed),
      quiz: courseDetails.quizQuestions.every(quiz => quiz.completed),
    };
  }, [courseDetails]);

  // NEW: Calculate overallCourseProgress
  const overallCourseProgress = useMemo(() => {
    if (!courseDetails) return 0;

    let totalAvailableSections = 0;
    let completedMainSections = 0;

    // Check availability before counting towards total and completed
    if (courseDetails.sections.officialDocs.available) {
      totalAvailableSections++;
      if (calculatedProgress.officialDocs) completedMainSections++;
    }
    if (courseDetails.sections.notes.available) {
      totalAvailableSections++;
      if (calculatedProgress.notes) completedMainSections++;
    }
    if (courseDetails.sections.course.available) {
      totalAvailableSections++;
      if (calculatedProgress.course) completedMainSections++;
    }
    if (courseDetails.sections.quiz.available) {
      totalAvailableSections++;
      if (calculatedProgress.quiz) completedMainSections++;
    }

    if (totalAvailableSections === 0) {
      return 0;
    }

    return Math.round((completedMainSections / totalAvailableSections) * 100);
  }, [courseDetails, calculatedProgress]); // Depend on courseDetails and calculatedProgress

  useEffect(() => {
    if (courseDetails) {
      if (courseDetails.sections.course?.available && courseDetails.sections.course.videos.length > 0) {
        const currentActiveVideoIsCompleted = activeVideoId && completedVideos.has(activeVideoId);
        const firstIncompleteVideo = courseDetails.sections.course.videos.find(
          (video) => !video.completed
        );

        if (!activeVideoId || currentActiveVideoIsCompleted) {
          setActiveVideoId(
            firstIncompleteVideo ? firstIncompleteVideo.id : courseDetails.sections.course.videos[0].id
          );
        }
      } else {
        setActiveVideoId("");
      }

      setCurrentLevel(courseDetails.levelName);
    }
  }, [courseDetails, activeVideoId, completedVideos]);

  const xpValues = {
    video: 50,
    article: 30,
    doc: 25,
    quiz: 100,
    sectionComplete: 200,
  };

  const markResourceAsCompleteOnBackend = async (resourceId: string) => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      setToast({ message: "Authentication required to mark progress.", type: "error", isVisible: true });
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${BASE_BACKEND_URL}/api/progress/resource/${resourceId}/complete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to mark resource as complete." }));
        throw new Error(errorData.message || `Failed to mark resource ${resourceId} as complete.`);
      }

      // ⭐ Key Change: Update local state instead of re-fetching all data
      setCourseDetails(prevDetails => {
        if (!prevDetails) return null; // Should not happen if component is rendered with data

        const newDetails = { ...prevDetails };

        // Helper to update a resource array by ID
        const updateArray = <T extends { id: string; completed: boolean }>(arr: T[], id: string) =>
          arr.map(item =>
            item.id === id ? { ...item, completed: true } : item
          );

        // Update officialDocs
        if (newDetails.sections.officialDocs.available) {
          newDetails.sections.officialDocs = {
            ...newDetails.sections.officialDocs,
            docs: updateArray(newDetails.sections.officialDocs.docs, resourceId),
          };
        }

        // Update notes
        if (newDetails.sections.notes.available) {
          newDetails.sections.notes = {
            ...newDetails.sections.notes,
            data: updateArray(newDetails.sections.notes.data, resourceId),
          };
        }

        // Update course videos
        if (newDetails.sections.course.available) {
          newDetails.sections.course = {
            ...newDetails.sections.course,
            videos: updateArray(newDetails.sections.course.videos, resourceId),
          };
        }

        // Update quiz questions (if a quiz resource is marked complete through this function)
        // Note: Quiz completion is usually handled by updateQuizProgressOnBackend after submission
        newDetails.quizQuestions = updateArray(newDetails.quizQuestions, resourceId);

        return newDetails;
      });

      setToast({ message: "Progress updated successfully!", type: "success", isVisible: true });
    } catch (err: any) {
      console.error(`Error marking resource ${resourceId} as complete:`, err);
      setToast({ message: `Failed to update progress: ${err.message}`, type: "error", isVisible: true });
    }
  };

  const updateQuizProgressOnBackend = async (answers: { resourceId: number; selectedOption: number }[]) => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      setToast({ message: "Authentication required to submit quiz.", type: "error", isVisible: true });
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_BACKEND_URL}/api/progress/quiz`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ answers }),
      });

      const responseData: QuizSubmissionResponse = await response.json();

      if (!response.ok) {
        throw new Error(responseData.overallMessage || `Failed to submit quiz with status: ${response.status}`);
      }

      setDetailedQuizResults(responseData.questionResults);
      setOverallQuizScore(responseData.totalScore);

      // // ⭐ Key Change: Update quiz questions directly in courseDetails state
      // setCourseDetails(prevDetails => {
      //   if (!prevDetails) return null;

      //   const newDetails = { ...prevDetails };
      //   const updatedQuizQuestions = newDetails.quizQuestions.map(q => {
      //     const result = responseData.questionResults.find(qr => String(qr.resourceId) === q.id);
      //     if (result) {
      //       return {
      //         ...q,
      //         completed: result.correct, // Assuming 'correct' from backend means completed for quiz
      //         userAnsweredOption: String(result.submittedOption),
      //         scoreAwarded: result.scoreAwarded,
      //         correctlyAnswered: result.correct,
      //       };
      //     }
      //     return q;
      //   });

      //   newDetails.quizQuestions = updatedQuizQuestions;
      //   return newDetails;
      // });

      await fetchCourseData(); // Re-fetch to ensure all data is up-to-date

      setToast({ message: "Quiz submitted successfully! Your progress has been updated.", type: "success", isVisible: true });
    } catch (err: any) {
      console.error("Error submitting quiz:", err);
      setToast({ message: `Failed to submit quiz: ${err.message}`, type: "error", isVisible: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionComplete = (section: string) => {
    const earnedXP = xpValues.sectionComplete;
    setUserXP((prevXP) => prevXP + earnedXP);

    setToast({
      message: `${
        section === "quiz" ? "Quiz" : section.charAt(0).toUpperCase() + section.slice(1)
      } completed! +${earnedXP} XP 🎉`,
      type: "success",
      isVisible: true,
    });
  };

  const handleVideoComplete = (videoId: string) => {
    const earnedXP = xpValues.video;
    setUserXP((prev) => prev + earnedXP);

    setToast({
      message: `Video completed! +${earnedXP} XP 🎉`,
      type: "success",
      isVisible: true,
    });

    markResourceAsCompleteOnBackend(videoId);
  };

  const handleDocComplete = async (docId: string): Promise<void> => {
    const earnedXP = xpValues.doc;
    setUserXP((prev) => prev + earnedXP);

    setToast({
      message: `Documentation read! +${earnedXP} XP 📚`,
      type: "success",
      isVisible: true,
    });
    await markResourceAsCompleteOnBackend(docId);
  };

  const handleMoveToNext = () => {
    setToast({
      message: "Congratulations! You've completed this course! Moving to the next adventure! 🎯",
      type: "success",
      isVisible: true,
    });
    router.push("/roadmap");
  };

  useEffect(() => {
    if (courseDetails && Object.values(calculatedProgress).every(Boolean)) {
      if (currentLevel === "BEGINNER" && !unlockedLevels.includes("INTERMEDIATE")) {
        setUnlockedLevels((prevLevels) => [...prevLevels, "INTERMEDIATE"]);
        setUserXP((prevXP) => prevXP + 500);
        setToast({
          message: "🎉 Intermediate level unlocked! +500 bonus XP! You can now access more challenging content.",
          type: "success",
          isVisible: true,
        });
      } else if (currentLevel === "INTERMEDIATE" && !unlockedLevels.includes("ADVANCED")) {
        setUnlockedLevels((prevLevels) => [...prevLevels, "ADVANCED"]);
        setUserXP((prevXP) => prevXP + 1000);
        setToast({
          message: "🎉 Advanced level unlocked! +1000 bonus XP! You're ready for expert content!",
          type: "success",
          isVisible: true,
        });
      }
    }
  }, [calculatedProgress, currentLevel, unlockedLevels, courseDetails]);

  const canMoveToNext =
    Object.values(calculatedProgress).every(Boolean) &&
    (currentLevel === "INTERMEDIATE" || currentLevel === "ADVANCED");

  const renderMainContent = () => {
    if (!courseDetails) return null;

    const availableSectionsForCourse = {
      officialDocs: courseDetails.sections.officialDocs.available,
      notes: courseDetails.sections.notes.available,
      course: courseDetails.sections.course.available,
      quiz: courseDetails.sections.quiz.available,
    };

    switch (activeSection) {
      case "officialDocs":
        if (!availableSectionsForCourse.officialDocs) return null;
        return (
          <OfficialDocsSection
            docs={courseDetails.sections.officialDocs.docs}
            onComplete={() => handleSectionComplete("officialDocs")}
            isCompleted={calculatedProgress.officialDocs}
            onMarkAsReadBackend={handleDocComplete}
          />
        );
      case "notes":
        if (!availableSectionsForCourse.notes) return null;
        return (
          <NotesSection
            notes={courseDetails.sections.notes.data}
            onComplete={() => handleSectionComplete("notes")}
            isCompleted={calculatedProgress.notes}
            onMarkAsReadBackend={handleDocComplete}
          />
        );
      case "course":
        if (!availableSectionsForCourse.course) return null;
        return (
          <CourseSection
            videos={courseDetails.sections.course.videos}
            onVideoComplete={handleVideoComplete}
            onCourseComplete={() => handleSectionComplete("course")}
            isCompleted={calculatedProgress.course}
            activeVideoId={activeVideoId}
            onVideoSelect={setActiveVideoId}
            completedVideos={completedVideos}
          />
        );
      case "quiz":
        if (!availableSectionsForCourse.quiz) return null;
        return (
          <QuizSection
            questions={courseDetails.quizQuestions}
            onComplete={(score) => handleSectionComplete("quiz")}
            isCompleted={calculatedProgress.quiz}
            onQuizSubmitBackend={updateQuizProgressOnBackend}
            currentCourseLevel={currentLevel}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-600 border-t-transparent"></div>
        <span className="ml-4 text-pink-700 font-bold text-lg">Loading course...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
          <p className="mt-2">Please ensure you are logged in and the course ID is valid.</p>
          <Button onClick={() => router.push('/roadmap')} className="mt-4 bg-pink-600 hover:bg-black text-white font-bold py-2 px-4 rounded-xl">
            Go to Roadmap
          </Button>
        </div>
      </div>
    );
  }

  if (!courseDetails) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 text-center p-6">
        <h2 className="text-3xl font-black text-gray-800 mb-4">Course Not Found</h2>
        <p className="text-gray-600 mb-6">
          The course you are looking for could not be loaded. It might not exist or there was an issue fetching its content.
        </p>
        <Button onClick={() => router.push('/roadmap')} className="bg-pink-600 hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition-all hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(219,39,119)]">
          Back to Roadmap
        </Button>
      </div>
    );
  }

  const availableSectionsForCourse = {
    officialDocs: courseDetails.sections.officialDocs.available,
    notes: courseDetails.sections.notes.available,
    course: courseDetails.sections.course.available,
    quiz: courseDetails.sections.quiz.available,
  };

  const currentVideos = courseDetails.sections.course.available
    ? courseDetails.sections.course.videos
    : [];

  return (
    <div className="min-h-screen bg-pink-50">
      <div className="flex min-h-screen">
        <div className="fixed top-0 left-0 h-screen z-10">
          <SectionSidebar
            courseTitle={courseDetails.title}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            progress={calculatedProgress}
            availableSections={availableSectionsForCourse}
            courseVideos={currentVideos}
            activeVideoId={activeVideoId}
            onVideoSelect={setActiveVideoId}
            completedVideos={completedVideos}
            overallCourseProgress={overallCourseProgress}
          />
        </div>

        <div className="flex-1 ml-[320px] transition-all duration-300">
          <div className="max-w-4xl mx-auto px-4 py-8">{renderMainContent()}</div>
        </div>
      </div>
    </div>
  );
}