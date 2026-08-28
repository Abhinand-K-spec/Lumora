import api from '../api/axios';
import type { ApiResponse } from '../types/api';
import type { UserProfile } from '../types/profile';

export interface PhotographerProfile extends UserProfile {
    bio: string;
    coverPhoto?: string;
    location?: string;
    languages?: string[];
    specialities?: string[];
    equipment?: string[];
    serviceRegions?: string[];
}

export interface UpdatePhotographerRequest {
    name?: string;
    phone?: string;
    bio?: string;
    profilePhoto?: string;
    coverPhoto?: string;
    location?: string;
    languages?: string[];
    specialities?: string[];
    equipment?: string[];
    serviceRegions?: string[];
}

const photographerService = {
    getProfile: async (): Promise<ApiResponse<{ photographer: PhotographerProfile }>> => {
        const response = await api.get<ApiResponse<{ photographer: PhotographerProfile }>>('/photographer/profile');
        return response.data;
    },

    updateProfile: async (data: UpdatePhotographerRequest): Promise<ApiResponse<{ photographer: PhotographerProfile }>> => {
        const response = await api.patch<ApiResponse<{ photographer: PhotographerProfile }>>('/photographer/profile', data);
        return response.data;
    },

    uploadProfilePhoto: async (file: File): Promise<ApiResponse<{ photoUrl: string }>> => {
        const formData = new FormData();
        formData.append('photo', file);

        const response = await api.post<ApiResponse<{ photoUrl: string }>>(
            '/photographer/profile/upload',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }
};

export default photographerService;