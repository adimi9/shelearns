"use client"

import { MessageSquare, Target, Code, Wrench } from "lucide-react"

interface OnboardingResponsesProps {
  responses: {
    interest: string
    motivation: string
    experience: string
    technologies: string[]
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
        {/* Interest */}
        <div className="border-l-4 border-pink-400 pl-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-pink-600" />
            <h4 className="font-bold text-gray-800">What you're learning</h4>
          </div>
          <p className="text-gray-700">{responses.interest}</p>
        </div>

        {/* Motivation */}
        <div className="border-l-4 border-blue-400 pl-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-gray-800">Your motivation</h4>
          </div>
          <p className="text-gray-700">{responses.motivation}</p>
        </div>

        {/* Experience */}
        <div className="border-l-4 border-green-400 pl-4">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-5 h-5 text-green-600" />
            <h4 className="font-bold text-gray-800">Your experience level</h4>
          </div>
          <p className="text-gray-700">{responses.experience}</p>
        </div>

        {/* Technologies */}
        <div className="border-l-4 border-purple-400 pl-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-5 h-5 text-purple-600" />
            <h4 className="font-bold text-gray-800">Technologies you're interested in</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {responses.technologies.map((tech, index) => (
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
