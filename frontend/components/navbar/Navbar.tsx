// components/navbar/Navbar.tsx
import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { ThemeToggle } from "@/components/theme-toggle";
import CategoryDropdown from './category-dropdown';
import SearchInput from './search-input'; // Make sure the path is correct
import CartIcon from './cart-icon';
import UserMenu from './user-menu';
import { Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

const Navbar: React.FC = () => {
    const { theme } = useTheme();
    const router = useRouter();

    // User-friendly category names for the UI
    const uiCategories = [
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

    // Mapping of UI category name to backend slug
    const categorySlugMap: Record<string, string> = {
        "All Categories": "", 
        "Auto Care": "auto_care",
        "Baby Products": "baby_products",
        "Bakery": "bakery",
        "Beverages": "beverages",
        "Cooking essentials": "cooking_essentials",
        "Dairy": "dairy",
        "Desserts Ingredients": "desserts_ingredients",
        "Fashion": "fashion",
        "Food cupboard": "food_cupboard",
        "Frozen Food": "frozen_food",
        "Fruits": "fruits",
        "Gifting": "gifting",
        "Health Beauty": "health_beauty",
        "Household": "household",
        "Meats": "meats",
        "Party Shop": "party_shop",
        "Pet Products": "pet_products",
        "Rice": "rice",
        "Seafood": "seafood",
        "Seeds Spices": "seeds_spices",
        "Snacks Confectionery": "snacks_confectionery",
        "Stationary": "stationary",
        "Tea Coffee": "tea_coffee",
        "Vegetables": "vegetables",
    };

    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [selectedCategoryUI, setSelectedCategoryUI] = useState(uiCategories[0]);

    const toggleSignIn = () => {
        setIsSignedIn(!isSignedIn);
    };

    const handleCategoryChange = useCallback((categoryUI: string) => {
        setSelectedCategoryUI(categoryUI);
    }, []);

    const getBackendCategorySlug = useCallback((categoryUI: string): string | undefined => {
        return categorySlugMap[categoryUI];
    }, [categorySlugMap]);

    const handleSearch = useCallback((query: string) => {
        const backendCategorySlug = getBackendCategorySlug(selectedCategoryUI);
        let url = `/products?query=${encodeURIComponent(query)}`;

        if (backendCategorySlug && backendCategorySlug !== "all_categories") { // Adjust "all_categories" if needed
            url += `&category=${encodeURIComponent(backendCategorySlug)}`;
        } else if (!query.trim() && backendCategorySlug && backendCategorySlug !== "all_categories") {
            url = `/products?category=${encodeURIComponent(backendCategorySlug)}`;
        }

        if (query.trim() || (backendCategorySlug && backendCategorySlug !== "all_categories")) {
            router.push(url);
        }
    }, [router, getBackendCategorySlug, selectedCategoryUI]);

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
                            selectedCategory={selectedCategoryUI}
                            setSelectedCategory={handleCategoryChange}
                            categories={uiCategories}
                        />
                        <SearchInput onSearch={handleSearch} /> {/* Pass the handleSearch function */}
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
                        selectedCategory={selectedCategoryUI}
                        setSelectedCategory={handleCategoryChange}
                        categories={uiCategories}
                    />
                    <SearchInput onSearch={handleSearch} /> {/* Pass the handleSearch function here too */}
                </div>}
            </header>
        </div>
    );
};

export default Navbar;