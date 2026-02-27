"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "./api";

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string;
  joinedDate: string;
  wishlist?: any[];
  addresses?: any[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  signUp: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string; requiresVerification?: boolean }>;
  signOut: () => void;
  logout: () => void; // Alias for signOut
  reloadUser: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "edifice-auth-user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Verify token and get user profile
        console.log('Loading user with token...');
        const response = await api.get('/auth/me');
        console.log('User loaded:', response.data);
        const userData: User = {
          ...response.data,
          id: response.data._id,
          joinedDate: new Date(response.data.createdAt || Date.now()).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
        };
        setUser(userData);
        persistUser(userData);
      }
    } catch (error) {
      console.error('Load user invalid:', error);
      // Token invalid or expired
      localStorage.removeItem('token');
    }
    setIsLoading(false);
  }, []);

  // Hydrate user from localStorage on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const persistUser = (userData: User | null) => {
    if (userData) {
      document.cookie = `${STORAGE_KEY}=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    } else {
      document.cookie = `${STORAGE_KEY}=; path=/; max-age=0`;
    }
  };

  const signIn = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string; user?: User }> => {
      setIsLoading(true);
      try {
        const response = await api.post('/auth/login', { email, password });

        const { token, ...userInfo } = response.data;

        // Store token
        localStorage.setItem('token', token);

        // Create user object
        const userData: User = {
          ...userInfo,
          id: userInfo._id,
          joinedDate: new Date(userInfo.createdAt || Date.now()).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
        };

        setUser(userData);
        persistUser(userData);
        return { success: true, user: userData };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Login failed";
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signUp = useCallback(
    async (data: {
      name: string;
      email: string;
      phone?: string;
      password: string;
    }): Promise<{ success: boolean; error?: string; requiresVerification?: boolean }> => {
      setIsLoading(true);
      try {
        const response = await api.post('/auth/register', data);

        // Backend now returns requiresVerification instead of a token
        if (response.data.requiresVerification) {
          return { success: true, requiresVerification: true };
        }

        // Legacy fallback if token is returned (e.g., admin created accounts)
        const { token, ...userInfo } = response.data;
        if (token) {
          localStorage.setItem('token', token);
          const userData: User = {
            ...userInfo,
            id: userInfo._id,
            joinedDate: new Date(userInfo.createdAt || Date.now()).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            }),
          };
          setUser(userData);
          persistUser(userData);
        }

        return { success: true };
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Registration failed";
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    document.cookie = `${STORAGE_KEY}=; path=/; max-age=0`;
  };

  const reloadUser = async () => {
    await loadUser();
  };

  const addToWishlist = async (productId: string) => {
    try {
      const response = await api.post('/auth/wishlist', { productId });
      if (user) {
        setUser({ ...user, wishlist: response.data });
      }
      return true;
    } catch (error: any) {
      const reason = error?.response?.data?.message || "Failed to add to wishlist";
      console.warn(`[Wishlist] ${reason}`);
      return false;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await api.delete(`/auth/wishlist/${productId}`);
      if (user) {
        setUser({ ...user, wishlist: response.data });
      }
      return true;
    } catch (error: any) {
      const reason = error?.response?.data?.message || "Failed to remove from wishlist";
      console.warn(`[Wishlist] ${reason}`);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut: logout,
        logout,
        reloadUser,
        addToWishlist,
        removeFromWishlist
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
