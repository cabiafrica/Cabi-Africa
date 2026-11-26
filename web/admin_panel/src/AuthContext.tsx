import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define the shape of the user object and the context
export interface AuthUser {
  id: string;
  email?: string;
  fullName: string;
  role: 'admin' | 'user';
  permissions?: string[]; // Granular permissions
  profilePictureUrl?: string;
  isTwoFactorEnabled?: boolean;
  identityVerified?: boolean;
  driverProfileId?: string;
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
    // On initial load, verify localStorage for legitimate verified session
    const token = localStorage.getItem('authToken');
    const userDataString = localStorage.getItem('authUser');
    if (token && userDataString) {
      try {
        const parsed = JSON.parse(userDataString) as AuthUser;
        if (parsed?.identityVerified === true) {
          setUser(parsed);
          return;
        }
      } catch (e) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }

    // Zero-Trust: If not authenticated, ensure user is null so login gate is enforced
    setUser(null);
  }, []);

  // Multi-tab synchronization
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('cabi_admin_auth_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'LOGOUT') {
            setUser(null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
          } else if (event.data?.type === 'LOGIN' && event.data.user) {
            setUser(event.data.user);
          }
        };
        return () => {
          channel.close();
        };
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  // Storage listener fallback
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' && !e.newValue) {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Persist theme changes to localStorage
  useEffect(() => {
    localStorage.setItem('auditLog_syntaxTheme', syntaxTheme);
  }, [syntaxTheme]);

  const login = (token: string, userData: AuthUser) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(userData));
    setUser(userData);
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('cabi_admin_auth_channel');
        channel.postMessage({ type: 'LOGIN', user: userData });
        channel.close();
      }
    } catch (e) {
      // Ignore
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setUser(null);
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('cabi_admin_auth_channel');
        channel.postMessage({ type: 'LOGOUT' });
        channel.close();
      }
    } catch (e) {
      // Ignore
    }
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