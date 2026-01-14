import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

export interface AuthUser {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'passenger' | 'driver' | 'admin';
    referralCode?: string;
    [key: string]: any;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: AuthUser | null;
    login: (token: string, userData: AuthUser) => void;
    logout: () => void;
    updateUser: (userData: AuthUser) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // On initial load, check localStorage for existing session
        const token = localStorage.getItem('authToken');
        const userDataString = localStorage.getItem('authUser');

        if (token && userDataString) {
            try {
                setUser(JSON.parse(userDataString));
            } catch (e) {
                console.error("Failed to parse auth user", e);
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
            }
        }
        setLoading(false);
    }, []);

    const login = (token: string, userData: AuthUser) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(userData));
        setUser(userData);

        // Redirect based on role
        if (userData.role === 'driver') {
            router.push('/drivers/dashboard');
        } else {
            router.push('/dashboard');
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        // Clean up legacy keys if they exist
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setUser(null);
        router.push('/');
    };

    const updateUser = (userData: AuthUser) => {
        localStorage.setItem('authUser', JSON.stringify(userData));
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
