"use client"

import type React from "react"

import { useState } from "react"
import { Clock, Globe, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CommunitySetupProps {
  onComplete: (data: any) => void
}

export default function CommunitySetup({ onComplete }: CommunitySetupProps) {
  const [formData, setFormData] = useState({
    timezone: "",
    availability: [] as string[],
    description: "",
  })

  const timezones = [
    "UTC-12:00 (Baker Island)",
    "UTC-11:00 (Hawaii)",
    "UTC-10:00 (Alaska)",
    "UTC-09:00 (Pacific)",
    "UTC-08:00 (Mountain)",
    "UTC-07:00 (Central)",
    "UTC-06:00 (Eastern)",
    "UTC-05:00 (Atlantic)",
    "UTC-04:00 (Brazil)",
    "UTC-03:00 (Argentina)",
    "UTC-02:00 (Mid-Atlantic)",
    "UTC-01:00 (Azores)",
    "UTC+00:00 (London)",
    "UTC+01:00 (Paris)",
    "UTC+02:00 (Cairo)",
    "UTC+03:00 (Moscow)",
    "UTC+04:00 (Dubai)",
    "UTC+05:00 (Pakistan)",
    "UTC+05:30 (India)",
    "UTC+06:00 (Bangladesh)",
    "UTC+07:00 (Thailand)",
    "UTC+08:00 (Singapore)",
    "UTC+09:00 (Japan)",
    "UTC+10:00 (Australia East)",
    "UTC+11:00 (Solomon Islands)",
    "UTC+12:00 (New Zealand)",
  ]

  const availabilityOptions = [
    "Early Morning (6-9 AM)",
    "Morning (9-12 PM)",
    "Afternoon (12-3 PM)",
    "Late Afternoon (3-6 PM)",
    "Evening (6-9 PM)",
    "Night (9-12 AM)",
    "Late Night (12-3 AM)",
    "Weekends Only",
  ]

  const handleAvailabilityChange = (option: string) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.includes(option)
        ? prev.availability.filter((a) => a !== option)
        : [...prev.availability, option],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.timezone && formData.availability.length > 0 && formData.description.trim()) {
      onComplete(formData)
    }
  }

  const isFormValid = formData.timezone && formData.availability.length > 0 && formData.description.trim().length > 0

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-6">
      <div className="bg-white border-4 border-black rounded-xl p-8 max-w-2xl w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">Join Our Learning Community! 🌟</h1>
          <p className="text-gray-600">
            Connect with fellow learners in your timezone and study together for better accountability and motivation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Timezone Selection */}
          <div>
            <Label className="flex items-center gap-2 text-lg font-bold mb-3">
              <Globe className="w-5 h-5 text-blue-500" />
              What's your timezone?
            </Label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData((prev) => ({ ...prev, timezone: e.target.value }))}
              className="w-full p-3 border-2 border-black rounded-lg bg-white"
              required
            >
              <option value="">Select your timezone</option>
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          {/* Availability */}
          <div>
            <Label className="flex items-center gap-2 text-lg font-bold mb-3">
              <Clock className="w-5 h-5 text-green-500" />
              When are you usually available to study? (Select all that apply)
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {availabilityOptions.map((option) => (
                <label
                  key={option}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.availability.includes(option)
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : "border-gray-300 hover:border-pink-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.availability.includes(option)}
                    onChange={() => handleAvailabilityChange(option)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="flex items-center gap-2 text-lg font-bold mb-3">
              <User className="w-5 h-5 text-purple-500" />
              Tell us about yourself and your goals (max 100 characters)
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => {
                if (e.target.value.length <= 100) {
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              }}
              placeholder="e.g., Frontend developer wannabe, love React, looking for study buddies!"
              className="border-2 border-black rounded-lg resize-none"
              rows={3}
              maxLength={100}
              required
            />
            <div className="text-right text-sm text-gray-500 mt-1">{formData.description.length}/100 characters</div>
          </div>

          <Button
            type="submit"
            disabled={!isFormValid}
            className={`w-full bg-pink-600 hover:bg-black text-white font-bold py-4 rounded-xl transition-all ${
              !isFormValid
                ? "opacity-50 cursor-not-allowed"
                : "hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(219,39,119)]"
            }`}
          >
            Join Community & Find Study Partners! 🚀
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <h4 className="font-bold text-blue-800 mb-2">🤝 What you can do in the community:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Find study partners in your timezone</li>
            <li>• Send and receive friend requests</li>
            <li>• Chat with your study buddies</li>
            <li>• Voice/video call for study sessions</li>
            <li>• Share screens to code together</li>
            <li>• Stay accountable and motivated!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
