import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://auth-gateway-746659778850.us-central1.run.app/api'; // Point to auth-gateway production

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        email?: string;
        fullName: string;
        role: string;
        permissions: string[];
        driverProfileId?: string;
    };
}

export const loginUser = async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const { data } = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/login`, credentials);
    return data;
};

export const forgotPassword = async (email: string): Promise<{ success: boolean }> => {
    const { data } = await axios.post(`${API_BASE_URL}/forgot-password`, { email });
    return data;
};

export const resetPassword = async (token: string, password: string): Promise<{ success: boolean }> => {
    const { data } = await axios.post(`${API_BASE_URL}/reset-password`, { token, password });
    return data;
};

// Alias used by ForgotPasswordPage
export const requestPasswordReset = forgotPassword;
