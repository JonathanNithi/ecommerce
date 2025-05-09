// providers.tsx
"use client"

import type React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { CartProvider } from "@/context/cart-context"
import { AuthProvider } from "@/context/auth-context"
import { ApolloClientProvider } from "@/context/apollo-client-context" // Import ApolloClientProvider

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ApolloClientProvider> {/* Wrap everything with ApolloClientProvider */}
            <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                <AuthProvider>
                    <CartProvider>{children}</CartProvider>
                </AuthProvider>
            </NextThemesProvider>
        </ApolloClientProvider>
    )
}