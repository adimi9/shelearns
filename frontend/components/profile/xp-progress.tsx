"use client"

import { Zap, TrendingUp } from "lucide-react"

interface XPProgressProps {
  totalXP: number
  currentLevelXP: number
  nextLevelXP: number
  currentLevel: string
}

export default function XPProgress({ totalXP, currentLevelXP, nextLevelXP, currentLevel }: XPProgressProps) {
  const progressPercentage = (currentLevelXP / nextLevelXP) * 100
  const xpToNext = nextLevelXP - currentLevelXP

  return (
    <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-6 h-6 text-yellow-500" />
        <h3 className="text-lg font-bold">Experience Points</h3>
      </div>

      <div className="text-center mb-4">
        <div className="text-3xl font-black text-yellow-600 mb-1">{totalXP.toLocaleString()}</div>
        <div className="text-sm text-gray-600">Total XP Earned</div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">{currentLevel} Level</span>
          <span className="text-sm font-bold">
            {currentLevelXP}/{nextLevelXP} XP
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 border-2 border-black">
          <div
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full rounded-full transition-all duration-500 flex items-center justify-center"
            style={{ width: `${progressPercentage}%` }}
          >
            {progressPercentage > 20 && (
              <span className="text-xs font-bold text-white">{Math.round(progressPercentage)}%</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
        <TrendingUp className="w-4 h-4" />
        <span>{xpToNext} XP to next level</span>
      </div>
    </div>
  )
}
