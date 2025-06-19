"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import SubCourseNavbar from "@/components/learning/sub-course-navbar"
import SectionSidebar from "@/components/learning/section-sidebar"
import OfficialDocsSection from "@/components/learning/official-docs-section"
import NotesSection from "@/components/learning/notes-section"
import CourseSection from "@/components/learning/course-section"
import QuizSection from "@/components/learning/quiz-section"
import ToastNotification from "@/components/learning/toast-notification"
import AIAssistant from "@/components/learning/ai-assistant"
import DifficultyAdjustment from "@/components/learning/difficulty-adjustment"

export default function LearningDashboard({ params }: { params: { courseId: string } }) {
  const router = useRouter()
  const [activeSubCourse, setActiveSubCourse] = useState("html-css")
  const [activeSection, setActiveSection] = useState("course") // Default to course
  const [activeVideoId, setActiveVideoId] = useState("")
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set())
  const [completedDocs, setCompletedDocs] = useState<Set<string>>(new Set())
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [currentLevel, setCurrentLevel] = useState("beginner")
  const [unlockedLevels, setUnlockedLevels] = useState(["beginner"])
  const [userXP, setUserXP] = useState(1250)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; isVisible: boolean }>({
    message: "",
    type: "success",
    isVisible: false,
  })

  // Sample course data with flexible sections
  const courseData = {
    title: "HTML & CSS Fundamentals",
    subCourses: [
      {
        id: "html-css",
        title: "HTML5 Structure & Semantics",
        description: "Learn to create structured, accessible web pages with modern HTML5",
        sections: {
          officialDocs: {
            available: true,
            docs: [
              {
                id: "html5-mdn",
                title: "HTML5 Official Documentation",
                description:
                  "Comprehensive reference from MDN Web Docs covering all HTML5 elements and best practices.",
                url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
              },
              {
                id: "html5-w3c",
                title: "W3C HTML5 Specification",
                description: "The official W3C specification for HTML5 with detailed technical information.",
                url: "https://www.w3.org/TR/html52/",
              },
            ],
          },
          notes: {
            available: true,
            data: [
              {
                id: "1",
                title: "Understanding HTML5 Semantic Elements",
                description: "Learn about the importance of semantic HTML and accessibility",
                readTime: "5 min",
                url: "#",
              },
              {
                id: "2",
                title: "HTML5 Best Practices Guide",
                description: "Modern approaches to writing clean, maintainable HTML",
                readTime: "8 min",
                url: "#",
              },
            ],
          },
          course: {
            available: true,
            videos: [
              {
                id: "1",
                title: "Introduction to HTML5",
                duration: "12:30",
                youtubeId: "UB1O30fR-EE", // Sample YouTube video ID
                completed: false,
              },
              {
                id: "2",
                title: "Semantic Elements Deep Dive",
                duration: "18:45",
                youtubeId: "UB1O30fR-EE",
                completed: false,
              },
              {
                id: "3",
                title: "Forms and Input Types",
                duration: "15:20",
                youtubeId: "UB1O30fR-EE",
                completed: false,
              },
              {
                id: "4",
                title: "HTML5 Media Elements",
                duration: "14:10",
                youtubeId: "UB1O30fR-EE",
                completed: false,
              },
              {
                id: "5",
                title: "Accessibility Best Practices",
                duration: "20:05",
                youtubeId: "UB1O30fR-EE",
                completed: false,
              },
              {
                id: "6",
                title: "HTML5 APIs Overview",
                duration: "16:40",
                youtubeId: "UB1O30fR-EE",
                completed: false,
              },
              {
                id: "7",
                title: "Responsive Design Principles",
                duration: "22:15",
                youtubeId: "UB1O30fR-EE",
                completed: false,
              },
            ],
          },
          quiz: {
            available: true,
          },
        },
      },
      {
        id: "css-styling",
        title: "CSS Styling & Layout",
        description: "Master CSS styling, flexbox, grid, and responsive design principles",
        sections: {
          officialDocs: {
            available: true,
            docs: [
              {
                id: "css-mdn",
                title: "CSS Documentation on MDN",
                description: "Complete CSS reference with tutorials and examples from Mozilla Developer Network.",
                url: "https://developer.mozilla.org/en-US/docs/Web/CSS",
              },
              {
                id: "css-w3c",
                title: "W3C CSS Specifications",
                description: "Official CSS specifications from the World Wide Web Consortium.",
                url: "https://www.w3.org/Style/CSS/",
              },
              {
                id: "css-tricks",
                title: "CSS-Tricks Almanac",
                description: "Comprehensive reference for CSS properties, selectors, and values.",
                url: "https://css-tricks.com/almanac/",
              },
            ],
          },
          notes: {
            available: true,
            data: [
              {
                id: "1",
                title: "CSS Flexbox Complete Guide",
                description: "Master flexbox layout with practical examples",
                readTime: "10 min",
                url: "#",
              },
            ],
          },
          course: {
            available: true,
            videos: [
              {
                id: "1",
                title: "CSS Fundamentals",
                duration: "20:15",
                youtubeId: "UB1O30fR-EE",
                completed: false,
              },
              {
                id: "2",
                title: "Flexbox Layout",
                duration: "25:30",
                youtubeId: "UB1O30fR-EE",
                completed: false,
              },
              {
                id: "3",
                title: "CSS Grid Layout",
                duration: "28:45",
                youtubeId: "UB1O30fR-EE",
                completed: false,
              },
              {
                id: "4",
                title: "Responsive Design with Media Queries",
                duration: "22:10",
                youtubeId: "UB1O30fR-EE",
                completed: false,
              },
              {
                id: "5",
                title: "CSS Animations and Transitions",
                duration: "19:30",
                youtubeId: "UB1O30fR-EE",
                completed: false,
              },
              {
                id: "6",
                title: "CSS Variables and Custom Properties",
                duration: "15:45",
                youtubeId: "UB1O30fR-EE",
                completed: false,
              },
            ],
          },
          quiz: {
            available: true,
          },
        },
      },
    ],
  }

  const [progress, setProgress] = useState({
    "html-css": {
      officialDocs: false,
      notes: false,
      course: false,
      quiz: false,
    },
    "css-styling": {
      officialDocs: false,
      notes: false,
      course: false,
      quiz: false,
    },
  })

  // XP values for different activities
  const xpValues = {
    video: 50,
    article: 30,
    doc: 25,
    quiz: 100,
    sectionComplete: 200,
  }

  // Initialize active video when changing sub-course
  useState(() => {
    const currentSubCourse = courseData.subCourses.find((sc) => sc.id === activeSubCourse)
    if (currentSubCourse?.sections.course?.available && currentSubCourse.sections.course.videos.length > 0) {
      setActiveVideoId(currentSubCourse.sections.course.videos[0].id)
    }
  })

  const handleSectionComplete = (section: string) => {
    setProgress((prev) => ({
      ...prev,
      [activeSubCourse]: {
        ...prev[activeSubCourse as keyof typeof prev],
        [section]: true,
      },
    }))

    // Award XP for section completion
    const earnedXP = xpValues.sectionComplete
    setUserXP((prev) => prev + earnedXP)

    setToast({
      message: `${section === "quiz" ? "Quiz" : section.charAt(0).toUpperCase() + section.slice(1)} completed! +${earnedXP} XP 🎉`,
      type: "success",
      isVisible: true,
    })

    // Check if all sections are complete to unlock next level
    const currentProgress = {
      ...progress[activeSubCourse as keyof typeof progress],
      [section]: true,
    }
    const allComplete = Object.values(currentProgress).every(Boolean)

    if (allComplete) {
      if (currentLevel === "beginner" && !unlockedLevels.includes("intermediate")) {
        setUnlockedLevels((prev) => [...prev, "intermediate"])
        setUserXP((prev) => prev + 500) // Bonus XP for level completion
        setToast({
          message: "🎉 Intermediate level unlocked! +500 bonus XP! You can now progress to the next level.",
          type: "success",
          isVisible: true,
        })
      } else if (currentLevel === "intermediate" && !unlockedLevels.includes("advanced")) {
        setUnlockedLevels((prev) => [...prev, "advanced"])
        setUserXP((prev) => prev + 1000) // More bonus XP for advanced unlock
        setToast({
          message: "🎉 Advanced level unlocked! +1000 bonus XP! You're ready for expert content!",
          type: "success",
          isVisible: true,
        })
      }
    }
  }

  const handleVideoComplete = (videoId: string) => {
    setCompletedVideos((prev) => {
      const newSet = new Set(prev)
      newSet.add(videoId)
      return newSet
    })

    // Award XP for video completion
    const earnedXP = xpValues.video
    setUserXP((prev) => prev + earnedXP)

    setToast({
      message: `Video completed! +${earnedXP} XP 🎉`,
      type: "success",
      isVisible: true,
    })
  }

  const handleDocComplete = (docId: string) => {
    setCompletedDocs((prev) => {
      const newSet = new Set(prev)
      newSet.add(docId)
      return newSet
    })

    // Award XP for documentation reading
    const earnedXP = xpValues.doc
    setUserXP((prev) => prev + earnedXP)

    setToast({
      message: `Documentation read! +${earnedXP} XP 📚`,
      type: "success",
      isVisible: true,
    })
  }

  const handleLevelChange = (level: string) => {
    // Check if user has completed current level before allowing progression
    if (level === "intermediate" && currentLevel === "beginner") {
      const currentProgress = progress[activeSubCourse as keyof typeof progress]
      const allComplete = Object.values(currentProgress).every(Boolean)
      if (!allComplete) {
        setToast({
          message: "Complete all beginner content first to unlock intermediate level! 🔒",
          type: "error",
          isVisible: true,
        })
        return
      }
    }

    if (level === "advanced" && (currentLevel === "beginner" || currentLevel === "intermediate")) {
      const currentProgress = progress[activeSubCourse as keyof typeof progress]
      const allComplete = Object.values(currentProgress).every(Boolean)
      if (!allComplete) {
        setToast({
          message: "Complete all current level content first to unlock advanced level! 🔒",
          type: "error",
          isVisible: true,
        })
        return
      }
    }

    setCurrentLevel(level)
    setToast({
      message: `Switched to ${level} level! 📈`,
      type: "info",
      isVisible: true,
    })
  }

  const handleDifficultyAdjust = (direction: "easier" | "harder") => {
    const levels = ["beginner", "intermediate", "advanced"]
    const currentIndex = levels.indexOf(currentLevel)

    if (direction === "easier" && currentIndex > 0) {
      const newLevel = levels[currentIndex - 1]
      setCurrentLevel(newLevel)
      if (!unlockedLevels.includes(newLevel)) {
        setUnlockedLevels((prev) => [...prev, newLevel])
      }
      setToast({
        message: `Switched to ${newLevel} level for easier content! 📚`,
        type: "info",
        isVisible: true,
      })
    } else if (direction === "harder" && currentIndex < levels.length - 1) {
      const newLevel = levels[currentIndex + 1]
      setCurrentLevel(newLevel)
      if (!unlockedLevels.includes(newLevel)) {
        setUnlockedLevels((prev) => [...prev, newLevel])
      }
      setToast({
        message: `Switched to ${newLevel} level for more challenging content! 🚀`,
        type: "info",
        isVisible: true,
      })
    }
  }

  const handleMoveToNext = () => {
    // Logic to move to next course
    setToast({
      message: "Moving to next course! 🎯",
      type: "success",
      isVisible: true,
    })
    // In real app, this would navigate to the next course
  }

  // Get current sub-course data
  const currentSubCourse = courseData.subCourses.find((sc) => sc.id === activeSubCourse)
  const availableSections = {
    officialDocs: currentSubCourse?.sections.officialDocs?.available || false,
    notes: currentSubCourse?.sections.notes?.available || false,
    course: currentSubCourse?.sections.course?.available || false,
    quiz: currentSubCourse?.sections.quiz?.available || false,
  }

  // Get current videos
  const currentVideos = currentSubCourse?.sections.course?.available ? currentSubCourse.sections.course.videos : []

  // Set default active video if not set
  if (activeVideoId === "" && currentVideos.length > 0) {
    setActiveVideoId(currentVideos[0].id)
  }

  // Check if can move to next course (all sections complete and at intermediate+ level)
  const canMoveToNext =
    Object.values(progress[activeSubCourse as keyof typeof progress]).every(Boolean) &&
    (currentLevel === "intermediate" || currentLevel === "advanced")

  // Sample quiz questions
  const sampleQuestions = [
    {
      id: "1",
      question: "Which HTML5 element is best for representing a standalone piece of content?",
      options: ["<div>", "<section>", "<article>", "<aside>"],
      correctAnswer: 2,
      hint: "Think about content that could be distributed independently, like a blog post or news article.",
      relatedArticles: [
        { title: "HTML5 Semantic Elements Guide", url: "#" },
        { title: "When to Use Article vs Section", url: "#" },
      ],
    },
    {
      id: "2",
      question: "What is the purpose of the <main> element?",
      options: [
        "To contain the main navigation",
        "To represent the main content of the document",
        "To define the main header",
        "To create the main layout container",
      ],
      correctAnswer: 1,
      hint: "The <main> element should contain the primary content that is unique to the document.",
      relatedArticles: [
        { title: "Understanding Document Structure", url: "#" },
        { title: "Accessibility and Semantic HTML", url: "#" },
      ],
    },
    {
      id: "3",
      question: "Which attribute is required for all <img> elements for accessibility?",
      options: ["src", "alt", "title", "width"],
      correctAnswer: 1,
      hint: "Screen readers need this attribute to describe images to visually impaired users.",
      relatedArticles: [
        { title: "Web Accessibility Guidelines", url: "#" },
        { title: "Image Optimization Best Practices", url: "#" },
      ],
    },
    {
      id: "4",
      question: "What does HTML5's <nav> element represent?",
      options: [
        "Any list of links",
        "The main navigation for the site",
        "A section with navigation links",
        "All of the above",
      ],
      correctAnswer: 2,
      hint: "The <nav> element is for sections containing navigation links, not just any links.",
      relatedArticles: [
        { title: "Navigation Patterns in HTML5", url: "#" },
        { title: "Semantic HTML Structure", url: "#" },
      ],
    },
    {
      id: "5",
      question: "Which HTML5 input type provides a date picker?",
      options: ["datetime", "date", "calendar", "picker"],
      correctAnswer: 1,
      hint: "HTML5 introduced several new input types for better user experience.",
      relatedArticles: [
        { title: "HTML5 Form Controls", url: "#" },
        { title: "Modern Form Design", url: "#" },
      ],
    },
  ]

  const renderMainContent = () => {
    if (!currentSubCourse) return null

    switch (activeSection) {
      case "officialDocs":
        if (!currentSubCourse.sections.officialDocs?.available) return null
        return (
          <OfficialDocsSection
            docs={currentSubCourse.sections.officialDocs.docs}
            onComplete={handleDocComplete}
            completedDocs={completedDocs}
            onAllComplete={() => handleSectionComplete("officialDocs")}
          />
        )
      case "notes":
        if (!currentSubCourse.sections.notes?.available) return null
        return (
          <NotesSection
            notes={currentSubCourse.sections.notes.data}
            onComplete={() => handleSectionComplete("notes")}
            isCompleted={progress[activeSubCourse as keyof typeof progress].notes || false}
          />
        )
      case "course":
        if (!currentSubCourse.sections.course?.available) return null
        return (
          <CourseSection
            videos={currentSubCourse.sections.course.videos}
            onVideoComplete={handleVideoComplete}
            onCourseComplete={() => handleSectionComplete("course")}
            isCompleted={progress[activeSubCourse as keyof typeof progress].course || false}
            activeVideoId={activeVideoId}
            onVideoSelect={setActiveVideoId}
            completedVideos={completedVideos}
            isAssistantOpen={isAssistantOpen}
          />
        )
      case "quiz":
        if (!currentSubCourse.sections.quiz?.available) return null
        return (
          <QuizSection
            questions={sampleQuestions}
            onComplete={(score) => handleSectionComplete("quiz")}
            isCompleted={progress[activeSubCourse as keyof typeof progress].quiz || false}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Sub-Course Navigation */}
      <SubCourseNavbar
        subCourses={courseData.subCourses}
        activeSubCourse={activeSubCourse}
        onSubCourseChange={(id) => {
          setActiveSubCourse(id)
          // Reset to first available section when switching sub-courses
          const newSubCourse = courseData.subCourses.find((sc) => sc.id === id)
          if (newSubCourse) {
            if (newSubCourse.sections.course?.available) {
              setActiveSection("course")
              if (newSubCourse.sections.course.videos.length > 0) {
                setActiveVideoId(newSubCourse.sections.course.videos[0].id)
              }
            } else if (newSubCourse.sections.officialDocs?.available) {
              setActiveSection("officialDocs")
            } else if (newSubCourse.sections.notes?.available) {
              setActiveSection("notes")
            } else if (newSubCourse.sections.quiz?.available) {
              setActiveSection("quiz")
            }
          }
        }}
      />

      <div className="flex min-h-[calc(100vh-200px)]">
        {/* Left Sidebar */}
        <SectionSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          progress={progress[activeSubCourse as keyof typeof progress]}
          availableSections={availableSections}
          courseVideos={currentVideos}
          activeVideoId={activeVideoId}
          onVideoSelect={setActiveVideoId}
          completedVideos={completedVideos}
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          currentLevel={currentLevel}
          unlockedLevels={unlockedLevels}
          onLevelChange={handleLevelChange}
          onMoveToNext={handleMoveToNext}
          canMoveToNext={canMoveToNext}
          onDifficultyAdjust={handleDifficultyAdjust}
          showDifficultyAdjust={false} // Hide from sidebar since we have floating buttons
        />

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? "ml-[60px]" : "ml-[320px]"}`}>
          <div className="max-w-4xl mx-auto p-8">{renderMainContent()}</div>
        </div>
      </div>

      {/* Floating Difficulty Adjustment */}
      <DifficultyAdjustment currentLevel={currentLevel} onDifficultyAdjust={handleDifficultyAdjust} />

      {/* Toast Notifications */}
      <ToastNotification
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />

      {/* AI Learning Assistant - only visible in Course section */}
      {activeSection === "course" && <AIAssistant isVisible={isAssistantOpen} onOpenChange={setIsAssistantOpen} />}
    </div>
  )
}
