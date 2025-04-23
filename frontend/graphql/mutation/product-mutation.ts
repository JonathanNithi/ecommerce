// @/graphql/mutation/product-mutation.ts

import { gql } from 'graphql-tag';

export const UPDATE_STOCK_MUTATION = gql`
  mutation UpdateStock($input: UpdateProductStockInput!) {
    updateStock(input: $input) {
      product {
        name
        stock
      }
    }
  }
`;