"use client";

import type React from "react";
import { useState, useEffect } from "react";
import ProductGrid from "@/components/product/product-grid";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { useQuery } from "@apollo/client";
import { GET_PRODUCTS_PRODUCT_PAGE, ProductSortField, SortDirection } from "@/graphql/queries/product-queries";
import { Product } from "@/types/products";
import { createApolloClient } from "@/lib/create-apollo-client";

// Initialize Apollo Client using your function
const client = createApolloClient();

// Sort options
const sortOptions = [
  { label: "Price: Low to High", value: "price-asc", field: ProductSortField.PRICE, direction: SortDirection.ASC },
  { label: "Price: High to Low", value: "price-desc", field: ProductSortField.PRICE, direction: SortDirection.DESC },
  { label: "Name: A to Z", value: "name-asc", field: ProductSortField.NAME, direction: SortDirection.ASC },
  { label: "Name: Z to A", value: "name-desc", field: ProductSortField.NAME, direction: SortDirection.DESC },
];

// Add this constant for the items per page options
const itemsPerPageOptions = [
  { label: "12 per page", value: "12" },
  { label: "25 per page", value: "25" },
  { label: "50 per page", value: "50" },
  { label: "100 per page", value: "100" },
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState(sortOptions[0].value); // Default sort by price low to high
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(12);

  const { loading, error, data } = useQuery(GET_PRODUCTS_PRODUCT_PAGE, {
    client, // Use the client created by your function
    variables: {
      field: sortOptions.find((option) => option.value === sortBy)?.field,
      direction: sortOptions.find((option) => option.value === sortBy)?.direction,
      skip: (currentPage - 1) * productsPerPage,
      take: productsPerPage,
    },
  });

  const filteredProducts = data?.products?.items as Product[] | undefined;
  const totalProductsCount = data?.products?.totalCount;
  const totalPages = totalProductsCount ? Math.ceil(totalProductsCount / productsPerPage) : 0;

  // Update Apollo query when sorting or pagination changes
  useEffect(() => {
    refetchProducts();
  }, [sortBy, currentPage, productsPerPage]);

  const { refetch: refetchProducts } = useQuery(GET_PRODUCTS_PRODUCT_PAGE, {
    client, // Use the client created by your function
    variables: {
      field: sortOptions.find((option) => option.value === sortBy)?.field,
      direction: sortOptions.find((option) => option.value === sortBy)?.direction,
      skip: (currentPage - 1) * productsPerPage,
      take: productsPerPage,
    },
    skip: true, // Don't run on initial load, useEffect will trigger it
  });

  // Toggle category selection (you'll need to adapt this if categories come from the backend)
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
    // You'll likely need to refetch products with category filters here
    // refetchProducts({ category: selectedCategories.includes(category) ? selectedCategories.filter((c) => c !== category) : [...selectedCategories, category] });
  };

  // Clear all filters (you'll need to adapt this based on your backend filtering)
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSortBy(sortOptions[0].value);
    setCurrentPage(1);
    setProductsPerPage(12);
    refetchProducts({ field: sortOptions[0].field, direction: sortOptions[0].direction, skip: 0, take: 12 });
  };

  // Handle sort by change
  const handleSortByChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1); // Reset page on sort
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setProductsPerPage(Number(value));
    setCurrentPage(1); // Reset page on items per page change
  };

  // Basic search (you'll likely want to integrate this with your backend search)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset page on search
    // You'll likely need to refetch products with the search query here
    // refetchProducts({ query: e.target.value });
  };

  // Dummy quantity state (replace with your actual cart logic)
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleQuantityChange = (productId: string, value: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: value }));
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const quantity = quantities[product.id] || 1;
    console.log(`Added ${quantity} of ${product.name} (ID: ${product.id}) to cart`);
    // Implement your cart logic here
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error loading products: {error.message}</div>;

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

          {/* Filters and Search (Basic search input added) */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Search:</span>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="border rounded-md px-3 py-2 w-full sm:w-auto"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select value={sortBy} onValueChange={handleSortByChange}>
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
                <Select value={productsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
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
            <button onClick={clearFilters} className="text-sm text-blue-500 hover:underline">
              Clear Filters
            </button>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts?.length || 0} of {totalProductsCount !== undefined ? totalProductsCount : '...'} products
            </p>
          </div>

          {/* Products Grid */}
          {filteredProducts && (
            <ProductGrid
              products={filteredProducts}
              quantities={quantities}
              handleQuantityChange={handleQuantityChange}
              handleAddToCart={handleAddToCart}
              clearFilters={clearFilters}
            />
          )}

          {/* Pagination */}
          {totalProductsCount !== undefined && totalProductsCount > productsPerPage && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number | null = null;

                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (i === 0) {
                    pageNum = 1;
                  } else if (i === 4) {
                    pageNum = totalPages;
                  } else if (currentPage <= 2) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 1) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 1 + i;
                  }

                  if (totalPages > 5) {
                    if ((i === 1 && currentPage > 3) || (i === 3 && currentPage < totalPages - 2)) {
                      return (
                        <PaginationItem key={`ellipsis-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                  }

                  if (pageNum !== null) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                            e.preventDefault();
                            setCurrentPage(pageNum as number);
                          }}
                          isActive={currentPage === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }

                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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
  );
}