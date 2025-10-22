/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { authService } from '../services/api/AuthService';
import type { AuthCredentials, User } from '../types/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (credentials: AuthCredentials) => Promise<void>;
  loginWithGoogle: () => void;
  signup: (credentials: AuthCredentials & { confirmPassword: string }) => Promise<void>;
  logout: () => void;
  loading: boolean; // Represents the initial auth check
  error: string | null;
  refetchUser: () => Promise<void>; // Add refetch function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // True on initial app load
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const fetchAndSetUser = useCallback(async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (e) {
      console.error("Failed to fetch user data:", e);
      logout(); // If fetching user fails, logout to clear invalid state
    }
  }, [logout]);

  // This effect runs only ONCE on app startup to check for an existing session.
  useEffect(() => {
    const bootstrapAuth = async () => {
      const storedToken = localStorage.getItem('jwt_token');
      if (storedToken) {
        try {
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          if (payload.exp * 1000 < Date.now()) {
            logout();
          } else {
            setToken(storedToken);
            await fetchAndSetUser();
          }
        } catch (e) {
          console.error("Invalid token on startup:", e);
          logout();
        }
      }
      setLoading(false);
    };

    bootstrapAuth();
  }, [fetchAndSetUser, logout]);

  const login = async (credentials: AuthCredentials) => {
    setError(null);
    try {
      const { accessToken, refreshToken } = await authService.login(credentials);
      
      localStorage.setItem('jwt_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      setToken(accessToken);

      await fetchAndSetUser();

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng thử lại.';
      setError(message);
      throw err;
    }
  };

  const loginWithGoogle = () => {
    window.location.href = 'https://api.ladanv.id.vn/oauth2/authorization/google';
  };

  const signup = async (credentials: AuthCredentials & { confirmPassword: string }) => {
    setError(null);
    try {
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Mật khẩu và xác nhận mật khẩu không khớp.');
      }
      await authService.signup({ email: credentials.email, password: credentials.password });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng ký thất bại.';
      setError(message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!token && !!user,
      user,
      token,
      login,
      loginWithGoogle,
      signup,
      logout,
      loading,
      error,
      refetchUser: fetchAndSetUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext); // Corrected from JournalContext
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
