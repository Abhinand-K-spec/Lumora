import { createContext } from "react";
import type { LoginFormData } from "../schemas/auth/loginSchema";
import type { User } from "../types/user";


interface authContextType{
    isAuthenticated:boolean;
    loading:boolean;
    user:User | null;
    login: (data: LoginFormData) => Promise<unknown>;
    logout:()=>void;
}


export const AuthContext = createContext<authContextType>({
    isAuthenticated:false,
    loading:true,
    user:null,
    login: async () => {
        throw new Error("login function not implemented");
    },
    logout:async()=>{
        throw new Error('logout function is not implemented');
    }
})