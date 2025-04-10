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

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      account {
        id
        role
      }
      refreshToken
      accessToken
    }
  }
`;

// Define the input type for creating an account
export interface AccountInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

// Define the expected return type of the createAccount mutation
export interface CreateAccountPayload {
  createAccount: {
    first_name: string;
    last_name: string;
    email: string;
    role: string; // Assuming 'role' is a string
    id: string;
  };
}

// Define the input type for the login mutation
export interface LoginInput {
  email: string;
  password: string;
}

// Define the expected return type of the login mutation
export interface LoginPayload {
  login: {
    account: {
      id: string;
    };
    refreshToken: string;
    accessToken: string;
  };
}