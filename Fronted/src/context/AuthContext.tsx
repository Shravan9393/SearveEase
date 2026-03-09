import { createContext, useContext, useState, useEffect, ReactNode, FC, ReactElement } from 'react';
import { authAPI, setTokens, clearTokens, setUser, getUser, User } from '../services/auth';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    googleLogin: (googleToken: string) => Promise<void>;
    registerCustomer: (data: {
        userName: string;
        email: string;
        password: string;
        fullName: string;
        phone: string;
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
    }) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }): ReactElement => {
    const [user, setUserState] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing user on mount
        const storedUser = getUser();
        const tokens = localStorage.getItem('accessToken');
        
        if (storedUser && tokens) {
            setUserState(storedUser);
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response = await authAPI.login({ email, password });
        
        setTokens(response.accessToken, response.refreshToken);
        setUser(response.user);
        setUserState(response.user);
    };

    const googleLogin = async (googleToken: string) => {
        const response = await authAPI.googleLogin(googleToken);
        
        setTokens(response.accessToken, response.refreshToken);
        setUser(response.user);
        setUserState(response.user);
    };

    const registerCustomer = async (data: {
        userName: string;
        email: string;
        password: string;
        fullName: string;
        phone: string;
    }) => {
        const response = await authAPI.registerCustomer(data);
        
        setTokens(response.accessToken, response.refreshToken);
        setUser(response.user);
        setUserState(response.user);
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
    }) => {
        const response = await authAPI.registerProvider(data);
        
        setTokens(response.accessToken, response.refreshToken);
        setUser(response.user);
        setUserState(response.user);
    };

    const logout = () => {
        authAPI.logout().catch(() => {});
        clearTokens();
        setUserState(null);
    };

    const refreshUser = async () => {
        try {
            const currentUser = await authAPI.getCurrentUser();
            setUser(currentUser);
            setUserState(currentUser);
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
