"use client"

import { useState } from "react"
import { Play, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Video {
  id: string
  title: string
  duration: string
  timestamp: string
  completed: boolean
}

interface FullCoursePlaylistProps {
  videos: Video[]
  onVideoComplete: (videoId: string) => void
  onCourseComplete: () => void
  isCompleted: boolean
}

export default function FullCoursePlaylist({
  videos,
  onVideoComplete,
  onCourseComplete,
  isCompleted,
}: FullCoursePlaylistProps) {
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
    <div className="bg-white border-2 border-black rounded-lg overflow-hidden">
      <div className="p-4 border-b-2 border-black bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-bold">Full Course Playlist</h4>
          <span className="text-sm font-medium">
            {completedCount}/{videos.length} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 border border-black">
          <div
            className="bg-pink-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {videos.map((video, index) => (
          <div key={video.id} className="border-b border-gray-200 last:border-b-0">
            <div className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-sm font-bold">
                    {completedVideos.has(video.id) ? <CheckCircle className="w-5 h-5 text-green-500" /> : index + 1}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium">{video.title}</h5>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>{video.duration}</span>
                      <span>•</span>
                      <span>{video.timestamp}</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setCurrentVideo(video.id)
                    // Simulate video completion after 3 seconds for demo
                    setTimeout(() => handleVideoComplete(video.id), 3000)
                  }}
                  className={`${
                    completedVideos.has(video.id) ? "bg-green-500 hover:bg-green-600" : "bg-pink-600 hover:bg-black"
                  } text-white`}
                  disabled={completedVideos.has(video.id)}
                >
                  {completedVideos.has(video.id) ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Done
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1" />
                      {currentVideo === video.id ? "Playing..." : "Play"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isCompleted && (
        <div className="p-4 bg-green-50 border-t-2 border-green-500 text-center">
          <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="font-bold text-green-700">Full course completed!</p>
        </div>
      )}
    </div>
  )
}
