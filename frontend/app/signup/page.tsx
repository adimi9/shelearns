"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PasswordStrength from "@/components/auth/password-strength"
import { Github } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false) // State for loading indicator
  const [error, setError] = useState<string | null>(null) // State for error messages

  const BASE_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'; // Get from env var

  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === "password") {
      setPasswordChecks({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[^A-Za-z0-9]/.test(value),
      })
    }
    console.log("hi")
  }

  const isFormValid = () => {
    console.log("s hi")
    return formData.name.trim() !== "" && formData.email.trim() !== "" && Object.values(passwordChecks).every(Boolean)
  }

  const handleSubmit = async (e: React.FormEvent) => { // Make handleSubmit async
    e.preventDefault()
    console.log("handleSubmit triggered!"); // <--- ADD THIS LINE
    if (!isFormValid()) {
      setError("Please ensure all fields are filled correctly and password criteria are met.")
      return
    }

    setLoading(true)
    setError(null) // Clear previous errors

    try {
      const response = await fetch(`${BASE_BACKEND_URL}/api/auth/signup`, { // <-- Endpoint on your Spring Boot backend
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        // Attempt to parse error message from backend
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Signup failed. Please try again.';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Signup successful:", result);

      // --- Important: Handle successful signup and potentially store auth token ---
      // If your backend returns a JWT or similar token, store it securely (e.g., in localStorage or cookies)
      // localStorage.setItem('authToken', result.token); // Example

      // Redirect to onboarding or dashboard after successful signup
      router.push("/onboarding");

    } catch (err: any) {
      console.error("Signup error:", err.message);
      setError(err.message || "An unexpected error occurred during signup.");
    } finally {
      setLoading(false);
    }
  }

  console.log("--- Component Re-render ---");
  console.log("Form Data:", formData);
  console.log("Password Checks:", passwordChecks);
  console.log("Is Form Valid?:", isFormValid());
  console.log("--- End Re-render Info ---");

  // @ts-ignore
  return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center p-6">
        <div className="bg-white border-4 border-black rounded-xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black">
              <span className="text-pink-600">Create</span> Your Account
            </h1>
            <p className="text-gray-600 mt-2">Join millions of women learning tech</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                What should we call you?
              </Label>
              <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="border-2 border-black rounded-lg p-3"
                  required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Your email (so we can track your progress)
              </Label>
              <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border-2 border-black rounded-lg p-3"
                  required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Create a strong password
              </Label>
              <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="border-2 border-black rounded-lg p-3"
                  required
              />
              <PasswordStrength password={formData.password} />
            </div>

            {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
            )}

            <Button
                type="submit"
                disabled={!isFormValid() || loading} // Disable button while loading or if form is invalid
                className={`w-full bg-pink-600 hover:bg-black text-white font-bold py-3 rounded-xl transition-all ${
                    !isFormValid() || loading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(219,39,119)]"
                }`}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or Sign Up With</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Social login buttons - unchanged */}
            <Button type="button" variant="outline" className="border-2 border-black hover:bg-gray-100">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                />
                <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                />
                <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                />
                <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                />
              </svg>
            </Button>

            <Button type="button" variant="outline" className="border-2 border-black hover:bg-gray-100">
              <Github className="w-5 h-5" />
            </Button>

            <Button type="button" variant="outline" className="border-2 border-black hover:bg-gray-100">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                    d="M21.5359 10.8046C21.5359 10.041 21.4743 9.29383 21.3457 8.56665H11.5V12.4772H17.0951C16.8482 13.7583 16.1183 14.8664 15.0237 15.6236V18.1891H18.4307C20.3644 16.4118 21.5359 13.8642 21.5359 10.8046Z"
                    fill="#4285F4"
                />
                <path
                    d="M11.5 21.5C14.3029 21.5 16.6747 20.5506 18.4307 18.1891L15.0237 15.6236C14.0948 16.2569 12.9128 16.625 11.5 16.625C8.74 16.625 6.39364 14.8015 5.56455 12.3249H2.04883V14.9695C3.80273 18.7677 7.36818 21.5 11.5 21.5Z"
                    fill="#34A853"
                />
                <path
                    d="M5.56458 12.3249C5.35458 11.6916 5.23728 11.0166 5.23728 10.3249C5.23728 9.63328 5.35458 8.95828 5.56458 8.32495V5.68042H2.04886C1.35001 7.09383 0.954102 8.67495 0.954102 10.3249C0.954102 11.975 1.35001 13.5561 2.04886 14.9695L5.56458 12.3249Z"
                    fill="#FBBC05"
                />
                <path
                    d="M11.5 4.02495C13.0109 4.02495 14.3855 4.53745 15.4744 5.57495L18.4854 2.56401C16.6747 0.873745 14.3029 -0.000488281 11.5 -0.000488281C7.36818 -0.000488281 3.80273 2.73183 2.04883 6.53011L5.56455 9.17464C6.39364 6.69808 8.74 4.02495 11.5 4.02495Z"
                    fill="#EA4335"
                />
              </svg>
            </Button>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-pink-600 font-medium underline">
                Log In
              </Link>{" "}
              Instead
            </p>
          </div>
        </div>
      </div>
  )
}