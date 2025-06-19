"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trophy, Zap, Award, Crown, Medal, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import AnimatedAvatar from "@/components/profile/animated-avatar"

export default function LeaderboardPage() {
  const router = useRouter()
  const [selectedPath, setSelectedPath] = useState("frontend")

  const learningPaths = [
    { id: "frontend", name: "Frontend Development", icon: "🎨" },
    { id: "backend", name: "Backend Development", icon: "⚙️" },
    { id: "mobile", name: "Mobile Development", icon: "📱" },
    { id: "fullstack", name: "Full Stack Development", icon: "🚀" },
  ]

  // Sample leaderboard data
  const leaderboardData = {
    frontend: [
      {
        rank: 1,
        username: "ReactQueen",
        avatar: "tech-girl",
        weeklyXP: 2850,
        totalXP: 15420,
        badge: "👑 Weekly Champion",
        streak: 7,
      },
      {
        rank: 2,
        username: "CSSWizard",
        avatar: "design-wizard",
        weeklyXP: 2720,
        totalXP: 12890,
        badge: "🥈 Silver Star",
        streak: 6,
      },
      {
        rank: 3,
        username: "JSNinja",
        avatar: "code-ninja",
        weeklyXP: 2650,
        totalXP: 11750,
        badge: "🥉 Bronze Medal",
        streak: 5,
      },
      {
        rank: 4,
        username: "VueVirtuoso",
        avatar: "creative-coder",
        weeklyXP: 2480,
        totalXP: 10920,
        badge: null,
        streak: 4,
      },
      {
        rank: 5,
        username: "AngularAce",
        avatar: "future-dev",
        weeklyXP: 2350,
        totalXP: 9850,
        badge: null,
        streak: 3,
      },
      // Current user
      {
        rank: 12,
        username: "You",
        avatar: "tech-girl",
        weeklyXP: 1250,
        totalXP: 5420,
        badge: null,
        streak: 2,
        isCurrentUser: true,
      },
    ],
  }

  const currentLeaderboard = leaderboardData[selectedPath as keyof typeof leaderboardData] || leaderboardData.frontend
  const currentUser = currentLeaderboard.find((user) => user.isCurrentUser)
  const topUsers = currentLeaderboard.filter((user) => !user.isCurrentUser).slice(0, 10)

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Medal className="w-6 h-6 text-orange-600" />
      default:
        return <Star className="w-6 h-6 text-gray-400" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
      case 3:
        return "bg-gradient-to-r from-orange-400 to-orange-600 text-white"
      default:
        return "bg-white border-2 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}

      <main className="container mx-auto px-6 py-8">
        {/* Learning Path Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4">Choose Your Learning Path</h2>
          <div className="flex flex-wrap gap-4">
            {learningPaths.map((path) => (
              <button
                key={path.id}
                onClick={() => setSelectedPath(path.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                  selectedPath === path.id
                    ? "bg-pink-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white border-2 border-black hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                }`}
              >
                <span className="text-xl">{path.icon}</span>
                {path.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2">
            <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-bold">Top 25 This Week</h3>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-bold">
                  Resets in 3 days
                </span>
              </div>

              <div className="space-y-3">
                {topUsers.map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all hover:translate-y-[-1px] ${getRankColor(
                      user.rank,
                    )}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8">{getRankIcon(user.rank)}</div>
                      <span className="font-bold text-lg">#{user.rank}</span>
                    </div>

                    <AnimatedAvatar type={user.avatar} size="small" />

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold">{user.username}</h4>
                        {user.badge && (
                          <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full font-bold">
                            {user.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm opacity-75">
                        <span>🔥 {user.streak} day streak</span>
                        <span>Total: {user.totalXP.toLocaleString()} XP</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 font-bold">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        {user.weeklyXP.toLocaleString()}
                      </div>
                      <div className="text-xs opacity-75">this week</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Rank */}
            {currentUser && (
              <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-pink-500" />
                  Your Rank
                </h3>
                <div className="text-center">
                  <div className="text-3xl font-black text-pink-600 mb-2">#{currentUser.rank}</div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span className="font-bold">{currentUser.weeklyXP.toLocaleString()} XP</span>
                  </div>
                  <div className="text-sm text-gray-600">this week</div>
                  <div className="mt-4 p-3 bg-pink-50 border-2 border-pink-200 rounded-lg">
                    <p className="text-sm text-pink-700">
                      🎯 You need{" "}
                      <span className="font-bold">{(topUsers[9]?.weeklyXP || 2000) - currentUser.weeklyXP} XP</span> to
                      reach top 10!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Weekly Prizes */}
            <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-500" />
                Weekly Prizes
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                  <Crown className="w-6 h-6 text-yellow-500" />
                  <div>
                    <div className="font-bold text-yellow-800">1st Place</div>
                    <div className="text-sm text-yellow-600">👑 Champion Badge + 1000 Bonus XP</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-gray-200 rounded-lg">
                  <Medal className="w-6 h-6 text-gray-500" />
                  <div>
                    <div className="font-bold text-gray-800">2nd Place</div>
                    <div className="text-sm text-gray-600">🥈 Silver Badge + 500 Bonus XP</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 border-2 border-orange-200 rounded-lg">
                  <Medal className="w-6 h-6 text-orange-500" />
                  <div>
                    <div className="font-bold text-orange-800">3rd Place</div>
                    <div className="text-sm text-orange-600">🥉 Bronze Badge + 250 Bonus XP</div>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="font-bold text-blue-800">Top 10</div>
                  <div className="text-sm text-blue-600">⭐ Elite Badge + 100 Bonus XP</div>
                </div>
              </div>
            </div>

            {/* Leaderboard Rules */}
            <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-lg font-bold mb-4">How It Works</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Leaderboard resets every Monday</p>
                <p>• Only shows top 25 learners</p>
                <p>• Separate rankings for each learning path</p>
                <p>• Earn XP by completing videos, quizzes, and more</p>
                <p>• Winners get exclusive badges and bonus XP</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
