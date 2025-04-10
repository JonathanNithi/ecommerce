"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { Product } from "@/types/products";
import { GET_PRODUCT } from "@/graphql/queries/product-queries";
import { UPDATE_STOCK_MUTATION } from "@/graphql/mutation/product-mutation"; // Import the update stock mutation
import { useQuery, useMutation } from "@apollo/client";
import { useCart } from "@/context/cart-context";
import { useApolloClient } from "@/context/apollo-client-context";
import { useAuth } from "@/context/auth-context"; // Import the auth context
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const productId = params.id;
    const [quantity, setQuantity] = useState(1);
    const { addItem } = useCart();
    const [isAdding, setIsAdding] = useState(false);
    const client = useApolloClient();
    const { role, accessToken, refreshToken, accountId } = useAuth(); // Get user role and tokens
    const [stockQuantity, setStockQuantity] = useState<number | undefined>(undefined); // Initialize with undefined
    const [isUpdatingStock, setIsUpdatingStock] = useState(false);
    const [updateStockError, setUpdateStockError] = useState<string | null>(null);

    const { loading, error, data, refetch } = useQuery(GET_PRODUCT, {
        client,
        variables: { id: productId },
    });

    const product: Product | undefined = data?.products?.items?.[0];

    useEffect(() => {
        if (product) {
            setStockQuantity(product.stock);
        }
    }, [product]);

    const [updateStock] = useMutation(UPDATE_STOCK_MUTATION, {
        client,
        onCompleted: () => {
            setIsUpdatingStock(false);
            setUpdateStockError(null);
            refetch(); // Refetch product data to update the displayed stock
            router.push("/"); // Redirect to homepage after successful update
        },
        onError: (err) => {
            console.error("Error updating stock:", err);
            setIsUpdatingStock(false);
            setUpdateStockError("Failed to update stock. Please try again.");
        },
    });

    const handleAddToCart = () => {
        setIsAdding(true);

        addItem(
            {
                id: product!.id,
                name: product!.name,
                price: product!.price,
                imageUrl: product!.imageUrl,
                description: product!.description,
            },
            quantity
        );

        setTimeout(() => {
            setIsAdding(false);
            console.log(`Added ${quantity} of ${product!.name} to cart`);
        }, 500);
    };

    const handleStockUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessToken || !refreshToken || accountId === null || stockQuantity === undefined) {
            setUpdateStockError("Authentication and valid stock required to update.");
            return;
        }

        setIsUpdatingStock(true);
        setUpdateStockError(null);

        await updateStock({
            variables: {
                input: {
                    accessToken,
                    refreshToken,
                    productId,
                    newStock: stockQuantity,
                    accountId: accountId,
                },
            },
        });
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="container py-24 min-h-screen">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">Loading Product...</h1>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        console.error("Error fetching product:", error);
        return (
            <div>
                <Navbar />
                <div className="container py-24 min-h-screen">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">Error Loading Product</h1>
                        <p className="mb-6">There was an error fetching the product details.</p>
                        <Button onClick={() => router.push("/products")}>Back to Products</Button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!product) {
        return (
            <div>
                <Navbar />
                <div className="container py-24 min-h-screen">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
                        <p className="mb-6">Sorry, the product you're looking for doesn't exist.</p>
                        <Button onClick={() => router.push("/products")}>Back to Products</Button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="container py-24 min-h-screen">
                <div className="flex flex-col md:grid md:grid-cols-2 gap-8">
                    {/* Product Image - Hidden on mobile, visible on md and up */}
                    <div className="bg-blue-50 rounded-lg overflow-hidden hidden md:block">
                        <img src={product.imageUrl || "/placeholder.svg"} alt={product.name} className="w-full h-auto object-cover" />
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                        <div className="mt-2 text-blue-600 text-2xl font-semibold">Rs. {product.price}</div>

                        <div className="mt-2">
                            <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                {product.category}
                            </span>
                        </div>

                        <div className="mt-6">
                            <h2 className="text-lg font-medium mb-2">Description</h2>
                            <p className="text-muted-foreground">
                                {product.description || "No description available for this product."}
                            </p>
                        </div>

                        <div className="mt-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center border rounded-md">
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                                        className="w-12 h-10 text-center border-0 focus:ring-0 focus:outline-none"
                                    />
                                </div>
                                <Button
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 h-10"
                                    onClick={handleAddToCart}
                                    disabled={!product.availability || isAdding}
                                >
                                    {isAdding ? "Adding..." : "Add to Cart"}
                                </Button>
                                {!product.availability && (
                                    <span className="text-red-500 text-sm">Out of Stock</span>
                                )}
                            </div>
                        </div>

                        {/* Product Image - Visible only on mobile, between Add to Cart and Back button */}
                        <div className="bg-blue-50 rounded-lg overflow-hidden my-6 md:hidden">
                            <img
                                src={product.imageUrl || "/placeholder.svg"}
                                alt={product.name}
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        <Button variant="outline" className="w-full mt-auto" onClick={() => router.push("/products")}>
                            Back to Products
                        </Button>
                        {role === "admin" && product && ( // Check if product exists before rendering the card
                            <Card className="mt-6 bg-transparent border-0 shadow-none">
                                <CardHeader className="px-0">
                                    <CardTitle className="text-lg">Update Stock</CardTitle>
                                    <CardDescription>Manage inventory for this product</CardDescription>
                                </CardHeader>
                                <CardContent className="px-0">
                                    <form onSubmit={handleStockUpdate} className="space-y-4">
                                        {updateStockError && <p className="text-red-500">{updateStockError}</p>}
                                        <div className="space-y-2">
                                            <label htmlFor="stock" className="text-sm font-medium">
                                                New Stock
                                            </label>
                                            <Input
                                                id="stock"
                                                type="number"
                                                min="0"
                                                value={stockQuantity !== undefined ? stockQuantity : ""}
                                                onChange={(e) => setStockQuantity(Number.parseInt(e.target.value) >= 0 ? Number.parseInt(e.target.value) : 0)}
                                                className="w-32"
                                            />
                                        </div>
                                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isUpdatingStock}>
                                            {isUpdatingStock ? "Updating..." : "Update Stock"}
                                        </Button>
                                        <div className="text-sm text-muted-foreground">Current Stock: {product?.stock}</div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}