"use client"

import type React from "react"

import { Zap, Award, Gift } from "lucide-react"
import { motion } from "framer-motion"

interface XPBadgePreviewProps {
  type: "video" | "article" | "doc" | "quiz" | "section"
  title: string
  xpReward: number
  badgeReward?: {
    name: string
    icon: string
    description: string
  }
  onComplete: () => void
  children: React.ReactNode
}

export default function XPBadgePreview({
  type,
  title,
  xpReward,
  badgeReward,
  onComplete,
  children,
}: XPBadgePreviewProps) {
  const getTypeColor = () => {
    switch (type) {
      case "video":
        return "bg-red-500"
      case "article":
        return "bg-blue-500"
      case "doc":
        return "bg-green-500"
      case "quiz":
        return "bg-purple-500"
      case "section":
        return "bg-pink-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTypeIcon = () => {
    switch (type) {
      case "video":
        return "🎥"
      case "article":
        return "📖"
      case "doc":
        return "📚"
      case "quiz":
        return "🧠"
      case "section":
        return "🎯"
      default:
        return "⭐"
    }
  }

  return (
    <div className="relative">
      {/* Reward Preview Banner */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 ${getTypeColor()} rounded-full flex items-center justify-center text-white font-bold`}
            >
              {getTypeIcon()}
            </div>
            <div>
              <h4 className="font-bold text-gray-800">Complete: {title}</h4>
              <p className="text-sm text-gray-600">Earn rewards for your progress!</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* XP Reward */}
            <div className="flex items-center gap-2 bg-yellow-100 px-3 py-2 rounded-lg border border-yellow-300">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span className="font-bold text-yellow-800">+{xpReward} XP</span>
            </div>

            {/* Badge Reward */}
            {badgeReward && (
              <div className="flex items-center gap-2 bg-orange-100 px-3 py-2 rounded-lg border border-orange-300">
                <Award className="w-5 h-5 text-orange-600" />
                <div className="text-center">
                  <div className="text-lg">{badgeReward.icon}</div>
                  <div className="text-xs font-bold text-orange-800">{badgeReward.name}</div>
                </div>
              </div>
            )}

            {/* Bonus Indicator */}
            {type === "section" && (
              <div className="flex items-center gap-2 bg-pink-100 px-3 py-2 rounded-lg border border-pink-300">
                <Gift className="w-5 h-5 text-pink-600" />
                <span className="text-xs font-bold text-pink-800">Bonus!</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      {children}
    </div>
  )
}
