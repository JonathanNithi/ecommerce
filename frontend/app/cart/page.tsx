"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import Navbar from "@/components/navbar/Navbar"
import Footer from "@/components/footer/Footer"

export default function CartPage() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  // Calculate shipping cost (free over $100)
  const shippingCost = subtotal >= 100 ? 0 : 10

  // Calculate tax (assume 8%)
  const taxRate = 0.08
  const tax = subtotal * taxRate

  // Calculate total
  const total = subtotal + shippingCost + tax

  // Handle checkout
  const handleCheckout = () => {
    setIsCheckingOut(true)
    // Simulate checkout process
    setTimeout(() => {
      clearCart()
      router.push("/checkout/success")
      setIsCheckingOut(false)
    }, 2000)
  }

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
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-medium">Cart Items ({items.length})</h2>
                    <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-500 hover:text-red-700">
                      Clear Cart
                    </Button>
                  </div>

                  <div className="divide-y">
                    {items.map((item) => (
                      <div key={item.id} className="py-6 flex flex-col sm:flex-row gap-4">
                        {/* Product Image */}
                        <div className="w-full sm:w-24 h-24 bg-blue-50 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <div>
                              <h3 className="font-medium">
                                <Link href={`/products/${item.id}`} className="hover:text-blue-600">
                                  {item.name}
                                </Link>
                              </h3>
                              <p className="text-muted-foreground text-sm mt-1">${item.price}</p>
                            </div>
                            <div className="mt-2 sm:mt-0">
                              <p className="font-medium">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center border rounded-md">
                              <button
                                className="px-3 py-1 border-r"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                                className="w-12 h-8 text-center border-0 focus:ring-0 focus:outline-none"
                              />
                              <button
                                className="px-3 py-1 border-l"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
                <h2 className="text-xl font-medium mb-6">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {shippingCost === 0
                        ? "Free shipping applied"
                        : `Free shipping on orders over $100. You're $${(100 - subtotal).toFixed(2)} away from free shipping.`}
                    </p>
                  </div>
                </div>
                <div className="mt-8 space-y-4">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
                  </Button>
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
