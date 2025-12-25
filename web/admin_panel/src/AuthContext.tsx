import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define the shape of the user object and the context
export interface AuthUser {
  id: string;
  fullName: string;
  role: 'admin' | 'user';
  permissions?: string[]; // Granular permissions
  profilePictureUrl?: string;
  isTwoFactorEnabled?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (token: string, userData: AuthUser) => void;
  logout: () => void;
  updateUser: (userData: AuthUser) => void;
  syntaxTheme: string;
  setSyntaxTheme: (theme: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [syntaxTheme, setSyntaxTheme] = useState(() => localStorage.getItem('auditLog_syntaxTheme') || 'vscDarkPlus');

  useEffect(() => {
    // On initial load, check localStorage for existing session
    const token = localStorage.getItem('authToken');
    const userDataString = localStorage.getItem('authUser');
    if (token && userDataString) {
      try {
        setUser(JSON.parse(userDataString));
      } catch (e) {
        localStorage.clear(); // Clear corrupted data
      }
    }
  }, []);

  // Persist theme changes to localStorage
  useEffect(() => {
    localStorage.setItem('auditLog_syntaxTheme', syntaxTheme);
  }, [syntaxTheme]);

  const login = (token: string, userData: AuthUser) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setUser(null);
  };

  const updateUser = (userData: AuthUser) => {
    // Assumes the token doesn't change when profile is updated.
    localStorage.setItem('authUser', JSON.stringify(userData));
    setUser(userData);
  };

  const value = { isAuthenticated: !!user, user, login, logout, updateUser, syntaxTheme, setSyntaxTheme };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// This is the hook that components will use to access auth state
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};