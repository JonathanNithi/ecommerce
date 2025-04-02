import { ShoppingBag } from "lucide-react";

const CartIcon = () => (
  <div className="relative px-2 py-1.5">
    <ShoppingBag className="h-5 w-5" />
    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">0</span>
  </div>
);

export default CartIcon;
