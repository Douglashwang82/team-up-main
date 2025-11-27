import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apis } from './api';
import { UserOut, ResponseError } from '@team-up-main/api-client';

interface AuthContextType {
  user: UserOut | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        const userInfo = await apis.auth.getCurrentUser();
        // @ts-ignore
        setUser(userInfo);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apis.auth.login({ loginIn: { email, password } });
      await AsyncStorage.setItem('accessToken', response.accessToken);
      await AsyncStorage.setItem('refreshToken', response.refreshToken);

      const userInfo = await apis.auth.getCurrentUser();
      // @ts-ignore
      setUser(userInfo);
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof ResponseError) {
        try {
          const body = await error.response.json();
          if (body.message) {
            throw new Error(body.message);
          }
        } catch (e) {
          // If parsing fails, throw original error or generic one
          if (e instanceof Error && e.message !== 'Login failed') {
            // ignore json parse error
          }
        }
      }
      throw error;
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      await apis.auth.signup({
        signupIn: {
          email,
          password,
          displayName: `${firstName} ${lastName}`
        }
      });
      await login(email, password);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
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
