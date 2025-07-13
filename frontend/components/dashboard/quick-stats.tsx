"use client"

import { Clock, Calendar, Zap, Award, TrendingUp, Target } from "lucide-react"

interface QuickStatsProps {
  userData: {
    totalStudyTime: number
    loginStreak: number
    totalXP: number
    badgesEarned: number
    coursesCompleted: number
    coursesInProgress: number
  }
}

export default function QuickStats({ userData }: QuickStatsProps) {
  const stats = [
    {
      icon: Zap,
      label: "Total XP",
      value: userData.totalXP.toLocaleString(),
      color: "yellow",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-600",
    },
    {
      icon: Award,
      label: "Badges Earned",
      value: userData.badgesEarned.toString(),
      color: "purple",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-600",
    },
    {
      icon: TrendingUp,
      label: "Courses Completed",
      value: userData.coursesCompleted.toString(),
      color: "green",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-600",
    },
    {
      icon: Target,
      label: "Courses In Progress",
      value: userData.coursesInProgress.toString(),
      color: "pink",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      textColor: "text-pink-600",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className={`${stat.bgColor} border-2 ${stat.borderColor} rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-[-2px]`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-5 h-5 ${stat.textColor}`} />
              <span className="text-sm font-medium text-gray-700">{stat.label}</span>
            </div>
            <div className={`text-2xl font-black ${stat.textColor}`}>{stat.value}</div>
          </div>
        )
      })}
    </div>
  )
}
