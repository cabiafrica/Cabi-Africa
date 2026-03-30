import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of the user object
// Using a flexible structure compatible with other apps
export interface AuthUser {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    profilePictureUrl?: string; // Standardized
    permissions?: string[]; // Admin permissions
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    login: (token: string, userData: AuthUser) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
    hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialize from localStorage
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse stored user", error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
            }
        }
        setLoading(false);
    }, []);

    const login = (newToken: string, userData: AuthUser) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('authUser', JSON.stringify(userData));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
    };

    const isAuthenticated = !!user;

    const hasPermission = (permission: string) => {
        if (!user) return false;
        // Super/System Admin check (if implemented) or wildcard
        if (user.permissions?.includes('*')) return true;
        return user.permissions?.includes(permission) || false;
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, loading, hasPermission }}>
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
