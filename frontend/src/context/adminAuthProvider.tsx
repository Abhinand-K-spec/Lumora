import { useEffect, useState, type ReactNode } from "react";
import { AdminAuthContext } from "./AdminAuthContext";
import type { LoginFormData } from "../schemas/auth/loginSchema";
import adminAuthService from "../services/adminAuthService";
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
    const response = await adminAuthService.login(data);
    setIsAuthenticated(true);
    setAdmin(response.data.admin);
    return response;
  };

  // getAdmin function
  const getCurrentAdmin = async () => {
    try {
      const response = await adminAuthService.getCurrentAdmin();
      
      setAdmin(response.data.admin);
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
    await adminAuthService.logout();
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
