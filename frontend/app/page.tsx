"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronDown, Menu, Search, ShoppingBag, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  // This would normally come from an auth context or similar
  const [isSignedIn, setIsSignedIn] = useState(false)

  // Toggle sign in status for demo purposes
  const toggleSignIn = () => {
    setIsSignedIn(!isSignedIn)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="mr-6 text-xl font-bold text-blue-600">
            MinimalBlue
          </Link>
          <div className="flex items-center flex-1 lg:flex-initial">

            <div className="hidden md:flex items-center flex-1 lg:w-[500px] xl:w-[600px] 2xl:w-[800px]">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-r-none border-r-0">
                    All Categories
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Product Categories</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Furniture</DropdownMenuItem>
                  <DropdownMenuItem>Lighting</DropdownMenuItem>
                  <DropdownMenuItem>Decor</DropdownMenuItem>
                  <DropdownMenuItem>Kitchen</DropdownMenuItem>
                  <DropdownMenuItem>Textiles</DropdownMenuItem>
                  <DropdownMenuItem>Storage</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search for products..." className="pl-8 w-full rounded-l-none" />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-5">
            <div className="px-2 py-1.5">
              <div className="relative md:hidden">
                <Search className="h-5 w-5" />
              </div>
              <div className="relative gap-4 items-center ">
                <span className="relative no-underline cursor-default text-inherit">
                  <ShoppingBag className="h-5 w-5 gap-4" />
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                    0
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {isSignedIn ? (
                    <>
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Link href="/profile" className="flex w-full">
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/orders" className="flex w-full">
                          Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/wishlist" className="flex w-full">
                          Wishlist
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={toggleSignIn}>Sign Out</DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem>
                        <Link href="/signin" className="flex w-full" onClick={toggleSignIn}>
                          Sign In
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/signup" className="flex w-full">
                          Sign Up
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden border-t">
          <div className="container py-2">
            <div className="flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-r-none border-r-0" size="sm">
                    All
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Furniture</DropdownMenuItem>
                  <DropdownMenuItem>Lighting</DropdownMenuItem>
                  <DropdownMenuItem>Decor</DropdownMenuItem>
                  <DropdownMenuItem>Kitchen</DropdownMenuItem>
                  <DropdownMenuItem>Textiles</DropdownMenuItem>
                  <DropdownMenuItem>Storage</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search..." className="pl-8 h-9 w-full rounded-l-none" />
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative">
          <div className="absolute inset-0 bg-blue-50" />
          <div className="container relative flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Minimal Design.
              <br />
              Maximum Impact.
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              Discover our curated collection of minimalist products designed for modern living.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Shop Now
              </Button>
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Learn More
              </Button>
            </div>
          </div>
        </section>

      </main>
      <footer className="border-t bg-background">
        <div className="container py-8 md:py-12">
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} MinimalBlue. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

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

const allProducts = [
  ...featuredProducts,
  {
    id: 5,
    name: "Minimalist Wall Clock",
    price: "59.99",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 6,
    name: "Wooden Serving Tray",
    price: "39.99",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 7,
    name: "Linen Throw Pillows",
    price: "29.99",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 8,
    name: "Glass Carafe",
    price: "34.99",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 9,
    name: "Bamboo Organizer",
    price: "24.99",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 10,
    name: "Ceramic Dinner Set",
    price: "129.99",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 11,
    name: "Minimalist Desk Organizer",
    price: "19.99",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 12,
    name: "Cotton Throw Blanket",
    price: "69.99",
    image: "/placeholder.svg?height=400&width=400",
  },
]

