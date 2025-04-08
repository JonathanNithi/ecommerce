import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/cart-context";

const CartIcon = () => {
  const { itemCount } = useCart();

  return (
    <div>
      <Link href="/cart" className="relative">
        <ShoppingBag className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
            {itemCount}
          </span>
        )}
      </Link>
    </div>
  );
};

export default CartIcon;
