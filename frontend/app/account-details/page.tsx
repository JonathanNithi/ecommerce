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
    const [isClient, setIsClient] = useState(false); // Track if we are on the client

    useEffect(() => {
        setIsClient(true); // Set to true after the component mounts on the client
    }, []);

    useEffect(() => {
        if (!isClient) return; // Don't redirect during server-side rendering

        if ( !isAuthenticated) {
            router.push('/signin');
        }
    }, [isAuthenticated, router, isClient]);

    if (!isClient  || !isAuthenticated) {
        // Render a minimal loading state or nothing during server-side and initial client-side load
        return (
            <div>
                <Navbar />
                <div className="container py-24 min-h-screen">
                    <p>{isClient ? (isAuthenticated ? "Checking authentication..." : "Not logged in.") : "Loading..."}</p>
                </div>
                <Footer />
            </div>
        );
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
            skip: !accountId || !accessToken || !refreshToken,
        }
    );

    // ... (rest of your rendering logic for loading, error, and data) ...

    return (
        <div>
            <Navbar />
            <div className="container py-24 min-h-screen">
                <h1 className="text-3xl font-bold mb-8">Your Account</h1>
                {/* ... (rest of your UI) ... */}
            </div>
            <Footer />
        </div>
    );
};

export default AccountPage;