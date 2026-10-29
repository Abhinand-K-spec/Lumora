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
import AdminPhotographers from "../pages/admin/AdminPhotographers";
import Profile from "../pages/user/Profile";
import PhotographerLayout from "../layouts/PhotographerLayout";
import PhotographerProfile from "../pages/photographer/PhotographerProfile";
import PhotographersList from "../pages/photographer/PhotographersList";
import PhotographerDetails from "../pages/photographer/PhotographerDetails";
import NotFound from "../pages/error/NotFound";
import useAuth from "../hooks/useAuth";
import CreateFeedPost from "../components/feed/CreateFeedPost";
import Feed from "../pages/user/Feed";
import Saved from "../pages/user/Saved";
import Bookings from "../pages/user/Bookings";
import PhotographerBookings from "../pages/photographer/PhotographerBookings";
import BookingDetails from "../pages/photographer/PhotographerBookingDetails";

const RoleBasedLayout = () => {
  const { user } = useAuth();
  if (user?.role === "PHOTOGRAPHER") {
    return <PhotographerLayout />;
  }
  return <UserLayout />;
};

const ProfileRouteSelector = () => {
  const { user } = useAuth();
  if (user?.role === "PHOTOGRAPHER") {
    return <PhotographerProfile />;
  }
  return <Profile />;
};

const HomeRouteSelector = () => {
  const { user } = useAuth();
  if (user?.role === "PHOTOGRAPHER") {
    return <Home />;
  }
  return <Feed />;
};

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
          <Route element={<RoleBasedLayout />}>
            <Route path="/" element={<HomeRouteSelector />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/profile" element={<ProfileRouteSelector />} />
            <Route path="/photographers" element={<PhotographersList />} />
            <Route
              path="/photographers/:id"
              element={<PhotographerDetails />}
            />
            <Route path="/feedPostUpload" element={<CreateFeedPost />} />
            <Route path="/photographer/bookings" element={<PhotographerBookings />} />
            <Route path="/photographer/booking/:bookingId" element={<BookingDetails/>} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />}></Route>
            <Route
              path="/admin/photographers"
              element={<AdminPhotographers />}
            />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default AppRoutes;
