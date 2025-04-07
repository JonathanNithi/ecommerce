"use client";

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { ApolloProvider } from "@apollo/client";
import { useMemo } from "react";
import { createApolloClient } from "@/lib/create-apollo-client";

export default function Home() {
  const client = useMemo(() => createApolloClient(), []);

  return (
    <ApolloProvider client={client}>
      <HomePageContent />
    </ApolloProvider>
  );
}

function HomePageContent() {
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
      </main>
      <Footer />
    </div>
  );
}