"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SectionSidebar from "@/components/learning/section-sidebar";
import OfficialDocsSection from "@/components/learning/official-docs-section";
import NotesSection from "@/components/learning/notes-section";
import CourseSection from "@/components/learning/course-section";
import QuizSection from "@/components/learning/quiz-section";
import ToastNotification from "@/components/learning/toast-notification";
import AIAssistant from "@/components/learning/ai-assistant";
import DifficultyAdjustment from "@/components/learning/difficulty-adjustment";

export default function LearningDashboard({ params }: { params: { courseId: string } }) {
  const router = useRouter();

  // The 'courseId' param can still be used for routing to *different* main courses
  // if you expand your application, but for this component, it's a single, combined course.
  const mainCourseId = params.courseId || "html-css-fundamentals";

  const [activeSection, setActiveSection] = useState("course"); // Default to 'course' section
  const [activeVideoId, setActiveVideoId] = useState(""); // Tracks the currently playing video
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set()); // Stores IDs of completed videos
  const [completedDocs, setCompletedDocs] = useState<Set<string>>(new Set()); // Stores IDs of completed docs
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Controls sidebar visibility/width
  const [isAssistantOpen, setIsAssistantOpen] = useState(false); // Controls AI assistant panel visibility
  const [currentLevel, setCurrentLevel] = useState("beginner"); // User's current difficulty level
  const [unlockedLevels, setUnlockedLevels] = useState(["beginner"]); // Levels the user has unlocked access to
  const [userXP, setUserXP] = useState(1250); // User's experience points
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  // --- Unified Course Data Structure ---
  // All content from the previous 'subCourses' (HTML and CSS) is now merged
  // into one single, comprehensive course object.
  const courseData = {
    id: "html-css-fundamentals", // Unique ID for this combined course
    title: "HTML & CSS Fundamentals: Complete Course", // Display title for the unified course
    description: "Master foundational HTML5 structure and advanced CSS styling for modern web development.",
    sections: {
      officialDocs: {
        available: true,
        docs: [
          // Combined HTML5 documentation references
          {
            id: "html5-mdn",
            title: "HTML5 Official Documentation (MDN)",
            description: "Comprehensive reference from MDN Web Docs covering all HTML5 elements and best practices.",
            url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
          },
          {
            id: "html5-w3c",
            title: "W3C HTML5 Specification",
            description: "The official W3C specification for HTML5 with detailed technical information.",
            url: "https://www.w3.org/TR/html52/",
          },
          // Combined CSS documentation references
          {
            id: "css-mdn",
            title: "CSS Documentation (MDN)",
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
          // Combined HTML notes
          {
            id: "html-note-1",
            title: "Understanding HTML5 Semantic Elements",
            description: "Learn about the importance of semantic HTML and accessibility",
            readTime: "5 min",
            url: "#",
          },
          {
            id: "html-note-2",
            title: "HTML5 Best Practices Guide",
            description: "Modern approaches to writing clean, maintainable HTML",
            readTime: "8 min",
            url: "#",
          },
          // Combined CSS notes
          {
            id: "css-note-1",
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
          // Combined HTML videos
          {
            id: "html-vid-1",
            title: "Introduction to HTML5",
            duration: "12:30",
            youtubeId: "UB1O30fR-EE",
            completed: false,
          },
          {
            id: "html-vid-2",
            title: "Semantic Elements Deep Dive",
            duration: "18:45",
            youtubeId: "UB1O30fR-EE",
            completed: false,
          },
          {
            id: "html-vid-3",
            title: "Forms and Input Types",
            duration: "15:20",
            youtubeId: "UB1O30fR-EE",
            completed: false,
          },
          {
            id: "html-vid-4",
            title: "HTML5 Media Elements",
            duration: "14:10",
            youtubeId: "UB1O30fR-EE",
            completed: false,
          },
          {
            id: "html-vid-5",
            title: "Accessibility Best Practices",
            duration: "20:05",
            youtubeId: "UB1O30fR-EE",
            completed: false,
          },
          {
            id: "html-vid-6",
            title: "HTML5 APIs Overview",
            duration: "16:40",
            youtubeId: "UB1O30fR-EE",
            completed: false,
          },
          {
            id: "html-vid-7",
            title: "Responsive Design Principles",
            duration: "22:15",
            youtubeId: "UB1O30fR-EE",
            completed: false,
          },
          // Combined CSS videos
          {
            id: "css-vid-1",
            title: "CSS Fundamentals",
            duration: "20:15",
            youtubeId: "UB1O30fR-EE",
            completed: false,
          },
          {
            id: "css-vid-2",
            title: "Flexbox Layout",
            duration: "25:30",
            youtubeId: "UB1O30fR-EE",
            completed: false,
          },
          {
            id: "css-vid-3",
            title: "CSS Grid Layout",
            duration: "28:45",
            youtubeId: "UB1O30fR-EE",
            completed: false,
          },
          {
            id: "css-vid-4",
            title: "Responsive Design with Media Queries",
            duration: "22:10",
            youtubeId: "UB1O30fR-EE",
            completed: false,
          },
          {
            id: "css-vid-5",
            title: "CSS Animations and Transitions",
            duration: "19:30",
            youtubeId: "UB1O30fR-EE",
            completed: false,
          },
          {
            id: "css-vid-6",
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
  };

  // --- Simplified Progress State ---
  // Progress is now tracked directly for the four main sections of this single course.
  const [progress, setProgress] = useState({
    officialDocs: false,
    notes: false,
    course: false,
    quiz: false,
  });

  // XP values awarded for various activities
  const xpValues = {
    video: 50,
    article: 30,
    doc: 25,
    quiz: 100,
    sectionComplete: 200,
  };

  // Effect to set the initial active video when the component mounts.
  useEffect(() => {
    if (courseData.sections.course?.available && courseData.sections.course.videos.length > 0) {
      setActiveVideoId(courseData.sections.course.videos[0].id);
    }
  }, []); // Runs only once on component mount

  // Handles marking a major section (Official Docs, Notes, Course, Quiz) as complete.
  const handleSectionComplete = (section: string) => {
    setProgress((prev) => ({
      ...prev,
      [section]: true, // Mark the specified section as completed
    }));

    const earnedXP = xpValues.sectionComplete;
    setUserXP((prev) => prev + earnedXP);

    setToast({
      message: `${
        section === "quiz" ? "Quiz" : section.charAt(0).toUpperCase() + section.slice(1)
      } completed! +${earnedXP} XP 🎉`,
      type: "success",
      isVisible: true,
    });

    // Check if all sections of the course are now complete
    const currentProgress = {
      ...progress,
      [section]: true,
    };
    const allSectionsComplete = Object.values(currentProgress).every(Boolean);

    // Logic for unlocking higher difficulty levels once all content is complete
    if (allSectionsComplete) {
      if (currentLevel === "beginner" && !unlockedLevels.includes("intermediate")) {
        setUnlockedLevels((prev) => [...prev, "intermediate"]);
        setUserXP((prev) => prev + 500); // Bonus XP for unlocking
        setToast({
          message:
            "🎉 Intermediate level unlocked! +500 bonus XP! You can now access more challenging content.",
          type: "success",
          isVisible: true,
        });
      } else if (currentLevel === "intermediate" && !unlockedLevels.includes("advanced")) {
        setUnlockedLevels((prev) => [...prev, "advanced"]);
        setUserXP((prev) => prev + 1000); // Larger bonus for advanced
        setToast({
          message: "🎉 Advanced level unlocked! +1000 bonus XP! You're ready for expert content!",
          type: "success",
          isVisible: true,
        });
      }
    }
  };

  // Handles marking a single video as complete.
  const handleVideoComplete = (videoId: string) => {
    setCompletedVideos((prev) => {
      const newSet = new Set(prev);
      newSet.add(videoId);
      return newSet;
    });

    const earnedXP = xpValues.video;
    setUserXP((prev) => prev + earnedXP);

    setToast({
      message: `Video completed! +${earnedXP} XP 🎉`,
      type: "success",
      isVisible: true,
    });
  };

  // Handles marking a single documentation entry as complete.
  const handleDocComplete = (docId: string) => {
    setCompletedDocs((prev) => {
      const newSet = new Set(prev);
      newSet.add(docId);
      return newSet;
    });

    const earnedXP = xpValues.doc;
    setUserXP((prev) => prev + earnedXP);

    setToast({
      message: `Documentation read! +${earnedXP} XP 📚`,
      type: "success",
      isVisible: true,
    });
  };

  // Allows the user to manually change their difficulty level.
  const handleLevelChange = (level: string) => {
    // Prevent switching to higher levels if prerequisites aren't met
    if (level === "intermediate" && currentLevel === "beginner") {
      const allSectionsComplete = Object.values(progress).every(Boolean);
      if (!allSectionsComplete) {
        setToast({
          message: "Complete all beginner content first to unlock intermediate level! 🔒",
          type: "error",
          isVisible: true,
        });
        return;
      }
    }

    if (level === "advanced" && (currentLevel === "beginner" || currentLevel === "intermediate")) {
      const allSectionsComplete = Object.values(progress).every(Boolean);
      if (!allSectionsComplete) {
        setToast({
          message: "Complete all current level content first to unlock advanced level! 🔒",
          type: "error",
          isVisible: true,
        });
        return;
      }
    }

    setCurrentLevel(level);
    setToast({
      message: `Switched to ${level} level! 📈`,
      type: "info",
      isVisible: true,
    });
  };

  // Adjusts the difficulty level one step easier or harder.
  const handleDifficultyAdjust = (direction: "easier" | "harder") => {
    const levels = ["beginner", "intermediate", "advanced"];
    const currentIndex = levels.indexOf(currentLevel);

    if (direction === "easier" && currentIndex > 0) {
      const newLevel = levels[currentIndex - 1];
      setCurrentLevel(newLevel);
      if (!unlockedLevels.includes(newLevel)) {
        setUnlockedLevels((prev) => [...prev, newLevel]); // Unlock if not already
      }
      setToast({
        message: `Switched to ${newLevel} level for easier content! 📚`,
        type: "info",
        isVisible: true,
      });
    } else if (direction === "harder" && currentIndex < levels.length - 1) {
      const newLevel = levels[currentIndex + 1];
      setCurrentLevel(newLevel);
      if (!unlockedLevels.includes(newLevel)) {
        setUnlockedLevels((prev) => [...prev, newLevel]); // Unlock if not already
      }
      setToast({
        message: `Switched to ${newLevel} level for more challenging content! 🚀`,
        type: "info",
        isVisible: true,
      });
    }
  };

  // Called when the user attempts to move to the 'next' course.
  // Since we have a single combined course here, this signifies completion of the entire course.
  const handleMoveToNext = () => {
    setToast({
      message: "Congratulations! You've completed this course! Moving to the next adventure! 🎯",
      type: "success",
      isVisible: true,
    });
    // In a full application, you might redirect the user to a course catalog,
    // a completion certificate page, or the start of another major course.
    // router.push("/courses/next-main-course-id");
  };

  // Retrieves the list of videos for the course section.
  const currentVideos = courseData.sections.course?.available
    ? courseData.sections.course.videos
    : [];

  // Determines if the "Move to Next Course" button should be enabled.
  // It's enabled if all sections are complete AND the user is at intermediate or advanced level.
  const canMoveToNext =
    Object.values(progress).every(Boolean) &&
    (currentLevel === "intermediate" || currentLevel === "advanced");

  // Sample quiz questions for the combined HTML & CSS course.
  // You could expand this with more CSS-specific questions.
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
  ];

  // Renders the appropriate main content component based on the active section.
  const renderMainContent = () => {
    // Determine which sections are available for the current (single) course
    const availableSectionsForCourse = {
      officialDocs: courseData.sections.officialDocs?.available || false,
      notes: courseData.sections.notes?.available || false,
      course: courseData.sections.course?.available || false,
      quiz: courseData.sections.quiz?.available || false,
    };

    switch (activeSection) {
      case "officialDocs":
        if (!availableSectionsForCourse.officialDocs) return null;
        return (
          <OfficialDocsSection
            docs={courseData.sections.officialDocs.docs}
            onComplete={handleDocComplete}
            completedDocs={completedDocs}
            onAllComplete={() => handleSectionComplete("officialDocs")}
          />
        );
      case "notes":
        if (!availableSectionsForCourse.notes) return null;
        return (
          <NotesSection
            notes={courseData.sections.notes.data}
            onComplete={() => handleSectionComplete("notes")}
            isCompleted={progress.notes || false}
          />
        );
      case "course":
        if (!availableSectionsForCourse.course) return null;
        return (
          <CourseSection
            videos={courseData.sections.course.videos}
            onVideoComplete={handleVideoComplete}
            onCourseComplete={() => handleSectionComplete("course")}
            isCompleted={progress.course || false}
            activeVideoId={activeVideoId}
            onVideoSelect={setActiveVideoId}
            completedVideos={completedVideos}
            isAssistantOpen={isAssistantOpen}
          />
        );
      case "quiz":
        if (!availableSectionsForCourse.quiz) return null;
        return (
          <QuizSection
            questions={sampleQuestions}
            onComplete={(score) => handleSectionComplete("quiz")}
            isCompleted={progress.quiz || false}
          />
        );
      default:
        return null;
    }
  };

  // Sections available in the sidebar, directly from the courseData.
  const availableSections = {
    officialDocs: courseData.sections.officialDocs?.available || false,
    notes: courseData.sections.notes?.available || false,
    course: courseData.sections.course?.available || false,
    quiz: courseData.sections.quiz?.available || false,
  };

  // --- Main Component Render ---
  return (
    <div className="min-h-screen bg-pink-50">
      {/* The main <h1> title has been removed to allow the sidebar to extend to the top. */}

      <div className="flex min-h-screen">
        {/* Left Sidebar Component */}
        <SectionSidebar
          courseTitle={courseData.title} // Pass the course title to the sidebar for display
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          progress={progress}
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
          showDifficultyAdjust={false}
        />

        {/* Main Content Area */}
        <div
          className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? "ml-[60px]" : "ml-[320px]"
          }`}
        >
          {/* Removed top padding to allow content to align with the very top of the sidebar. */}
          <div className="max-w-4xl mx-auto">{renderMainContent()}</div>
        </div>
      </div>

      {/* Floating Difficulty Adjustment */}
      <DifficultyAdjustment
        currentLevel={currentLevel}
        onDifficultyAdjust={handleDifficultyAdjust}
      />

      {/* Toast Notifications */}
      <ToastNotification
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />

      {/* AI Learning Assistant - only visible when in the "course" section */}
      {activeSection === "course" && (
        <AIAssistant isVisible={isAssistantOpen} onOpenChange={setIsAssistantOpen} />
      )}
    </div>
  );
}