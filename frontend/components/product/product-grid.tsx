// components/products-grid.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/products"; // Adjust the import path as necessary

interface ProductGridProps {
  products: Product[];
  quantities: Record<string, number>;
  handleQuantityChange: (productId: string, value: number) => void;
  handleAddToCart: (e: React.MouseEvent, product: Product) => void;
  clearFilters?: () => void; // Optional clear filters function
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  quantities,
  handleQuantityChange,
  handleAddToCart,
  clearFilters,
}) => {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-medium">No products found</h3>
        <p className="mt-2 text-muted-foreground">
          Try adjusting your search or filter criteria
        </p>
        {clearFilters && (
          <Button variant="outline" className="mt-4" onClick={clearFilters}>
            Clear all filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <div key={product.id} className="relative group">
          <Link href={`/products/${product.id}`} className="block">
            <Card className="overflow-hidden transition-all hover:shadow-md h-full">
              <div className="aspect-square bg-blue-50">
                <img
                  src={product.imageUrl || "/placeholder.svg"}
                  alt={product.name}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium">{product.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Rs. {product.price}</p>

                {/* Add to Cart Section */}
                <div
                  className="mt-4 flex items-center gap-2"
                  onClick={(e) => e.preventDefault()} // Prevent navigation when interacting with these elements
                >
                  <div className="flex items-center border rounded-md">
                    <input
                      type="number"
                      min="1"
                      value={quantities?.[product.id] || 1}
                      onChange={(e) =>
                        handleQuantityChange(
                          product.id,
                          Number.parseInt(e.target.value) || 1
                        )
                      }
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
  );
};

export default ProductGrid;