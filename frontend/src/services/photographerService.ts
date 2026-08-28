import api from '../api/axios';
import type { ApiResponse } from '../types/api';
import type { UserProfile } from '../types/profile';

export interface PackageItem {
    _id: string;
    packageName: string;
    photographerId: string;
    price: number;
    description: string;
    framesIncluded: boolean;
    droneIncluded: boolean;
    albumIncluded: boolean;
    videographersIncluded: boolean;
    status: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PhotographerProfile extends UserProfile {
    bio: string;
    coverPhoto?: string;
    location?: string;
    languages?: string[];
    specialities?: string[];
    equipment?: string[];
    serviceRegions?: string[];
    packages?: PackageItem[];
    experienceYears?: number;
    rating?: number;
    reviewsCount?: number;
    totalBookings?: number;
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

    getPhotographers: async (params: { search?: string; district?: string; service?: string; price?: string; }): Promise<ApiResponse<{ photographers: PhotographerProfile[] }>> => {
        const response = await api.get<ApiResponse<{ photographers: PhotographerProfile[] }>>('/photographer', { params });
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
    },

    uploadCoverPhoto: async (file: File): Promise<ApiResponse<{ coverPhotoUrl: string }>> => {
        const formData = new FormData();
        formData.append('photo', file);

        const response = await api.post<ApiResponse<{ coverPhotoUrl: string }>>(
            '/photographer/profile/upload-cover',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    addPackage: async (data: Omit<PackageItem, '_id' | 'photographerId'>): Promise<ApiResponse<{ photographer: PhotographerProfile }>> => {
        const response = await api.post<ApiResponse<{ photographer: PhotographerProfile }>>('/photographer/profile/packages', data);
        return response.data;
    },

    editPackage: async (packageId: string, data: Omit<PackageItem, '_id' | 'photographerId'>): Promise<ApiResponse<{ photographer: PhotographerProfile }>> => {
        const response = await api.put<ApiResponse<{ photographer: PhotographerProfile }>>(`/photographer/profile/packages/${packageId}`, data);
        return response.data;
    },

    deletePackage: async (packageId: string): Promise<ApiResponse<{ photographer: PhotographerProfile }>> => {
        const response = await api.delete<ApiResponse<{ photographer: PhotographerProfile }>>(`/photographer/profile/packages/${packageId}`);
        return response.data;
    },

    getPhotographerById: async (userId: string): Promise<ApiResponse<{ photographer: PhotographerProfile }>> => {
        const response = await api.get<ApiResponse<{ photographer: PhotographerProfile }>>(`/photographer/${userId}`);
        return response.data;
    }
};

export default photographerService;