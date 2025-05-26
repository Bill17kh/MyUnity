// src/services/api.ts
import axios from 'axios';

// Retrieve the backend API URL from environment variables
// Fallback to localhost for development if the variable is not set
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const instance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Optional: Add a request interceptor to include the JWT token in headers
instance.interceptors.request.use(
    (config) => {
        // Attempt to get the token from localStorage (or wherever you store it)
        const token = localStorage.getItem('authToken'); // Adjust key if needed
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optional: Add a response interceptor for handling common errors (like 401 Unauthorized)
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access, e.g., redirect to login or clear auth state
            console.error("Unauthorized access - 401");
            // Example: Trigger logout or redirect
            // window.location.href = '/login'; // Or use React Router's navigate
            localStorage.removeItem('authToken'); // Clear token
            localStorage.removeItem('user'); // Clear user info
            // Potentially update auth context state here if applicable
        }
        return Promise.reject(error);
    }
);

export default instance;

