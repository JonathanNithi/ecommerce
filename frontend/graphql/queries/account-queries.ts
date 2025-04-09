// account-queries.ts

import { gql } from '@apollo/client';
import { OrderedProduct } from '@/types/orders';
import { Order } from '@/types/orders'; 

export const GET_ACCOUNT_DETAILS = gql`
  query GetAccountDetails($id: String, $refreshToken: String!, $accessToken: String!) {
    accounts(id: $id, refreshToken: $refreshToken, accessToken: $accessToken) {
      first_name
      last_name
      email
      orders {
        id
        createdAt
        totalPrice
        products {
          name
          quantity
          price
          imageUrl
        }
      }
    }
  }
`;

// Define the TypeScript interface for the account details response
export interface AccountDetailsResponse {
  accounts: {
    first_name: string;
    last_name: string;
    email: string;
    orders: {
      id: string;
      createdAt: string;
      totalPrice: number;
      products: {
        name: string;
        quantity: number;
        price: number;
        imageUrl: string;
        __typename?: 'OrderedProduct';
      }[];
      __typename?: 'Order';
    }[];
    __typename?: 'Account';
  }[];
}

// Define the TypeScript interface for the variables required by the query
export interface AccountDetailsVars {
  id: string;
  refreshToken: string;
  accessToken: string;
}