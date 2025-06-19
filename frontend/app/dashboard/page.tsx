"use client"
import { useRouter } from "next/navigation" // navigation
import { ArrowLeft, Calendar, Target } from "lucide-react" // svg icons for visuals
import { Button } from "@/components/ui/button"
import StudyTimeChart from "@/components/dashboard/study-time-chart"
import ProgressChart from "@/components/dashboard/progress-chart"
import LeaderboardRank from "@/components/dashboard/leaderboard-rank"
import AIProgressSummary from "@/components/dashboard/ai-progress-summary"
import QuickStats from "@/components/dashboard/quick-stats"

export default function DashboardPage() {
  const router = useRouter()

  // Sample user data - in real app this would come from API/database
  const userData = {
    totalStudyTime: 45.5, // hours
    loginStreak: 12, // days
    currentWeekStudyTime: 8.5, // hours
    weeklyGoal: 10, // hours
    totalXP: 5420,
    weeklyXP: 1250,
    leaderboardRank: 12,
    totalUsers: 1247,
    coursesInProgress: 2,
    coursesCompleted: 1,
    badgesEarned: 8,
    currentLevel: "Beginner",
    learningPath: "Frontend Development",
  }

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}


      <main className="container mx-auto px-6 py-8">
        {/* Quick Stats Row */}
        <QuickStats userData={userData} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Study Time Chart */}
            <StudyTimeChart />

            {/* Progress Chart */}
            <ProgressChart />

            {/* AI Progress Summary */}
            <AIProgressSummary userData={userData} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard Rank */}
            <LeaderboardRank
              rank={userData.leaderboardRank}
              totalUsers={userData.totalUsers}
              weeklyXP={userData.weeklyXP}
              learningPath={userData.learningPath}
            />

            {/* Weekly Goal */}
            <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-bold">Weekly Goal</h3>
              </div>
              <div className="text-center mb-4">
                <div className="text-2xl font-black text-green-600 mb-1">
                  {userData.currentWeekStudyTime}h / {userData.weeklyGoal}h
                </div>
                <div className="text-sm text-gray-600">This week</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 border-2 border-black mb-4">
                <div
                  className="bg-green-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((userData.currentWeekStudyTime / userData.weeklyGoal) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 text-center">
                {userData.weeklyGoal - userData.currentWeekStudyTime > 0
                  ? `${(userData.weeklyGoal - userData.currentWeekStudyTime).toFixed(1)} hours to go!`
                  : "🎉 Goal achieved!"}
              </p>
            </div>

            {/* Current Streak */}
            <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-bold">Learning Streak</h3>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🔥</div>
                <div className="text-2xl font-black text-orange-600 mb-1">{userData.loginStreak} Days</div>
                <div className="text-sm text-gray-600">Keep it up!</div>
              </div>
              <div className="mt-4 p-3 bg-orange-50 border-2 border-orange-200 rounded-lg">
                <p className="text-sm text-orange-700 text-center">
                  You're on fire! 🚀 Come back tomorrow to keep your streak alive.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/learn/html-css-fundamentals")}
                  className="w-full bg-pink-600 hover:bg-black text-white font-bold py-3 rounded-xl transition-all"
                >
                  Continue Learning
                </Button>
                <Button
                  onClick={() => router.push("/community")}
                  variant="outline"
                  className="w-full border-2 border-black hover:bg-gray-100 font-bold py-3 rounded-xl"
                >
                  Find Study Partners
                </Button>
                <Button
                  onClick={() => router.push("/leaderboard")}
                  variant="outline"
                  className="w-full border-2 border-black hover:bg-gray-100 font-bold py-3 rounded-xl"
                >
                  View Leaderboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
