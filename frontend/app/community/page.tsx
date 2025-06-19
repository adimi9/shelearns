"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Users, MessageCircle, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import CommunitySetup from "@/components/community/community-setup"
import UserList from "@/components/community/user-list"
import FriendRequests from "@/components/community/friend-requests"
import FriendsList from "@/components/community/friends-list"

export default function CommunityPage() {
  const router = useRouter()
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false) // In real app, check from user data
  const [activeTab, setActiveTab] = useState("discover")

  const handleSetupComplete = (data: any) => {
    setHasCompletedSetup(true)
    // In real app, save to database
    console.log("Community setup completed:", data)
  }

  if (!hasCompletedSetup) {
    return <CommunitySetup onComplete={handleSetupComplete} />
  }

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}

      {/* Navigation Tabs */}
      <div className="bg-white border-b-2 border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex gap-8">
            {[
              { id: "discover", label: "Discover", icon: Users },
              { id: "requests", label: "Friend Requests", icon: UserPlus },
              { id: "friends", label: "My Friends", icon: MessageCircle },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-4 transition-colors ${
                    activeTab === tab.id
                      ? "border-pink-500 text-pink-600 font-bold"
                      : "border-transparent text-gray-600 hover:text-pink-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        {activeTab === "discover" && <UserList />}
        {activeTab === "requests" && <FriendRequests />}
        {activeTab === "friends" && <FriendsList />}
      </main>
    </div>
  )
}
