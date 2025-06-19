"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, X } from "lucide-react"

interface ToastNotificationProps {
  message: string
  type: "success" | "error" | "info"
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export default function ToastNotification({
  message,
  type,
  isVisible,
  onClose,
  duration = 3000,
}: ToastNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setTimeout(onClose, 300) // Wait for exit animation
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible && !isAnimating) return null

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-500"
      case "error":
        return "bg-red-50 border-red-500"
      default:
        return "bg-blue-50 border-blue-500"
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`${getBgColor()} border-2 rounded-lg p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 ${
          isAnimating ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <div className="flex items-center gap-3">
          {getIcon()}
          <span className="font-medium">{message}</span>
          <button
            onClick={() => {
              setIsAnimating(false)
              setTimeout(onClose, 300)
            }}
            className="ml-2 hover:bg-black hover:bg-opacity-10 rounded p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
