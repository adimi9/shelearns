"use client"

import { useState } from "react"
import { Play, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Video {
  id: string
  title: string
  duration: string
  startTime: string
  completed: boolean
}

interface FullCourseSectionProps {
  videos: Video[]
  onVideoComplete: (videoId: string) => void
  onCourseComplete: () => void
  isCompleted: boolean
}

export default function FullCourseSection({
  videos,
  onVideoComplete,
  onCourseComplete,
  isCompleted,
}: FullCourseSectionProps) {
  const [currentVideo, setCurrentVideo] = useState<string | null>(null)
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set())

  const handleVideoComplete = (videoId: string) => {
    const newCompleted = new Set(completedVideos)
    newCompleted.add(videoId)
    setCompletedVideos(newCompleted)
    onVideoComplete(videoId)

    // Check if all videos are completed
    if (newCompleted.size === videos.length && !isCompleted) {
      onCourseComplete()
    }
  }

  const completedCount = completedVideos.size
  const progressPercentage = (completedCount / videos.length) * 100

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black mb-2">Full Course</h2>
        <p className="text-gray-600">Complete video series with detailed explanations</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 bg-white border-4 border-black rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Course Progress</h3>
          <span className="text-sm font-medium">
            {completedCount}/{videos.length} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 border-2 border-black">
          <div
            className="bg-pink-500 h-full rounded-full transition-all duration-500 flex items-center justify-center"
            style={{ width: `${progressPercentage}%` }}
          >
            {progressPercentage > 0 && (
              <span className="text-xs font-bold text-white">{Math.round(progressPercentage)}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Video Playlist */}
      <div className="bg-white border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="p-6 border-b-4 border-black bg-gray-50">
          <h3 className="text-xl font-bold">Video Playlist</h3>
        </div>

        <div className="divide-y-2 divide-gray-200">
          {videos.map((video, index) => (
            <div key={video.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 border-2 border-black text-sm font-bold">
                    {completedVideos.has(video.id) ? <CheckCircle className="w-6 h-6 text-green-500" /> : index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold mb-1">{video.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{video.duration}</span>
                      </div>
                      <span>•</span>
                      <span>Starts at {video.startTime}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setCurrentVideo(video.id)
                    // Simulate video completion after 3 seconds for demo
                    setTimeout(() => handleVideoComplete(video.id), 3000)
                  }}
                  className={`${
                    completedVideos.has(video.id) ? "bg-green-500 hover:bg-green-600" : "bg-pink-600 hover:bg-black"
                  } text-white font-bold px-6 py-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-[-2px]`}
                  disabled={completedVideos.has(video.id)}
                >
                  {completedVideos.has(video.id) ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      {currentVideo === video.id ? "Playing..." : "Play"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {isCompleted && (
          <div className="p-6 bg-green-50 border-t-4 border-green-500 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-700 mb-2">Full Course Completed! 🎉</h3>
            <p className="text-green-600">You've finished all videos in this course.</p>
          </div>
        )}
      </div>
    </div>
  )
}
