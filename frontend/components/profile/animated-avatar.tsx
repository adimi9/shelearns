"use client"

import { useEffect, useRef } from "react"
import { Brain, Code, Sparkles, Zap, Heart, Star } from "lucide-react"

interface AnimatedAvatarProps {
  type: string
  size?: "small" | "medium" | "large"
}

export default function AnimatedAvatar({ type, size = "medium" }: AnimatedAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const sizeClasses = {
    small: "w-12 h-12",
    medium: "w-20 h-20",
    large: "w-32 h-32",
  }

  const iconSizes = {
    small: 16,
    medium: 24,
    large: 32,
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let frame = 0
    let direction = 1
    let blinkTimeout: NodeJS.Timeout

    const animate = () => {
      if (!container) return

      frame += 0.02 * direction
      if (frame > 1) direction = -1
      if (frame < 0) direction = 1

      container.style.transform = `translateY(${Math.sin(frame * Math.PI) * 5}px)`
      requestAnimationFrame(animate)
    }

    const startBlinking = () => {
      const eyes = container.querySelectorAll(".avatar-eye")

      const blink = () => {
        eyes.forEach((eye) => {
          eye.classList.add("scale-y-[0.1]")
          setTimeout(() => eye.classList.remove("scale-y-[0.1]"), 150)
        })

        blinkTimeout = setTimeout(blink, Math.random() * 3000 + 2000)
      }

      blink()
    }

    animate()
    startBlinking()

    return () => {
      clearTimeout(blinkTimeout)
    }
  }, [])

  const getAvatarConfig = (type: string) => {
    const configs = {
      "tech-girl": {
        bgColor: "bg-pink-500",
        faceColor: "bg-white",
        icon: Brain,
        iconColor: "text-pink-600",
        accent: "bg-yellow-300",
      },
      "code-ninja": {
        bgColor: "bg-purple-500",
        faceColor: "bg-white",
        icon: Code,
        iconColor: "text-purple-600",
        accent: "bg-green-300",
      },
      "design-wizard": {
        bgColor: "bg-blue-500",
        faceColor: "bg-white",
        icon: Sparkles,
        iconColor: "text-blue-600",
        accent: "bg-pink-300",
      },
      "data-explorer": {
        bgColor: "bg-green-500",
        faceColor: "bg-white",
        icon: Zap,
        iconColor: "text-green-600",
        accent: "bg-orange-300",
      },
      "creative-coder": {
        bgColor: "bg-red-500",
        faceColor: "bg-white",
        icon: Heart,
        iconColor: "text-red-600",
        accent: "bg-blue-300",
      },
      "future-dev": {
        bgColor: "bg-indigo-500",
        faceColor: "bg-white",
        icon: Star,
        iconColor: "text-indigo-600",
        accent: "bg-yellow-300",
      },
    }

    return configs[type as keyof typeof configs] || configs["tech-girl"]
  }

  const config = getAvatarConfig(type)
  const Icon = config.icon

  return (
    <div ref={containerRef} className={`relative ${sizeClasses[size]} transition-transform duration-300 ease-in-out`}>
      {/* Avatar base */}
      <div
        className={`absolute inset-0 ${config.bgColor} rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
      ></div>

      {/* Avatar face */}
      <div className={`absolute inset-2 ${config.faceColor} rounded-full border-2 border-black`}></div>

      {/* Avatar eyes */}
      <div className="absolute top-[35%] left-[25%] w-2 h-2 bg-black rounded-full avatar-eye transition-transform duration-150"></div>
      <div className="absolute top-[35%] right-[25%] w-2 h-2 bg-black rounded-full avatar-eye transition-transform duration-150"></div>

      {/* Avatar mouth */}
      <div className="absolute bottom-[35%] left-1/2 transform -translate-x-1/2 w-6 h-3 border-b-2 border-black rounded-b-full"></div>

      {/* Icon on top */}
      <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 border-2 border-black">
        <Icon className={`${config.iconColor}`} size={iconSizes[size] / 2} />
      </div>

      {/* Decorative accent */}
      <div className={`absolute -bottom-1 -left-1 w-4 h-4 ${config.accent} rounded-full border-2 border-black`}></div>
    </div>
  )
}
