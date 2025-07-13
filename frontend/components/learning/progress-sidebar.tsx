// components/progress-sidebar-updated.tsx (Hypothetical, assuming it replaces SectionSidebar)
"use client";

import { CheckCircle, Circle, Play, BookOpen, FileText } from "lucide-react";

// You would likely pass the full course details or specific parts of it
interface CourseSectionProgress {
  officialDocs: boolean;
  notes: boolean;
  course: boolean; // Refers to the main video course section
  quiz: boolean;
}

interface ProgressSidebarProps {
  courseTitle: string;
  calculatedProgress: CourseSectionProgress;
  availableSections: {
    officialDocs: boolean;
    notes: boolean;
    course: boolean;
    quiz: boolean;
  };
  // If you want to show video counts, you'd need to pass the videos array
  courseVideos?: Array<{ id: string; title: string; completed: boolean }>;
  quizQuestions?: Array<{ id: string; questionText: string; completed: boolean; scoreAwarded?: number }>;
  activeSection: string;
  onSectionChange: (section: string) => void;
  isCollapsed?: boolean; // If this sidebar is collapsible
  toggleCollapse?: () => void; // If this sidebar is collapsible
}

export default function ProgressSidebar({
  courseTitle,
  calculatedProgress,
  availableSections,
  courseVideos,
  quizQuestions,
  activeSection,
  onSectionChange,
  isCollapsed,
  toggleCollapse,
}: ProgressSidebarProps) {
  // Calculate overall progress based on the new structure
  const calculateOverallProgress = () => {
    let totalSections = 0;
    let completedSections = 0;

    if (availableSections.officialDocs) {
      totalSections++;
      if (calculatedProgress.officialDocs) completedSections++;
    }
    if (availableSections.notes) {
      totalSections++;
      if (calculatedProgress.notes) completedSections++;
    }
    if (availableSections.course) {
      totalSections++;
      if (calculatedProgress.course) completedSections++;
    }
    if (availableSections.quiz) {
      totalSections++;
      if (calculatedProgress.quiz) completedSections++;
    }

    return totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
  };

  const overallProgressValue = calculateOverallProgress();

  return (
    <div className="sticky top-6 bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="text-xl font-bold mb-4">{courseTitle} Progress</h3> {/* Adjusted title */}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Overall Course Progress</span>
          <span className="text-sm font-bold">{overallProgressValue}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 border-2 border-black">
          <div
            className="bg-pink-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${overallProgressValue}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Official Docs Section */}
        {availableSections.officialDocs && (
          <div className={`border-2 rounded-lg p-3 ${activeSection === "officialDocs" ? "border-pink-600" : "border-gray-200"}`}>
            <button
              onClick={() => onSectionChange("officialDocs")}
              className={`w-full text-left transition-colors ${
                activeSection === "officialDocs" ? "text-pink-600 font-bold" : "hover:text-pink-600"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Official Documentation</span>
                {calculatedProgress.officialDocs && <CheckCircle className="w-4 h-4 text-green-500" />}
              </div>
            </button>
            <div className="flex items-center gap-2 text-xs ml-2">
              <BookOpen className="w-3 h-3" />
              <span className={calculatedProgress.officialDocs ? "text-green-600" : "text-gray-500"}>
                All docs completed
              </span>
            </div>
          </div>
        )}

        {/* Notes Section */}
        {availableSections.notes && (
          <div className={`border-2 rounded-lg p-3 ${activeSection === "notes" ? "border-pink-600" : "border-gray-200"}`}>
            <button
              onClick={() => onSectionChange("notes")}
              className={`w-full text-left transition-colors ${
                activeSection === "notes" ? "text-pink-600 font-bold" : "hover:text-pink-600"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Notes & Tutorials</span>
                {calculatedProgress.notes && <CheckCircle className="w-4 h-4 text-green-500" />}
              </div>
            </button>
            <div className="flex items-center gap-2 text-xs ml-2">
              <FileText className="w-3 h-3" />
              <span className={calculatedProgress.notes ? "text-green-600" : "text-gray-500"}>
                All notes completed
              </span>
            </div>
          </div>
        )}

        {/* Main Course Video Section */}
        {availableSections.course && (
          <div className={`border-2 rounded-lg p-3 ${activeSection === "course" ? "border-pink-600" : "border-gray-200"}`}>
            <button
              onClick={() => onSectionChange("course")}
              className={`w-full text-left transition-colors ${
                activeSection === "course" ? "text-pink-600 font-bold" : "hover:text-pink-600"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Video Course</span>
                {calculatedProgress.course && <CheckCircle className="w-4 h-4 text-green-500" />}
              </div>
            </button>
            <div className="flex items-center gap-2 text-xs ml-2">
              <Play className="w-3 h-3" />
              <span className={calculatedProgress.course ? "text-green-600" : "text-gray-500"}>
                {courseVideos ? `${courseVideos.filter(v => v.completed).length}/${courseVideos.length} videos completed` : "Videos available"}
              </span>
            </div>
          </div>
        )}

        {/* Quiz Section */}
        {availableSections.quiz && (
          <div className={`border-2 rounded-lg p-3 ${activeSection === "quiz" ? "border-pink-600" : "border-gray-200"}`}>
            <button
              onClick={() => onSectionChange("quiz")}
              className={`w-full text-left transition-colors ${
                activeSection === "quiz" ? "text-pink-600 font-bold" : "hover:text-pink-600"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Quiz</span>
                {calculatedProgress.quiz && <CheckCircle className="w-4 h-4 text-green-500" />}
              </div>
            </button>
            <div className="flex items-center gap-2 text-xs ml-2">
              <Circle className="w-3 h-3" /> {/* Using Circle as a generic quiz icon */}
              <span className={calculatedProgress.quiz ? "text-green-600" : "text-gray-500"}>
                Quiz completed {quizQuestions && calculatedProgress.quiz ? `(Score: ${quizQuestions.reduce((sum, q) => sum + (q.scoreAwarded || 0), 0)})` : ""}
              </span>
            </div>
          </div>
        )}
      </div>
      {/* Add collapse button if needed */}
      {toggleCollapse && (
        <button onClick={toggleCollapse} className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700">
          {isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        </button>
      )}
    </div>
  );
}