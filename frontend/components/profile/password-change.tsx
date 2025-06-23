"use client"

import type React from "react"

import { useState } from "react" // No need for useEffect directly in this file anymore
import { X, Eye, EyeOff, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PasswordStrength from "@/components/auth/password-strength" // <--- IMPORTANT: Importing your separate component

interface PasswordChangeProps {
  onClose: () => void
}

export default function PasswordChange({ onClose }: PasswordChangeProps) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // This function checks if the new password meets ALL strength criteria
  // We'll use the same logic as your PasswordStrength component to ensure consistency
  const isNewPasswordStrong = (password: string) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([]) // Clear errors at the start of submission
    setIsLoading(true)

    const newErrors: string[] = []

    // Validate current password (in real app, this would be verified server-side)
    if (!formData.currentPassword) {
      newErrors.push("Current password is required.")
    }

    // Validate new password using the strength check
    if (!isNewPasswordStrong(formData.newPassword)) {
      newErrors.push("New password does not meet all strength requirements.")
    }

    // Check password confirmation
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.push("New passwords do not match.")
    }
    
    // If any newErrors exist, set them and stop
    if (newErrors.length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    // Simulate API call - REPLACE THIS WITH YOUR ACTUAL BACKEND INTEGRATION
    setTimeout(() => {
      setIsLoading(false)
      setSuccess(true)
      // Optionally close the modal after success display
      setTimeout(() => {
        onClose()
      }, 2000)
    }, 1000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors([]) // Clear general errors on input change
  }

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  // Render success state
  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white border-4 border-black rounded-xl p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-2">Password Updated!</h2>
            <p className="text-gray-600">Your password has been successfully changed.</p>
          </div>
        </div>
      </div>
    )
  }

  // Render the main password change form
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black rounded-xl p-6 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black">Change Password</h2>
          <Button onClick={onClose} variant="outline" size="icon" className="border-2 border-black">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password Field */}
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                className="border-2 border-black pr-10"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                aria-label={showPasswords.current ? "Hide password" : "Show password"}
              >
                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => handleInputChange("newPassword", e.target.value)}
                className="border-2 border-black pr-10"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                aria-label={showPasswords.new ? "Hide password" : "Show password"}
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Display the PasswordStrength component here */}
            {formData.newPassword && <PasswordStrength password={formData.newPassword} />}
          </div>

          {/* Confirm Password Field */}
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className="border-2 border-black pr-10"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                aria-label={showPasswords.confirm ? "Hide password" : "Show password"}
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Display general errors (e.g., passwords don't match, or general strength failure) */}
          {errors.length > 0 && (
            <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            // Button is disabled if:
            // 1. It's currently loading.
            // 2. Any of the password fields are empty.
            // 3. The new password isn't considered strong.
            // 4. The new password and confirm password don't match.
            disabled={
              isLoading ||
              !formData.currentPassword ||
              !formData.newPassword ||
              !formData.confirmPassword ||
              !isNewPasswordStrong(formData.newPassword) ||
              formData.newPassword !== formData.confirmPassword
            }
            className={`w-full bg-pink-600 hover:bg-black text-white font-bold py-3 rounded-xl transition-all ${
              (isLoading || 
               !formData.currentPassword ||
               !formData.newPassword ||
               !formData.confirmPassword ||
               !isNewPasswordStrong(formData.newPassword) ||
               formData.newPassword !== formData.confirmPassword)
                ? "opacity-50 cursor-not-allowed"
                : "hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(219,39,119)]"
            }`}
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  )
}