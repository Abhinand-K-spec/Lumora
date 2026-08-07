import api from "../api/axios";
import type { accountStatus } from "../types/user";

const adminUserService = {
    getUsers: async () => {
        const response = await api.get("/admin/userManagement/users");
        return response.data;
    },

    getUserById: async (id: string) => {
        const response = await api.get(`/admin/userManagement/users/${id}`);
        return response.data;
    },

    changeStatus: async (id: string, status: accountStatus) => {
        const response = await api.patch(`/admin/userManagement/users/${id}/status`, { status });

        return response.data;
    },

    deleteUser: async (id: string) => {
        const response = await api.delete(`/admin/userManagement/users/${id}/delete`);

        return response.data;
    },
};

export default adminUserService;