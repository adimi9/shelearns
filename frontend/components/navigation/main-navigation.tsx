"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, User, Users, Trophy, BarChart3, BookOpen } from "lucide-react"
import AnimatedAvatar from "@/components/profile/animated-avatar"

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Don't show navigation on landing page, login, signup, or onboarding
  const hideNavigation = ["/", "/login", "/signup", "/onboarding"].includes(pathname)

  if (hideNavigation) {
    return null
  }

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/dashboard" },
    { id: "learning", label: "Learning Path", icon: BookOpen, path: "/roadmap" },
    { id: "community", label: "Community", icon: Users, path: "/community" },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
  ]

  const isActive = (path: string) => {
    if (path === "/roadmap") {
      return pathname === "/roadmap" || pathname.startsWith("/learn")
    }
    return pathname === path
  }

  return (
    <nav className="bg-white border-b-4 border-black sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => router.push("/dashboard")}
            className="font-black text-2xl tracking-tighter hover:scale-105 transition-transform"
          >
            <span className="text-pink-600">tech</span>
            <span className="text-black">path</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => router.push(item.path)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold transition-all ${
                    isActive(item.path)
                      ? "bg-pink-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      : "text-gray-700 hover:text-pink-600 hover:bg-pink-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* User Avatar */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => router.push("/profile")}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <AnimatedAvatar type="tech-girl" size="small" />
              <span className="font-medium text-gray-700">Sarah</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t-2 border-gray-200">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      router.push(item.path)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
                      isActive(item.path)
                        ? "bg-pink-500 text-white"
                        : "text-gray-700 hover:text-pink-600 hover:bg-pink-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                )
              })}
            </div>

            {/* Mobile User Section */}
            <div className="mt-4 pt-4 border-t-2 border-gray-200">
              <button
                onClick={() => {
                  router.push("/profile")
                  setIsMobileMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <AnimatedAvatar type="tech-girl" size="small" />
                <span className="font-medium text-gray-700">Sarah Johnson</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
