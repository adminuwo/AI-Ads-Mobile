import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../api/authApi';
import { secureStorage, appStorage } from '../utils/storage';
import { STORAGE_KEYS } from '../config/constants';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  uwoLogin: (data: { email: string; name?: string; uwo_token?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on launch
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await secureStorage.getItem(STORAGE_KEYS.TOKEN);
        const savedUser = await appStorage.getJSON<User | null>(STORAGE_KEYS.USER, null);

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
        }
      } catch (err) {
        console.warn('Auth restoration failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      if (response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        await secureStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        await appStorage.setJSON(STORAGE_KEYS.USER, response.user);
        return { success: true };
      }
      return { success: false, error: response.error || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Cannot reach server' };
    }
  };

  const register = async (email: string, password: string, confirmPassword: string) => {
    try {
      const response = await authApi.register(email, password, confirmPassword);
      if (response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        await secureStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        await appStorage.setJSON(STORAGE_KEYS.USER, response.user);
        return { success: true };
      }
      return { success: false, error: response.error || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Cannot reach server' };
    }
  };

  const uwoLogin = async (data: { email: string; name?: string; uwo_token?: string }) => {
    try {
      const response = await authApi.uwoLogin(data);
      if (response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        await secureStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        await appStorage.setJSON(STORAGE_KEYS.USER, response.user);
        return { success: true };
      }
      return { success: false, error: response.error || 'SSO Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Cannot reach server' };
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await secureStorage.removeItem(STORAGE_KEYS.TOKEN);
    await appStorage.removeItem(STORAGE_KEYS.USER);
  };

  const updateUser = (updated: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updated };
      appStorage.setJSON(STORAGE_KEYS.USER, next);
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        uwoLogin,
        logout,
        updateUser,
      }}
    >
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
