import api from "../api/axios";
import type { ApiResponse } from "../types/api";
import type { PhotographerProfile } from "../types/photographerProfile";



export const photographerService = {
    getProfile : async():Promise<ApiResponse<{photographer:PhotographerProfile}>> =>{
        const res = await api.get<ApiResponse<{photographer:PhotographerProfile}>>('/photographer/profile');
        return res.data;
    },


    updateProfile : async():Promise<ApiResponse<{photographer:PhotographerProfile}>> =>{
        const res = await api.patch<ApiResponse<{photographer:PhotographerProfile}>>('/photographer/profile');
        return res.data;
    },


    updateProfilePhoto : async(file:File):Promise<ApiResponse<{photoUrl:string}>> =>{
        const formData = new FormData();
        formData.append('photo',file);

        const res = await api.post<ApiResponse<{photoUrl:string}>>('/photographer/upload',formData,{headers:{'Content-Type':'multipart/form-data'}});
        return res.data;
    }
}