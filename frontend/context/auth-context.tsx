// auth-context.tsx
"use client";

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation'; // Import from next/navigation

interface AuthContextType {
    isAuthenticated: boolean;
    accountId: string | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthLoading: boolean; // Add loading state
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [accountId, setAccountId] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true); // Initialize as loading
    const router = useRouter();

    const setAuthData = useCallback((accessToken: string, refreshToken: string, id: string) => {
        Cookies.set('accessToken', accessToken, { secure: true, sameSite: 'strict' });
        Cookies.set('refreshToken', refreshToken, { secure: true, sameSite: 'strict' });
        Cookies.set('accountId', id, { secure: true, sameSite: 'strict' });
        setIsAuthenticated(true);
        setAccountId(id);
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setIsAuthLoading(false); // Authentication is done
    }, []);

    const clearAuthData = useCallback(() => {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('accountId');
        setIsAuthenticated(false);
        setAccountId(null);
        setAccessToken(null);
        setRefreshToken(null);
        setIsAuthLoading(false); // Loading is done (no auth)
    }, []);

    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        setIsAuthLoading(true); // Start loading on login attempt
        try {
            const response = await fetch('http://localhost:8000/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `
                        mutation Login($email: String!, $password: String!) {
                            login(email: $email, password: $password) {
                                account_id {
                                    id
                                }
                                refreshToken
                                accessToken
                            }
                        }
                    `,
                    variables: { email, password },
                }),
            });

            const data = await response.json();

            if (data?.data?.login?.accessToken && data?.data?.login?.refreshToken && data?.data?.login?.account_id?.id) {
                setAuthData(
                    data.data.login.accessToken,
                    data.data.login.refreshToken,
                    data.data.login.account_id.id
                );
                router.push('/');
                return true;
            } else {
                console.error('Login failed:', data?.errors || data?.data?.login);
                setIsAuthLoading(false); // Login failed, loading done
                return false;
            }
        } catch (error) {
            console.error('Error during login:', error);
            setIsAuthLoading(false); // Error during login, loading done
            return false;
        }
    }, [setAuthData, router]);

    const logout = useCallback(async () => {
        setIsAuthLoading(true); // Start loading on logout
        clearAuthData();
        await router.push('/login');
        setIsAuthLoading(false); // Logout done
    }, [clearAuthData, router]);

    const refreshAccessToken = useCallback(async (): Promise<string | null> => {
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) {
            clearAuthData();
            setIsAuthLoading(false); // Loading done (no refresh needed)
            return null;
        }

        try {
            const response = await fetch('http://localhost:8000/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `
                        mutation RefreshToken($refreshToken: String!) {
                            refreshToken(refreshToken: $refreshToken) {
                                accessToken
                            }
                        }
                    `,
                    variables: { refreshToken },
                }),
            });

            const data = await response.json();

            if (data?.data?.refreshToken?.accessToken) {
                Cookies.set('accessToken', data.data.refreshToken.accessToken, { secure: true, sameSite: 'strict' });
                setAccessToken(data.data.refreshToken.accessToken);
                setIsAuthLoading(false); // Refresh successful, loading done
                return data.data.refreshToken.accessToken;
            } else {
                clearAuthData();
                setIsAuthLoading(false); // Refresh failed, loading done
                return null;
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            clearAuthData();
            setIsAuthLoading(false); // Error during refresh, loading done
            return null;
        }
    }, [clearAuthData]);

    useEffect(() => {
        const accessToken = Cookies.get('accessToken');
        const refreshToken = Cookies.get('refreshToken');
        const storedAccountId = Cookies.get('accountId');

        console.log('AuthContext - Checking cookies:', { accessToken, refreshToken, storedAccountId });

        if (accessToken && refreshToken && storedAccountId) {
            setIsAuthenticated(true);
            setAccountId(storedAccountId);
            setAccessToken(accessToken);
            setRefreshToken(refreshToken);
            setIsAuthLoading(false); // Authentication state loaded from cookies
            console.log('AuthContext - Authentication state after cookie check:', { isAuthenticated: true, accountId: storedAccountId, accessToken, refreshToken, isAuthLoading: false });
            // Optionally, you can trigger an initial token refresh here
            // refreshAccessToken();
        } else {
            setIsAuthenticated(false);
            setAccountId(null);
            setAccessToken(null);
            setRefreshToken(null);
            setIsAuthLoading(false); // No auth info in cookies, loading done
            console.log('AuthContext - No auth cookies found, state:', { isAuthenticated: false, isAuthLoading: false });
        }
    }, [refreshAccessToken]);

    const contextValue: AuthContextType = {
        isAuthenticated,
        accountId,
        accessToken,
        refreshToken,
        isAuthLoading, // Include loading state in context
        login,
        logout,
        refreshAccessToken,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    console.log('useAuth called, context:', context);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context!;
};