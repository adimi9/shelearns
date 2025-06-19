"use client"

import { useState, useRef } from "react"
import { Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CrashCourseSectionProps {
  title: string
  onComplete: () => void
  isCompleted: boolean
}

export default function CrashCourseSection({ title, onComplete, isCompleted }: CrashCourseSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setProgress(currentProgress)

      // Mark as complete when 90% watched
      if (currentProgress >= 90 && !isCompleted) {
        onComplete()
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black mb-2">{title}</h2>
        <p className="text-gray-600">Quick overview to get you started</p>
      </div>

      <div className="bg-white border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="relative bg-gray-900 aspect-video">
          <video
            ref={videoRef}
            className="w-full h-full"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => {
              setIsPlaying(false)
              onComplete()
            }}
          >
            <source src="/placeholder-video.mp4" type="video/mp4" />
          </video>

          {/* Video overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Button
              onClick={togglePlay}
              className="bg-white bg-opacity-90 hover:bg-opacity-100 text-black rounded-full p-6"
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </Button>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-black bg-opacity-50">
            <div className="h-full bg-pink-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>

          {/* Completion badge */}
          {isCompleted && (
            <div className="absolute top-6 right-6 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">
              ✓ Completed
            </div>
          )}
        </div>

        <div className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2">HTML5 Structure & Semantics - Crash Course</h3>
          <p className="text-gray-600 mb-4">8:30 minutes</p>

          {!isCompleted && <p className="text-sm text-gray-500">Watch 90% of the video to mark as complete</p>}

          {isCompleted && (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
              <p className="font-bold text-green-700">🎉 Crash course completed! Ready for the next step?</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
