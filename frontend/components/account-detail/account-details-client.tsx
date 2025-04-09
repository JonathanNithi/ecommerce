"use client";

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ACCOUNT_DETAILS, AccountDetailsResponse, AccountDetailsVars } from '@/graphql/queries/account-queries';
import { useAuth } from '@/context/auth-context';
import { useApolloClient } from "@/context/apollo-client-context";
import { useRouter } from 'next/navigation';
import { User, Package, ShoppingBag, Calendar, ChevronRight, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { formatDate } from '@/lib/format-date'; // Assuming you have a utility function for date formatting
import { accountDetails } from "@/types/accounts"; // Import the accountDetails type
import { Order } from "@/types/orders"; // Import the Order type

const AccountDetailsClient = () => {
    const { accountId, accessToken, refreshToken, isAuthenticated } = useAuth();
    const client = useApolloClient();
    const router = useRouter();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // Use the Order type
    const [viewingOrderDetails, setViewingOrderDetails] = useState(false);

    if (!isAuthenticated || !accountId || !accessToken || !refreshToken) {
        return (
            <div>
                <Navbar />
                <div className="container py-24 min-h-screen">
                    <p>Authentication data loading or missing...</p>
                </div>
                <Footer />
            </div>
        );
    }

    // Adjust the useQuery type to use your defined accountDetails interface
    const { loading, error, data } = useQuery<{ accounts: accountDetails[] }, AccountDetailsVars>(
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

    if (!data?.accounts || data.accounts.length === 0) {
        return (
            <div>
                <Navbar />
                <div className="container py-24 min-h-screen">
                    <p>No account details found.</p>
                </div>
                <Footer />
            </div>
        );
    }

    const accountDetailsData = data.accounts[0]; // Now 'accountDetailsData' is of type 'accountDetails'
    const orderHistory = accountDetailsData.orders || []; // 'orderHistory' is of type 'Order[]'


    // View order details
    const viewOrderDetails = (order: Order) => { // Use the Order type here
        setSelectedOrder(order);
        setViewingOrderDetails(true);
    };

    // Back to orders list
    const backToOrders = () => {
        setViewingOrderDetails(false);
        setSelectedOrder(null);
    };

    return (
        <div>
            <div className="container py-24 min-h-screen">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">My Account</h1>
                            <p className="text-muted-foreground">Manage your account details and view your order history</p>
                        </div>
                        <Button variant="outline" onClick={() => router.push("/")}>
                            Continue Shopping
                        </Button>
                    </div>

                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full md:w-auto grid-cols-2">
                            <TabsTrigger value="profile" className="flex items-center gap-2">
                                <User size={16} />
                                <span>Profile</span>
                            </TabsTrigger>
                            <TabsTrigger value="orders" className="flex items-center gap-2">
                                <Package size={16} />
                                <span>Orders</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Profile Tab */}
                        <TabsContent value="profile" className="mt-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Personal Information</CardTitle>
                                        <CardDescription>Your personal details</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid gap-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {accountDetailsData.first_name && (
                                            <div className="space-y-4">
                                                <div>
                                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">First Name</h3>
                                                    <p className="font-medium">{accountDetailsData.first_name}</p>
                                                </div>
                                            </div>
                                        )}
                                        {accountDetailsData.last_name && (
                                            <div className="space-y-4">
                                                <div>
                                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Last Name</h3>
                                                    <p className="font-medium">{accountDetailsData.last_name}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        {accountDetailsData.email && (
                                            <div>
                                                <h3 className="text-sm font-medium text-muted-foreground mb-2">Email Address</h3>
                                                <p className="font-medium">{accountDetailsData.email}</p>
                                            </div>
                                        )}
                                        {/* You might want to display a "Member Since" based on account creation if available */}
                                    </div>
                                    {/* <div className="border-t pt-6">
                                        <h3 className="font-medium mb-4">Account Actions</h3>
                                        <div className="flex flex-wrap gap-3">
                                            <Button variant="outline" size="sm">
                                                Change Password
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                Update Email
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                Delete Account
                                            </Button>
                                        </div>
                                    </div> */}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Orders Tab */}
                        <TabsContent value="orders" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <CardTitle>Order History</CardTitle>
                                            <CardDescription>View your recent orders</CardDescription>
                                        </div>
                                        {viewingOrderDetails && (
                                            <Button variant="outline" size="sm" onClick={backToOrders}>
                                                Back to All Orders
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {viewingOrderDetails && selectedOrder ? (
                                        <div className="space-y-6">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
                                                <div>
                                                    <h3 className="font-medium text-lg">{selectedOrder.id}</h3>
                                                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar size={14} />
                                                            <span>{formatDate(selectedOrder.createdAt)}</span>
                                                        </div>
                                                        {/* You might have a status field in your Order type */}
                                                        {/* {selectedOrder.status && (
                                                            <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge>
                                                        )} */}
                                                    </div>
                                                </div>
                                                {typeof selectedOrder.totalPrice === 'number' && (
                                                    <div className="text-right">
                                                        <p className="text-sm text-muted-foreground">Order Total</p>
                                                        <p className="font-medium text-lg">Rs. {selectedOrder.totalPrice}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="font-medium mb-4">Order Items</h3>
                                                <div className="space-y-4">
                                                    {selectedOrder.products && selectedOrder.products.map((item) => (
                                                        <div key={item.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                                                            {/* You might have an imageUrl in your OrderedProduct type */}
                                                            <div className="w-20 h-20 bg-blue-50 rounded-md overflow-hidden flex-shrink-0">
                                                                <img
                                                                    src={"/placeholder.svg"} // Replace with actual image URL if available
                                                                    alt={item.name || "Product Image"}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-grow">
                                                                <h4 className="font-medium">{item.name}</h4>
                                                                <div className="flex justify-between mt-1">
                                                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                                    <p className="font-medium">Rs. {item.price}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {typeof selectedOrder.totalPrice === 'number' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                                    <div></div> {/* Empty div for spacing */}
                                                    <div>
                                                        <h3 className="font-medium mb-3">Order Summary</h3>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Subtotal</span>
                                                                <span>Rs. {selectedOrder.totalPrice}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Shipping</span>
                                                                <span>Free</span> {/* You might need to fetch shipping cost */}
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">Tax</span>
                                                                <span>Included</span> {/* You might need to fetch tax amount */}
                                                            </div>
                                                            <div className="flex justify-between font-medium pt-2 border-t">
                                                                <span>Total</span>
                                                                <span>Rs. {selectedOrder.totalPrice}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {orderHistory.length > 0 ? (
                                                orderHistory.map((order) => (
                                                    <div
                                                        key={order.id}
                                                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                                        onClick={() => viewOrderDetails(order)}
                                                    >
                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                                                                <ShoppingBag size={18} />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-medium">{order.id}</h3>
                                                                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                                                    <div className="flex items-center gap-1">
                                                                        <Calendar size={14} />
                                                                        <span>{formatDate(order.createdAt)}</span>
                                                                    </div>
                                                                    {/* {order.status && (
                                                                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                                                                    )} */}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {typeof order.totalPrice === 'number' && (
                                                            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                                                                <div className="sm:text-right">
                                                                    <p className="text-sm text-muted-foreground">Total</p>
                                                                    <p className="font-medium">Rs. {order.totalPrice}</p>
                                                                </div>
                                                                <ChevronRight size={18} className="text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-12">
                                                    <Package size={48} className="mx-auto text-muted-foreground mb-4" />
                                                    <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                                                    <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
                                                    <Button onClick={() => router.push("/products")}>Start Shopping</Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default AccountDetailsClient;