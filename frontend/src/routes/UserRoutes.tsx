import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const UserRoute = () => {
  const { user } = useAuth();

  if (user?.role !== "USER") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default UserRoute;