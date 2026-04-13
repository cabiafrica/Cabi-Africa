import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import apiClient from '@/lib/apiClient';

export interface AuthUser {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'passenger' | 'driver' | 'admin';
    permissions?: string[];
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
    hasPermission: (permission: string) => boolean;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const refreshProfile = async () => {
        const token = localStorage.getItem('authToken');
        const userDataString = localStorage.getItem('authUser');
        if (!token || !userDataString) return;

        try {
            const currentUser = JSON.parse(userDataString);
            const response = await apiClient.get(`/settings/user/${currentUser.id}`);

            const freshUser = { ...currentUser, ...response.data };
            localStorage.setItem('authUser', JSON.stringify(freshUser));
            setUser(freshUser);
        } catch (error) {
            console.error("Failed to refresh profile", error);
        }
    };

    useEffect(() => {
        // On initial load, check localStorage for existing session
        const token = localStorage.getItem('authToken');
        const userDataString = localStorage.getItem('authUser');

        if (token && userDataString) {
            try {
                const parsedUser = JSON.parse(userDataString);
                setUser(parsedUser);

                // Trigger background refresh if token exists
                apiClient.get(`/settings/user/${parsedUser.id}`).then(res => {
                    const freshUser = { ...parsedUser, ...res.data };
                    localStorage.setItem('authUser', JSON.stringify(freshUser));
                    setUser(freshUser);
                }).catch(e => console.error("Background profile sync failed", e));

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

        // Fetch fresh settings immediately
        // Just triggering without await to not block redirect
        refreshProfile();

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

    const hasPermission = (permission: string) => {
        if (!user || !user.permissions) return false;
        return user.permissions.includes('*') || user.permissions.includes(permission);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, updateUser, loading, hasPermission, refreshProfile }}>
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
