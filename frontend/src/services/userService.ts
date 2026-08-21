import api from '../api/axios';
import type { ApiResponse } from '../types/api';
import type { UpdateProfileRequest, UserProfile } from '../types/profile';


const userService = {
    getProfile : async():Promise<ApiResponse<{user:UserProfile}>> =>{
        const response = await api.get<ApiResponse<{user:UserProfile}>>('/app/profile');
        return response.data
    },

    updateProfile : async(data:UpdateProfileRequest):Promise<ApiResponse<{user:UserProfile}>> =>{
        const response = await api.patch<ApiResponse<{user:UserProfile}>>('/app/profile',data);
        return response.data;
    }
}


export default userService;