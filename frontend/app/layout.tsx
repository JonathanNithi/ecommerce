import type React from "react";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context"; 

export const metadata = {
  title: "E-Market - Homepage of the best ecommerce platform",
  description: "Find the best products at the best prices",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider> 
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import './globals.css';