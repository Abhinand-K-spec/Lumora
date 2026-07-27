import { Navigate, Outlet } from "react-router-dom";
import useAuth from '../hooks/useAuth';
import useAdminAuth from '../hooks/useAdminAuth';

export default function PublicRoute() {
    const { isAuthenticated: isUserAuth } = useAuth();
    const { isAuthenticated: isAdminAuth } = useAdminAuth();

    if (isUserAuth) {
        return <Navigate to="/" replace />;
    }

    if (isAdminAuth) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return <Outlet />;
}