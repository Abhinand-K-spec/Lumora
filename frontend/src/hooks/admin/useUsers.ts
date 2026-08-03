import { useEffect, useState } from "react";
import { toast } from "sonner";

import adminUserService from "../../services/adminUserService";
import type { User } from "../../types/user";
import { accountStatus } from "../../../../backend/src/shared/enums/accountStatus";

export const useUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);

        try {
            const response = await adminUserService.getUsers();

            setUsers(response.data);
        } catch (error) {
            toast.error("Failed to fetch users.");
            console.log(error);
            
        } finally {
            setLoading(false);
        }
    };

    const changeStatus = async (
        id: string,
        status: accountStatus
    ) => {
        try {
            await adminUserService.changeStatus(id, status);

            toast.success("User status updated.");

            await fetchUsers();
        } catch (error) {
            toast.error("Unable to update user status.");
            console.log(error);
            
        }
    };

    const deleteUser = async (id: string) => {
        try {
            await adminUserService.deleteUser(id);

            toast.success("User deleted successfully.");

            await fetchUsers();
        } catch (error) {
            toast.error("Unable to delete user.");
            console.log(error);
            
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return {
        users,
        loading,
        fetchUsers,
        changeStatus,
        deleteUser,
    };
};