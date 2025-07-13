"use client"

import { Zap, TrendingUp } from "lucide-react"

interface XPProgressProps {
  totalXP: number
}

export default function XPProgress({ totalXP }: XPProgressProps) {

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
    </div>
  )
}
