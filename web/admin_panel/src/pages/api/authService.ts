import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.cabi.africa/api'; // Point to auth-gateway production

export interface AuthResponse {
    token: string;
    requiresOnboarding?: boolean;
    onboardingToken?: string;
    message?: string;
    user: {
        id: string;
        email?: string;
        fullName: string;
        role: string;
        permissions: string[];
        driverProfileId?: string;
        identityVerified?: boolean;
        isIdentityVerified?: boolean;
    };
}

export interface AdminLoginChallengeResponse {
    requiresVerification: boolean;
    requiresOnboarding?: boolean;
    isTemporaryPassword?: boolean;
    challengeToken: string;
    maskedEmail: string;
    expiresInSeconds: number;
    devOtpPreview?: string;
}

export interface SecurityQuestion {
    id: string;
    text: string;
}

export interface TotpSetupResponse {
    secretBase32: string;
    otpauthUrl?: string;
    qrCodeDataUrl: string;
}

export const getSecurityQuestions = async (): Promise<SecurityQuestion[]> => {
    const { data } = await axios.get<SecurityQuestion[]>(`${API_BASE_URL}/auth/admin/onboarding/questions`, {
        timeout: 5000,
    });
    return data;
};

export const setupOnboardingTotp = async (onboardingToken: string): Promise<TotpSetupResponse> => {
    const { data } = await axios.post<TotpSetupResponse>(`${API_BASE_URL}/auth/admin/onboarding/totp-setup`, {
        onboardingToken,
    }, {
        timeout: 5000,
    });
    return data;
};

export const completeAdminOnboarding = async (payload: {
    onboardingToken: string;
    newPassword: string;
    securityQuestions: Array<{ questionId: string; question: string; answer: string }>;
    totpSecret: string;
    totpCode: string;
    biometricCredential?: any;
}): Promise<AuthResponse> => {
    const { data } = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/admin/onboarding/complete`, payload, {
        timeout: 10000,
    });
    return data;
};

export const initiateAdminLogin = async (credentials: { email: string; password: string }): Promise<AdminLoginChallengeResponse> => {
    const { data } = await axios.post<AdminLoginChallengeResponse>(`${API_BASE_URL}/auth/admin/initiate-login`, credentials, {
        timeout: 5000
    });
    return data;
};

export const verifyAdminIdentity = async (challengeToken: string, otpCode: string): Promise<AuthResponse> => {
    const { data } = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/admin/verify-identity`, {
        challengeToken,
        otpCode,
    }, {
        timeout: 5000
    });
    return data;
};

export const resendAdminOtp = async (challengeToken: string): Promise<AdminLoginChallengeResponse> => {
    const { data } = await axios.post<AdminLoginChallengeResponse>(`${API_BASE_URL}/auth/admin/resend-otp`, {
        challengeToken,
    }, {
        timeout: 5000
    });
    return data;
};

export const loginUser = async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const { data } = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/login`, credentials, {
        timeout: 5000
    });
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
