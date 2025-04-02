import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface CategoryDropdownProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
}

const CategoryDropdown = ({ selectedCategory, setSelectedCategory, categories }: CategoryDropdownProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild className="w-full md:w-56">
      <Button
        variant="outline"
        className="md:w-auto w-full md:rounded-r-none focus:outline-none focus:ring-0 focus:border-input hover:border-input"
      >
        {selectedCategory}
        <ChevronDown className="ml-2 h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-full md:w-56">
      <DropdownMenuLabel>Product Categories</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <div className="max-h-[200px] overflow-y-auto">
        {categories.map((category) => (
          <DropdownMenuItem key={category} onClick={() => setSelectedCategory(category)}>
            {category}
          </DropdownMenuItem>
        ))}
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default CategoryDropdown;
