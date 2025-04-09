// lib/apollo-client-context.tsx
"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { createApolloClient } from '@/lib/create-apollo-client'; // Your client creation function

interface ApolloClientContextType {
    client: ApolloClient<any> | null;
}

const ApolloClientContext = createContext<ApolloClientContextType>({ client: null });

export const ApolloClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [client] = useState<ApolloClient<any> | null>(createApolloClient());

    return (
        <ApolloClientContext.Provider value={{ client }}>
            <ApolloProvider client={client!}> {/* Ensure client is not null */}
                {children}
            </ApolloProvider>
        </ApolloClientContext.Provider>
    );
};

export const useApolloClient = (): ApolloClient<any> => {
    const context = useContext(ApolloClientContext);
    if (!context?.client) {
        throw new Error('useApolloClient must be used within an ApolloClientProvider');
    }
    return context.client;
};