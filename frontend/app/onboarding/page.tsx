"use client"

import { useEffect } from "react"
import QuestionFlow from "@/components/onboarding/question-flow"
import { motion } from "framer-motion"

export default function OnboardingPage() {
  // Add framer-motion to package.json
  useEffect(() => {
    // This is just to ensure framer-motion is included
    // In a real app, you'd handle this with proper package management
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-pink-50"
    >
      <QuestionFlow />
    </motion.div>
  )
}
