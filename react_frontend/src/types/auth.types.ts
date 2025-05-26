// src/types/auth.types.ts - Compléter les types manquants

export interface User {
    id: number;
    username: string;
    email: string;
    roles: string[];
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

export interface AuthContextType extends AuthState {
    login: (token: string, user: User) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export interface LoginResponse {
    token: string;
    type: string;
    id: number;
    username: string;
    email: string;
    roles: string[];
}

export interface MessageResponse {
    message: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface SignupRequest {
    username: string;
    email: string;
    password: string;
    role?: string[];
}
