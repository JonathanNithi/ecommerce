import React from 'react';
import Link from 'next/link';
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import CategoryDropdown from './category-dropdown';
import SearchInput from './search-input';
import CartIcon from './cart-icon';
import UserMenu from './user-menu';
import { Menu } from 'lucide-react';


const Navbar: React.FC = () => {
    
    // Dropdown menu items
    const categories = [
        "All Categories",
        "Furniture",
        "Lighting",
        "Decor",
        "Kitchen",
        "Textiles",
        "Storage",
        "Bathroom",
        "Outdoor",
        "Office",
        "Electronics",
        "Appliances",
        "Rugs",
        "Mirrors",
        "Art",
        "Plants",
        "Kids",
        "Pets",
        "Seasonal",
        "Sale",
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
                        <Link href="/" className="mr-6 text-xl font-bold text-blue-600">
                            E-Market
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
                        <UserMenu isSignedIn={isSignedIn} toggleSignIn={toggleSignIn} />
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