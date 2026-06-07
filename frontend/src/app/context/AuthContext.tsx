import React, { type ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  department: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  signup: (username: string, email: string, password: string, fullName: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize state with saved user from localStorage
  const [user, setUser] = React.useState<User | null>(() => {
    const savedUser = localStorage.getItem('hotelUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (username: string, password: string): boolean => {
    // Demo login - accept any credentials
    if (username && password) {
      const demoUser: User = {
        id: 'U001',
        username: username,
        fullName: username === 'admin' ? 'Admin User' : 'Demo User',
        email: `${username}@hotel.com`,
        role: username === 'admin' ? 'admin' : 'staff',
        department: 'Management'
      };
      setUser(demoUser);
      localStorage.setItem('hotelUser', JSON.stringify(demoUser));
      return true;
    }
    return false;
  };

  const signup = (username: string, email: string, password: string, fullName: string): boolean => {
    if (username && email && password && fullName) {
      const newUser: User = {
        id: `U${Date.now()}`,
        username,
        fullName,
        email,
        role: 'staff',
        department: 'Front Office'
      };
      setUser(newUser);
      localStorage.setItem('hotelUser', JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hotelUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}