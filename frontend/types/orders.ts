export interface OrderedProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number
  }

export interface Order {
    id: string;
    createdAt: string;
    totalPrice: number;
    products: OrderedProduct[];
  }