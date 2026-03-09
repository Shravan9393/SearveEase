import { api } from './api';

// Types
export interface User {
    _id: string;
    userName: string;
    fullName: string;
    email: string;
    role: 'customer' | 'provider' | 'admin';
    profileImage?: string;
    phone?: string;
    isProvider?: boolean;
    serviceCategory?: string;
    googleId?: string;
    isGoogleAccount?: boolean;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface LoginCredentials {
    email?: string;
    userName?: string;
    password: string;
}

export interface RegisterCustomerData {
    userName: string;
    email: string;
    password: string;
    fullName: string;
    phone: string;
}

export interface RegisterProviderData {
    userName: string;
    email: string;
    password: string;
    fullName: string;
    phone: string;
    displayName: string;
    businessName: string;
    description: string;
}

// Auth API functions
export const authAPI = {
    // Register customer
    registerCustomer: async (data: RegisterCustomerData): Promise<AuthResponse> => {
        const response = await api.post('/auth/register/customer', data);
        return response.data.data;
    },

    // Register provider
    registerProvider: async (data: RegisterProviderData): Promise<AuthResponse> => {
        const response = await api.post('/auth/register/provider', data);
        return response.data.data;
    },

    // Login
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', credentials);
        return response.data.data;
    },

    // Logout
    logout: async (): Promise<void> => {
        const response = await api.post('/auth/logout');
        return response.data.data;
    },

    // Get current user
    getCurrentUser: async (): Promise<User> => {
        const response = await api.get('/users/me');
        return response.data.data.user || response.data.data;
    },

    // Refresh token
    refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
        const response = await api.post('/auth/refresh-token', { refreshToken });
        return response.data.data;
    },

    // Google Login/Register
    googleLogin: async (googleToken: string): Promise<AuthResponse> => {
        const response = await api.post('/auth/google', { token: googleToken });
        return response.data.data;
    },
};

// Helper functions for localStorage
export const setTokens = (accessToken: string, refreshToken: string): void => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
};

export const getTokens = (): { accessToken: string | null; refreshToken: string | null } => {
    return {
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
    };
};

export const clearTokens = (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
};

export const setUser = (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export default authAPI;
