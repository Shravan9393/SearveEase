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
    identifier: string;
    password: string;
    role?: 'customer' | 'provider';
}


export interface RegisterCustomerData {
    userName: string;
    email: string;
    password: string;
    fullName: string;
    phone: string;
    profileImage?: File | null;
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
    serviceCategory?: string;
    experience?: string;
    location?: string;
    serviceArea?: string;
    pricing?: string;
    availability?: string;
    certifications?: string;
    profileImage?: File | null;
}


export const authAPI = {
   
    registerCustomer: async (data: RegisterCustomerData): Promise<AuthResponse> => {
        const formData = new FormData();
        formData.append('userName', data.userName);
        formData.append('email', data.email);
        formData.append('password', data.password);
        formData.append('fullName', data.fullName);
        formData.append('phone', data.phone);
        if (data.profileImage) {
            formData.append('profileImage', data.profileImage);
        }
        const response = await api.post('/auth/register/customer', formData);
        return response.data.data;
    },

    
    registerProvider: async (data: RegisterProviderData): Promise<AuthResponse> => {
        const formData = new FormData();
        formData.append('userName', data.userName);
        formData.append('email', data.email);
        formData.append('password', data.password);
        formData.append('fullName', data.fullName);
        formData.append('phone', data.phone);
        formData.append('displayName', data.displayName);
        formData.append('businessName', data.businessName);
        formData.append('description', data.description);
        if (data.serviceCategory) formData.append('serviceCategory', data.serviceCategory);
        if (data.experience) formData.append('experience', data.experience);
        if (data.location) formData.append('location', data.location);
        if (data.serviceArea) formData.append('serviceArea', data.serviceArea);
        if (data.pricing) formData.append('pricing', data.pricing);
        if (data.availability) formData.append('availability', data.availability);
        if (data.certifications) formData.append('certifications', data.certifications);
        if (data.profileImage) {
            formData.append('profileImage', data.profileImage);
        }
        const response = await api.post('/auth/register/provider', formData);
        return response.data.data;
    },

   
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', credentials);
        return response.data.data;
    },

   
    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
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
    }): Promise<AuthResponse> => {
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

// FIX Bug 1: Wrapped JSON.parse in try/catch to prevent crash on corrupted storage data
export const getUser = (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr) as User;
    } catch {
        localStorage.removeItem('user'); // Clean up corrupt data
        return null;
    }
};

export default authAPI;