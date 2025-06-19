"use client"

import { useState } from "react"
import { Check, X, Clock, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import AnimatedAvatar from "@/components/profile/animated-avatar"

export default function FriendRequests() {
  const [requests, setRequests] = useState([
    {
      id: "1",
      username: "WebDevWonder",
      avatar: "tech-girl",
      description: "Full-stack developer learning React. Love pair programming and code reviews! 💻",
      timezone: "UTC-05:00 (Eastern)",
      availability: ["Evening (6-9 PM)", "Night (9-12 AM)"],
      sentAt: "2 hours ago",
    },
    {
      id: "2",
      username: "CodingCrafter",
      avatar: "creative-coder",
      description: "Creative developer passionate about UI/UX and clean code. Let's build amazing things! 🎨",
      timezone: "UTC-05:00 (Eastern)",
      availability: ["Morning (9-12 PM)", "Evening (6-9 PM)"],
      sentAt: "1 day ago",
    },
    {
      id: "3",
      username: "AlgorithmAce",
      avatar: "data-explorer",
      description: "Love solving coding challenges and data structures. Looking for practice partners! 🧮",
      timezone: "UTC-05:00 (Eastern)",
      availability: ["Afternoon (12-3 PM)", "Weekends Only"],
      sentAt: "3 days ago",
    },
  ])

  const handleAccept = (requestId: string) => {
    setRequests((prev) => prev.filter((req) => req.id !== requestId))
    // In real app, send API request to accept
  }

  const handleReject = (requestId: string) => {
    setRequests((prev) => prev.filter((req) => req.id !== requestId))
    // In real app, send API request to reject
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black mb-2">Friend Requests</h2>
        <p className="text-gray-600">
          These learners want to connect with you! Review their profiles and decide if you'd like to study together.
        </p>
      </div>

      {requests.length > 0 ? (
        <div className="space-y-6">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex items-start gap-6">
                <div className="text-center">
                  <AnimatedAvatar type={request.avatar} size="medium" />
                  <h3 className="text-lg font-bold mt-3">{request.username}</h3>
                  <p className="text-sm text-gray-500">{request.sentAt}</p>
                </div>

                <div className="flex-1 space-y-4">
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border">"{request.description}"</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600">{request.timezone}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">Available:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {request.availability.map((time, index) => (
                          <span
                            key={index}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-300"
                          >
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => handleAccept(request.id)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2 rounded-lg transition-all hover:translate-y-[-1px]"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    onClick={() => handleReject(request.id)}
                    variant="outline"
                    className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold px-6 py-2 rounded-lg transition-all"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📬</div>
          <h3 className="text-xl font-bold mb-2">No friend requests</h3>
          <p className="text-gray-600">
            When someone sends you a friend request, it will appear here. You can also discover new study partners in
            the Discover tab!
          </p>
        </div>
      )}
    </div>
  )
}
