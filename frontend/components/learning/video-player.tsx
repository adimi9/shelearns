"use client"

import { useState, useRef } from "react"
import { Play, Pause, Volume2, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VideoPlayerProps {
  title: string
  duration: string
  onComplete: () => void
  isCompleted: boolean
}

export default function VideoPlayer({ title, duration, onComplete, isCompleted }: VideoPlayerProps) {
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
    <div className="bg-white border-2 border-black rounded-lg overflow-hidden">
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
            className="bg-white bg-opacity-90 hover:bg-opacity-100 text-black rounded-full p-4"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </Button>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-50">
          <div className="h-full bg-pink-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Completion badge */}
        {isCompleted && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            ✓ Completed
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold">{title}</h4>
            <p className="text-sm text-gray-600">{duration}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-2 border-black">
              <Volume2 size={16} />
            </Button>
            <Button variant="outline" size="sm" className="border-2 border-black">
              <Maximize size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
