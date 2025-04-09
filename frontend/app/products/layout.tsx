import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "All Products | MinimalBlue",
  description: "Browse our complete collection of minimalist products designed for modern living.",
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

