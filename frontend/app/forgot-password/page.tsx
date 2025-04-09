"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [touched, setTouched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate email when it changes and has been touched
  useEffect(() => {
    if (touched) {
      if (!email) {
        setEmailError("Email is required")
      } else if (!validateEmail(email)) {
        setEmailError("Please enter a valid email address")
      } else {
        setEmailError("")
      }
    }
  }, [email, touched])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark email as touched to trigger validation
    setTouched(true)

    // Validate before submission
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // In a real app, you would call your password reset API here
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Show success state
      setIsSubmitted(true)
    } catch (err) {
      setError("An error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Link href="/" className="mx-auto block">
            <h1 className="text-3xl font-bold text-blue-600">E-Market</h1>
          </Link>
          <CardTitle className="text-2xl mt-6">Reset your password</CardTitle>
          <CardDescription>
            {!isSubmitted
              ? "Enter your email address and we'll send you a link to reset your password"
              : "Check your email for a link to reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500">{error}</div>}

          {isSubmitted ? (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-600">
              <p>
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="mt-2">If you don't see it in your inbox, please check your spam folder.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(true)}
                  required
                  className={`w-full ${emailError && touched ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "email-error" : undefined}
                  disabled={isLoading}
                />
                {emailError && touched && (
                  <p id="email-error" className="text-sm text-red-500 mt-1">
                    {emailError}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || (touched && !!emailError)}
              >
                {isLoading ? "Sending reset link..." : "Send reset link"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <div className="w-full text-center">
            <Link href="/signin" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

