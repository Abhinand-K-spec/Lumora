import { useEffect, useState, type ReactNode } from "react";
import { AdminAuthContext } from "./AdminAuthContext";
import type { LoginFormData } from "../schemas/auth/loginSchema";
import authService from "../services/authService";
import type { User } from "../types/user";

interface AdminAuthProviderProps {
  children: ReactNode;
}

const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // login function
  const login = async (data: LoginFormData) => {
    const response = await authService.login(data);
    setIsAuthenticated(true);
    setAdmin(response.data.user);
    return response;
  };

  // getAdmin function
  const getCurrentAdmin = async () => {
    try {
      const response = await authService.getCurrentUser();
      
      setAdmin(response.data.user);
      setIsAuthenticated(true);
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
  const logout = async () => {
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
