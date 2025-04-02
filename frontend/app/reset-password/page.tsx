"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default function ResetPassword() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  })
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formError, setFormError] = useState("")

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Mark field as touched when blurred
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))
  }

  // Validate form fields
  useEffect(() => {
    const newErrors = { ...errors }

    // Validate password
    if (touched.password) {
      if (!formData.password) {
        newErrors.password = "Password is required"
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long"
      } else {
        newErrors.password = ""
      }
    }

    // Validate confirm password
    if (touched.confirmPassword) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password"
      } else if (formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = "Passwords do not match"
      } else {
        newErrors.confirmPassword = ""
      }
    }

    setErrors(newErrors)
  }, [formData, touched])

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.password.length >= 8 &&
      formData.confirmPassword === formData.password &&
      !errors.password &&
      !errors.confirmPassword
    )
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched to trigger validation
    setTouched({
      password: true,
      confirmPassword: true,
    })

    // Check if form is valid
    if (!isFormValid()) {
      return
    }

    setIsLoading(true)
    setFormError("")

    try {
      // In a real app, you would call your API to update the password
      // You would typically include a token from the URL query parameters
      // that was sent in the reset password email
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Show success state
      setIsSubmitted(true)

      // In a real app, you might redirect to sign-in after a delay
      setTimeout(() => {
        router.push("/signin")
      }, 3000)
    } catch (err) {
      setFormError("An error occurred while resetting your password. Please try again.")
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
            {!isSubmitted ? "Create a new password for your account" : "Your password has been successfully reset"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formError && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500">{formError}</div>}

          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-lg font-medium">Password Reset Complete</h3>
              <p className="mt-2 text-muted-foreground">
                Your password has been successfully reset. You will be redirected to the sign-in page shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none">
                  New Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full ${errors.password && touched.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  disabled={isLoading}
                />
                {errors.password && touched.password && (
                  <p id="password-error" className="text-sm text-red-500 mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                  Confirm New Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full ${errors.confirmPassword && touched.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                  disabled={isLoading}
                />
                {errors.confirmPassword && touched.confirmPassword && (
                  <p id="confirmPassword-error" className="text-sm text-red-500 mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || !isFormValid()}
              >
                {isLoading ? "Resetting password..." : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <div className="w-full text-center text-sm">
            {!isSubmitted ? (
              <>
                Remember your password?{" "}
                <Link href="/signin" className="text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </>
            ) : (
              <Link href="/signin" className="text-blue-600 hover:text-blue-500">
                Go to sign in
              </Link>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

