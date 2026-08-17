import { createContext } from "react";
import type { LoginFormData } from "../schemas/auth/loginSchema";
import type { User } from "../types/user";
import type { ApiResponse } from "../types/api";

interface adminAuthContextType {
    isAuthenticated: boolean;
    loading: boolean;
    admin: User | null;
    login: (data: LoginFormData) => Promise<ApiResponse<{ user: User }>>;
    logout: () => void;
}

export const AdminAuthContext = createContext<adminAuthContextType>({
    isAuthenticated: false,
    loading: true,
    admin: null,
    login: async () => {
        throw new Error("login function not implemented");
    },
    logout: async () => {
        throw new Error("logout function not implemented");
    }
});
