"use client";

import Link from "next/link";
import Navbar from "@/components/navbar/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/footer/Footer";
import { ApolloProvider } from "@apollo/client";
import { useMemo } from "react";
import { useGetProducts } from "@/graphql/queries/product-queries";
import { createApolloClient } from "@/lib/create-apollo-client";
import { Product } from "@/types/products"; // Import the Product interface

export default function Home() {
  const client = useMemo(() => createApolloClient(), []);

  return (
    <ApolloProvider client={client}>
      <HomePageContent />
    </ApolloProvider>
  );
}

function HomePageContent() {
  const { loading, error, data } = useGetProducts();

  if (loading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    console.error("Error fetching products:", error);
    return <div>Error loading products.</div>;
  }

  const products: Product[] = data?.products || []; // Explicitly type the products array

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 pt-16 md:pt-16 ">
        <section className="relative bg-[url('/images/homepage.jpeg')] bg-cover bg-center h-screen flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
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
            {products.map((product) => ( // TypeScript can now infer the type of 'product'
              <Link key={product.id} href={`#product-${product.id}`}>
                <Card className="overflow-hidden transition-all hover:shadow-md">
                  <div className="aspect-square bg-blue-50">
                    <img
                      src={product.imageUrl || "/placeholder.svg"}
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