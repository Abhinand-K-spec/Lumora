import { useEffect, useState, type ReactNode } from "react";
import { AdminAuthContext } from "./AdminAuthContext";
import type { LoginFormData } from "../schemas/auth/loginSchema";
import authService from "../services/authService";
import type { User } from "../types/user";
import type { ApiResponse } from "../types/api";

interface AdminAuthProviderProps {
  children: ReactNode;
}

const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // login function
  const login = async (
    data: LoginFormData,
  ): Promise<ApiResponse<{ user: User }>> => {
    const response = await authService.login(data);
    const user = response.data.user;
    if (user.role === "ADMIN") {
      setIsAuthenticated(true);
      setAdmin(user);
      return response;
    } else {
      await authService.logout();
      setIsAuthenticated(false);
      setAdmin(null);
      throw new Error("Unauthorized access. Admin role required.");
    }
  };

  // getAdmin function
  const getCurrentAdmin = async (): Promise<void> => {
    try {
      const response = await authService.getCurrentUser();
      const user = response.data.user;

      if (user.role === "ADMIN") {
        setAdmin(user);
        setIsAuthenticated(true);
      } else {
        setAdmin(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error(error);
      setAdmin(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      if (window.location.pathname.startsWith("/admin")) {
        await getCurrentAdmin();
      } else {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  // logout function
  const logout = async (): Promise<void> => {
    await authService.logout();
    setIsAuthenticated(false);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthProvider;
