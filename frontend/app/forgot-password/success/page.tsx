"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function PasswordResetSuccess() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Link href="/" className="mx-auto block">
            <h1 className="text-3xl font-bold text-blue-600">E-Market</h1>
          </Link>
          <CardTitle className="text-2xl mt-6">Password Reset Successful</CardTitle>
          <CardDescription>Your password has been reset successfully</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-medium">Password Reset Complete</h3>
            <p className="mt-2 text-muted-foreground">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/signin")}>
            Go to Sign In
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
