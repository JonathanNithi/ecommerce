// components/navbar/search-input.tsx
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useCallback } from "react";

interface SearchInputProps {
    placeholder?: string;
    onSearch: (query: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ placeholder = "Search for products...", onSearch }) => {
    const [inputValue, setInputValue] = useState("");

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    }, []);

    const handleSearchClick = useCallback(() => {
        onSearch(inputValue.trim());
    }, [inputValue, onSearch]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    }, [handleSearchClick]);

    return (
        <div className="relative w-full md:flex-1 mt-2 md:mt-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder={placeholder}
                className="w-full pl-8 md:rounded-l-none border border-input focus:outline-none focus:ring-0 focus:border-primary focus:border-[2px] focus:pl-7 focus:pr-7"
                style={{ boxShadow: "none" }}
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
            />
            <Button
                variant="default"
                className="w-full block md:hidden py-2 mt-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md"
                onClick={handleSearchClick}
            >
                Search Now
            </Button>
        </div>
    );
};

export default SearchInput;