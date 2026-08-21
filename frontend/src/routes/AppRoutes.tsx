import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Home from "../pages/home/Home";
import ProtectedRoute from "./ProtectedRoute";
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";
import VerifyEmailPage from "../pages/auth/VerifyEmail";
import ResetPasswordPage from "../pages/auth/ResetPassword";
import ForgetPassword from "../pages/auth/ForgetPassword";
import PublicRoute from "./PublicRoutes";
import AdminLogin from "../pages/auth/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminRoute from "./AdminRoute";
import AdminPublicRoute from "./AdminPublicRoute";
import UserManagement from "../pages/admin/UserManagement";
import Profile from '../pages/user/Profile';

const AppRoutes = () => {
  return (
    <div>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<AdminPublicRoute />}>
          <Route path="/admin/login" element={<AdminLogin />} />
        </Route>
        <Route path="/verifyEmail" element={<VerifyEmailPage />} />
        <Route path="/resetPassword" element={<ResetPasswordPage />} />
        <Route path="/forgotPassword" element={<ForgetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<UserLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile/>}/>
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />}></Route>
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

export default AppRoutes;
