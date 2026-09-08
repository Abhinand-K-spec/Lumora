import api from "../api/axios";
import type { ApiResponse } from "../types/api";
import type { User, accountStatus } from "../types/user";

export interface UserStats {
  total: number;
  active: number;
  suspended: number;
}

export interface PaginatedUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: UserStats;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

const adminUserService = {
  getUsers: async (
    params?: GetUsersParams
  ): Promise<ApiResponse<PaginatedUsersResponse>> => {
    const response = await api.get<ApiResponse<PaginatedUsersResponse>>(
      "/admin/userManagement/users",
      { params }
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
