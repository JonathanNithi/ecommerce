// account-queries.ts

import { gql } from '@apollo/client';

export const GET_ACCOUNT_DETAILS = gql`
  query GetAccountDetails($id: ID!, $refreshToken: String!, $accessToken: String!) {
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
      }[];
    }[];
  } | null; 
}

// Define the TypeScript interface for the variables required by the query
export interface AccountDetailsVars {
  id: string;
  refreshToken: string;
  accessToken: string;
}