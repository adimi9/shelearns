"use client"

import { Award, Lock } from "lucide-react"

export default function BadgeCollection() {
  const badges = [
    {
      id: "first-steps",
      name: "First Steps",
      description: "Completed your first course",
      icon: "🚀",
      earned: true,
      earnedDate: "Jan 15, 2025",
    },
    {
      id: "halfway-there",
      name: "Halfway There",
      description: "Completed 50% of your learning journey",
      icon: "🧭",
      earned: false,
      earnedDate: ""
    },
    {
      id: "journey-conqueror",
      name: "Journey Conqueror",
      description: "Completed your entire learning journey",
      icon: "🏆",
      earned: false,
      earnedDate: ""
    },
    {
      id: "quiz-starter",
      name: "Quiz Starter",
      description: "Completed your first quiz",
      icon: "📝",
      earned: false,
      earnedDate: ""
    },
    {
      id: "high-scorer",
      name: "High Scorer",
      description: "Scored 4/5 on 5 quizzes",
      icon: "🎯",
      earned: false,
      earnedDate: ""
    },
    {
      id: "deep-diver",
      name: "Deep Diver",
      description: "Completed advanced version of all courses",
      icon: "🔍",
      earned: false,
      earnedDate: ""
    },
    {
      id: "achiever",
      name: "Achiever",
      description: "Achieved Top 3 on Leaderboard",
      icon: "🧭",
      earned: false,
      earnedDate: ""
    },
    {
      id: "return-visitor",
      name: "Return Visitor",
      description: "Achieved a 10 day streak",
      icon: "🔄",
      earned: false,
      earnedDate: ""
    },
  ]

  const earnedBadges = badges.filter((badge) => badge.earned)
  const lockedBadges = badges.filter((badge) => !badge.earned)

  return (
    <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-6 h-6 text-yellow-500" />
        <h3 className="text-xl font-bold">Badge Collection</h3>
        <span className="bg-pink-500 text-white px-2 py-1 rounded-full text-sm font-bold">
          {earnedBadges.length}/{badges.length}
        </span>
      </div>

      {/* Earned Badges */}
      <div className="mb-8">
        <h4 className="text-lg font-bold mb-4 text-green-700">🏆 Earned Badges</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {earnedBadges.map((badge) => (
            <div
              key={badge.id}
              className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-lg p-4 text-center hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-[-2px]"
            >
              <div className="text-3xl mb-2">{badge.icon}</div>
              <h5 className="font-bold text-sm mb-1">{badge.name}</h5>
              <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
              <p className="text-xs text-green-600 font-medium">Earned {badge.earnedDate}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Locked Badges */}
      <div>
        <h4 className="text-lg font-bold mb-4 text-gray-700">🔒 Locked Badges</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {lockedBadges.map((badge) => (
            <div
              key={badge.id}
              className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 text-center opacity-75 hover:opacity-100 transition-opacity"
            >
              <div className="relative">
                <div className="text-3xl mb-2 filter grayscale">{badge.icon}</div>
                <Lock className="absolute top-0 right-0 w-4 h-4 text-gray-500" />
              </div>
              <h5 className="font-bold text-sm mb-1 text-gray-700">{badge.name}</h5>
              <p className="text-xs text-gray-500 mb-2">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
