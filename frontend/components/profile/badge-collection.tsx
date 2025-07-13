"use client"

import { Award, Lock } from "lucide-react"

// Define types for badge props
interface Badge {
  badgeName: string
  earned: boolean
  earnedDate?: string // Optional, as it might not be present for unearned badges
}

interface BadgeCollectionProps {
  earnedBadges: Badge[]
  unearnedBadges: Badge[]
}

export default function BadgeCollection({ earnedBadges, unearnedBadges }: BadgeCollectionProps) {
  // Map your badge names to display properties (name, description, icon)
  const badgeDetailsMap: { [key: string]: { name: string; description: string; icon: string } } = {
    FIRST_COURSE_COMPLETED: {
      name: "First Steps",
      description: "Completed your first course",
      icon: "🚀",
    },
    FIFTY_PERCENT_JOURNEY: {
      name: "Halfway There",
      description: "Completed 50% of your learning journey",
      icon: "🧭",
    },
    ENTIRE_JOURNEY: {
      name: "Journey Conqueror",
      description: "Completed your entire learning journey",
      icon: "🏆",
    },
    FIRST_QUIZ_COMPLETED: {
      name: "Quiz Starter",
      description: "Completed your first quiz",
      icon: "📝",
    },
    ALL_ADVANCED_COURSES: {
      name: "Deep Diver",
      description: "Completed advanced version of all courses",
      icon: "🔍",
    },
  }

  // Combine and enrich badges with display details
  const allBadges = [...earnedBadges, ...unearnedBadges].map((badge) => ({
    ...badge,
    id: badge.badgeName, // Use badgeName as id
    ...badgeDetailsMap[badge.badgeName], // Add name, description, icon
  }))

  const displayEarnedBadges = allBadges.filter((badge) => badge.earned)
  const displayLockedBadges = allBadges.filter((badge) => !badge.earned)

  return (
    <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-6 h-6 text-yellow-500" />
        <h3 className="text-xl font-bold">Badge Collection</h3>
        <span className="bg-pink-500 text-white px-2 py-1 rounded-full text-sm font-bold">
          {displayEarnedBadges.length}/{allBadges.length}
        </span>
      </div>

      {/* Earned Badges */}
      <div className="mb-8">
        <h4 className="text-lg font-bold mb-4 text-green-700">🏆 Earned Badges</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayEarnedBadges.length === 0 ? (
            <p className="text-gray-500 col-span-full">No badges earned yet!</p>
          ) : (
            displayEarnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-lg p-4 text-center hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-[-2px]"
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <h5 className="font-bold text-sm mb-1">{badge.name}</h5>
                <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                {badge.earnedDate && (
                  <p className="text-xs text-green-600 font-medium">Earned {badge.earnedDate}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Locked Badges */}
      <div>
        <h4 className="text-lg font-bold mb-4 text-gray-700">🔒 Locked Badges</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayLockedBadges.length === 0 ? (
            <p className="text-gray-500 col-span-full">All available badges earned!</p>
          ) : (
            displayLockedBadges.map((badge) => (
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}