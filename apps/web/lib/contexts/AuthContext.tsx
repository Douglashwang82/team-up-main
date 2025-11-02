'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apis } from '../api';
import { UserOut } from '@team-up-main/api-client';

interface AuthContextType {
  user: UserOut | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userInfo = await apis.auth.getCurrentUser();

      if (userInfo) {
        setUser(userInfo);
        // Ensure cookie is set (in case user refreshed page)
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          document.cookie = `auth_token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear cookie on auth failure
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apis.auth.login({ loginIn: { email, password } });
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      // Set cookie for middleware authentication check
      document.cookie = `auth_token=${response.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days

      // Fetch user info
      const userInfo = await apis.auth.getCurrentUser();
      setUser(userInfo);

      router.push('/teamups');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, displayName?: string) => {
    try {
      await apis.auth.signup({ signupIn: { email, password, displayName: displayName } });
      await login(email, password);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } 
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Remove auth cookie
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
