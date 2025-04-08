import type React from "react";
import "@/app/globals.css";
import { Providers } from "@/components/providers";


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

        <Providers>
          {children}
        </Providers>

      </body>
    </html>
  );
}
