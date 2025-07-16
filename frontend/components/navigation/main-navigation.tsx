// components/navigation.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, User, Trophy, BarChart3, BookOpen, LogOut, LogIn } from "lucide-react";
import AnimatedAvatar from "@/components/profile/animated-avatar";
import { useUser } from "@/components/context/UserContext";

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, isLoadingUser, setUser } = useUser(); // Destructure setUser if available

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Don't show navigation on landing page, login, signup, or onboarding
  const hideNavigation = ["/", "/login", "/signup", "/onboarding"].includes(pathname);

  if (hideNavigation) {
    return null;
  }

  // Profile is removed from here, as it will be in the avatar dropdown
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/dashboard" },
    { id: "learning", label: "Learning Path", icon: BookOpen, path: "/roadmap" },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
  ];

  const isActive = (path: string) => {
    if (path === "/roadmap") {
      return pathname === "/roadmap" || pathname.startsWith("/learn");
    }
    return pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Clear auth token
    // Immediately clear user state in context to reflect logout faster in UI
    if (typeof setUser === 'function') {
      setUser(null);
    }
    router.push('/login'); // Redirect to login page
    setIsProfileDropdownOpen(false); // Close dropdown
    setIsMobileMenuOpen(false); // Close mobile menu if open
    router.refresh(); // Force a refresh to re-evaluate context and components
  };

  const handleProfileClick = () => {
    router.push("/profile");
    setIsProfileDropdownOpen(false); // Close dropdown
    setIsMobileMenuOpen(false); // Close mobile menu if open
  };

  return (
    <nav className="bg-white border-b-4 border-black sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => router.push("/dashboard")}
            className="font-black text-2xl tracking-tighter hover:scale-105 transition-transform"
          >
            <span className="text-pink-600">she</span>
            <span className="text-black">learns</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => router.push(item.path, { scroll: true })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold transition-all ${
                    isActive(item.path)
                      ? "bg-pink-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      : "text-gray-700 hover:text-pink-600 hover:bg-pink-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* User Avatar & Name - DESKTOP - WITH DROPDOWN */}
          <div className="hidden md:flex items-center gap-4 relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isLoadingUser ? (
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
              ) : user ? (
                <>
                  <AnimatedAvatar type={user.avatarType as any} size="small" />
                  <span className="font-medium text-gray-700">{user.username}</span>
                </>
              ) : (
                // If not logged in, show generic guest icon/text
                <>
                  <User className="w-8 h-8 text-gray-400" />
                  <span className="font-medium text-gray-700">Guest</span>
                </>
              )}
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border-2 border-black rounded-lg shadow-lg z-10 overflow-hidden">
                {user ? (
                  // Logged-in user options
                  <>
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center gap-2 w-full text-left px-4 py-3 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                    >
                      <User className="w-5 h-5" />
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-3 text-gray-700 font-medium hover:bg-gray-100 transition-colors border-t border-gray-200"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  // Guest options
                  <button
                    onClick={() => { router.push("/login"); setIsProfileDropdownOpen(false); }}
                    className="flex items-center gap-2 w-full text-left px-4 py-3 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                  >
                    <LogIn className="w-5 h-5" /> {/* Use LogIn icon for guest */}
                    Login / Signup
                  </button>
                )}
              </div>
            )}
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
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      router.push(item.path);
                      setIsMobileMenuOpen(false);
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
                );
              })}
            </div>

            {/* Mobile User Section - Directly show profile/logout options or login link */}
            <div className="mt-4 pt-4 border-t-2 border-gray-200 space-y-2">
              {isLoadingUser ? (
                <div className="w-full flex items-center gap-5 px-4 py-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                  <span className="font-medium text-gray-700">Loading...</span>
                </div>
              ) : user ? (
                <>
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-5 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <AnimatedAvatar type={user.avatarType as any} size="small" />
                    <span className="font-medium text-gray-700">{user.username}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-5 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-red-600"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    router.push("/login");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-5 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <User className="w-8 h-8 text-gray-400" />
                  <span className="font-medium text-gray-700">Login / Signup</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}