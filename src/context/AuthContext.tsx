import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/api.service';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy user credentials for testing
const DUMMY_USER = {
  username: 'martas',
  password: 'martas@123'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const isValid = await authService.verifyToken(token);
          setIsAuthenticated(isValid);
        } catch (error) {
          // Token is invalid
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // For testing: Check against dummy credentials
      if (username === DUMMY_USER.username && password === DUMMY_USER.password) {
        // Create a dummy token
        const dummyToken = 'dummy_token_' + Date.now();
        localStorage.setItem('access_token', dummyToken);
        localStorage.setItem('refresh_token', 'dummy_refresh_token');
        setIsAuthenticated(true);
        return;
      }

      const response = await authService.login({ username, password });
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      setIsAuthenticated(true);
    } catch (error: any) {
      setError(error?.response?.data?.detail || 'Login failed. Please check your credentials.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};