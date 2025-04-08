"use client"

import type React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { CartProvider } from "@/context/cart-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <CartProvider>{children}</CartProvider>
    </NextThemesProvider>
  )
}
