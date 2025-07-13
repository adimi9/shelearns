"use client"

import { useState, useEffect } from "react" // Import useEffect
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Save, X, Award, Star, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AnimatedAvatar from "@/components/profile/animated-avatar"
import AvatarSelector from "@/components/profile/avatar-selector"
import BadgeCollection from "@/components/profile/badge-collection"
import XPProgress from "@/components/profile/xp-progress"
import OnboardingResponses from "@/components/profile/onboarding-responses"
import PasswordChange from "@/components/profile/password-change"

// Define the shape of your profile data from the backend
interface UserProfileData {
  username: string
  email: string
  totalXp: number
  avatarType: string
  onboardingData: {
    qn1: string
    ans1: string
    qn2: string
    ans2: string
    qn3: string
    ans3: string
    qn4: string
    ans4: string[]
  }
  earnedBadges: { badgeName: string; earned: boolean; earnedDate?: string }[]
  unearnedBadges: { badgeName: string; earned: boolean }[]
  // Add other fields if your backend sends them, e.g., joinDate: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)

  // Initialize userData as null or undefined, and set it once data is fetched
  const [userData, setUserData] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editForm, setEditForm] = useState({
    username: "", // Initialize with empty strings
    email: "",
  })

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const authToken = localStorage.getItem("authToken")
        if (!authToken) {
          // Handle case where token is not found (e.g., redirect to login)
          setError("Authentication token not found. Please log in.")
          setLoading(false)
          router.push("/login") // Example: Redirect to login page
          return
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
        const response = await fetch(`${backendUrl}/api/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`, // Include the JWT token
          },
        })

        if (!response.ok) {
          // Handle HTTP errors
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to fetch profile data.")
        }

        const data: UserProfileData = await response.json()
        setUserData(data)
        setEditForm({ username: data.username, email: data.email }) // Set edit form values
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.")
        console.error("Error fetching profile data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, []) // Empty dependency array means this effect runs once on mount

  const handleSaveProfile = async () => {
    if (!userData) return; // Should not happen if data is loaded

    try {
      const authToken = localStorage.getItem("auth-token")
      if (!authToken) {
        setError("Authentication token not found. Please log in.")
        router.push("/login")
        return
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"
      const response = await fetch(`${backendUrl}/api/profile`, {
        method: "PUT", // Or POST, depending on your API for profile updates
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update profile data.")
      }

      // If update is successful, update local state
      setUserData((prev) => ({
        ...prev!, // Use non-null assertion since we checked for null
        username: editForm.username,
        email: editForm.email,
      }))
      setIsEditing(false)
    } catch (err: any) {
      setError(err.message || "Failed to save profile.")
      console.error("Error saving profile:", err)
    }
  }

  const handleAvatarChange = (newAvatar: string) => {
    // Implement logic to send avatar change to backend if needed
    setUserData((prev) => ({
      ...prev!,
      avatarType: newAvatar,
    }))
    setShowAvatarSelector(false)
  }

  // --- Loading and Error States ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <p className="text-xl font-semibold text-gray-700">Loading profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 text-red-600 p-4">
        <p className="text-xl font-semibold mb-4">Error: {error}</p>
        <Button onClick={() => router.back()} className="bg-pink-500 hover:bg-pink-600 text-white">
          Go Back
        </Button>
      </div>
    )
  }

  // Ensure userData is not null before rendering the main content
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <p className="text-xl font-semibold text-gray-700">No profile data available.</p>
      </div>
    )
  }

  // Helper to calculate total courses completed (example, adjust based on actual logic)
  // You'll need to decide how your backend provides this or if you calculate it client-side
  const coursesCompleted = 0 // Placeholder
  const totalBadgesEarned = userData.earnedBadges.length + userData.unearnedBadges.filter(b => b.earned).length;


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
                  <AnimatedAvatar type={userData.avatarType} size="large" />
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
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={editForm.username}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, username: e.target.value }))}
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
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form if cancel, using current userData
                        setEditForm({ username: userData.username, email: userData.email });
                      }}
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
                  <h2 className="text-xl font-bold mb-2">{userData.username}</h2>
                  <p className="text-gray-600 mb-4">{userData.email}</p>
                  {/* You'll need to add joinDate to your new data structure if you want to display it */}
                  {/* <p className="text-sm text-gray-500 mb-4">Member since {userData.joinDate}</p> */}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="border-2 border-black flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button
                      onClick={() => setShowPasswordChange(true)}
                      variant="outline"
                      className="w-full border-2 border-black mt-2"
                    >
                      <KeyRound className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* XP Progress - Updated props */}
            <XPProgress totalXP={userData.totalXp} />

            {/* Quick Stats */}
            <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-pink-50 rounded-lg border-2 border-pink-200">
                  <Award className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                  <div className="font-bold text-pink-800">{totalBadgesEarned}</div>
                  <div className="text-sm text-pink-600">
                    Achieved <br /> Badges
                  </div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg border-2 border-green-200">
                  <Star className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="font-bold text-green-800">{coursesCompleted}</div>
                  <div className="text-sm text-green-600">Completed Courses</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Onboarding Responses */}
            <OnboardingResponses responses={userData.onboardingData} />

            {/* Badge Collection */}
            <BadgeCollection
              earnedBadges={userData.earnedBadges}
              unearnedBadges={userData.unearnedBadges}
            />
          </div>
        </div>
      </main>

      {/* Modals - These render on top of the content when their state is true */}
      {showAvatarSelector && (
        <AvatarSelector
          currentAvatar={userData.avatarType}
          onSelect={handleAvatarChange}
          onClose={() => setShowAvatarSelector(false)}
        />
      )}

      {showPasswordChange && <PasswordChange onClose={() => setShowPasswordChange(false)} />}
    </div>
  )
}