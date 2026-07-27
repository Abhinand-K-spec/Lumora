import { useContext } from "react";
import { AdminAuthContext } from "../context/AdminAuthContext";

const useAdminAuth = () => {
    return useContext(AdminAuthContext);
};

export default useAdminAuth;
