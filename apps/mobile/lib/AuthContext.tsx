import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (e.g., from AsyncStorage)
    // For now, we'll just set loading to false
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, []);

  const login = async (email: string, password: string) => {
    // TODO: Implement actual login API call
    // For now, simulate login
    await new Promise(resolve => setTimeout(resolve, 1000));

    setUser({
      id: '1',
      email,
      firstName: 'John',
      lastName: 'Doe',
    });
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    // TODO: Implement actual signup API call
    // For now, simulate signup
    await new Promise(resolve => setTimeout(resolve, 1000));

    setUser({
      id: '1',
      email,
      firstName,
      lastName,
    });
  };

  const logout = async () => {
    // TODO: Clear AsyncStorage/SecureStore
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
