"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/footer/Footer";


export default function Home() {
  // This would normally come from BACKEND
  const featuredProducts = [
    {
      id: 1,
      name: "Minimalist Desk Lamp",
      price: "49.99",
      image: "/placeholder.svg?height=400&width=400",
    },
    {
      id: 2,
      name: "Modern Coffee Table",
      price: "199.99",
      image: "/placeholder.svg?height=400&width=400",
    },
    {
      id: 3,
      name: "Ceramic Vase Set",
      price: "79.99",
      image: "/placeholder.svg?height=400&width=400",
    },
    {
      id: 4,
      name: "Wool Throw Blanket",
      price: "89.99",
      image: "/placeholder.svg?height=400&width=400",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 pt-16 md:pt-16 "> {/* Add padding-top to ensure content is below the fixed header */}
        <section className="relative bg-[url('/images/homepage.jpeg')] bg-cover bg-center h-screen flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" /> {/* Dark overlay for better text readability */}
          <div className="container relative flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Sri Lanka's favorite online shopping destination
            </h1>
            <p className="max-w-[600px] text-white/80 md:text-xl">
              Discover our curated collection of minimalist products designed for modern living.
            </p>
          </div>
        </section>
        <section className="container py-12 md:py-24">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Featured Products</h2>
            <p className="max-w-[600px] text-muted-foreground md:text-lg">
              Our most popular items, carefully selected for quality and design.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`#product-${product.id}`}>
                <Card className="overflow-hidden transition-all hover:shadow-md">
                  <div className="aspect-square bg-blue-50">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">${product.price}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
