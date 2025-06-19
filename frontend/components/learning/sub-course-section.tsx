"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Play, FileText, BookOpen, Brain } from "lucide-react"
import VideoPlayer from "./video-player"
import ArticleCard from "./article-card"
import FullCoursePlaylist from "./full-course-playlist"
import QuizSection from "./quiz-section"

interface SubCourseSectionProps {
  id: string
  title: string
  description: string
  isExpanded: boolean
  onToggle: () => void
  onProgress: (type: string, completed: boolean) => void
}

export default function SubCourseSection({
  id,
  title,
  description,
  isExpanded,
  onToggle,
  onProgress,
}: SubCourseSectionProps) {
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set())

  const handleSectionComplete = (sectionType: string) => {
    const newCompleted = new Set(completedSections)
    newCompleted.add(sectionType)
    setCompletedSections(newCompleted)
    onProgress(sectionType, true)
  }

  // Sample data - in a real app, this would come from props or API
  const sampleArticles = [
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
  ]

  const sampleVideos = [
    {
      id: "1",
      title: "Introduction to HTML5",
      duration: "12:30",
      timestamp: "0:00",
      completed: false,
    },
    {
      id: "2",
      title: "Semantic Elements Deep Dive",
      duration: "18:45",
      timestamp: "12:30",
      completed: false,
    },
    {
      id: "3",
      title: "Forms and Input Types",
      duration: "15:20",
      timestamp: "31:15",
      completed: false,
    },
  ]

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

  return (
    <div className="bg-white border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300">
      <button onClick={onToggle} className="w-full p-6 text-left hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {["crashCourse", "articles", "fullCourse", "quiz"].map((section) => (
                <div
                  key={section}
                  className={`w-3 h-3 rounded-full ${completedSections.has(section) ? "bg-green-500" : "bg-gray-300"}`}
                />
              ))}
            </div>
            {isExpanded ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t-4 border-black">
          <div className="p-6 space-y-8">
            {/* Crash Course Video */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-pink-600" />
                <h4 className="text-lg font-bold">Crash Course Video</h4>
              </div>
              <VideoPlayer
                title={`${title} - Quick Overview`}
                duration="8:30"
                onComplete={() => handleSectionComplete("crashCourse")}
                isCompleted={completedSections.has("crashCourse")}
              />
            </div>

            {/* Articles */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-pink-600" />
                <h4 className="text-lg font-bold">Reading Materials</h4>
              </div>
              <ArticleCard
                articles={sampleArticles}
                onComplete={() => handleSectionComplete("articles")}
                isCompleted={completedSections.has("articles")}
              />
            </div>

            {/* Full Course */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-pink-600" />
                <h4 className="text-lg font-bold">Full Course</h4>
              </div>
              <FullCoursePlaylist
                videos={sampleVideos}
                onVideoComplete={(videoId) => console.log(`Video ${videoId} completed`)}
                onCourseComplete={() => handleSectionComplete("fullCourse")}
                isCompleted={completedSections.has("fullCourse")}
              />
            </div>

            {/* Quiz */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-pink-600" />
                <h4 className="text-lg font-bold">Knowledge Check</h4>
              </div>
              <QuizSection
                questions={sampleQuestions}
                onComplete={(score) => {
                  handleSectionComplete("quiz")
                  console.log(`Quiz completed with score: ${score}`)
                }}
                isCompleted={completedSections.has("quiz")}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
