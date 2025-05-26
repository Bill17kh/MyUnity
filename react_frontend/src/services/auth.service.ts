// src/services/auth.service.ts
import api from './api';
import { LoginRequest, SignupRequest } from '../types/auth.types'; // Assuming these types are defined
import { LoginResponse, MessageResponse } from '../types/auth.types';

const AuthService = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        try {
            const response = await api.post<LoginResponse>('/auth/signin', credentials);
            // Store token and user info upon successful login
            if (response.data.token) {
                localStorage.setItem('authToken', response.data.token);
                // Store user details separately or derive from token if needed
                localStorage.setItem('user', JSON.stringify({
                    id: response.data.id,
                    username: response.data.username,
                    email: response.data.email,
                    roles: response.data.roles
                }));
            }
            return response.data;
        } catch (error) {
            console.error('Login failed:', error);
            // Rethrow or handle error appropriately (e.g., return a specific error structure)
            throw error;
        }
    },

    register: async (userData: SignupRequest): Promise<MessageResponse> => {
        try {
            const response = await api.post<MessageResponse>('/auth/signup', userData);
            return response.data;
        } catch (error) {
            console.error('Registration failed:', error);
            // Rethrow or handle error appropriately
            throw error;
        }
    },

    logout: (): void => {
        // Clear token and user info from storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        // Optionally: Call a backend logout endpoint if it exists
        // api.post('/auth/signout');
    },

    getCurrentUser: (): { id: number; username: string; email: string; roles: string[] } | null => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
                localStorage.removeItem('user'); // Clear corrupted data
                return null;
            }
        }
        return null;
    },

    getToken: (): string | null => {
        return localStorage.getItem('authToken');
    }
};

export default AuthService;

