import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return null; // App-level loader handles this

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.isBlocked) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their own dashboard if they try accessing wrong role's page
        return <Navigate to={`/dashboard/${user.role.toLowerCase()}`} replace />;
    }

    return children;
};

export default ProtectedRoute;
