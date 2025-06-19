"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Check, X } from "lucide-react"

interface PasswordStrengthProps {
  password: string
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const [checks, setChecks] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  })

  useEffect(() => {
    setChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    })
  }, [password])

  const allValid = Object.values(checks).every(Boolean)

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <PasswordCheck valid={checks.length}>8+ characters</PasswordCheck>
      <PasswordCheck valid={checks.uppercase}>1 uppercase</PasswordCheck>
      <PasswordCheck valid={checks.number}>1 number</PasswordCheck>
      <PasswordCheck valid={checks.special}>1 special char</PasswordCheck>
    </div>
  )
}

interface PasswordCheckProps {
  valid: boolean
  children: React.ReactNode
}

function PasswordCheck({ valid, children }: PasswordCheckProps) {
  return (
    <div
      className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 transition-colors ${
        valid ? "bg-green-100 text-green-800 border border-green-300" : "bg-red-100 text-red-800 border border-red-300"
      }`}
    >
      {valid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
      {children}
    </div>
  )
}
