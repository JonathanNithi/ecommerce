// src/graphql/queries/productQueries.ts
import { gql, useQuery } from "@apollo/client";
import { useMemo } from "react";

export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      price
      category
      imageUrl
      availability
      stock
      description
    }
  }
`;

// Custom hook to use the GET_PRODUCTS query
export function useGetProducts() {
  return useQuery(GET_PRODUCTS);
}