"use client"

import { useEffect, useRef } from "react"
import { Brain } from "lucide-react"

export default function AnimatedCharacter() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Animation frames for the character
    let frame = 0
    let direction = 1
    let blinkTimeout: NodeJS.Timeout

    const animate = () => {
      if (!container) return

      // Floating animation
      frame += 0.02 * direction
      if (frame > 1) direction = -1
      if (frame < 0) direction = 1

      container.style.transform = `translateY(${Math.sin(frame * Math.PI) * 10}px)`

      requestAnimationFrame(animate)
    }

    const startBlinking = () => {
      const eyes = container.querySelectorAll(".character-eye")

      // Random blink
      const blink = () => {
        eyes.forEach((eye) => {
          eye.classList.add("scale-y-[0.1]")
          setTimeout(() => eye.classList.remove("scale-y-[0.1]"), 150)
        })

        // Schedule next blink
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

  return (
    <div ref={containerRef} className="transition-transform duration-300 ease-in-out">
      <div className="relative w-32 h-32 mx-auto">
        {/* Character base */}
        <div className="absolute inset-0 bg-pink-500 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>

        {/* Character face */}
        <div className="absolute inset-4 bg-white rounded-full border-2 border-black"></div>

        {/* Character eyes */}
        <div className="absolute top-[35%] left-[25%] w-4 h-4 bg-black rounded-full character-eye transition-transform duration-150"></div>
        <div className="absolute top-[35%] right-[25%] w-4 h-4 bg-black rounded-full character-eye transition-transform duration-150"></div>

        {/* Character mouth - changes based on question */}
        <div className="absolute bottom-[35%] left-1/2 transform -translate-x-1/2 w-10 h-5 border-b-4 border-black rounded-b-full"></div>

        {/* Brain icon on top */}
        <div className="absolute -top-4 -right-4 bg-white rounded-full p-1 border-2 border-black">
          <Brain className="w-6 h-6 text-pink-600" />
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-300 rounded-full border-2 border-black"></div>
      </div>
    </div>
  )
}
