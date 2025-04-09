// lib/graphql/order-mutation.ts
import { gql } from "@apollo/client";

// GraphQL mutation to create an order
export const CREATE_ORDER_MUTATION = gql`
  mutation CreateOrder($order: OrderInput!) {
    createOrder(order: $order) {
      id
      totalPrice
      products {
        name
        quantity
      }
    }
  }
`;

export interface OrderInput {
  account_id: string;
  accessToken: string;
  refreshToken: string;
  products: { product_id: string; quantity: number }[];
}