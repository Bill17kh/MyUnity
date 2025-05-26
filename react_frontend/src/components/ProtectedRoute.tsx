// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
    allowedRoles?: string[]; // Optional: Specify roles allowed to access this route
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { isAuthenticated, user, loading } = useAuth();

    // Optional: Show a loading indicator while auth state is being determined
    if (loading) {
        // You can replace this with a proper loading spinner component
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        // Redirect to login page if not authenticated
        return <Navigate to="/login" replace />;
    }

    // Check roles if allowedRoles are specified
    if (allowedRoles && allowedRoles.length > 0) {
        const userRoles = user?.roles || [];
        const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

        if (!hasRequiredRole) {
            // Redirect to an unauthorized page or home page if roles don't match
            // For simplicity, redirecting to dashboard here, but an "Unauthorized" page is better UX
            console.warn(`User does not have required roles: ${allowedRoles.join(', ')}`);
            return <Navigate to="/dashboard" replace />; // Or create a specific /unauthorized route
        }
    }

    // Render the protected component if authenticated (and roles match, if applicable)
    return <Outlet />; // Renders the nested child route components
};

export default ProtectedRoute;

