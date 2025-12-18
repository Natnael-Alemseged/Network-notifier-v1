"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { loginUser } from "@/lib/features/auth/authThunk"
import { clearError, clearMessage, clearAuth } from "@/lib/features/auth/authSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const dispatch = useAppDispatch()
  const router = useRouter()
  
  const { loading, error, message, user } = useAppSelector((state) => state.auth)

  // Clear errors, messages, and auth state on mount to prevent redirect issues
  useEffect(() => {
    dispatch(clearError())
    dispatch(clearMessage())
    dispatch(clearAuth())
  }, [dispatch])

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push("/")
      router.refresh()
    }
  }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())
    dispatch(clearMessage())

    try {
        const result = await dispatch(
            loginUser({ email: email.toLowerCase(), password })
        ).unwrap();


        if (result.success) {
        // Redirect to dashboard on successful login
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      // Error is handled by Redux state
      console.error('Login failed:', error)
    }
  }


    return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Sign In</h2>
      <p className="text-gray-600 mb-6">Enter your email and password to access Ordo PMS</p>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm">
        Don't have an account?{" "}
        <Link href="/auth/sign-up" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  )
}
