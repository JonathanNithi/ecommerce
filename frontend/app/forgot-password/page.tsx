"use client" // Ensures this component runs on the client

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation' // Import the router
import { useMutation, gql } from "@apollo/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react" // CheckCircle2 is removed as it's no longer used

// Import your GraphQL mutations from the specified file
import { FORGOT_PASSWORD_MUTATION, RESET_PASSWORD_MUTATION } from "@/graphql/mutation/account-mutation"

interface ForgotPasswordInput {
  email: string;
  first_name: string;
  last_name: string;
}

interface ResetPasswordInput {
  id: string;
  email: string;
  password: string;
}

export default function ForgotPassword() {
  const router = useRouter(); // Get the router instance

  // Step tracking (1: Verification, 2: New Password)
  const [currentStep, setCurrentStep] = useState(1)

  // Account ID from verification step
  const [accountId, setAccountId] = useState<string | null>(null)

  // Storing email from the first step
  const [storedEmail, setStoredEmail] = useState<string | null>(null)

  // Form data for step 1
  const [verificationData, setVerificationData] = useState<ForgotPasswordInput>({
    email: "",
    first_name: "",
    last_name: "",
  });

  // Form data for step 2
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  })

  // Errors for step 1
  const [verificationErrors, setVerificationErrors] = useState({
    email: "",
    firstName: "",
    lastName: "",
  })

  // Errors for step 2
  const [passwordErrors, setPasswordErrors] = useState({
    password: "",
    confirmPassword: "",
  })

  // Touched state for step 1
  const [verificationTouched, setVerificationTouched] = useState({
    email: false,
    firstName: false,
    lastName: false,
  })

  // Touched state for step 2
  const [passwordTouched, setPasswordTouched] = useState({
    password: false,
    confirmPassword: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  // const [isCompleted, setIsCompleted] = useState(false) // Removed isCompleted state
  const [formError, setFormError] = useState("")

  const [forgotPasswordMutation, { loading: forgotPasswordLoading, error: forgotPasswordError }] = useMutation(FORGOT_PASSWORD_MUTATION);
  const [resetPasswordMutation, { loading: resetPasswordLoading, error: resetPasswordError }] = useMutation(RESET_PASSWORD_MUTATION);

  // --- Input Handlers and Validation (No changes needed here) ---

  // Handle input changes for verification step
  const handleVerificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // Adjust name mapping if needed (e.g., 'firstName' maps to 'first_name')
    const stateKey = name === 'firstName' ? 'first_name' : name === 'lastName' ? 'last_name' : name;

    // For firstName and lastName, only allow letters and spaces
    if ((name === "firstName" || name === "lastName") && value !== "") {
      if (!/^[A-Za-z\s]*$/.test(value)) {
        return // Don't update if input contains non-letters/spaces
      }
    }

    setVerificationData((prev) => ({
      ...prev,
      [stateKey]: value,
    }))
  }

  // Handle input changes for password step
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Mark field as touched for verification step
  const handleVerificationBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target
    setVerificationTouched((prev) => ({
      ...prev,
      [name]: true,
    }))
  }

  // Mark field as touched for password step
  const handlePasswordBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target
    setPasswordTouched((prev) => ({
      ...prev,
      [name]: true,
    }))
  }

  // Validate verification form fields
  useEffect(() => {
    const newErrors = { email: "", firstName: "", lastName: "" } // Reset errors

    // Validate email
    if (verificationTouched.email) {
      if (!verificationData.email) {
        newErrors.email = "Email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(verificationData.email)) {
        newErrors.email = "Please enter a valid email address"
      }
    }

    // Validate first name
    if (verificationTouched.firstName) {
        const firstNameTrimmed = verificationData.first_name.trim();
        if (!firstNameTrimmed) {
        newErrors.firstName = "First name is required"
        } else if (firstNameTrimmed.length < 2) {
        newErrors.firstName = "First name must be at least 2 characters"
        } else if (firstNameTrimmed.length > 100) {
        newErrors.firstName = "First name cannot exceed 100 characters"
        } else if (!/^[A-Za-z\s]+$/.test(firstNameTrimmed)) { // Check trimmed value
        newErrors.firstName = "First name can only contain letters and spaces"
        }
    }

    // Validate last name
    if (verificationTouched.lastName) {
        const lastNameTrimmed = verificationData.last_name.trim();
        if (!lastNameTrimmed) {
        newErrors.lastName = "Last name is required"
        } else if (lastNameTrimmed.length < 2) {
        newErrors.lastName = "Last name must be at least 2 characters"
        } else if (lastNameTrimmed.length > 100) {
        newErrors.lastName = "Last name cannot exceed 100 characters"
        } else if (!/^[A-Za-z\s]+$/.test(lastNameTrimmed)) { // Check trimmed value
        newErrors.lastName = "Last name can only contain letters and spaces"
        }
    }

    setVerificationErrors(newErrors)
  }, [verificationData, verificationTouched])

  // Validate password form fields
  useEffect(() => {
    const newErrors = { password: "", confirmPassword: "" } // Reset errors

    // Validate password
    if (passwordTouched.password) {
      if (!passwordData.password) {
        newErrors.password = "Password is required"
      } else if (passwordData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long"
      }
    }

    // Validate confirm password
    if (passwordTouched.confirmPassword) {
      if (!passwordData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password"
      } else if (passwordData.password && passwordData.confirmPassword !== passwordData.password) {
        // Only check match if password field itself is touched or has value
        newErrors.confirmPassword = "Passwords do not match"
      }
    }

    setPasswordErrors(newErrors)
  }, [passwordData, passwordTouched])


  // Check if verification form is valid
  const isVerificationFormValid = () => {
    // Re-check validation logic inline to ensure it matches useEffect
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(verificationData.email);
    const firstNameTrimmed = verificationData.first_name.trim();
    const isFirstNameValid = firstNameTrimmed.length >= 2 && firstNameTrimmed.length <= 100 && /^[A-Za-z\s]+$/.test(firstNameTrimmed);
    const lastNameTrimmed = verificationData.last_name.trim();
    const isLastNameValid = lastNameTrimmed.length >= 2 && lastNameTrimmed.length <= 100 && /^[A-Za-z\s]+$/.test(lastNameTrimmed);

    return (
        isEmailValid &&
        isFirstNameValid &&
        isLastNameValid &&
        !verificationErrors.email &&
        !verificationErrors.firstName &&
        !verificationErrors.lastName
    );
  };


  // Check if password form is valid
  const isPasswordFormValid = () => {
    // Re-check validation logic inline
    const isPasswordLengthValid = passwordData.password.length >= 8;
    const doPasswordsMatch = passwordData.confirmPassword === passwordData.password;

    return (
        isPasswordLengthValid &&
        doPasswordsMatch &&
        !passwordErrors.password &&
        !passwordErrors.confirmPassword
    );
  };

  // --- Form Submission Handlers ---

  // Handle verification form submission
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched to trigger validation display if needed
    setVerificationTouched({
      email: true,
      firstName: true,
      lastName: true,
    })

    // Explicitly check validity again before submitting
    if (!isVerificationFormValid()) {
        console.log("Verification form invalid:", verificationErrors); // Debug log
        // Ensure errors are displayed based on the latest check
        const currentErrors = { email: "", firstName: "", lastName: "" };
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(verificationData.email)) currentErrors.email = verificationErrors.email || "Invalid email";
        if (!verificationData.first_name.trim() || verificationData.first_name.trim().length < 2 || verificationData.first_name.trim().length > 100 || !/^[A-Za-z\s]+$/.test(verificationData.first_name.trim())) currentErrors.firstName = verificationErrors.firstName || "Invalid first name";
        if (!verificationData.last_name.trim() || verificationData.last_name.trim().length < 2 || verificationData.last_name.trim().length > 100 || !/^[A-Za-z\s]+$/.test(verificationData.last_name.trim())) currentErrors.lastName = verificationErrors.lastName || "Invalid last name";
        setVerificationErrors(currentErrors);
        return;
    }

    setIsLoading(true)
    setFormError("")

    try {
        const result = await forgotPasswordMutation({
            variables: {
            account: {
                email: verificationData.email,
                first_name: verificationData.first_name.trim(), // Send trimmed names
                last_name: verificationData.last_name.trim(),
            },
            },
        });

        if (result.data?.forgotPassword?.id) {
            setAccountId(result.data.forgotPassword.id);
            setStoredEmail(verificationData.email); // Store the email
            setCurrentStep(2);
            // Reset password form state when moving to step 2
            setPasswordData({ password: "", confirmPassword: ""});
            setPasswordTouched({ password: false, confirmPassword: false });
            setPasswordErrors({ password: "", confirmPassword: "" });
        } else {
            // Handle case where mutation succeeded but didn't return expected data (e.g., account not found)
             setFormError(result.data?.forgotPassword?.message || "Account not found or details incorrect."); // Adjust based on your API response
        }
    } catch (err: any) {
         // Handle GraphQL errors or network errors
        setFormError(err.graphQLErrors?.[0]?.message || err.message || "An error occurred during verification.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle password form submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    setPasswordTouched({
      password: true,
      confirmPassword: true,
    })

    // Validate before submission
    if (!isPasswordFormValid() || !accountId || !storedEmail) {
        console.log("Password form invalid:", { passwordErrors, accountId, storedEmail }); // Debug log
         // Ensure errors are displayed based on the latest check
         const currentErrors = { password: "", confirmPassword: "" };
         if (passwordData.password.length < 8) currentErrors.password = passwordErrors.password || "Password too short";
         if (passwordData.password !== passwordData.confirmPassword) currentErrors.confirmPassword = passwordErrors.confirmPassword || "Passwords do not match";
         setPasswordErrors(currentErrors);
        return;
    }

    setIsLoading(true)
    setFormError("")

    try {
      const result = await resetPasswordMutation({
        variables: {
          account: {
            id: accountId,
            email: storedEmail, // Use the stored email
            password: passwordData.password,
          },
        },
      });

      // Check for success based on your mutation's response structure
      if (result.data?.resetPassword?.id) { // Adjust this check if necessary
        // REDIRECT on success
        router.push('/forgot-password/success');
      } else {
         // Handle case where mutation succeeded but didn't return expected data (e.g., invalid token/ID)
         setFormError(result.data?.resetPassword?.message || "Failed to reset password. Please try again."); // Adjust based on your API response
      }
    } catch (err: any) {
        // Handle GraphQL errors or network errors
      setFormError(err.graphQLErrors?.[0]?.message || err.message || "An error occurred while resetting password.")
    } finally {
      setIsLoading(false)
    }
  }

  // --- Render Logic ---

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Link href="/" className="mx-auto block">
            <h1 className="text-3xl font-bold text-blue-600">E-Market</h1>
          </Link>
          <CardTitle className="text-2xl mt-6">Reset your password</CardTitle>
          <CardDescription>
            {/* Simplified description */}
            {currentStep === 1
              ? "Enter your details to verify your account"
              : "Create a new password for your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formError && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500">{formError}</div>}

          {/* Removed the isCompleted conditional rendering */}
          {currentStep === 1 ? (
            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium leading-none">
                    First name
                  </label>
                  <Input
                    id="firstName"
                    name="firstName" // Keep name consistent with handler/touched state
                    placeholder="John"
                    value={verificationData.first_name}
                    onChange={handleVerificationChange}
                    onBlur={handleVerificationBlur}
                    required
                    maxLength={100}
                    className={`w-full ${verificationErrors.firstName && verificationTouched.firstName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    aria-invalid={!!verificationErrors.firstName}
                    aria-describedby={verificationErrors.firstName ? "firstName-error" : undefined}
                    disabled={isLoading}
                  />
                  {verificationErrors.firstName && verificationTouched.firstName && (
                    <p id="firstName-error" className="text-sm text-red-500 mt-1">
                      {verificationErrors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium leading-none">
                    Last name
                  </label>
                  <Input
                    id="lastName"
                    name="lastName" // Keep name consistent with handler/touched state
                    placeholder="Doe"
                    value={verificationData.last_name}
                    onChange={handleVerificationChange}
                    onBlur={handleVerificationBlur}
                    required
                    maxLength={100}
                    className={`w-full ${verificationErrors.lastName && verificationTouched.lastName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    aria-invalid={!!verificationErrors.lastName}
                    aria-describedby={verificationErrors.lastName ? "lastName-error" : undefined}
                    disabled={isLoading}
                  />
                  {verificationErrors.lastName && verificationTouched.lastName && (
                    <p id="lastName-error" className="text-sm text-red-500 mt-1">
                      {verificationErrors.lastName}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={verificationData.email}
                  onChange={handleVerificationChange}
                  onBlur={handleVerificationBlur}
                  required
                  className={`w-full ${verificationErrors.email && verificationTouched.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  aria-invalid={!!verificationErrors.email}
                  aria-describedby={verificationErrors.email ? "email-error" : undefined}
                  disabled={isLoading}
                />
                {verificationErrors.email && verificationTouched.email && (
                  <p id="email-error" className="text-sm text-red-500 mt-1">
                    {verificationErrors.email}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || !isVerificationFormValid()} // Disable based on validity check
              >
                {isLoading ? "Verifying..." : "Verify Account"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none">
                  New Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  required
                  className={`w-full ${passwordErrors.password && passwordTouched.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  aria-invalid={!!passwordErrors.password}
                  aria-describedby={passwordErrors.password ? "password-error" : undefined}
                  disabled={isLoading}
                />
                {passwordErrors.password && passwordTouched.password && (
                  <p id="password-error" className="text-sm text-red-500 mt-1">
                    {passwordErrors.password}
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
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  required
                  className={`w-full ${passwordErrors.confirmPassword && passwordTouched.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  aria-invalid={!!passwordErrors.confirmPassword}
                  aria-describedby={passwordErrors.confirmPassword ? "confirmPassword-error" : undefined}
                  disabled={isLoading}
                />
                {passwordErrors.confirmPassword && passwordTouched.confirmPassword && (
                  <p id="confirmPassword-error" className="text-sm text-red-500 mt-1">
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>
              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCurrentStep(1)} // Go back to step 1
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || !isPasswordFormValid()} // Disable based on validity check
                >
                  {isLoading ? "Resetting Password..." : "Reset Password"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <div className="w-full text-center">
            {/* Removed the !isCompleted check */}
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