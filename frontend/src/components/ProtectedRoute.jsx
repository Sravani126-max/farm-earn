import { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading, logout } = useContext(AuthContext);

    useEffect(() => {
        if (user && user.isBlocked) {
            logout();
        }
    }, [user, logout]);

    if (loading) return null; // App-level loader handles this

    if (!user || user.isBlocked) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles) {
        const userRole = user.role?.toLowerCase();
        const isAuthorized = allowedRoles.some(role => role.toLowerCase() === userRole);
        
        if (!isAuthorized) {
            // Redirect to their own dashboard if they try accessing wrong role's page
            return <Navigate to={`/dashboard/${user.role.toLowerCase()}`} replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
