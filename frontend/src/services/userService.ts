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
    },

    uploadProfilePhoto:async(file:File):Promise<ApiResponse<{ photoUrl:string }>> =>{
        const formData = new FormData();
        formData.append('photo',file);

        const response = await api.post<ApiResponse<{ photoUrl:string }>>('/app/profile/upload',formData,{headers:{'Content-Type':'multipart/form-data'}});
        return response.data;
    }
}


export default userService;