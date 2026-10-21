import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; full_name: string; address?: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  demoLogin: (role: 'citizen' | 'admin') => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ecosort_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const fetchProfile = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        localStorage.removeItem('ecosort_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // Response was not JSON
      }
      if (!res.ok) {
        if (res.status === 404) {
          return { success: false, error: 'API route not found (404). Check Render Static Site Rewrites or set VITE_API_BASE_URL.' };
        }
        if (res.status === 502 || res.status === 504) {
          return { success: false, error: 'Backend is waking up from sleep. Please wait ~30 seconds and try again.' };
        }
        return { success: false, error: data.detail || `Login failed (${res.status})` };
      }
      localStorage.setItem('ecosort_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      setShowAuthModal(false);
      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, error: 'Network error connecting to EcoSort API. Please verify backend service is active.' };
    }
  };

  const register = async (regData: { email: string; password: string; full_name: string; address?: string; phone?: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // Response was not JSON
      }
      if (!res.ok) {
        if (res.status === 404) {
          return { success: false, error: 'API route not found (404). Check Render Static Site Rewrites or set VITE_API_BASE_URL.' };
        }
        if (res.status === 502 || res.status === 504) {
          return { success: false, error: 'Backend is waking up from sleep. Please wait ~30 seconds and try again.' };
        }
        return { success: false, error: data.detail || `Registration failed (${res.status})` };
      }
      localStorage.setItem('ecosort_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      setShowAuthModal(false);
      return { success: true };
    } catch (err: any) {
      console.error('Registration error:', err);
      return { success: false, error: 'Network error connecting to EcoSort API. Please verify backend service is active.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('ecosort_token');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchProfile(token);
    }
  };

  const demoLogin = async (role: 'citizen' | 'admin') => {
    if (role === 'citizen') {
      await login('demo@ecosort.org', 'DemoEco@2026');
    } else {
      await login('admin@ecosort.org', 'AdminSort@2026');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      login,
      register,
      logout,
      refreshProfile,
      demoLogin,
      showAuthModal,
      setShowAuthModal,
      authModalMode,
      setAuthModalMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
