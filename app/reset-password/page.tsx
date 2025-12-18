"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export default function ResetPassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [checkingSession, setCheckingSession] = useState(true)
  const [isValidSession, setIsValidSession] = useState(false)

  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session")
        const data = await res.json()
        if (data.user) {
          setIsValidSession(true)
        } else {
          setIsValidSession(false)
          setError("You must be logged in to reset your password.")
        }
      } catch (err) {
        setIsValidSession(false)
        setError("Failed to verify session.")
      } finally {
        setCheckingSession(false)
      }
    }
    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to update password")
      }

      setMessage("Password updated successfully! Redirecting...")
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err: any) {
      console.error("Password update error:", err)
      setError(err.message || "Failed to update password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleBackToSignIn = () => {
    router.push("/")
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-xl tracking-wider">VERIFYING SESSION...</div>
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-light tracking-wider mb-2">RESET PASSWORD</h1>
            <div className="w-16 h-px bg-gray-600 mx-auto"></div>
          </div>
          <div className="border border-gray-600 bg-black p-8 rounded-md">
            <div className="mb-6 p-3 border border-red-500 text-red-500 text-xs tracking-wider text-center">
              {error}
            </div>
            <button
              onClick={handleBackToSignIn}
              className="w-full border border-gray-600 hover:border-white hover:bg-white hover:text-black py-4 text-white font-mono text-sm tracking-wider transition-all rounded-md"
            >
              BACK TO SIGN IN
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-light tracking-wider mb-2">RESET PASSWORD</h1>
          <div className="w-16 h-px bg-gray-600 mx-auto"></div>
        </div>

        <div className="border border-gray-600 bg-black p-8 rounded-md">
          {message && (
            <div className="mb-4 p-3 border border-green-500 text-green-500 text-xs tracking-wider text-center">
              {message}
            </div>
          )}
          {error && !message && (
            <div className="mb-4 p-3 border border-red-500 text-red-500 text-xs tracking-wider text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-medium mb-2 tracking-wider text-gray-400">NEW PASSWORD</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-gray-700 p-3 pr-12 text-white placeholder-gray-500 font-mono text-sm tracking-wider focus:border-white focus:outline-none transition-colors rounded-md"
                  placeholder="ENTER NEW PASSWORD"
                  required
                  disabled={loading || !!message}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  disabled={loading || !!message}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2 tracking-wider text-gray-400">CONFIRM PASSWORD</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-black border border-gray-700 p-3 pr-12 text-white placeholder-gray-500 font-mono text-sm tracking-wider focus:border-white focus:outline-none transition-colors rounded-md"
                  placeholder="CONFIRM NEW PASSWORD"
                  required
                  disabled={loading || !!message}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  disabled={loading || !!message}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !!message}
              className="w-full border border-green-500 hover:border-green-400 hover:bg-green-500 hover:text-black py-4 text-green-500 font-mono text-sm tracking-wider transition-all mt-8 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
            >
              {loading ? "UPDATING..." : "UPDATE PASSWORD"}
            </button>
          </form>

          {!message && (
            <div className="mt-6 text-center">
              <button
                onClick={handleBackToSignIn}
                disabled={loading}
                className="text-gray-400 hover:text-white text-xs tracking-wider underline transition-colors disabled:opacity-50"
              >
                BACK TO SIGN IN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
