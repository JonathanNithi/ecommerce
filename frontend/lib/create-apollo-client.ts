import { ApolloClient, InMemoryCache } from "@apollo/client";

// Function to create the Apollo Client instance
export function createApolloClient() {
  return new ApolloClient({
    uri: "http://localhost:8000/graphql",
    cache: new InMemoryCache(),
  });
}
