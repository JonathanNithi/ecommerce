"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { Product } from "@/types/products";
import { createApolloClient } from "@/lib/create-apollo-client";
import { GET_PRODUCT } from "@/graphql/queries/product-queries";
import { useQuery } from "@apollo/client";
import { useCart } from "@/context/cart-context"

// Initialize Apollo Client using your function
const client = createApolloClient();

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const productId = params.id;
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const { loading, error, data } = useQuery(GET_PRODUCT, {
    client,
    variables: { id: productId },
  });

  const product: Product | undefined = data?.products?.items?.[0]; 

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

  const handleAddToCart = () => {
    setIsAdding(true)

    // Add item to cart
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.imageUrl,
      },
      quantity,
    )

    // Show success message
    setTimeout(() => {
      setIsAdding(false)
      // You would use a toast notification here in a real app
      console.log(`Added ${quantity} of ${product.name} to cart`)

      // Optionally navigate to cart
      // router.push('/cart')
    }, 500)
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
                  <button
                    className="px-3 py-2 border-r"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                    className="w-12 h-10 text-center border-0 focus:ring-0 focus:outline-none"
                  />
                  <button className="px-3 py-2 border-l" onClick={() => setQuantity((prev) => prev + 1)}>
                    +
                  </button>
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
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}