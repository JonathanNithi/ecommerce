import React from 'react';
import Link from 'next/link';
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import CategoryDropdown from './category-dropdown';
import SearchInput from './search-input';
import CartIcon from './cart-icon';
import UserMenu from './user-menu';
import { Menu } from 'lucide-react';
import { useTheme } from 'next-themes'; // Import the useTheme hook

const Navbar: React.FC = () => {
    const { theme } = useTheme(); // Get the current theme

    // Dropdown menu items
    const categories = [
        "All Categories",
        "Auto Care",
        "Baby Products",
        "Bakery",
        "Beverages",
        "Cooking essentials",
        "Dairy",
        "Desserts Ingredients",
        "Fashion",
        "Food cupboard",
        "Frozen Food",
        "Fruits",
        "Gifting",
        "Health Beauty",
        "Household",
        "Meats",
        "Party Shop",
        "Pet Products",
        "Rice",
        "Seafood",
        "Seeds Spices",
        "Snacks Confectionery",
        "Stationary",
        "Tea Coffee",
        "Vegetables",
    ];

    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(categories[0]);

    // Toggle sign in status for demo purposes
    const toggleSignIn = () => {
        setIsSignedIn(!isSignedIn);
    };
    return (
        <div>
            <header className="z-50 border-b bg-background fixed top-0 left-0 w-full shadow-md">
                <div className=" z-50 shadow w-full px-2 md:px-4 flex h-16 items-center justify-between bg-background">
                    <div>
                        <Link href="/" className="mr-8 text-xl font-bold text-blue-600">
                            E-Market
                        </Link>
                        <Link href="/products" className="text-sm font-semibold transition-colors duration-300 ease-in-out" style={{ color: theme === 'dark' ? 'white' : 'black' }}>
                            Products
                        </Link>
                    </div>
                    <div className="flex items-center flex-1 lg:flex-initial hidden md:flex lg:w-[500px] xl:w-[600px] 2xl:w-[800px]">
                        <CategoryDropdown
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            categories={categories}
                        />
                        <SearchInput />
                    </div>
                    <div className="flex items-center space-x-5">
                        <CartIcon />
                        <ThemeToggle />
                        <UserMenu  />
                        <Menu className="h-6 w-6 cursor-pointer md:hidden" onClick={() => setIsSearchVisible(!isSearchVisible)} />
                    </div>
                </div>


                {isSearchVisible && <div className="md:hidden border-t p-4">
                    <CategoryDropdown
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        categories={categories}
                    />
                    <SearchInput />
                </div>}
            </header>
        </div>
    );
};

export default Navbar;