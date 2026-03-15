import { createContext, useContext, useState, useEffect, ReactNode, FC, ReactElement } from 'react';
import { authAPI, setTokens, clearTokens, setUser, getUser, User, CurrentUserResponse } from '../services/auth';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (identifier: string, password: string, role?: 'customer' | 'provider') => Promise<void>;
    googleLogin: (googleToken: string, role?: 'customer' | 'provider') => Promise<AuthResult>;
    completeProviderProfile: (data: {
        displayName: string;
        phone: string;
        businessName: string;
        description: string;
    }) => Promise<void>;
    registerCustomer: (data: {
        userName: string;
        email: string;
        password: string;
        fullName: string;
        phone: string;
        profileImage?: File | null;
    }) => Promise<void>;
    registerProvider: (data: {
        userName: string;
        email: string;
        password: string;
        fullName: string;
        phone: string;
        displayName: string;
        businessName: string;
        description: string;
        profileImage?: File | null;
    }) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthResult {
    requiresProviderProfileCompletion?: boolean;
}

const mergeUserProfile = (payload: CurrentUserResponse): User => {
    const baseUser = payload.user;
    const profile = payload.profile as Record<string, any> | null;
    const profileData = payload.profileData || {};

    return {
        ...baseUser,
        ...profileData,
        phone: profileData.phone || profile?.phone || baseUser.phone,
        profileImage: profileData.profileImage || profile?.profileImage || baseUser.profileImage,
        location: profileData.location || profile?.location || null,
        isProvider: baseUser.role === 'provider',
        displayName: profileData.displayName || profile?.displayName,
        businessName: profileData.businessName || profile?.businessName,
        description: profileData.description || profile?.description,
        verified: Boolean(profileData.verified ?? profile?.verified),
        rating: Number(profileData.rating ?? profile?.ratingSummary?.avg ?? 0),
        reviewCount: Number(profileData.reviewCount ?? profile?.ratingSummary?.count ?? 0),
        completedJobs: Number(profileData.completedJobs ?? profile?.reviewCount ?? 0),
    };
};

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }): ReactElement => {
    const [user, setUserState] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const bootstrapAuth = async () => {
            const storedUser = getUser();
            const token = localStorage.getItem('accessToken');

            if (storedUser && token) {
                setUserState(storedUser);
                try {
                    await refreshUser();
                } catch {
                    clearTokens();
                    setUserState(null);
                }
            }

            setIsLoading(false);
        };

        bootstrapAuth();
    }, []);

    const login = async (identifier: string, password: string, role?: 'customer' | 'provider') => {
        const normalizedIdentifier = identifier.trim();
        console.log('[AuthContext] login called', {
            identifier: normalizedIdentifier,
            passwordLength: password.length,
            role: role ?? 'not_provided',
        });
        const response = await authAPI.login({ identifier: normalizedIdentifier, password, role });

        setTokens(response.accessToken, response.refreshToken);
        setUser(response.user);
        setUserState(response.user);
        await refreshUser();
    };

    const googleLogin = async (googleToken: string, role: 'customer' | 'provider' = 'customer'): Promise<AuthResult> => {
        const response = await authAPI.googleLogin(googleToken, role);

        setTokens(response.accessToken, response.refreshToken);
        setUser(response.user);
        setUserState(response.user);
        await refreshUser();
        return { requiresProviderProfileCompletion: response.requiresProviderProfileCompletion };
    };

    const completeProviderProfile = async (data: {
        displayName: string;
        phone: string;
        businessName: string;
        description: string;
    }) => {
        await authAPI.completeProviderProfile(data);
        await refreshUser();
    };

    const registerCustomer = async (data: {
        userName: string;
        email: string;
        password: string;
        fullName: string;
        phone: string;
        profileImage?: File | null;
    }) => {
        const response = await authAPI.registerCustomer(data);

        setTokens(response.accessToken, response.refreshToken);
        setUser(response.user);
        setUserState(response.user);
        await refreshUser();
    };

    const registerProvider = async (data: {
        userName: string;
        email: string;
        password: string;
        fullName: string;
        phone: string;
        displayName: string;
        businessName: string;
        description: string;
        profileImage?: File | null;
    }) => {
        const response = await authAPI.registerProvider(data);

        setTokens(response.accessToken, response.refreshToken);
        setUser(response.user);
        setUserState(response.user);
        await refreshUser();
    };

    const logout = () => {
        authAPI.logout().catch(() => {});
        clearTokens();
        setUserState(null);
    };

    const refreshUser = async () => {
        try {
            const currentUserPayload = await authAPI.getCurrentUser();
            const mergedUser = mergeUserProfile(currentUserPayload);
            setUser(mergedUser);
            setUserState(mergedUser);
        } catch (error) {
            logout();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                googleLogin,
                completeProviderProfile,
                registerCustomer,
                registerProvider,
                logout,
                refreshUser,
            }}
        >
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

export default AuthContext;
