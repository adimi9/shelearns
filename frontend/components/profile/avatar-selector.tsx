"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import AnimatedAvatar from "./animated-avatar"

interface AvatarSelectorProps {
  currentAvatar: string
  onSelect: (avatar: string) => void
  onClose: () => void
}

export default function AvatarSelector({ currentAvatar, onSelect, onClose }: AvatarSelectorProps) {
  const avatarTypes = [
    { id: "tech-girl", name: "Tech Girl", description: "Perfect for aspiring developers" },
    { id: "code-ninja", name: "Code Ninja", description: "For the stealthy programmers" },
    { id: "design-wizard", name: "Design Wizard", description: "Creative and magical" },
    { id: "data-explorer", name: "Data Explorer", description: "For the analytical minds" },
    { id: "creative-coder", name: "Creative Coder", description: "Art meets technology" },
    { id: "future-dev", name: "Future Dev", description: "Tomorrow's tech leader" },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black">Choose Your Avatar</h2>
          <Button onClick={onClose} variant="outline" size="icon" className="border-2 border-black">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {avatarTypes.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => onSelect(avatar.id)}
              className={`p-4 border-4 rounded-xl transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                currentAvatar === avatar.id
                  ? "border-pink-500 bg-pink-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  : "border-black bg-white hover:translate-y-[-2px]"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-3">
                  <AnimatedAvatar type={avatar.id} size="medium" />
                </div>
                <h3 className="font-bold text-sm mb-1">{avatar.name}</h3>
                <p className="text-xs text-gray-600">{avatar.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Choose an avatar that represents your coding journey! You can change it anytime.
          </p>
        </div>
      </div>
    </div>
  )
}
