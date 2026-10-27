import api from "../api/axios";
import type { ApiResponse } from "../types/api";
import type { UpdateProfileRequest, UserProfile } from "../types/profile";
import type { PhotographerProfile } from "./photographerService";

const userService = {
  getProfile: async (): Promise<ApiResponse<{ user: UserProfile }>> => {
    const response =
      await api.get<ApiResponse<{ user: UserProfile }>>("/app/profile");
    return response.data;
  },

  updateProfile: async (
    data: UpdateProfileRequest,
  ): Promise<ApiResponse<{ user: UserProfile }>> => {
    const response = await api.patch<ApiResponse<{ user: UserProfile }>>(
      "/app/profile",
      data,
    );
    return response.data;
  },

  uploadProfilePhoto: async (
    file: File,
  ): Promise<ApiResponse<{ photoUrl: string }>> => {
    const formData = new FormData();
    formData.append("photo", file);

    const response = await api.post<ApiResponse<{ photoUrl: string }>>(
      "/app/profile/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  toggleSavePhotographer: async (
    photographerId: string,
  ): Promise<ApiResponse<{ isSaved: boolean }>> => {
    const response = await api.post<ApiResponse<{ isSaved: boolean }>>(
      `/app/saved-photographers/${photographerId}`,
    );
    return response.data;
  },

  getSavedPhotographers: async (): Promise<
    ApiResponse<{ photographers: PhotographerProfile[] }>
  > => {
    const response = await api.get<
      ApiResponse<{ photographers: PhotographerProfile[] }>
    >("/app/saved-photographers");
    return response.data;
  },

  getSavedPhotographerIds: async (): Promise<
    ApiResponse<{ savedIds: string[] }>
  > => {
    const response = await api.get<ApiResponse<{ savedIds: string[] }>>(
      "/app/saved-photographers/ids",
    );
    return response.data;
  },

  checkIsPhotographerSaved: async (
    photographerId: string,
  ): Promise<ApiResponse<{ isSaved: boolean }>> => {
    const response = await api.get<ApiResponse<{ isSaved: boolean }>>(
      `/app/saved-photographers/${photographerId}/status`,
    );
    return response.data;
  },
};

export default userService;
