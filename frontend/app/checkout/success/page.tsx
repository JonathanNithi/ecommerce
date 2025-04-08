"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar/Navbar"
import Footer from "@/components/footer/Footer"
import { useCart } from "@/context/cart-context" // Import useCart to access the last order data

export default function CheckoutSuccessPage() {
    const router = useRouter()
    const { lastOrder } = useCart() // Access the last order data from the cart context

    // Use the order ID from the mutation response as the order number
    const orderNumber = lastOrder?.id || "N/A" // Fallback to "N/A" if lastOrder is not available;

    // Redirect to home after 10 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            router.push("/")
        }, 10000)

        return () => clearTimeout(timer)
    }, [router])

    return (
        <div>
            <Navbar />
            <div className="container py-24 min-h-screen">
                <div className="max-w-md mx-auto text-center">
                    <div className="flex justify-center mb-6">
                        <CheckCircle size={64} className="text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Order Successful!</h1>
                    <p className="text-muted-foreground mb-6">
                        Thank you for your purchase. Your order has been received and is being processed.
                    </p>

                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                        <h2 className="text-xl font-medium mb-4">Order Details</h2>
                        <div className="flex justify-between mb-2">
                            <span className="text-muted-foreground">Order Number:</span>
                            <span className="font-medium">{orderNumber}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-muted-foreground">Date:</span>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="text-green-500">Confirmed</span>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-8">
                        A confirmation email has been sent to your email address. You will be redirected to the homepage in a few
                        seconds.
                    </p>

                    <div className="space-y-4">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/")}>
                            Return to Home
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => router.push("/products")}>
                            Continue Shopping
                        </Button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}