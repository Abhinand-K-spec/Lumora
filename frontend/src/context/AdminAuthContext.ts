import { createContext } from "react";
import type { LoginFormData } from "../schemas/auth/loginSchema";
import type { User } from "../types/user";

interface adminAuthContextType {
    isAuthenticated: boolean;
    loading: boolean;
    admin: User | null;
    login: (data: LoginFormData) => Promise<unknown>;
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
