"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PasswordStrength from "@/components/auth/password-strength"
// Removed Github import as it's no longer used for social buttons

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BASE_BACKEND_URL = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BACKEND_URL
    ? process.env.NEXT_PUBLIC_BACKEND_URL
    : 'http://localhost:8080';

  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      setPasswordChecks({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[^A-Za-z0-9]/.test(value),
      });
    }
  };

  const isFormValid = () => {
    return (
      formData.username.trim() !== "" &&
      formData.email.trim() !== "" &&
      Object.values(passwordChecks).every(Boolean)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      setError("Please ensure all fields are filled correctly and password criteria are met.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        // This block handles non-2xx responses (errors)
        let errorData;
        try {
          const text = await response.text();
          if (text) {
            errorData = JSON.parse(text);
          } else {
            errorData = { message: `Signup failed with status: ${response.status}. No error response body.` };
          }
        } catch (jsonParseError: any) {
          console.error("Error response JSON parsing error:", jsonParseError);
          errorData = { message: `Server error: Could not parse error response. Status: ${response.status}.` };
        }

        const errorMessage = errorData.message || 'Signup failed. Please try again.';
        throw new Error(errorMessage); // Throw error to be caught by outer catch
      }

      // This block handles successful 2xx responses
      let result;
      try {
        const text = await response.text(); // Read as text first
        if (text) {
          result = JSON.parse(text); // Then try to parse it
        } else {
          // If a 2xx response has an empty body, it's an unexpected scenario for a token
          console.error("Successful signup response had an empty body.");
          throw new Error("Signup successful, but no token received. Please try logging in.");
        }
      } catch (jsonParseError: any) {
        console.error("Successful response JSON parsing error:", jsonParseError);
        throw new Error("Signup successful, but failed to parse server response for token.");
      }

      console.log("Signup successful:", result);

      if (result.token) {
        localStorage.setItem('authToken', result.token);
        console.log("JWT Token stored:", result.token);
      } else {
        console.warn("Signup successful, but no 'token' field found in response:", result);
        setError("Signup successful, but no session token received. Please try logging in.");
      }

      router.push("/onboarding");

    } catch (err: any) {
      console.error("Signup process error:", err.message); // More generic error message for the outer catch
      setError(err.message || "An unexpected error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

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
            <Label htmlFor="username" className="text-sm font-medium">
              What should we call you?
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
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
            disabled={!isFormValid() || loading}
            className={`w-full bg-pink-600 hover:bg-black text-white font-bold py-3 rounded-xl transition-all ${
              !isFormValid() || loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(219,39,119)]"
            }`}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        {/* The "or Sign Up With" section and social buttons have been removed from here */}

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
  );
}
