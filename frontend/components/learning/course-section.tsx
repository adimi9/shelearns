"use client"
import { CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface Video {
  id: string
  title: string
  duration: string
  youtubeId: string
  completed: boolean
}

interface CourseSectionProps {
  videos: Video[]
  onVideoComplete: (videoId: string) => void
  onCourseComplete: () => void
  isCompleted: boolean
  activeVideoId: string
  onVideoSelect: (videoId: string) => void
  completedVideos: Set<string>
  isAssistantOpen: boolean
}

export default function CourseSection({
  videos,
  onVideoComplete,
  onCourseComplete,
  isCompleted,
  activeVideoId,
  onVideoSelect,
  completedVideos,
  isAssistantOpen,
}: CourseSectionProps) {
  const currentVideoData = videos.find((video) => video.id === activeVideoId) || videos[0]

  const handleVideoComplete = (videoId: string) => {
    onVideoComplete(videoId)

    // Check if all videos are completed
    if (completedVideos.size + 1 === videos.length && !isCompleted) {
      onCourseComplete()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full transition-all duration-300 ${isAssistantOpen ? "mr-[30%]" : ""}`}
    >
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black mb-2">Course Videos</h2>
        <p className="text-gray-600">Complete video series with detailed explanations</p>
      </div>

      <div className="bg-white border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {currentVideoData && (
          <>
            {/* YouTube Player */}
            <div className="relative aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${currentVideoData.youtubeId}?autoplay=0&rel=0`}
                title={currentVideoData.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>

              {/* Completion badge */}
              {completedVideos.has(currentVideoData.id) && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  ✓ Completed
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{currentVideoData.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{currentVideoData.duration}</span>
                </div>
                <span>•</span>
                <span>
                  Video {videos.findIndex((v) => v.id === activeVideoId) + 1} of {videos.length}
                </span>
              </div>

              {!completedVideos.has(currentVideoData.id) && (
                <Button
                  onClick={() => handleVideoComplete(currentVideoData.id)}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  Mark as Completed
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-green-50 border-4 border-green-500 rounded-xl p-6 text-center"
        >
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-700 mb-2">Course Completed! 🎉</h3>
          <p className="text-green-600">You've finished all videos in this course.</p>
        </motion.div>
      )}
    </motion.div>
  )
}
