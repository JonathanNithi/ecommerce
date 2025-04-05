// account-mutation.ts
import { gql } from '@apollo/client';

export const CREATE_ACCOUNT_MUTATION = gql`
  mutation CreateAccount($account: AccountInput!) {
    createAccount(account: $account) {
      first_name
      last_name
      email
      role
      id
    }
  }
`;

// Define the input type for better type safety
export interface AccountInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

// Define the expected return type of the mutation
export interface CreateAccountPayload {
  createAccount: {
    first_name: string;
    last_name: string;
    email: string;
    role: string; // Assuming 'role' is a string
    id: string;
  };
}