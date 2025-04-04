// src/graphql/queries/productQueries.ts
import { gql, ApolloClient, InMemoryCache, useQuery } from "@apollo/client";
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

// Function to create the Apollo Client instance
export function createApolloClient() {
  return new ApolloClient({
    uri: "http://localhost:8000/graphql",
    cache: new InMemoryCache(),
  });
}

// Custom hook to use the GET_PRODUCTS query
export function useGetProducts() {
  return useQuery(GET_PRODUCTS);
}