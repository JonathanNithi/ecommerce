// utils/check-stock.ts
import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { Product } from '@/types/products'; // Import the Product type
import { CartItem } from '@/context/cart-context';

const GET_PRODUCTS_BY_IDS_FOR_STOCK = gql`
  query GetProductsByIdsForStock($ids: [String!]!) {
    productsById(id: $ids) {
      id
      stock
      name
    }
  }
`;

interface ProductStockData {
  id: string;
  stock: number;
  name?: string;
}

interface StockCheckResult {
    orderSuccessful: boolean;
    orderFailed: boolean;
    insufficientStock: { id: string; name?: string; requested: number; available: number }[];
    error: boolean;
}

export const checkStockAndProceed = async (
  client: ApolloClient<NormalizedCacheObject>,
  items: CartItem[],
  createOrderMutation: (options: any) => Promise<any>,
  orderInput: any, // Replace 'any' with your actual OrderInput type
  setLastOrder: (order: { id: string }) => void,
  clearCart: () => void,
  router: any, // Replace 'any' with your useRouter type
  productsData: Product[] | undefined | null
): Promise<StockCheckResult> => {
  const stockCheckFailed: { id: string; name?: string; requested: number; available: number }[] = [];

  if (!productsData) {
    return {
      orderSuccessful: false,
      orderFailed: false,
      insufficientStock: [],
      error: true,
    };
  }

  for (const cartItem of items) {
    const productData = productsData.find((p) => p?.id === cartItem.id);
    if (productData) {
      const remainingStock = productData.stock - cartItem.quantity;
      if (remainingStock < 0) {
        stockCheckFailed.push({
          id: cartItem.id,
          name: productData.name,
          requested: cartItem.quantity,
          available: productData.stock,
        });
      }
    } else {
      console.error(`Product with ID ${cartItem.id} not found in fetched data.`);
      return {
        orderSuccessful: false,
        orderFailed: false,
        insufficientStock: [],
        error: true,
      };
    }
  }

  if (stockCheckFailed.length > 0) {
    console.error("Stock check failed for some products:", stockCheckFailed);
    return {
      orderSuccessful: false,
      orderFailed: false,
      insufficientStock: stockCheckFailed,
      error: false,
    };
  }

  try {
    const orderResponse = await createOrderMutation({ variables: { order: orderInput } });

    if (orderResponse?.data?.createOrder?.id) {
      setLastOrder({ id: orderResponse.data.createOrder.id });
      clearCart();
      router.push("/checkout/success");
      return {
        orderSuccessful: true,
        orderFailed: false,
        insufficientStock: [],
        error: false,
      };
    } else {
      console.error("Failed to create order:", orderResponse?.errors || orderResponse?.data);
      return {
        orderSuccessful: false,
        orderFailed: true,
        insufficientStock: [],
        error: false,
      };
    }
  } catch (error) {
    console.error("Error during order creation:", error);
    return {
      orderSuccessful: false,
      orderFailed: false,
      insufficientStock: [],
      error: true,
    };
  }
};