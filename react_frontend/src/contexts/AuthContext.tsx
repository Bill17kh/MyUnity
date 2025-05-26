// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AuthService from '../services/auth.service';
import { AuthContextType, AuthState, User } from '../types/auth.types';

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>(() => {
        // Initialize state from localStorage
        const token = AuthService.getToken();
        const user = AuthService.getCurrentUser();
        return {
            isAuthenticated: !!token && !!user,
            user: user,
            token: token,
            loading: false, // Initial loading state can be true if you fetch user data on load
            error: null,
        };
    });

    const setLoading = useCallback((loading: boolean) => {
        setAuthState(prevState => ({ ...prevState, loading }));
    }, []);

    const setError = useCallback((error: string | null) => {
        setAuthState(prevState => ({ ...prevState, error, loading: false }));
    }, []);

    const login = useCallback((token: string, user: User) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        setAuthState({
            isAuthenticated: true,
            user: user,
            token: token,
            loading: false,
            error: null,
        });
    }, []);

    const logout = useCallback(() => {
        AuthService.logout();
        setAuthState({
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
            error: null,
        });
        // Optionally redirect to login page using useNavigate() from react-router-dom
        // navigate('/login');
    }, []);

    // Optional: Add effect to verify token validity on app load or periodically
    // useEffect(() => {
    //     const verifyToken = async () => {
    //         if (authState.token) {
    //             try {
    //                 setLoading(true);
    //                 // Example: Call an endpoint like /api/auth/validate or /api/user/me
    //                 // const validatedUser = await UserService.getProfile(); 
    //                 // if (!validatedUser) throw new Error('Invalid session');
    //                 // If validation fails, call logout()
    //             } catch (err) {
    //                 console.error("Token validation failed:", err);
    //                 logout(); 
    //             } finally {
    //                 setLoading(false);
    //             }
    //         }
    //     };
    //     verifyToken();
    // }, [authState.token, logout]); // Dependency array needs careful consideration

    const contextValue: AuthContextType = {
        ...authState,
        login,
        logout,
        setLoading,
        setError,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Export the context itself if needed, or just the provider and hook
export default AuthContext;

