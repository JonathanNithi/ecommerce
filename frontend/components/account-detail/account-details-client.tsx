// app/account-details/AccountDetailsClient.tsx
"use client";

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ACCOUNT_DETAILS, AccountDetailsResponse, AccountDetailsVars } from '@/graphql/queries/account-queries';
import { useAuth } from '@/context/auth-context';
import { createApolloClient } from '@/lib/create-apollo-client';
import { useApolloClient } from "@/context/apollo-client-context";

const AccountDetailsClient = () => {
    const { accountId, accessToken, refreshToken, isAuthenticated } = useAuth();
    const client = useApolloClient();

    if (!isAuthenticated || !accountId || !accessToken || !refreshToken) {
        return <p>Authentication data loading or missing...</p>;
    }

    const { loading, error, data } = useQuery<AccountDetailsResponse, AccountDetailsVars>(
        GET_ACCOUNT_DETAILS,
        {
            client,
            variables: {
                id: accountId,
                refreshToken: refreshToken,
                accessToken: accessToken,
            },
            skip: !isAuthenticated || !accountId || !accessToken || !refreshToken,
            fetchPolicy: 'cache-and-network',
        }
    );

    console.log('AccountDetailsClient - Data:', data);
    console.log('AccountDetailsClient - Loading:', loading);
    console.log('AccountDetailsClient - Error:', error);

    if (loading) {
        return <p>Loading account details...</p>;
    }

    if (error) {
        return <p>Error fetching account details: {error.message}</p>;
    }

    if (data?.accounts && data.accounts.length > 0) {
        const accountDetails = data.accounts[0];
        return (
            <div>
                <p>First Name: {accountDetails.first_name}</p>
                <p>Last Name: {accountDetails.last_name}</p>
                <p>Email: {accountDetails.email}</p>
                {accountDetails.orders && accountDetails.orders.map(order => (
                    <div key={order.id} className="mb-4 border p-4">
                        <p>Order ID: {order.id}</p>
                        <p>Created At: {new Date(order.createdAt).toLocaleDateString()}</p>
                        <p>Total Price: {order.totalPrice}</p>
                        {order.products && order.products.map(product => (
                            <div key={product.name} className="ml-4 border-t pt-2">
                                <p>Product Name: {product.name}</p>
                                <p>Quantity: {product.quantity}</p>
                                <p>Price: {product.price}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    return <p>No account details found.</p>;
};

export default AccountDetailsClient;