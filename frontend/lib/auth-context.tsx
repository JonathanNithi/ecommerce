"use client";

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation'; // Import from next/navigation

interface AuthContextType {
  isAuthenticated: boolean;
  accountId: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const router = useRouter();

  const setAuthData = useCallback((accessToken: string, refreshToken: string, id: string) => {
    Cookies.set('accessToken', accessToken, { secure: true, sameSite: 'strict' });
    Cookies.set('refreshToken', refreshToken, { secure: true, sameSite: 'strict' });
    Cookies.set('accountId', id, { secure: true, sameSite: 'strict' });
    setIsAuthenticated(true);
    setAccountId(id);
  }, []);

  const clearAuthData = useCallback(() => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('accountId');
    setIsAuthenticated(false);
    setAccountId(null);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
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
        return false;
      }
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  }, [setAuthData, router]);

  const logout = useCallback(async () => {
    clearAuthData();
    await router.push('/login');
  }, [clearAuthData, router]);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const refreshToken = Cookies.get('refreshToken');
    if (!refreshToken) {
      clearAuthData();
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
        return data.data.refreshToken.accessToken;
      } else {
        clearAuthData();
        return null;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      clearAuthData();
      return null;
    }
  }, [clearAuthData]);

  useEffect(() => {
    const accessToken = Cookies.get('accessToken');
    const refreshToken = Cookies.get('refreshToken');
    const storedAccountId = Cookies.get('accountId');

    if (accessToken && refreshToken && storedAccountId) {
      setIsAuthenticated(true);
      setAccountId(storedAccountId);
      // Optionally, you can trigger an initial token refresh here
      // refreshAccessToken();
    }
  }, [refreshAccessToken]);

  const contextValue: AuthContextType = {
    isAuthenticated,
    accountId,
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};