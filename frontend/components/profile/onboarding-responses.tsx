"use client"

import { MessageSquare, Target, Code, Wrench } from "lucide-react"

// Updated interface to match the new onboardingData structure
interface OnboardingResponsesProps {
  responses: {
    qn1: string
    ans1: string
    qn2: string
    ans2: string
    qn3: string
    ans3: string
    qn4: string
    ans4: string[] // Assuming qn4's answer is an array of strings
  }
}

export default function OnboardingResponses({ responses }: OnboardingResponsesProps) {
  return (
    <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-6 h-6 text-blue-500" />
        <h3 className="text-xl font-bold">Your Learning Journey Setup</h3>
      </div>

      <div className="space-y-6">
        {/* Question 1 & Answer 1 (Interest) */}
        <div className="border-l-4 border-pink-400 pl-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-pink-600" />
            <h4 className="font-bold text-gray-800">{responses.qn1}</h4>
          </div>
          <p className="text-gray-700">{responses.ans1}</p>
        </div>

        {/* Question 2 & Answer 2 (Motivation) */}
        <div className="border-l-4 border-blue-400 pl-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-gray-800">{responses.qn2}</h4>
          </div>
          <p className="text-gray-700">{responses.ans2}</p>
        </div>

        {/* Question 3 & Answer 3 (Experience) */}
        <div className="border-l-4 border-green-400 pl-4">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-5 h-5 text-green-600" />
            <h4 className="font-bold text-gray-800">{responses.qn3}</h4>
          </div>
          <p className="text-gray-700">{responses.ans3}</p>
        </div>

        {/* Question 4 & Answer 4 (Technologies) */}
        <div className="border-l-4 border-purple-400 pl-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-5 h-5 text-purple-600" />
            <h4 className="font-bold text-gray-800">{responses.qn4}</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {responses.ans4.map((tech, index) => (
              <span
                key={index}
                className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium border border-purple-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}