import api from "../api/axios";
import type { ApiResponse } from "../types/api";
import type { User, accountStatus } from "../types/user";

const adminUserService = {
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get<ApiResponse<User[]>>(
      "/admin/userManagement/users",
    );
    return response.data;
  },

  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>(
      `/admin/userManagement/users/${id}`,
    );
    return response.data;
  },

  changeStatus: async (
    id: string,
    status: accountStatus,
  ): Promise<ApiResponse<User>> => {
    const response = await api.patch<ApiResponse<User>>(
      `/admin/userManagement/users/${id}/status`,
      { status },
    );
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(
      `/admin/userManagement/users/${id}/delete`,
    );
    return response.data;
  },
};

export default adminUserService;
