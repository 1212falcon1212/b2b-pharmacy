'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, authApi, documentsApi, User } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  documentsApproved: boolean;
  checkingDocuments: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  checkDocumentStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Routes that don't require document approval
const PUBLIC_ROUTES = ['/login', '/register', '/documents'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [documentsApproved, setDocumentsApproved] = useState(false);
  const [checkingDocuments, setCheckingDocuments] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  // Check document status and redirect if needed
  useEffect(() => {
    if (!isLoading && user && !checkingDocuments) {
      // Super admins bypass document check
      if (user.role === 'super-admin') {
        setDocumentsApproved(true);
        return;
      }

      // If not approved and not on allowed route, redirect to documents
      if (!documentsApproved && !PUBLIC_ROUTES.includes(pathname)) {
        router.push('/documents');
      }
    }
  }, [user, isLoading, documentsApproved, pathname, checkingDocuments]);

  const checkAuth = async () => {
    const token = api.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    const response = await authApi.getUser();
    if (response.data) {
      setUser(response.data.user);
      // Check document status after getting user
      await checkDocumentStatus();
    } else {
      api.setToken(null);
    }
    setIsLoading(false);
  };

  const checkDocumentStatus = async () => {
    setCheckingDocuments(true);
    try {
      const response = await documentsApi.getStatus();
      if (response.data) {
        setDocumentsApproved(response.data.documents_approved);
      }
    } catch (error) {
      console.error('Failed to check document status:', error);
    } finally {
      setCheckingDocuments(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);

    if (response.data) {
      api.setToken(response.data.token);
      setUser(response.data.user);

      // Check document status after login
      await checkDocumentStatus();

      return { success: true };
    }

    return { success: false, error: response.error };
  };

  const logout = async () => {
    await authApi.logout();
    api.setToken(null);
    setUser(null);
    setDocumentsApproved(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        documentsApproved,
        checkingDocuments,
        login,
        logout,
        setUser,
        checkDocumentStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
