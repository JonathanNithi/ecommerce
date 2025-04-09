"use client";
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

const ProductCard = () => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrease = () => setQuantity((prev) => prev + 1);
  const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const handleChange = (e: { target: { value: string; }; }) => {
    const value = parseInt(e.target.value, 10);
    setQuantity(value >= 1 ? value : 1);
  };

  return (
    <Card className="p-2 sm:p-4 rounded-2xl shadow-lg border border-gray-300/50 w-48 sm:w-60"> {/* Adjusted width and padding for responsiveness */}
      <div className="relative mt-2 sm:mt-4">
        <Image
          src="/images/images_auto_care/Aer_Air_Freshner_Gel_Cool_-_9.00_ml.jpg"
          alt="Product"
          width={100} // Reduced image size
          height={100} // Reduced image size
          className="mx-auto"
        />
      </div>
      <CardContent className="mt-2 sm:mt-4 text-center">
        <p className="text-gray-400 text-xs sm:text-xs">Fresh Seafood</p> {/* Font size remains same or adjust as needed */}
        <h3 className="text-sm sm:text-lg font-bold">All Natural Style Chicken Meatballs</h3> {/* Reduced heading font size */}
        <p className="text-blue-600 font-bold mt-1 text-sm">Rs. 160.00</p> {/* Reduced price font size */}
        <div className="flex items-center mt-2">
          <input
            type="number"
            value={quantity}
            onChange={handleChange}
            className="w-16 sm:w-24 text-center border border-gray-300 rounded-md outline-none p-1 sm:p-2 text-sm" // reduced input width and font size
          />
          <div className="ml-2 sm:ml-3">
            <button className="bg-blue-500 text-white p-2 rounded-full"> {/* Reduced button padding */}
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" /> {/* Reduced icon size */}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;