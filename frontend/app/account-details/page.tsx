"use client";

import React, { useEffect, useState } from 'react'; // Import useState
import { useQuery } from '@apollo/client';
import { GET_ACCOUNT_DETAILS, AccountDetailsResponse, AccountDetailsVars } from '@/graphql/queries/account-queries';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import { useRouter } from 'next/navigation';

const AccountPage = () => {
    const { accountId, accessToken, refreshToken, isAuthenticated } = useAuth();
    const router = useRouter();

    if (!isAuthenticated) {
        router.push('/signin');
    }

    // Only call useQuery on the client-side when authenticated
    const { loading, error, data } = useQuery<AccountDetailsResponse, AccountDetailsVars>(
        GET_ACCOUNT_DETAILS,
        {
            variables: {
                id: accountId!,
                refreshToken: refreshToken!,
                accessToken: accessToken!,
            },
        }
    );

    console.log('Account Details:', data);
    console.log('Loading:', loading);
    console.log('Error:', error);
    return (
        <div>
            <Navbar />
            <div className="container py-24 min-h-screen">
                <h1 className="text-3xl font-bold mb-8">Your Account</h1>
                
            </div>
            <Footer />
        </div>
    );
};

export default AccountPage;