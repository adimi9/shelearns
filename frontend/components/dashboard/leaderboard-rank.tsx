"use client"

import { Trophy, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface LeaderboardRankProps {
  rank: number
  totalUsers: number
  weeklyXP: number
  learningPath: string
}

export default function LeaderboardRank({ rank, totalUsers, weeklyXP, learningPath }: LeaderboardRankProps) {
  const router = useRouter()
  const isTopTier = rank <= 25

  return (
    <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h3 className="text-lg font-bold">Leaderboard Rank</h3>
      </div>

      {isTopTier ? (
        <div className="text-center">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-2xl font-black text-yellow-600 mb-1">#{rank}</div>
          <div className="text-sm text-gray-600 mb-4">out of {totalUsers.toLocaleString()} learners</div>
          <div className="p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg mb-4">
            <p className="text-sm text-yellow-700 font-medium">🎉 You're in the top 25! Keep up the amazing work!</p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-2xl font-black text-gray-600 mb-1">#{rank}</div>
          <div className="text-sm text-gray-600 mb-4">out of {totalUsers.toLocaleString()} learners</div>
          <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg mb-4">
            <p className="text-sm text-blue-700">
              🎯 You need <span className="font-bold">{2000 - weeklyXP} XP</span> to join the top 25!
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Weekly XP:</span>
          <span className="font-bold">{weeklyXP.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Learning Path:</span>
          <span className="font-bold">{learningPath}</span>
        </div>
      </div>

      <Button
        onClick={() => router.push("/leaderboard")}
        className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-lg transition-all"
      >
        <TrendingUp className="w-4 h-4 mr-2" />
        View Full Leaderboard
      </Button>
    </div>
  )
}
