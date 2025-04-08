"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { GET_PRODUCTS_PRODUCT_PAGE, SEARCH_PRODUCTS, ProductSortField, SortDirection } from "@/graphql/queries/product-queries";
import { Product } from "@/types/products";
import { createApolloClient } from "@/lib/create-apollo-client";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context"

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
    const searchParams = useSearchParams();
    const router = useRouter();
    const searchQuery = searchParams.get('query') || '';
    const categoryQuery = searchParams.get('category') || ''; // Get the category parameter
    const { addItem } = useCart()
    const [sortBy, setSortBy] = useState(sortOptions[0].value);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage, setProductsPerPage] = useState(12);

    const currentSortOption = sortOptions.find((option) => option.value === sortBy);
    const sortField = currentSortOption?.field;
    const sortDirection = currentSortOption?.direction;

    const { loading, error, data, refetch } = useQuery(
        searchQuery || categoryQuery ? SEARCH_PRODUCTS : GET_PRODUCTS_PRODUCT_PAGE,
        {
            client,
            variables: searchQuery || categoryQuery
                ? {
                      field: sortField,
                      direction: sortDirection,
                      skip: (currentPage - 1) * productsPerPage,
                      take: productsPerPage,
                      query: searchQuery || "",
                      category: categoryQuery || ""
                  }
                : {
                      field: sortField,
                      direction: sortDirection,
                      skip: (currentPage - 1) * productsPerPage,
                      take: productsPerPage,
                  },
            skip: false,
            notifyOnNetworkStatusChange: true,
        }
    );

    const filteredProducts = data?.products?.items as Product[] | undefined;
    const totalProductsCount = data?.products?.totalCount;
    const totalPages = totalProductsCount ? Math.ceil(totalProductsCount / productsPerPage) : 0;

    const handleSortByChange = useCallback((value: string) => {
        setSortBy(value);
        setCurrentPage(1);
    }, []);

    const handleItemsPerPageChange = useCallback((value: string) => {
        setProductsPerPage(Number(value));
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const clearFilters = useCallback(() => {
        router.push('/products'); // Navigate back to the base products page to clear query
        setSortBy(sortOptions[0].value);
        setCurrentPage(1);
        setProductsPerPage(12);
    }, [router]);

    // Dummy quantity state (replace with your actual cart logic)
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    const handleQuantityChange = useCallback((productId: string, value: number) => {
        setQuantities((prev) => ({ ...prev, [productId]: value }));
    }, []);

    const handleAddToCart = useCallback((e: React.MouseEvent, product: Product, quantity: number) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Add item to cart
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.imageUrl,
      },
      quantity,
    )
        
        console.log(`Added ${quantity} of ${product.name} (ID: ${product.id}) to cart`);
        // Implement your cart logic here
    }, []);

    useEffect(() => {
        refetch({
            field: sortField,
            direction: sortDirection,
            skip: (currentPage - 1) * productsPerPage,
            take: productsPerPage,
            query: searchQuery || undefined,
            category: categoryQuery || undefined,
        });
    }, [sortBy, currentPage, productsPerPage, searchQuery, categoryQuery, refetch, sortField, sortDirection]);

    if (loading) return (
        <div>
            <Navbar />
            <div className="container py-24 min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold mb-4">{searchQuery || categoryQuery ? `Searching...` : "Loading Products..."}</h1>
                    {searchQuery && <p className="text-muted-foreground">for "{searchQuery}"</p>}
                    {categoryQuery && <p className="text-muted-foreground">in category "{categoryQuery}"</p>}
                </div>
            </div>
            <Footer />
        </div>
    );
    if (error) return (
        <div>
            <Navbar />
            <div className="container py-24 min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold mb-4">Error Loading Products</h1>
                    <p className="text-red-500">{error.message}</p>
                </div>
            </div>
            <Footer />
        </div>
    );

    return (
        <div>
            <Navbar />
            <div className="min-h-screen bg-background">
                <div className="container py-24">
                    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                {searchQuery ? `Search Results for "${searchQuery}"` : categoryQuery ? `Products in "${categoryQuery.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}"` : "All Products"}
                            </h1>
                            {(searchQuery || categoryQuery) && filteredProducts?.length === 0 && (
                                <p className="mt-2 text-muted-foreground">No products found matching your criteria.</p>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
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
                            {(searchQuery || categoryQuery) && (
                                <Button onClick={clearFilters} variant="outline" size="sm">
                                    Clear Filters
                                </Button>
                            )}
                        </div>
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
                        />
                    )}

                    {/* Pagination */}
                    {totalProductsCount !== undefined && totalProductsCount > productsPerPage && (
                        <Pagination className="mt-8">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage > 1) handlePageChange(currentPage - 1);
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
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(pageNum as number);
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
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (currentPage < totalPages) handlePageChange(currentPage + 1);
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