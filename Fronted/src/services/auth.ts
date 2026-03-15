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
    location?: {
        city?: string;
        state?: string;
    } | null;
    displayName?: string;
    businessName?: string;
    description?: string;
    verified?: boolean;
    rating?: number;
    reviewCount?: number;
    completedJobs?: number;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    isFirstGoogleLogin?: boolean;
    requiresProviderProfileCompletion?: boolean;
}

export interface CurrentUserResponse {
    user: User;
    profile: Record<string, unknown> | null;
    profileData?: Partial<User>;
}

export interface LoginCredentials {
    email?: string;
    userName?: string;
    identifier?: string;
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
    registerCustomer: async (data: RegisterCustomerData): Promise<AuthResponse> => {
        const response = await api.post('/auth/register/customer', data);
        return response.data.data;
    },

    registerProvider: async (data: RegisterProviderData): Promise<AuthResponse> => {
        const response = await api.post('/auth/register/provider', data);
        return response.data.data;
    },

    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', credentials);
        return response.data.data;
    },

    logout: async (): Promise<void> => {
        const response = await api.post('/auth/logout');
        return response.data.data;
    },

    getCurrentUser: async (): Promise<CurrentUserResponse> => {
        const response = await api.get('/users/me');
        return response.data.data;
    },

    refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
        const response = await api.post('/auth/refresh-token', { refreshToken });
        return response.data.data;
    },

    googleLogin: async (googleToken: string, role: 'customer' | 'provider' = 'customer'): Promise<AuthResponse> => {
        const response = await api.post('/auth/google', { token: googleToken, role });
        return response.data.data;
    },

    completeProviderProfile: async (data: {
        displayName: string;
        phone: string;
        businessName: string;
        description: string;
    }) => {
        const response = await api.post('/auth/provider-profile/complete', data);
        return response.data.data;
    },
};

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
