"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import Navbar from "@/components/navbar/Navbar"
import Footer from "@/components/footer/Footer"
import { useAuth } from "@/lib/auth-context"
import { createApolloClient } from "@/lib/create-apollo-client"
import { useMutation } from "@apollo/client"
import { CREATE_ORDER_MUTATION, OrderInput } from "@/graphql/mutation/order-mutation" // Import from order-mutation.ts

// Initialize Apollo Client
const client = createApolloClient()

export default function CartPage() {
    const router = useRouter()
    const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart()
    const [isCheckingOut, setIsCheckingOut] = useState(false)
    const { isAuthenticated, accountId, accessToken, refreshToken } = useAuth() // Get auth info
    const [createOrder, { data: orderData, loading: orderLoading, error: orderError }] = useMutation(CREATE_ORDER_MUTATION, { client })

    const shippingCost = 0 // Assume free shipping
    const total = subtotal + shippingCost

    const handleCheckout = useCallback(async () => {
        if (!isAuthenticated || !accountId || !accessToken || !refreshToken) {
            router.push("/signin") // Redirect to signin if not authenticated or missing data
            return
        }

        setIsCheckingOut(true)

        const orderProducts = items.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
        }));

        const orderInput: OrderInput = {
            account_id: accountId,
            accessToken: accessToken,
            refreshToken: refreshToken,
            products: orderProducts,
        };

        try {
            const response = await createOrder({ variables: { order: orderInput } });

            if (response?.data?.createOrder?.id) {
                clearCart();
                router.push("/checkout/success");
            } else {
                console.error("Failed to create order:", response?.errors || response?.data);
                // Optionally set an error state to display to the user
            }
        } catch (error) {
            console.error("Error creating order:", error);
            // Optionally set an error state to display to the user
        } finally {
            setIsCheckingOut(false);
        }
    }, [isAuthenticated, accountId, accessToken, refreshToken, items, clearCart, createOrder, router]);

    useEffect(() => {
        if (orderError) {
            console.error("GraphQL Error creating order:", orderError);
            // Optionally display an error message to the user
        }
    }, [orderError]);

    return (
        <div>
            <Navbar />
            <div className="container py-24 min-h-screen">
                <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

                {items.length === 0 ? (
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-medium mb-4">Your cart is empty</h2>
                        <p className="text-muted-foreground mb-8">Looks like you haven't added any products to your cart yet.</p>
                        <Button onClick={() => router.push("/products")} className="bg-blue-600 hover:bg-blue-700">
                            Continue Shopping
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            {/* ... (rest of the cart items display) ... */}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className=" rounded-lg shadow-sm border p-6 sticky top-24">
                                <h2 className="text-xl font-medium mb-6">Order Summary</h2>
                                <div className="space-y-4">
                                    {/* ... (order summary details) ... */}
                                </div>
                                <div className="mt-8 space-y-4">
                                    {isAuthenticated ? (
                                        <Button
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                            onClick={handleCheckout}
                                            disabled={isCheckingOut || orderLoading}
                                        >
                                            {orderLoading ? "Processing Order..." : "Proceed to Checkout"}
                                        </Button>
                                    ) : (
                                        <Button variant="outline" className="w-full" onClick={() => router.push("/signin")}>
                                            Login to Checkout
                                        </Button>
                                    )}
                                    <Button variant="outline" className="w-full" onClick={() => router.push("/products")}>
                                        Continue Shopping
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}