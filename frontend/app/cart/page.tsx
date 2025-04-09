// pages/cart/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { useAuth } from "@/context/auth-context";
import { useMutation, gql, useQuery } from "@apollo/client";
import { CREATE_ORDER_MUTATION, OrderInput } from "@/graphql/mutation/order-mutation";
import { useApolloClient } from "@/context/apollo-client-context";
import { GET_PRODUCTS_BY_IDS } from "@/graphql/queries/product-queries";
import { checkStockAndProceed } from '@/lib/check-stock'; // Import the utility function
import UnavailableProductsModal from "@/components/modals/UnavailableProductsModal"; // Import the modal
import { OrderedProduct } from "@/types/orders"; // Import the OrderedProduct type

interface UnavailableProduct {
    id: string;
    name?: string;
    requested?: number;
    available?: number;
}

export default function CartPage() {
    const router = useRouter();
    const { items, updateQuantity, removeItem, clearCart, subtotal, setLastOrder } = useCart();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const { isAuthenticated, accountId, accessToken, refreshToken } = useAuth();
    const client = useApolloClient();
    const [createOrder, { data: orderData, loading: orderLoading, error: orderError }] = useMutation(
        CREATE_ORDER_MUTATION,
        { client }
    );
    const [stockError, setStockError] = useState<string | null>(null);
    const [showUnavailablePopup, setShowUnavailablePopup] = useState(false);
    const [unavailableProducts, setUnavailableProducts] = useState<UnavailableProduct[]>([]);

    const productIdsToCheck = items.map((item) => item.id);

    const { data: productsData, loading: availabilityLoading, error: availabilityError } = useQuery(
        GET_PRODUCTS_BY_IDS,
        {
            variables: { id: productIdsToCheck },
            skip: items.length === 0,
        }
    );

    const shippingCost = 0;
    const total = subtotal + shippingCost;

    const handleCheckout = useCallback(async () => {
        if (!isAuthenticated || !accountId || !accessToken || !refreshToken) {
            router.push("/signin");
            return;
        }

        setIsCheckingOut(true);
        setStockError(null);
        setShowUnavailablePopup(false);
        setUnavailableProducts([]);

        const orderProducts = items.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
        }));

        const orderInput: OrderInput = {
            account_id: accountId!,
            accessToken: accessToken!,
            refreshToken: refreshToken!,
            products: orderProducts,
        };

        const stockCheckResult = await checkStockAndProceed(
            client,
            items, // Cast 'items' to OrderedProduct[]
            createOrder,
            orderInput,
            setLastOrder,
            clearCart,
            router,
            productsData?.productsById
        );

        setIsCheckingOut(false);

        if (stockCheckResult && stockCheckResult.insufficientStock.length > 0) {
            setUnavailableProducts(stockCheckResult.insufficientStock);
            setShowUnavailablePopup(true);
        } else if (stockCheckResult && stockCheckResult.orderSuccessful) {
            // Order was handled within checkStockAndProceed, no need to do anything here
        } else if (stockCheckResult && stockCheckResult.orderFailed) {
            setStockError("Failed to create order. Please try again.");
        } else if (stockCheckResult && stockCheckResult.error) {
            setStockError("An error occurred during checkout. Please try again later.");
        }
    }, [isAuthenticated, accountId, accessToken, refreshToken, items, clearCart, createOrder, router, setLastOrder, client, productsData?.productsById]);

    useEffect(() => {
        if (orderError) {
            console.error("GraphQL Error creating order:", orderError);
            setStockError("Failed to create order. Please try again.");
        }
    }, [orderError]);

    const closeUnavailablePopup = () => {
        setShowUnavailablePopup(false);
        setUnavailableProducts([]);
    };

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
                            <div className="rounded-lg shadow-sm border">
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
                                                        src={item.imageUrl || "/placeholder.svg"}
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
                                                                Rs. {(item.price * item.quantity).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between items-center mt-4">
                                                        <div className="flex items-center border rounded-md">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={item.quantity}
                                                                onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                                                                className="w-12 h-8 text-center border-0 focus:ring-0 focus:outline-none"
                                                            />
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
                            <div className=" rounded-lg shadow-sm border p-6 sticky top-24">
                                <h2 className="text-xl font-medium mb-6">Order Summary</h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>Rs. {subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span>Free</span>
                                    </div>
                                    <div className="border-t pt-4 mt-4">
                                        <div className="flex justify-between font-medium text-lg">
                                            <span>Total</span>
                                            <span>Rs. {total.toFixed(2)}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Free shipping applied
                                        </p>
                                    </div>
                                </div>
                                {stockError && <p className="text-red-500 mt-4">{stockError}</p>}
                                <div className="mt-8 space-y-4">
                                    {isAuthenticated ? (
                                        <Button
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                            onClick={handleCheckout}
                                            disabled={isCheckingOut || orderLoading || availabilityLoading}
                                        >
                                            {availabilityLoading ? "Checking Stock..." : (isCheckingOut || orderLoading ? "Processing Order..." : "Proceed to Checkout")}
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

            <UnavailableProductsModal
                isOpen={showUnavailablePopup}
                unavailableProducts={unavailableProducts}
                onClose={closeUnavailablePopup}
            />
        </div>
    );
}