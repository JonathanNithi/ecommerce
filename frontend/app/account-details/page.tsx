"use client";

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ACCOUNT_DETAILS, AccountDetailsResponse, AccountDetailsVars } from '@/graphql/queries/account-queries'; // Adjust the import path as needed
import { useAuth } from '@/lib/auth-context'; // Assuming you have an auth context
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import { useRouter } from 'next/navigation'; // Import useRouter for redirection


const AccountPage = () => {
    const { accountId, accessToken, refreshToken, isAuthenticated } = useAuth();
    const router = useRouter();
  
    // Redirect to signin if not authenticated
    if (!isAuthenticated) {
      router.push('/signin');
      return null; // Prevent rendering the rest of the page
    }
  
    const { loading, error, data } = useQuery<AccountDetailsResponse, AccountDetailsVars>(
      GET_ACCOUNT_DETAILS,
      {
        variables: {
          id: accountId!, // Use the accountId from your auth context
          refreshToken: refreshToken!, // Use the refreshToken from your auth context
          accessToken: accessToken!, // Use the accessToken from your auth context
        },
        skip: !accountId || !accessToken || !refreshToken, // Skip the query if auth data is missing
      }
    );
  
    if (loading) {
      return (
        <div>
          <Navbar />
          <div className="container py-24 min-h-screen">
            <p>Loading account details...</p>
          </div>
          <Footer />
        </div>
      );
    }
  
    if (error) {
      return (
        <div>
          <Navbar />
          <div className="container py-24 min-h-screen">
            <p>Error fetching account details: {error.message}</p>
          </div>
          <Footer />
        </div>
      );
    }
  
    if (!data?.accounts) {
      return (
        <div>
          <Navbar />
          <div className="container py-24 min-h-screen">
            <p>Account details not found.</p>
          </div>
          <Footer />
        </div>
      );
    }
  
    const account = data.accounts;
  
    return (
      <div>
        <Navbar />
        <div className="container py-24 min-h-screen">
          <h1 className="text-3xl font-bold mb-8">Your Account</h1>
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-medium mb-4">Account Information</h2>
            <p className="mb-2">
              <span className="font-semibold">First Name:</span> {account.first_name}
            </p>
            {/* Add other account details here if your query fetches them */}
          </div>
  
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-medium mb-4">Your Orders</h2>
            {account.orders.length > 0 ? (
              <ul className="divide-y">
                {account.orders.map(order => (
                  <li key={order.id} className="py-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">Order ID: {order.id}</h3>
                      <span className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-2">Total: Rs. {order.totalPrice.toFixed(2)}</p>
                    {order.products.length > 0 && (
                      <ul className="ml-4 text-sm text-muted-foreground">
                        <li className="mb-1 font-semibold">Products:</li>
                        {order.products.map(product => (
                          <li key={`${order.id}-${product.name}`}>
                            {product.name} x {product.quantity} @ Rs. {product.price.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>You haven't placed any orders yet.</p>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  };
  
  export default AccountPage;