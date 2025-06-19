"use client"

import { useState } from "react"
import { UserPlus, Clock, Globe, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import AnimatedAvatar from "@/components/profile/animated-avatar"

export default function UserList() {
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set())

  // Sample users - in real app, this would be filtered by timezone and availability
  const users = [
    {
      id: "1",
      username: "CodeQueen23",
      avatar: "tech-girl",
      description: "Frontend dev student, love React & CSS animations! Looking for study accountability 💪",
      timezone: "UTC-05:00 (Eastern)",
      availability: ["Evening (6-9 PM)", "Night (9-12 AM)"],
      commonAvailability: 2,
    },
    {
      id: "2",
      username: "JavaScriptNinja",
      avatar: "code-ninja",
      description: "Learning JS fundamentals, need someone to practice coding challenges with! 🥷",
      timezone: "UTC-05:00 (Eastern)",
      availability: ["Afternoon (12-3 PM)", "Evening (6-9 PM)"],
      commonAvailability: 1,
    },
    {
      id: "3",
      username: "DesignDevGirl",
      avatar: "design-wizard",
      description: "UI/UX designer learning to code. Let's build beautiful apps together! ✨",
      timezone: "UTC-05:00 (Eastern)",
      availability: ["Morning (9-12 PM)", "Evening (6-9 PM)"],
      commonAvailability: 1,
    },
    {
      id: "4",
      username: "ReactRookie",
      avatar: "future-dev",
      description: "New to React, excited to learn! Looking for patient study partners 🌱",
      timezone: "UTC-05:00 (Eastern)",
      availability: ["Evening (6-9 PM)", "Weekends Only"],
      commonAvailability: 2,
    },
    {
      id: "5",
      username: "CSSMaster",
      avatar: "creative-coder",
      description: "CSS enthusiast! Love creating animations and responsive designs 🎨",
      timezone: "UTC-05:00 (Eastern)",
      availability: ["Late Afternoon (3-6 PM)", "Evening (6-9 PM)"],
      commonAvailability: 1,
    },
  ]

  const handleSendRequest = (userId: string) => {
    setSentRequests((prev) => new Set([...prev, userId]))
    // In real app, send API request
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black mb-2">Discover Study Partners</h2>
        <p className="text-gray-600">
          These learners are in your timezone with similar availability. Send them a friend request to start studying
          together!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-[-2px]"
          >
            <div className="text-center mb-4">
              <AnimatedAvatar type={user.avatar} size="medium" />
              <h3 className="text-lg font-bold mt-3">{user.username}</h3>
            </div>

            <div className="space-y-3 mb-4">
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border">"{user.description}"</p>

              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600">{user.timezone}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600">Available:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {user.availability.map((time, index) => (
                    <span
                      key={index}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-300"
                    >
                      {time}
                    </span>
                  ))}
                </div>
                {user.commonAvailability > 0 && (
                  <p className="text-xs text-green-600 font-medium">
                    ✨ {user.commonAvailability} overlapping time slot{user.commonAvailability > 1 ? "s" : ""}!
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={() => handleSendRequest(user.id)}
              disabled={sentRequests.has(user.id)}
              className={`w-full font-bold py-2 rounded-lg transition-all ${
                sentRequests.has(user.id)
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-pink-600 hover:bg-black text-white hover:translate-y-[-1px]"
              }`}
            >
              {sentRequests.has(user.id) ? (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Request Sent!
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Send Friend Request
                </>
              )}
            </Button>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">No study partners found</h3>
          <p className="text-gray-600">
            Try adjusting your availability times or check back later for new members in your timezone!
          </p>
        </div>
      )}
    </div>
  )
}
