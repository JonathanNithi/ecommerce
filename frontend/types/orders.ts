export interface OrderedProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number
    imageUrl: string;
  }

export interface Order {
    id: string;
    createdAt: string;
    totalPrice: number;
    products: OrderedProduct[];
  }