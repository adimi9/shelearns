"use client"

import type React from "react"

import { useState } from "react"
import { X, Eye, EyeOff, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

  const validatePassword = (password: string) => {
    const errors = []
    if (password.length < 8) errors.push("At least 8 characters")
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter")
    if (!/[0-9]/.test(password)) errors.push("One number")
    if (!/[^A-Za-z0-9]/.test(password)) errors.push("One special character")
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setIsLoading(true)

    // Validate current password (in real app, this would be verified server-side)
    if (!formData.currentPassword) {
      setErrors(["Current password is required"])
      setIsLoading(false)
      return
    }

    // Validate new password
    const passwordErrors = validatePassword(formData.newPassword)
    if (passwordErrors.length > 0) {
      setErrors(passwordErrors)
      setIsLoading(false)
      return
    }

    // Check password confirmation
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors(["New passwords don't match"])
      setIsLoading(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    }, 1000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors([])
  }

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

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
          {/* Current Password */}
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
              >
                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
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
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
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
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="p-3 bg-gray-50 border-2 border-gray-200 rounded-lg">
            <p className="text-sm font-medium mb-2">Password must include:</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {validatePassword(formData.newPassword).map((req, index) => (
                <div key={index} className="flex items-center gap-1 text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  <span>{req}</span>
                </div>
              ))}
              {validatePassword(formData.newPassword).length === 0 && formData.newPassword && (
                <div className="flex items-center gap-1 text-green-600 col-span-2">
                  <Check className="w-3 h-3" />
                  <span>Password meets all requirements</span>
                </div>
              )}
            </div>
          </div>

          {/* Errors */}
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

          <Button
            type="submit"
            disabled={isLoading || errors.length > 0}
            className="w-full bg-pink-600 hover:bg-black text-white font-bold py-3 rounded-xl transition-all"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  )
}
