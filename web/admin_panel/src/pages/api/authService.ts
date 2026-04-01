import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api'; // Point to auth-gateway

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
