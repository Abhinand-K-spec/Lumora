import { Navigate, Outlet } from "react-router-dom";
import useAdminAuth from "../hooks/useAdminAuth";

const AdminRoute = () => {
    const { isAuthenticated, admin, loading } = useAdminAuth();
    if (loading) {
        return <>Loading...</>;
    }

    if (!isAuthenticated || admin?.role !== "ADMIN") {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
