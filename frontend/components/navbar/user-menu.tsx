import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import Link from "next/link";

interface UserMenuProps {
  isSignedIn: boolean;
  toggleSignIn: () => void;
}

const UserMenu = ({ isSignedIn, toggleSignIn }: UserMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <User className="h-5 w-5" />
        <span className="sr-only">User menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      {isSignedIn ? (
        <>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem><Link href="/profile" className="flex w-full">Profile</Link></DropdownMenuItem>
          <DropdownMenuItem><Link href="/orders" className="flex w-full">Orders</Link></DropdownMenuItem>
          <DropdownMenuItem><Link href="/wishlist" className="flex w-full">Wishlist</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={toggleSignIn}>Sign Out</DropdownMenuItem>
        </>
      ) : (
        <>
          <DropdownMenuItem><Link href="/signin" className="flex w-full" onClick={toggleSignIn}>Sign In</Link></DropdownMenuItem>
          <DropdownMenuItem><Link href="/signup" className="flex w-full">Sign Up</Link></DropdownMenuItem>
        </>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);

export default UserMenu;
