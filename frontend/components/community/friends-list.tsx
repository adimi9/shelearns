"use client"

import { useState } from "react"
import { MessageCircle, Video, Phone, Monitor, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import AnimatedAvatar from "@/components/profile/animated-avatar"

export default function FriendsList() {
  const [friends] = useState([
    {
      id: "1",
      username: "ReactRookie",
      avatar: "future-dev",
      description: "New to React, excited to learn! Looking for patient study partners 🌱",
      isOnline: true,
      lastSeen: "now",
      currentActivity: "Watching: JavaScript Fundamentals",
    },
    {
      id: "2",
      username: "CSSMaster",
      avatar: "creative-coder",
      description: "CSS enthusiast! Love creating animations and responsive designs 🎨",
      isOnline: true,
      lastSeen: "5 minutes ago",
      currentActivity: "Reading: CSS Grid Guide",
    },
    {
      id: "3",
      username: "CodeQueen23",
      avatar: "tech-girl",
      description: "Frontend dev student, love React & CSS animations! Looking for study accountability 💪",
      isOnline: false,
      lastSeen: "2 hours ago",
      currentActivity: null,
    },
    {
      id: "4",
      username: "DesignDevGirl",
      avatar: "design-wizard",
      description: "UI/UX designer learning to code. Let's build beautiful apps together! ✨",
      isOnline: false,
      lastSeen: "1 day ago",
      currentActivity: null,
    },
  ])

  const handleMessage = (friendId: string) => {
    // In real app, open chat interface
    console.log("Opening chat with friend:", friendId)
  }

  const handleVoiceCall = (friendId: string) => {
    // In real app, initiate voice call
    console.log("Starting voice call with friend:", friendId)
  }

  const handleVideoCall = (friendId: string) => {
    // In real app, initiate video call
    console.log("Starting video call with friend:", friendId)
  }

  const handleScreenShare = (friendId: string) => {
    // In real app, start screen sharing session
    console.log("Starting screen share with friend:", friendId)
  }

  const onlineFriends = friends.filter((friend) => friend.isOnline)
  const offlineFriends = friends.filter((friend) => !friend.isOnline)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black mb-2">My Study Friends</h2>
        <p className="text-gray-600">
          Connect with your study partners through chat, voice calls, video calls, or screen sharing sessions.
        </p>
      </div>

      {friends.length > 0 ? (
        <div className="space-y-8">
          {/* Online Friends */}
          {onlineFriends.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-4 text-green-600 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Online ({onlineFriends.length})
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {onlineFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <AnimatedAvatar type={friend.avatar} size="medium" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold">{friend.username}</h4>
                        <p className="text-sm text-gray-600 mb-2">"{friend.description}"</p>
                        {friend.currentActivity && (
                          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-200">
                            <Users className="w-4 h-4" />
                            <span>{friend.currentActivity}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => handleMessage(friend.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition-all"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                      <Button
                        onClick={() => handleVoiceCall(friend.id)}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition-all"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Voice
                      </Button>
                      <Button
                        onClick={() => handleVideoCall(friend.id)}
                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 rounded-lg transition-all"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Video
                      </Button>
                      <Button
                        onClick={() => handleScreenShare(friend.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition-all"
                      >
                        <Monitor className="w-4 h-4 mr-2" />
                        Screen
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offline Friends */}
          {offlineFriends.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-600 flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                Offline ({offlineFriends.length})
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {offlineFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="bg-white border-4 border-gray-300 rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] opacity-75"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <AnimatedAvatar type={friend.avatar} size="medium" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-400 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-700">{friend.username}</h4>
                        <p className="text-sm text-gray-500 mb-2">"{friend.description}"</p>
                        <p className="text-xs text-gray-400">Last seen {friend.lastSeen}</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleMessage(friend.id)}
                      className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded-lg transition-all"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-bold mb-2">No friends yet</h3>
          <p className="text-gray-600">
            Start by discovering study partners and sending friend requests. Once they accept, you'll see them here!
          </p>
        </div>
      )}
    </div>
  )
}
