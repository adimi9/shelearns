"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  FileText,
  BookOpen,
  Brain,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  PanelLeft,
  Lock,
  ArrowRight,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

interface Video {
  id: string
  title: string
  duration: string
  youtubeId: string
  completed: boolean
}

interface SectionSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  progress: {
    officialDocs?: boolean
    notes?: boolean
    course: boolean
    quiz: boolean
  }
  availableSections: {
    officialDocs?: boolean
    notes?: boolean
    course: boolean
    quiz: boolean
  }
  courseVideos?: Video[]
  activeVideoId?: string
  onVideoSelect?: (videoId: string) => void
  completedVideos?: Set<string>
  isCollapsed: boolean
  toggleCollapse: () => void
  currentLevel: string
  unlockedLevels: string[]
  onLevelChange?: (level: string) => void
  onMoveToNext?: () => void
  canMoveToNext?: boolean
  onDifficultyAdjust?: (direction: "easier" | "harder") => void
  showDifficultyAdjust?: boolean
}

export default function SectionSidebar({
  activeSection,
  onSectionChange,
  progress,
  availableSections,
  courseVideos = [],
  activeVideoId = "",
  onVideoSelect = () => {},
  completedVideos = new Set(),
  isCollapsed,
  toggleCollapse,
  currentLevel,
  unlockedLevels,
  onLevelChange = () => {},
  onMoveToNext = () => {},
  canMoveToNext = false,
  onDifficultyAdjust = () => {},
  showDifficultyAdjust = true,
}: SectionSidebarProps) {
  const [isCourseExpanded, setIsCourseExpanded] = useState(activeSection === "course")
  const videoListRef = useRef<HTMLDivElement>(null)
  const activeVideoRef = useRef<HTMLButtonElement>(null)

  // Sections to display in the sidebar
  const sections = [
    {
      id: "officialDocs",
      label: "Official Docs",
      icon: ExternalLink,
      available: availableSections.officialDocs,
    },
    {
      id: "notes",
      label: "Notes",
      icon: FileText,
      available: availableSections.notes,
    },
    {
      id: "course",
      label: "Course",
      icon: BookOpen,
      available: availableSections.course,
    },
    {
      id: "quiz",
      label: "Quiz",
      icon: Brain,
      available: availableSections.quiz,
    },
  ].filter((section) => section.available)

  const levels = ["beginner", "intermediate", "advanced"]

  // Calculate overall progress
  const calculateProgress = () => {
    const availableCount = sections.length
    const completed = sections.filter((section) => progress[section.id as keyof typeof progress]).length
    return availableCount > 0 ? Math.round((completed / availableCount) * 100) : 0
  }

  // Handle section click
  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId)
    if (sectionId === "course") {
      setIsCourseExpanded(true)
    } else {
      setIsCourseExpanded(false)
    }
  }

  // Toggle course expansion
  const toggleCourseExpanded = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsCourseExpanded(!isCourseExpanded)
    if (!isCourseExpanded) {
      onSectionChange("course")
    }
  }

  // Scroll active video into view when it changes
  useEffect(() => {
    if (isCourseExpanded && activeVideoRef.current && videoListRef.current) {
      const videoIndex = courseVideos.findIndex((video) => video.id === activeVideoId)

      // Only scroll if not one of the last 4 videos
      if (videoIndex < courseVideos.length - 4) {
        activeVideoRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }, [activeVideoId, isCourseExpanded, courseVideos])

  // Expand course section when activeSection is "course"
  useEffect(() => {
    if (activeSection === "course") {
      setIsCourseExpanded(true)
    }
  }, [activeSection])

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

  const isLevelUnlocked = (level: string) => {
    return unlockedLevels.includes(level)
  }

  const getTooltipMessage = (level: string) => {
    const levelIndex = levels.indexOf(level)
    const currentIndex = levels.indexOf(currentLevel)

    if (levelIndex <= currentIndex) return ""

    const requiredLevels = levels.slice(0, levelIndex)
    const uncompletedLevels = requiredLevels.filter((l) => !unlockedLevels.includes(l))

    if (uncompletedLevels.length > 0) {
      return `Complete ${uncompletedLevels.join(" and ")} to unlock`
    }
    return ""
  }

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? "60px" : "320px" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-white border-r-4 border-black h-full relative overflow-hidden"
    >
      {/* Collapse toggle button */}
      <button
        onClick={toggleCollapse}
        className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <PanelLeft className={`w-5 h-5 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
      </button>

      <div className={`p-6 ${isCollapsed ? "opacity-0" : "opacity-100"} transition-opacity duration-200`}>
        <h3 className="text-lg font-bold mb-6">Course Content</h3>

        {/* Difficulty Adjustment */}
        {showDifficultyAdjust && !isCollapsed && (
          <div className="mb-6 p-3 bg-gray-50 border-2 border-gray-200 rounded-lg">
            <h4 className="text-sm font-bold mb-2">Difficulty Level</h4>
            <div className="flex gap-2">
              {currentLevel !== "beginner" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDifficultyAdjust("easier")}
                  className="text-xs border-2 border-black"
                >
                  Too Hard?
                </Button>
              )}
              {currentLevel !== "advanced" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDifficultyAdjust("harder")}
                  className="text-xs border-2 border-black"
                >
                  Too Easy?
                </Button>
              )}
            </div>
          </div>
        )}

        <nav className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon
            const isCompleted = progress[section.id as keyof typeof progress]
            const isActive = activeSection === section.id

            return (
              <div key={section.id} className="flex flex-col">
                <button
                  onClick={() => handleSectionClick(section.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-pink-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      : "hover:bg-pink-100 text-black"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium flex-1">{section.label}</span>
                  {isCompleted && <div className="w-2 h-2 rounded-full bg-green-400"></div>}

                  {section.id === "course" && (
                    <button
                      onClick={toggleCourseExpanded}
                      className={`p-1 rounded-full hover:bg-black hover:bg-opacity-10 ${isActive ? "text-white" : "text-black"}`}
                    >
                      {isCourseExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  )}
                </button>

                {/* Course Videos List */}
                {section.id === "course" && (
                  <AnimatePresence>
                    {isCourseExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden ml-4 mt-1"
                      >
                        <div className="text-xs text-gray-500 px-3 py-2 flex justify-between items-center">
                          <span>Videos</span>
                          <span>
                            {completedVideos.size}/{courseVideos.length} completed
                          </span>
                        </div>

                        <div
                          ref={videoListRef}
                          className="max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                        >
                          {courseVideos.map((video, index) => (
                            <button
                              key={video.id}
                              ref={video.id === activeVideoId ? activeVideoRef : null}
                              onClick={() => onVideoSelect(video.id)}
                              className={`w-full flex items-center gap-2 p-2 text-left text-sm rounded-lg mb-1 transition-colors ${
                                activeVideoId === video.id
                                  ? "bg-pink-100 border-l-2 border-pink-500"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                                {completedVideos.has(video.id) ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <span className="text-xs font-medium">{index + 1}</span>
                                )}
                              </div>
                              <span className="truncate flex-1">{video.title}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            )
          })}
        </nav>

        {/* Level Progression */}
        <div className="mt-8 pt-6 border-t-2 border-gray-200">
          <h4 className="text-sm font-bold mb-4">Course Levels</h4>
          <div className="space-y-2">
            {levels.map((level) => {
              const isUnlocked = isLevelUnlocked(level)
              const isCurrent = level === currentLevel
              const tooltipMessage = getTooltipMessage(level)

              return (
                <div key={level} className="relative group">
                  <button
                    onClick={() => isUnlocked && onLevelChange(level)}
                    disabled={!isUnlocked}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                      isCurrent
                        ? "bg-pink-500 text-white"
                        : isUnlocked
                          ? "hover:bg-gray-100 text-black"
                          : "text-gray-400 cursor-not-allowed"
                    }`}
                    title={tooltipMessage}
                  >
                    <div className={`w-3 h-3 rounded-full ${getLevelColor(level)}`}></div>
                    <span className="text-sm font-medium capitalize flex-1">{level}</span>
                    {!isUnlocked && <Lock className="w-4 h-4" />}
                    {isCurrent && <span className="text-xs bg-white text-pink-500 px-2 py-1 rounded">Current</span>}
                  </button>

                  {/* Tooltip */}
                  {tooltipMessage && (
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {tooltipMessage}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Move to Next Course */}
        {canMoveToNext && (
          <div className="mt-6 pt-4 border-t-2 border-gray-200">
            <Button
              onClick={onMoveToNext}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2"
            >
              Move to Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Progress at bottom */}
        <div className="mt-8 pt-6 border-t-2 border-gray-200">
          <div className="text-center mb-2">
            <span className="text-sm font-medium">Sub-Course Progress</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 border-2 border-black">
            <div
              className="bg-pink-500 h-full rounded-full transition-all duration-500 flex items-center justify-center"
              style={{ width: `${calculateProgress()}%` }}
            >
              <span className="text-xs font-bold text-white">{calculateProgress()}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsed view */}
      {isCollapsed && (
        <div className="flex flex-col items-center pt-16 space-y-6">
          {sections.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.id

            return (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className={`p-3 rounded-full transition-all ${
                  isActive ? "bg-pink-500 text-white" : "hover:bg-pink-100 text-black"
                }`}
                title={section.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
