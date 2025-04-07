"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import Navbar from "@/components/navbar/Navbar"
import Footer from "@/components/footer/Footer"

// Product type definition
type Product = {
  id: number
  name: string
  price: string
  image: string
  category: string
}

// All products data (in a real app, this would come from an API)
const allProducts: Product[] = [
  {
    id: 1,
    name: "Minimalist Desk Lamp",
    price: "49.99",
    image: "/placeholder.svg?height=400&width=400",
    category: "Lighting",
  },
  {
    id: 2,
    name: "Modern Coffee Table",
    price: "199.99",
    image: "/placeholder.svg?height=400&width=400",
    category: "Furniture",
  },
  {
    id: 3,
    name: "Ceramic Vase Set",
    price: "79.99",
    image: "/placeholder.svg?height=400&width=400",
    category: "Decor",
  },
  {
    id: 4,
    name: "Wool Throw Blanket",
    price: "89.99",
    image: "/placeholder.svg?height=400&width=400",
    category: "Textiles",
  },
  {
    id: 5,
    name: "Minimalist Wall Clock",
    price: "59.99",
    image: "/placeholder.svg?height=400&width=400",
    category: "Decor",
  },
  {
    id: 6,
    name: "Wooden Serving Tray",
    price: "39.99",
    image: "/placeholder.svg?height=400&width=400",
    category: "Kitchen",
  },
  {
    id: 7,
    name: "Linen Throw Pillows",
    price: "29.99",
    image: "/placeholder.svg?height=400&width=400",
    category: "Textiles",
  },
  {
    id: 8,
    name: "Glass Carafe",
    price: "34.99",
    image: "/placeholder.svg?height=400&width=400",
    category: "Kitchen",
  },
  {
    id: 9,
    name: "Bamboo Organizer",
    price: "24.99",
    image: "/placeholder.svg?height=400&width=400",
    category: "Storage",
  },
  {
    id: 10,
    name: "Ceramic Dinner Set",
    price: "129.99",
    image: "/placeholder.svg?height=400&width=400",
    category: "Kitchen",
  },
  {
    id: 11,
    name: "Minimalist Desk Organizer",
    price: "19.99",
    image: "/placeholder.svg?height=400&width=400",
    category: "Storage",
  },
  {
    id: 12,
    name: "Cotton Throw Blanket",
    price: "69.99",
    image: "/placeholder.svg?height=400&width=400",
    category: "Textiles",
  },
  {
    id: 13,
    name: "Scandinavian Side Table",
    price: "149.99",
    image: "/placeholder.svg?height=400&width=400",
    category: "Furniture",
  },
  {
    id: 14,
    name: "Geometric Bookends",
    price: "34.99",
    image: "/placeholder.svg?height=400&width=400",
    category: "Decor",
  },
  {
    id: 15,
    name: "Pendant Light Fixture",
    price: "89.99",
    image: "/placeholder.svg?height=400&width=400",
    category: "Lighting",
  },
  {
    id: 16,
    name: "Minimalist Dining Chair",
    price: "129.99",
    image: "/placeholder.svg?height=400&width=400",
    category: "Furniture",
  },
  {
    id: 17,
    name: "Concrete Planter",
    price: "39.99",
    image: "/placeholder.svg?height=400&width=400",
    category: "Decor",
  },
  {
    id: 18,
    name: "Floating Wall Shelf",
    price: "59.99",
    image: "/placeholder.svg?height=400&width=400",
    category: "Storage",
  },
]

// Get all unique categories
const categories = [...new Set(allProducts.map((product) => product.category))]

// Sort options
const sortOptions = [
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A to Z", value: "name-asc" },
  { label: "Name: Z to A", value: "name-desc" },
]

// Add this constant for the items per page options
const itemsPerPageOptions = [
  { label: "12 per page", value: "12" },
  { label: "25 per page", value: "25" },
  { label: "50 per page", value: "50" },
  { label: "100 per page", value: "100" },
]

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(allProducts)
  const [productsPerPage, setProductsPerPage] = useState(12)
  // State to track quantity for each product
  const [quantities, setQuantities] = useState<Record<number, number>>(
    allProducts.reduce((acc, product) => ({ ...acc, [product.id]: 1 }), {}),
  )

  // Filter and sort products when search, categories, or sort option changes
  useEffect(() => {
    let result = [...allProducts]

    // Filter by search query
    if (searchQuery) {
      result = result.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      result = result.filter((product) => selectedCategories.includes(product.category))
    }

    // Sort products
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => Number.parseFloat(a.price) - Number.parseFloat(b.price))
        break
      case "price-desc":
        result.sort((a, b) => Number.parseFloat(b.price) - Number.parseFloat(a.price))
        break
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        // "newest" - sort by id descending (assuming higher id = newer)
        result.sort((a, b) => b.id - a.id)
    }

    setFilteredProducts(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchQuery, selectedCategories, sortBy, productsPerPage])

  // Calculate pagination
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setSortBy("newest")
  }

  // Handle quantity change
  const handleQuantityChange = (productId: number, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: value,
    }))
  }

  // Handle add to cart
  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault() // Prevent navigation when clicking the button
    e.stopPropagation() // Stop event from bubbling up

    const quantity = quantities[product.id]
    console.log(`Added ${quantity} of ${product.name} to cart`)

    // Here you would add the product to your cart state/context
    // For example: addToCart(product, quantity)
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container py-24">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">All Products</h1>
            <p className="mt-2 text-muted-foreground">
              Browse our complete collection of minimalist products designed for modern living.
            </p>
          </div>

          {/* Filters and Search */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Items Per Page Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select value={productsPerPage.toString()} onValueChange={(value) => setProductsPerPage(Number(value))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Items per page" />
                  </SelectTrigger>
                  <SelectContent>
                    {itemsPerPageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {currentProducts.length} of {filteredProducts.length} products
            </p>
          </div>

          {/* Products Grid */}
          {currentProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {currentProducts.map((product) => (
                <div key={product.id} className="relative group">
                  <Link href={`/products/${product.id}`} className="block">
                    <Card className="overflow-hidden transition-all hover:shadow-md h-full">
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

                        {/* Add to Cart Section */}
                        <div
                          className="mt-4 flex items-center gap-2"
                          onClick={(e) => e.preventDefault()} // Prevent navigation when interacting with these elements
                        >
                          <div className="flex items-center border rounded-md">
                            <input
                              type="number"
                              min="1"
                              value={quantities[product.id]}
                              onChange={(e) => handleQuantityChange(product.id, Number.parseInt(e.target.value) || 1)}
                              aria-label={`Quantity for ${product.name}`}
                              className="w-12 h-9 text-center border-0 focus:ring-0 focus:outline-none"
                              onClick={(e) => e.stopPropagation()} // Prevent navigation when clicking the input
                            />
                          </div>
                          <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={(e) => handleAddToCart(e, product)}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="mt-2 text-muted-foreground">Try adjusting your search or filter criteria</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {filteredProducts.length > productsPerPage && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show first page, last page, current page, and pages around current
                  let pageNum: number | null = null

                  if (totalPages <= 5) {
                    // If 5 or fewer pages, show all page numbers
                    pageNum = i + 1
                  } else if (i === 0) {
                    // First button is always page 1
                    pageNum = 1
                  } else if (i === 4) {
                    // Last button is always the last page
                    pageNum = totalPages
                  } else if (currentPage <= 2) {
                    // Near the start
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 1) {
                    // Near the end
                    pageNum = totalPages - 4 + i
                  } else {
                    // In the middle
                    pageNum = currentPage - 1 + i
                  }

                  // Show ellipsis instead of page number in certain cases
                  if (totalPages > 5) {
                    if ((i === 1 && currentPage > 3) || (i === 3 && currentPage < totalPages - 2)) {
                      return (
                        <PaginationItem key={`ellipsis-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                  }

                  if (pageNum !== null) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                            e.preventDefault()
                            setCurrentPage(pageNum as number)
                          }}
                          isActive={currentPage === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  }

                  return null
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

