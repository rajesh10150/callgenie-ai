'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User, Organization } from '@/types';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  organization: Organization | null;
  role: string | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  org_name: string;
  industry: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ['/', '/auth/login', '/auth/register'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<AuthState>({
    user: null,
    organization: null,
    role: null,
    token: null,
    loading: true,
    error: null,
  });

  const setAuth = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('callgenie_token');
    if (token) {
      api.setToken(token);
      fetchProfile(token);
    } else {
      setAuth({ loading: false });
      if (!PUBLIC_PATHS.includes(pathname)) {
        router.push('/auth/login');
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProfile = async (token: string) => {
    try {
      const res = await api.get<{
        user: User;
        organization: Organization;
        role: string;
      }>('/auth/me');

      if (res.success) {
        setAuth({
          user: res.data.user,
          organization: res.data.organization,
          role: res.data.role,
          token,
          loading: false,
        });
      } else {
        localStorage.removeItem('callgenie_token');
        api.clearToken();
        setAuth({ loading: false });
        if (!PUBLIC_PATHS.includes(pathname)) {
          router.push('/auth/login');
        }
      }
    } catch {
      localStorage.removeItem('callgenie_token');
      api.clearToken();
      setAuth({ loading: false });
    }
  };

  const login = async (email: string, password: string) => {
    setAuth({ loading: true, error: null });
    try {
      const res = await api.post<{
        user: User;
        organization: Organization;
        role: string;
        token: string;
        refresh_token: string;
      }>('/auth/login', { email, password });

      if (res.success) {
        localStorage.setItem('callgenie_token', res.data.token);
        api.setToken(res.data.token);
        setAuth({
          user: res.data.user,
          organization: res.data.organization,
          role: res.data.role,
          token: res.data.token,
          loading: false,
        });
        router.push('/dashboard');
      } else {
        setAuth({
          loading: false,
          error: res.error?.message || 'Login failed',
        });
      }
    } catch {
      setAuth({
        loading: false,
        error: 'Unable to connect to server. Please try again.',
      });
    }
  };

  const register = async (data: RegisterData) => {
    setAuth({ loading: true, error: null });
    try {
      const res = await api.post<{
        user: User;
        organization: Organization;
        token: string;
      }>('/auth/register', data);

      if (res.success) {
        localStorage.setItem('callgenie_token', res.data.token);
        api.setToken(res.data.token);
        setAuth({
          user: res.data.user,
          organization: res.data.organization,
          role: 'owner',
          token: res.data.token,
          loading: false,
        });
        router.push('/dashboard');
      } else {
        setAuth({
          loading: false,
          error: res.error?.message || 'Registration failed',
        });
      }
    } catch {
      setAuth({
        loading: false,
        error: 'Unable to connect to server. Please try again.',
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('callgenie_token');
    api.clearToken();
    setState({
      user: null,
      organization: null,
      role: null,
      token: null,
      loading: false,
      error: null,
    });
    router.push('/auth/login');
  };

  const clearError = () => setAuth({ error: null });

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, clearError }}>
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
