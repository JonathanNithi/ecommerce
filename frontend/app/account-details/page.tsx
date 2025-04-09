// app/account-details/page.tsx
"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const AccountDetailsClient = dynamic(() => import('../../components/account-detail/account-details-client'), {
    ssr: false,
    loading: () => <p>Loading account details component...</p>,
});

const AccountPage = () => {
    const { isAuthenticated, isAuthLoading } = useAuth(); // Get isAuthLoading
    const router = useRouter();

    console.log('AccountPage - isAuthenticated:', isAuthenticated, 'isAuthLoading:', isAuthLoading);

    useEffect(() => {
        if (!isAuthenticated && !isAuthLoading) { // Only redirect if not loading AND not authenticated
            console.log('AccountPage - Redirecting to /signin');
            router.push('/signin');
        } else {
            console.log('AccountPage - User is authenticated or loading');
        }
    }, [isAuthenticated, isAuthLoading, router]);

    // Show a loading state while authentication is being checked
    if (isAuthLoading) {
        return (
            <div>
                <Navbar />
                <div className="container py-24 min-h-screen">
                    <p>Checking authentication...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Or a redirecting message
    }

    return (
        <div>
            <Navbar />
            <div className="container py-24 min-h-screen">
                <h1 className="text-3xl font-bold mb-8">Your Account</h1>
                <AccountDetailsClient />
            </div>
            <Footer />
        </div>
    );
};

export default AccountPage;