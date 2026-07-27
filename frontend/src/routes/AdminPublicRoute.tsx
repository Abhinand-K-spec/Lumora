import { Navigate, Outlet } from "react-router-dom";
import useAdminAuth from "../hooks/useAdminAuth";
import useAuth from "../hooks/useAuth";

const AdminPublicRoute = () => {
    const { isAuthenticated: isAdminAuth, loading } = useAdminAuth();
    const { isAuthenticated: isUserAuth } = useAuth();

    if (loading) {
        return <>Loading...</>;
    }

    if (isAdminAuth) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (isUserAuth) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminPublicRoute;
