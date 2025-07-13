"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
  FileText,
  BookOpen,
  Brain,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Video {
  id: string;
  title: string;
  duration: string;
  youtubeId: string;
  completed: boolean;
}

interface SectionSidebarProps {
  courseTitle: string;
  activeSection: string;
  onSectionChange: (section: string) => void;
  progress: {
    officialDocs?: boolean;
    notes?: boolean;
    course: boolean;
    quiz: boolean;
  };
  availableSections: {
    officialDocs?: boolean;
    notes?: boolean;
    course: boolean;
    quiz: boolean;
  };
  courseVideos?: Video[];
  activeVideoId?: string;
  onVideoSelect?: (videoId: string) => void;
  completedVideos?: Set<string>;
  // Removed isCollapsed and toggleCollapse props
  overallCourseProgress: number; // Percentage from 0-100
}

export default function SectionSidebar({
  courseTitle,
  activeSection,
  onSectionChange,
  progress,
  availableSections,
  courseVideos = [],
  activeVideoId = "",
  onVideoSelect = () => {},
  completedVideos = new Set(),
  // Removed isCollapsed from destructuring
  // Removed toggleCollapse from destructuring
  overallCourseProgress,
}: SectionSidebarProps) {
  const [isCourseVideosExpanded, setIsCourseVideosExpanded] = useState(activeSection === "course");
  const videoListRef = useRef<HTMLDivElement>(null);
  const activeVideoRef = useRef<HTMLButtonElement>(null);

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
  ].filter((section) => section.available);

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId);
    if (sectionId === "course") {
      setIsCourseVideosExpanded(true);
    } else {
      setIsCourseVideosExpanded(false);
    }
  };

  const toggleCourseVideosExpansion = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCourseVideosExpanded((prev) => !prev);
  };

  useEffect(() => {
    if (isCourseVideosExpanded && activeVideoRef.current && videoListRef.current) {
      const videoIndex = courseVideos.findIndex((video) => video.id === activeVideoId);
      // Only scroll if the active video is not visible or close to the top
      if (videoIndex >= 0 && videoIndex < courseVideos.length - 4) {
        activeVideoRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [activeVideoId, isCourseVideosExpanded, courseVideos]);

  useEffect(() => {
    if (activeSection === "course") {
      setIsCourseVideosExpanded(true);
    }
  }, [activeSection]);

  return (
    // Changed from motion.div to div and set a fixed width
    <div className="bg-white border-r-4 border-black h-full relative overflow-hidden w-[320px]">
      {/* Removed the collapse button completely */}

      <div className="p-6 pt-32">
        {/* Added classes to handle text wrapping and prevent cutoff */}
        <h3 className="text-lg font-bold mb-6 break-words whitespace-normal leading-tight">
          {courseTitle}
        </h3>

        <nav className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            const isCompleted = progress[section.id as keyof typeof progress];
            const isActive = activeSection === section.id;

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
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium flex-1 text-left">{section.label}</span>
                  {isCompleted && <div className="w-2 h-2 rounded-full bg-green-400"></div>}

                  {section.id === "course" && (
                    <div
                      onClick={toggleCourseVideosExpansion}
                      className={`p-1 rounded-full hover:bg-gray-200 cursor-pointer ${
                        isActive ? "text-white hover:bg-opacity-10" : "text-black"
                      }`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleCourseVideosExpansion(e as unknown as React.MouseEvent);
                        }
                      }}
                      aria-expanded={isCourseVideosExpanded}
                      aria-controls="course-videos-list"
                    >
                      {isCourseVideosExpanded ? (
                        <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="w-4 h-4 transition-transform duration-200" />
                      )}
                    </div>
                  )}
                </button>

                {section.id === "course" && (
                  <AnimatePresence>
                    {isCourseVideosExpanded && (
                      <motion.div
                        id="course-videos-list"
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
                          className="max-h-100 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
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
            );
          })}
        </nav>
      </div>
      {/* Removed the entire isCollapsed block */}
    </div>
  );
}