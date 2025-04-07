"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar/Navbar"
import Footer from "@/components/footer/Footer"

// Product type definition
type Product = {
  id: number
  name: string
  price: string
  image: string
  category: string
  description?: string
}

// All products data (in a real app, this would come from an API)
const allProducts: Product[] = [
  {
    id: 1,
    name: "Minimalist Desk Lamp",
    price: "49.99",
    image: "/placeholder.svg?height=800&width=800",
    category: "Lighting",
    description:
      "A sleek, minimalist desk lamp with adjustable brightness and color temperature. Perfect for your home office or bedside table.",
  },
  {
    id: 2,
    name: "Modern Coffee Table",
    price: "199.99",
    image: "/placeholder.svg?height=800&width=800",
    category: "Furniture",
    description:
      "This modern coffee table features clean lines and a durable surface. The perfect centerpiece for your living room.",
  },
  {
    id: 3,
    name: "Ceramic Vase Set",
    price: "79.99",
    image: "/placeholder.svg?height=800&width=800",
    category: "Decor",
    description: "A set of three ceramic vases in varying sizes. Each piece is handcrafted with attention to detail.",
  },
  // Add more product descriptions as needed
]

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const productId = Number.parseInt(params.id)
  const product = allProducts.find((p) => p.id === productId)

  const [quantity, setQuantity] = useState(1)

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
    )
  }

  return (
    <div>
      <Navbar />
      <div className="container py-24 min-h-screen">
        <div className="flex flex-col md:grid md:grid-cols-2 gap-8">
          {/* Product Image - Hidden on mobile, visible on md and up */}
          <div className="bg-blue-50 rounded-lg overflow-hidden hidden md:block">
            <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-auto object-cover" />
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="mt-2 text-blue-600 text-2xl font-semibold">${product.price}</div>

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
                  <button className="px-3 py-2 border-r" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>
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
                  onClick={() => console.log(`Added ${quantity} of ${product.name} to cart`)}
                >
                  Add to Cart
                </Button>
              </div>
            </div>

            {/* Product Image - Visible only on mobile, between Add to Cart and Back button */}
            <div className="bg-blue-50 rounded-lg overflow-hidden my-6 md:hidden">
              <img
                src={product.image || "/placeholder.svg"}
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
  )
}

