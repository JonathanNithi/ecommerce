"use client"

import type React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { CREATE_ACCOUNT_MUTATION, AccountInput, CreateAccountPayload } from "@/graphql/mutation/account-mutation"; // Adjust the import path
import { useMutation } from '@apollo/client'; 
import { createApolloClient } from '@/lib/create-apollo-client'; 

export default function SignUp() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  })
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // For firstName and lastName, only allow letters
    if ((name === "firstName" || name === "lastName") && value !== "") {
      // Allow only letters and spaces
      if (!/^[A-Za-z\s]*$/.test(value)) {
        return // Don't update if input contains non-letters
      }
    }

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

    // Validate first name
    if (touched.firstName) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = "First name is required"
      } else if (formData.firstName.trim().length < 2) {
        newErrors.firstName = "First name must be at least 2 characters"
      } else if (formData.firstName.trim().length > 100) {
        newErrors.firstName = "First name cannot exceed 100 characters"
      } else if (!/^[A-Za-z\s]+$/.test(formData.firstName)) {
        newErrors.firstName = "First name can only contain letters"
      } else {
        newErrors.firstName = ""
      }
    }

    // Validate last name
    if (touched.lastName) {
      if (!formData.lastName.trim()) {
        newErrors.lastName = "Last name is required"
      } else if (formData.lastName.trim().length < 2) {
        newErrors.lastName = "Last name must be at least 2 characters"
      } else if (formData.lastName.trim().length > 100) {
        newErrors.lastName = "Last name cannot exceed 100 characters"
      } else if (!/^[A-Za-z\s]+$/.test(formData.lastName)) {
        newErrors.lastName = "Last name can only contain letters"
      } else {
        newErrors.lastName = ""
      }
    }

    // Validate email
    if (touched.email) {
      if (!formData.email) {
        newErrors.email = "Email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address"
      } else {
        newErrors.email = ""
      }
    }

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

    setErrors(newErrors)
  }, [formData, touched])

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.firstName.trim().length >= 2 &&
      formData.firstName.trim().length <= 100 &&
      /^[A-Za-z\s]+$/.test(formData.firstName) &&
      formData.lastName.trim().length >= 2 &&
      formData.lastName.trim().length <= 100 &&
      /^[A-Za-z\s]+$/.test(formData.lastName) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.password.length >= 8 &&
      !errors.firstName &&
      !errors.lastName &&
      !errors.email &&
      !errors.password
    )
  }

  // Using Apollo Client's useMutation hook
  const client = createApolloClient(); // Initialize the Apollo Client instance
  const [createAccountMutation, { data: mutationData, loading: mutationLoading, error: mutationError }] = useMutation<CreateAccountPayload, { account: AccountInput }>(CREATE_ACCOUNT_MUTATION, {
    client, // Pass the Apollo Client instance
    onCompleted: (data) => {
      console.log("Account created successfully:", data);
      router.push("/signin");
      setIsLoading(false);
    },
    onError: (err) => {
      console.error("Error creating account:", err);
      setFormError("An error occurred while creating your account. Please try again.");
      setIsLoading(false);
    },
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ firstName: true, lastName: true, email: true, password: true });

    if (!isFormValid()) {
      return;
    }

    setIsLoading(true);
    setFormError("");

    const accountInput: AccountInput = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      password: formData.password,
    };

    createAccountMutation({ variables: { account: accountInput } });
  };

  return (
    <div>
      <Navbar />
      <div className="flex pt-32 items-center justify-center bg-background px-4 pb-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <Link href="/" className="mx-auto block">
              <h1 className="text-3xl font-bold text-blue-600">E-Market</h1>
            </Link>
            <CardTitle className="text-2xl mt-6">Create an account</CardTitle>
            <CardDescription>Enter your information to create an account</CardDescription>
          </CardHeader>
          <CardContent>
            {formError && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium leading-none">
                    First name
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    maxLength={100}
                    className={`w-full ${errors.firstName && touched.firstName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    aria-invalid={!!errors.firstName}
                    aria-describedby={errors.firstName ? "firstName-error" : undefined}
                  />
                  {errors.firstName && touched.firstName && (
                    <p id="firstName-error" className="text-sm text-red-500 mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium leading-none">
                    Last name
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    maxLength={100}
                    className={`w-full ${errors.lastName && touched.lastName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    aria-invalid={!!errors.lastName}
                    aria-describedby={errors.lastName ? "lastName-error" : undefined}
                  />
                  {errors.lastName && touched.lastName && (
                    <p id="lastName-error" className="text-sm text-red-500 mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full ${errors.email && touched.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && touched.email && (
                  <p id="email-error" className="text-sm text-red-500 mt-1">
                    {errors.email}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none">
                  Password
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
                />
                {errors.password && touched.password && (
                  <p id="password-error" className="text-sm text-red-500 mt-1">
                    {errors.password}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || mutationLoading || !isFormValid()}
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <div className="w-full text-center text-sm">
              Already have an account?{" "}
              <Link href="/signin" className="text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  )
}

