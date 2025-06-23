"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Save, X, Award, Star, KeyRound } from "lucide-react" // Added KeyRound for password icon
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AnimatedAvatar from "@/components/profile/animated-avatar"
import AvatarSelector from "@/components/profile/avatar-selector"
import BadgeCollection from "@/components/profile/badge-collection"
import XPProgress from "@/components/profile/xp-progress"
import OnboardingResponses from "@/components/profile/onboarding-responses"
import PasswordChange from "@/components/profile/password-change" // Ensure this component exists and is updated

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false) // State to control password change modal visibility

  const [userData, setUserData] = useState({
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    avatar: "tech-girl", // Make sure you have this avatar type in AnimatedAvatar
    joinDate: "January 2025",
    currentLevel: "Beginner",
    totalXP: 1250,
    currentLevelXP: 250,
    nextLevelXP: 500,
    coursesCompleted: 1,
    badgesEarned: 8,
    onboardingResponses: {
      interest: "Front End Web Development",
      motivation: "I want to get my first job as a frontend developer",
      experience: "I know basic HTML/CSS",
      technologies: ["React", "Tailwind CSS", "GitHub", "Vite"],
    },
  })

  const [editForm, setEditForm] = useState({
    name: userData.name,
    email: userData.email,
  })

  const handleSaveProfile = () => {
    setUserData((prev) => ({
      ...prev,
      name: editForm.name,
      email: editForm.email,
    }))
    setIsEditing(false)
  }

  const handleAvatarChange = (newAvatar: string) => {
    setUserData((prev) => ({
      ...prev,
      avatar: newAvatar,
    }))
    setShowAvatarSelector(false)
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <AnimatedAvatar type={userData.avatar} size="large" />
                  <button
                    onClick={() => setShowAvatarSelector(true)}
                    className="absolute -bottom-2 -right-2 bg-pink-500 text-white rounded-full p-2 border-2 border-black hover:bg-pink-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="border-2 border-black"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="border-2 border-black"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} className="bg-green-500 hover:bg-green-600 text-white flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="border-2 border-black flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <h2 className="text-xl font-bold mb-2">{userData.name}</h2>
                  <p className="text-gray-600 mb-4">{userData.email}</p>
                  <p className="text-sm text-gray-500 mb-4">Member since {userData.joinDate}</p>
                  <div className="flex flex-col gap-2"> {/* Changed to flex-col for stacking buttons */}
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="border-2 border-black flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    {/* Added Change Password Button below Edit Profile - Now directly in the profile card */}
                    <Button
                      onClick={() => setShowPasswordChange(true)} // This button toggles the PasswordChange modal
                      variant="outline"
                      className="w-full border-2 border-black mt-2" // Added margin-top for spacing
                    >
                      <KeyRound className="w-4 h-4 mr-2" /> {/* Used KeyRound icon */}
                      Change Password
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* XP Progress */}
            <XPProgress
              totalXP={userData.totalXP}
              currentLevelXP={userData.currentLevelXP}
              nextLevelXP={userData.nextLevelXP}
              currentLevel={userData.currentLevel}
            />

            {/* Quick Stats */}
            <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-pink-50 rounded-lg border-2 border-pink-200">
                  <Award className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                  <div className="font-bold text-pink-800">{userData.badgesEarned}</div>
                  <div className="text-sm text-pink-600">Achieved <br/> Badges</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg border-2 border-green-200">
                  <Star className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="font-bold text-green-800">{userData.coursesCompleted}</div>
                  <div className="text-sm text-green-600">Completed Courses</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Onboarding Responses */}
            <OnboardingResponses responses={userData.onboardingResponses} />

            {/* Badge Collection */}
            <BadgeCollection />

            
          </div>
        </div>
      </main>

      {/* Modals - These render on top of the content when their state is true */}
      {showAvatarSelector && (
        <AvatarSelector
          currentAvatar={userData.avatar}
          onSelect={handleAvatarChange}
          onClose={() => setShowAvatarSelector(false)}
        />
      )}

      {/* The PasswordChange modal is rendered here when showPasswordChange is true */}
      {showPasswordChange && <PasswordChange onClose={() => setShowPasswordChange(false)} />}
    </div>
  )
}