import React, { type ReactNode } from 'react';
import { api } from '../lib/apiClient';

interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  department: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('authUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = async (email: string, password: string): Promise<void> => {
    const data = await api.post<{ accessToken: string }>('/auth/login', { email, password });
    localStorage.setItem('authToken', data.accessToken);

    const me = await api.get<AuthUser>('/auth/me');
    setUser(me);
    localStorage.setItem('authUser', JSON.stringify(me));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
