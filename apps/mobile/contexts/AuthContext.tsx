import React, { createContext, useContext, useState, useEffect } from "react";
import { api, setTokens, clearTokens } from "../lib/apiClient";
import type { User } from "../lib/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userInfo = await api.auth.getCurrentUser();
      setUser(userInfo);
    } catch (error) {
      // It is normal to fail auth check if the user is simply not logged in (e.g., throwing "Authentication required" or "Unauthorized")
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes("Authentication required") && !errorMessage.includes("Unauthorized") && !errorMessage.includes("unauthorized")) {
        console.warn("Auth check failed with unexpected error:", error);
      }
      await clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.auth.login({ email, password });
      await setTokens(response.access_token, response.refresh_token);

      const userInfo = await api.auth.getCurrentUser();
      setUser(userInfo);
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Login failed. Please check your credentials.",
      );
    }
  };

  const signup = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    try {
      const response = await api.auth.signup({
        email,
        password,
        display_name: displayName,
      });
      await setTokens(response.access_token, response.refresh_token);

      const userInfo = await api.auth.getCurrentUser();
      setUser(userInfo);
    } catch (error) {
      console.error("Signup error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Signup failed. Please try again.",
      );
    }
  };

  const logout = async () => {
    await clearTokens();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userInfo = await api.auth.getCurrentUser();
      setUser(userInfo);
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, logout, refreshUser }}
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
