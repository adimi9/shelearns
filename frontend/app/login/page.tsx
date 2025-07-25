"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser } from "@/components/context/UserContext" // Import useUser hook

export default function LoginPage() {
  const router = useRouter()
  // Destructure fetchUserProfile from useUser hook
  const { fetchUserProfile } = useUser(); // <--- ADD THIS LINE

  // define all possible states possible on this page -----
  // email and password stored in the form
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  // invalid login credentials -> error
  const [error, setError] = useState<string | null>(null)
  // when login credentials are being processed -> loading
  const [loading, setIsLoading] = useState(false)

  // Use a fallback for NEXT_PUBLIC_BACKEND_URL if not defined in the environment
  const BASE_BACKEND_URL = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BACKEND_URL
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : 'http://localhost:8080';

  // if email / password are updated, update formData accordingly
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // when form is submitted, handle login logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // clear previous errors

    try {
      const response = await fetch(`${BASE_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const responseText = await response.text();
      console.log("Backend Raw Response:", responseText);

      if (response.ok) {
        let data;
        try {
          if (responseText) {
            data = JSON.parse(responseText);
          } else {
            console.error("Successful login response had an empty body.");
            throw new Error("Login successful, but no token received. Please try again.");
          }
        } catch (jsonParseError: any) {
          console.error("Successful response JSON parsing error:", jsonParseError);
          throw new Error("Login successful, but failed to parse server response for token.");
        }

        console.log("Login successful:", data);

        if (data.token) {
          localStorage.setItem('authToken', data.token); // Store the JWT token
          console.log("JWT Token stored:", data.token);

          // IMPORTANT: Trigger a re-fetch of the user profile after successful login
          await fetchUserProfile(); // <--- ADD THIS LINE to update UserContext

        } else {
          console.warn("Login successful, but no 'token' field found in response:", data);
          setError("Login successful, but no session token received. Please try logging in again.");
        }

        router.push("/roadmap"); // Redirect to roadmap on success

      } else {
        let errorData;
        try {
          if (responseText) {
            errorData = JSON.parse(responseText);
          } else {
            errorData = { message: `Login failed with status: ${response.status}. No error response body.` };
          }
        } catch (jsonParseError: any) {
          console.error("Error response JSON parsing error:", jsonParseError);
          errorData = { message: `Server error: Could not parse error response. Status: ${response.status}.` };
        }

        setError(errorData.message || `Login failed with status: ${response.status}.`);
        console.error("Login failed:", errorData);
      }
    } catch (err: any) {
      console.error("An unexpected error occurred (network or other):", err);
      setError(err.message || 'An unexpected error occurred. Please check your network connection and server status.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-6">
      <div className="bg-white border-4 border-black rounded-xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black">
            <span className="text-pink-600">Welcome</span> Back
          </h1>
          <p className="text-gray-600 mt-2">Continue your learning journey</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-400 text-red-700 text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="border-2 border-black rounded-lg p-3"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Link href="#" className="text-xs text-pink-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="border-2 border-black rounded-lg p-3"
              required
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-pink-600 hover:bg-black text-white font-bold py-3 rounded-xl transition-all hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(219,39,119)]"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or Log In With</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Button type="button" variant="outline" className="border-2 border-black hover:bg-gray-100" disabled={loading}>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <title>Google</title>
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

          <Button type="button" variant="outline" className="border-2 border-black hover:bg-gray-100" disabled={loading}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="currentColor"
            >
              <title>GitHub</title>
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </Button>

          <Button type="button" variant="outline" className="border-2 border-black hover:bg-gray-100" disabled={loading}>
            <svg
              className="w-5 h-5"
              viewBox="0 0 21 21"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Microsoft</title>

              <path d="M0 0H10V10H0V0Z" fill="#F25022" />
              <path d="M11 0H21V10H11V0Z" fill="#7FBA00" />
              <path d="M0 11H10V21H0V11Z" fill="#00A4EF" />
              <path d="M11 11H21V21H11V11Z" fill="#FFB900" />
            </svg>
          </Button>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="text-pink-600 font-medium underline">
              Sign Up
            </Link>{" "}
            Instead
          </p>
        </div>
      </div>
    </div>
  )
}