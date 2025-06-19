"use client"

import { Award, Lock } from "lucide-react"

export default function BadgeCollection() {
  const badges = [
    {
      id: "first-steps",
      name: "First Steps",
      description: "Completed your first lesson",
      icon: "🚀",
      earned: true,
      earnedDate: "Jan 15, 2025",
    },
    {
      id: "html-master",
      name: "HTML Master",
      description: "Completed HTML fundamentals",
      icon: "🏗️",
      earned: true,
      earnedDate: "Jan 18, 2025",
    },
    {
      id: "css-wizard",
      name: "CSS Wizard",
      description: "Mastered CSS styling",
      icon: "🎨",
      earned: true,
      earnedDate: "Jan 22, 2025",
    },
    {
      id: "quiz-champion",
      name: "Quiz Champion",
      description: "Scored 100% on 5 quizzes",
      icon: "🏆",
      earned: true,
      earnedDate: "Jan 20, 2025",
    },
    {
      id: "speed-learner",
      name: "Speed Learner",
      description: "Completed 3 lessons in one day",
      icon: "⚡",
      earned: true,
      earnedDate: "Jan 19, 2025",
    },
    {
      id: "documentation-reader",
      name: "Documentation Reader",
      description: "Read 10 official documentation pages",
      icon: "📚",
      earned: true,
      earnedDate: "Jan 21, 2025",
    },
    {
      id: "video-watcher",
      name: "Video Watcher",
      description: "Watched 20 course videos",
      icon: "📺",
      earned: true,
      earnedDate: "Jan 23, 2025",
    },
    {
      id: "consistent-learner",
      name: "Consistent Learner",
      description: "Learned for 7 days straight",
      icon: "📅",
      earned: true,
      earnedDate: "Jan 24, 2025",
    },
    {
      id: "javascript-ninja",
      name: "JavaScript Ninja",
      description: "Complete JavaScript fundamentals",
      icon: "🥷",
      earned: false,
      requirement: "Complete JavaScript course",
    },
    {
      id: "react-developer",
      name: "React Developer",
      description: "Build your first React app",
      icon: "⚛️",
      earned: false,
      requirement: "Complete React course",
    },
    {
      id: "project-builder",
      name: "Project Builder",
      description: "Complete 3 coding projects",
      icon: "🔨",
      earned: false,
      requirement: "Build 3 projects",
    },
    {
      id: "community-helper",
      name: "Community Helper",
      description: "Help 5 fellow learners",
      icon: "🤝",
      earned: false,
      requirement: "Help others in community",
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
              <p className="text-xs text-gray-400 font-medium">{badge.requirement}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
