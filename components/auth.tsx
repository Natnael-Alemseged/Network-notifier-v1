"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { loginUser, registerUser } from "@/lib/features/auth/authThunk"
import { clearError, clearMessage, setError, setMessage } from "@/lib/features/auth/authSlice"

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const dispatch = useAppDispatch()
  const { loading, error, message, user } = useAppSelector((state) => state.auth)

  const safeText = (value: unknown): string | null => {
    if (value == null) return null
    if (typeof value === "string") return value
    if (typeof value === "number" || typeof value === "boolean") return String(value)
    if (typeof value === "object") {
      const maybeMessage = (value as { message?: unknown }).message
      if (typeof maybeMessage === "string") return maybeMessage
      try {
        return JSON.stringify(value)
      } catch {
        return ""
      }
    }
    return ""
  }

  const displayMessage = safeText(message)
  const displayError = safeText(error)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  })

  // Clear auth state on mount
  useEffect(() => {
    dispatch(clearError())
    dispatch(clearMessage())
  }, [dispatch])

  // Redirect/Reload on successful auth (user present)
  useEffect(() => {
    if (user) {
      window.location.reload()
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())
    dispatch(clearMessage())

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          dispatch(setError("Passwords do not match"))
          return
        }
        await dispatch(registerUser({
          email: formData.email,
          password: formData.password,
          name: formData.name
        })).unwrap()

        setIsSignUp(false)
        dispatch(setMessage("Registration successful! Please sign in."))
      } else {
        await dispatch(loginUser({
          email: formData.email,
          password: formData.password
        })).unwrap()
      }
    } catch (error) {
      // Error handled by reducer (sets state.error)
      console.error("Auth error:", error)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement forgot password API
    dispatch(setError("Forgot password is not yet implemented with the new system."))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-light tracking-wider mb-2">FORGOT PASSWORD</h1>
            <div className="w-16 h-px bg-gray-600 mx-auto"></div>
          </div>

          {/* Forgot Password Form */}
          <div className="border border-gray-600 bg-black p-8 rounded-md">
            {/* Messages */}
            {displayMessage && (
              <div className="mb-4 p-3 border border-green-500 text-green-500 text-xs tracking-wider text-center">
                {displayMessage}
              </div>
            )}
            {displayError && (
              <div className="mb-4 p-3 border border-red-500 text-red-500 text-xs tracking-wider text-center">
                {displayError}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="block text-xs font-medium mb-2 tracking-wider text-gray-400">EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full bg-black border border-gray-700 p-3 text-white placeholder-gray-500 font-mono text-sm tracking-wider focus:border-white focus:outline-none transition-colors rounded-md"
                  placeholder="ENTER YOUR EMAIL"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full border border-green-500 hover:border-green-400 hover:bg-green-500 hover:text-black py-4 text-green-500 font-mono text-sm tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              >
                {loading ? "SENDING..." : "SEND RESET LINK"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowForgotPassword(false)}
                disabled={loading}
                className="text-gray-400 hover:text-white text-xs tracking-wider underline transition-colors disabled:opacity-50 rounded-md"
              >
                BACK TO SIGN IN
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-xs text-gray-400 tracking-wider">SECURE • PRIVATE • MINIMAL</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-light tracking-wider mb-2">NETWORK NOTIFIER</h1>
          <div className="w-16 h-px bg-gray-600 mx-auto"></div>
        </div>

        {/* Auth Form */}
        <div className="border border-gray-600 bg-black rounded-md">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => {
                setIsSignUp(false)
                dispatch(clearError())
                dispatch(clearMessage())
              }}
              className={`flex-1 py-4 px-6 text-sm tracking-wider transition-colors ${!isSignUp
                ? "bg-[#2C2C2C] text-white border-b-2 border-white"
                : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => {
                setIsSignUp(true)
                dispatch(clearError())
                dispatch(clearMessage())
              }}
              className={`flex-1 py-4 px-6 text-sm tracking-wider transition-colors ${isSignUp
                ? "bg-[#2C2C2C] text-white border-b-2 border-white"
                : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
            >
              SIGN UP
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {/* Messages */}
            {displayMessage && (
              <div className="mb-4 p-3 border border-green-500 text-green-500 text-xs tracking-wider text-center">
                {displayMessage}
              </div>
            )}
            {displayError && (
              <div className="mb-4 p-3 border border-red-500 text-red-500 text-xs tracking-wider text-center">
                {displayError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name field - only for sign up */}
              {isSignUp && (
                <div>
                  <label className="block text-xs font-medium mb-2 tracking-wider text-gray-400">FULL NAME</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full bg-black border border-gray-700 p-3 text-white placeholder-gray-500 font-mono text-sm tracking-wider focus:border-white focus:outline-none transition-colors rounded-md"
                    placeholder="ENTER YOUR NAME"
                    required={isSignUp}
                    disabled={loading}
                  />
                </div>
              )}

              {/* Email field */}
              <div>
                <label className="block text-xs font-medium mb-2 tracking-wider text-gray-400">EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full bg-black border border-gray-700 p-3 text-white placeholder-gray-500 font-mono text-sm tracking-wider focus:border-white focus:outline-none transition-colors rounded-md"
                  placeholder="ENTER YOUR EMAIL"
                  required
                  disabled={loading}
                />
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-medium mb-2 tracking-wider text-gray-400">PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="w-full bg-black border border-gray-700 p-3 pr-12 text-white placeholder-gray-500 font-mono text-sm tracking-wider focus:border-white focus:outline-none transition-colors rounded-md"
                    placeholder="ENTER YOUR PASSWORD"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password field - only for sign up */}
              {isSignUp && (
                <div>
                  <label className="block text-xs font-medium mb-2 tracking-wider text-gray-400">
                    CONFIRM PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="w-full bg-black border border-gray-700 p-3 pr-12 text-white placeholder-gray-500 font-mono text-sm tracking-wider focus:border-white focus:outline-none transition-colors rounded-md"
                      placeholder="CONFIRM YOUR PASSWORD"
                      required={isSignUp}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full border border-green-500 hover:border-green-400 hover:bg-green-500 hover:text-black py-4 text-green-500 font-mono text-sm tracking-wider transition-all mt-8 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              >
                {loading ? "LOADING..." : isSignUp ? "CREATE ACCOUNT" : "SIGN IN"}
              </button>
            </form>

            {/* Forgot Password - only for sign in */}
            {!isSignUp && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowForgotPassword(true)}
                  disabled={loading}
                  className="text-gray-400 hover:text-white text-xs tracking-wider underline transition-colors disabled:opacity-50"
                >
                  FORGOT PASSWORD?
                </button>
              </div>
            )}

            {/* Terms and Privacy - only for sign up */}
            {isSignUp && (
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400 tracking-wider leading-relaxed">
                  BY CREATING AN ACCOUNT, YOU AGREE TO OUR{" "}
                  <button className="text-white hover:text-gray-300 underline transition-colors">
                    TERMS OF SERVICE
                  </button>{" "}
                  AND{" "}
                  <button className="text-white hover:text-gray-300 underline transition-colors">PRIVACY POLICY</button>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400 tracking-wider">SECURE • PRIVATE • MINIMAL</p>
        </div>
      </div>
    </div>
  )
}
