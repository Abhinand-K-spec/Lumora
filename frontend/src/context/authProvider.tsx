import {  useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { LoginFormData } from "../schemas/auth/loginSchema";
import authService from "../services/authService";
import type { User } from "../types/user";


interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User|null>(null);


  // login function

  const login = async(data:LoginFormData)=>{

    const response = await authService.login(data);
  
    
    setIsAuthenticated(true);
    setUser(response.data.user);
  
    return response;
  }


//logout function 

const logout = ()=>{
  setIsAuthenticated(false);
  setUser(null);
}

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};





export default AuthProvider;