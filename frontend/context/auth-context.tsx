"use client";

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { LOGIN_MUTATION } from '@/graphql/mutation/account-mutation'; // Import the mutation

interface AuthContextType {
  isAuthenticated: boolean;
  accountId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  isAuthLoading: boolean;
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
  const [role, setRole] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();

  const setAuthData = useCallback((accessToken: string, refreshToken: string, id: string, role: string) => {
    Cookies.set('accessToken', accessToken, { secure: true, sameSite: 'strict' });
    Cookies.set('refreshToken', refreshToken, { secure: true, sameSite: 'strict' });
    Cookies.set('accountId', id, { secure: true, sameSite: 'strict' });
    Cookies.set('role', role, { secure: true, sameSite: 'strict' });
    setIsAuthenticated(true);
    setAccountId(id);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setRole(role);
    setIsAuthLoading(false);
  }, []);

  const clearAuthData = useCallback(() => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('accountId');
    Cookies.remove('role');
    setIsAuthenticated(false);
    setAccountId(null);
    setAccessToken(null);
    setRefreshToken(null);
    setRole(null);
    setIsAuthLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsAuthLoading(true);
    try {
      const response = await fetch('http://localhost:8000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: LOGIN_MUTATION, // Use the imported mutation
          variables: { email, password },
        }),
      });

      const data = await response.json();

      if (
        data?.data?.login?.accessToken &&
        data?.data?.login?.refreshToken &&
        data?.data?.login?.account_id?.id &&
        data?.data?.login?.role
      ) {
        setAuthData(
          data.data.login.accessToken,
          data.data.login.refreshToken,
          data.data.login.account_id.id,
          data.data.login.role
        );
        router.push('/');
        return true;
      } else {
        console.error('Login failed:', data?.errors || data?.data?.login);
        setIsAuthLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Error during login:', error);
      setIsAuthLoading(false);
      return false;
    }
  }, [setAuthData, router]);

  const logout = useCallback(async () => {
    setIsAuthLoading(true);
    clearAuthData();
    await router.push('/login');
    setIsAuthLoading(false);
  }, [clearAuthData, router]);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const refreshToken = Cookies.get('refreshToken');
    if (!refreshToken) {
      clearAuthData();
      setIsAuthLoading(false);
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
        setIsAuthLoading(false);
        return data.data.refreshToken.accessToken;
      } else {
        clearAuthData();
        setIsAuthLoading(false);
        return null;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      clearAuthData();
      setIsAuthLoading(false);
      return null;
    }
  }, [clearAuthData]);

  useEffect(() => {
    const accessToken = Cookies.get('accessToken');
    const refreshToken = Cookies.get('refreshToken');
    const storedAccountId = Cookies.get('accountId');
    const storedRole = Cookies.get('role');

    console.log('AuthContext - Checking cookies:', { accessToken, refreshToken, storedAccountId, storedRole });

    if (accessToken && refreshToken && storedAccountId && storedRole) {
      setIsAuthenticated(true);
      setAccountId(storedAccountId);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setRole(storedRole);
      setIsAuthLoading(false);
      console.log('AuthContext - Authentication state after cookie check:', { isAuthenticated: true, accountId: storedAccountId, accessToken, refreshToken, role: storedRole, isAuthLoading: false });
      // Optionally, you can trigger an initial token refresh here
      // refreshAccessToken();
    } else {
      setIsAuthenticated(false);
      setAccountId(null);
      setAccessToken(null);
      setRefreshToken(null);
      setRole(null);
      setIsAuthLoading(false);
      console.log('AuthContext - No auth cookies found, state:', { isAuthenticated: false, isAuthLoading: false });
    }
  }, [refreshAccessToken]);

  const contextValue: AuthContextType = {
    isAuthenticated,
    accountId,
    accessToken,
    refreshToken,
    role,
    isAuthLoading,
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