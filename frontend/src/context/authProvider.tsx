import { useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { LoginFormData } from "../schemas/auth/loginSchema";
import authService from "../services/authService";
import type { User } from "../types/user";
import type { ApiResponse } from "../types/api";

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // login function

  const login = async (
    data: LoginFormData,
  ): Promise<ApiResponse<{ user: User }>> => {
    const response = await authService.login(data);
    const user = response.data.user;

    if (user.role !== "ADMIN") {
      setIsAuthenticated(true);
      setUser(user);
      return response;
    } else {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      throw new Error("Unauthorized access. Admin role not permitted here.");
    }
  };

  //getUser function
  const getCurrentUser = async (): Promise<void> => {
    try {
      const response = await authService.getCurrentUser();
      const user = response.data.user;

      if (user.role !== "ADMIN") {
        setUser(user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error(error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeauth = async () => {
      if (!window.location.pathname.startsWith("/admin")) {
        await getCurrentUser();
      } else {
        setLoading(false);
      }
    };
    initializeauth();
  }, []);

  //logout function

  const logout = async (): Promise<void> => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
