// src/graphql/queries/productQueries.ts
import { gql, useQuery } from "@apollo/client";
import { useMemo } from "react";

export const GET_PRODUCTS_PRODUCT_PAGE = gql`
  query GetProducts($field: ProductSortField, $direction: SortDirection, $skip: Int, $take: Int) {
    products(sort: { field: $field, direction: $direction }, pagination: { skip: $skip, take: $take }) {
      totalCount
      items {
        name
        price
        availability
        imageUrl
        id
      }
    }
  }
`;

// Define the enum types if they are not already defined elsewhere in your codebase
// These should match your GraphQL schema definitions
export enum ProductSortField {
  NAME = 'NAME',
  PRICE = 'PRICE',
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

// Custom hook to use the GET_PRODUCTS query
export function useGetProductsProductPage() {
  return useQuery(GET_PRODUCTS_PRODUCT_PAGE);
}