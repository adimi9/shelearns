"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface DifficultyAdjustmentProps {
  currentLevel: string
  onDifficultyAdjust: (direction: "easier" | "harder") => void
}

export default function DifficultyAdjustment({ currentLevel, onDifficultyAdjust }: DifficultyAdjustmentProps) {
  const [showConfirmation, setShowConfirmation] = useState<{
    direction: "easier" | "harder"
    targetLevel: string
  } | null>(null)

  const getLevelInfo = (level: string) => {
    const levels = {
      beginner: { name: "Beginner", color: "green", description: "Basic concepts and fundamentals" },
      intermediate: { name: "Intermediate", color: "yellow", description: "More complex topics and projects" },
      advanced: { name: "Advanced", color: "red", description: "Expert-level content and challenges" },
    }
    return levels[level as keyof typeof levels]
  }

  const getTargetLevel = (direction: "easier" | "harder") => {
    const levels = ["beginner", "intermediate", "advanced"]
    const currentIndex = levels.indexOf(currentLevel)

    if (direction === "easier" && currentIndex > 0) {
      return levels[currentIndex - 1]
    } else if (direction === "harder" && currentIndex < levels.length - 1) {
      return levels[currentIndex + 1]
    }
    return null
  }

  const handleDifficultyClick = (direction: "easier" | "harder") => {
    const targetLevel = getTargetLevel(direction)
    if (targetLevel) {
      setShowConfirmation({ direction, targetLevel })
    }
  }

  const handleConfirm = () => {
    if (showConfirmation) {
      onDifficultyAdjust(showConfirmation.direction)
      setShowConfirmation(null)
    }
  }

  const canGoEasier = currentLevel !== "beginner"
  const canGoHarder = currentLevel !== "advanced"

  return (
    <>
      {/* Floating Difficulty Buttons */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 space-y-3">
        {canGoEasier && (
          <motion.button
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            onClick={() => handleDifficultyClick("easier")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group"
            title="Switch to easier difficulty level"
          >
            <div className="flex items-center gap-2">
              <ChevronDown className="w-4 h-4" />
              <span className="text-sm font-bold">Too Hard?</span>
            </div>
            <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-black text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Switch to {getTargetLevel("easier")} level
            </div>
          </motion.button>
        )}

        {canGoHarder && (
          <motion.button
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            onClick={() => handleDifficultyClick("harder")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-full shadow-lg border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group"
            title="Switch to harder difficulty level"
          >
            <div className="flex items-center gap-2">
              <ChevronUp className="w-4 h-4" />
              <span className="text-sm font-bold">Too Easy?</span>
            </div>
            <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-black text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Switch to {getTargetLevel("harder")} level
            </div>
          </motion.button>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-4 border-black rounded-xl p-6 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-bold">Switch Difficulty Level?</h3>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  You're about to switch from{" "}
                  <span className="font-bold text-pink-600">{getLevelInfo(currentLevel).name}</span> to{" "}
                  <span className="font-bold text-pink-600">{getLevelInfo(showConfirmation.targetLevel).name}</span>{" "}
                  difficulty level.
                </p>

                {showConfirmation.direction === "easier" && (
                  <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Going Easier:</strong> You'll get simpler explanations, more guided examples, and
                      slower pacing. Perfect when you need to build confidence!
                    </p>
                  </div>
                )}

                {showConfirmation.direction === "harder" && (
                  <div className="mt-3 p-3 bg-orange-50 border-2 border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-700">
                      🚀 <strong>Going Harder:</strong> You'll get more challenging content, advanced topics, and faster
                      pacing. Ready for the challenge?
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleConfirm}
                  className="flex-1 bg-pink-600 hover:bg-black text-white font-bold py-3 rounded-xl transition-all"
                >
                  Yes, Switch Level
                </Button>
                <Button
                  onClick={() => setShowConfirmation(null)}
                  variant="outline"
                  className="flex-1 border-2 border-black hover:bg-gray-100 font-bold py-3 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
