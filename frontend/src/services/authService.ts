import api from '../api/axios';
import type {  ForgotPasswordRequest, ResendOtpRequest, ResetPasswordRequest, VerifyEmailRequest } from '../types/auth';

const authService = {
    register:async(data:any)=>{
        const path = data.role === 'PHOTOGRAPHER' ? '/photographer/auth/register' : '/auth/register';
        const response = await api.post(path, data);
        return response.data;
    },

    login:async(data:any)=>{
        try {
            const response = await api.post('/auth/login', data);
            return response.data;
        } catch (error) {
            try {
                const response = await api.post('/photographer/auth/login', data);
                return response.data;
            } catch (err) {
                throw error;
            }
        }
    },

    logout: async () => {
        try {
            return await api.post('/auth/logout');
        } catch (error) {
            return await api.post('/photographer/auth/logout');
        }
    },

    getCurrentUser(){
        return api.get('/app/me')
    },

    verifyEmail:async(data:VerifyEmailRequest)=>{
        try {
            const response = await api.post('/auth/verifyEmail',data);
            return response.data;
        } catch (error) {
            try {
                const response = await api.post('/photographer/auth/verifyEmail',data);
                return response.data;
            } catch (err) {
                throw error;
            }
        }
    },

    resendOtp:async(data:ResendOtpRequest)=>{
        try {
            const response = await api.post('/auth/resendOtp',data);
            return response.data;
        } catch (error) {
            try {
                const response = await api.post('/photographer/auth/resendOtp',data);
                return response.data;
            } catch (err) {
                throw error;
            }
        }
    },

    resetPassword:async(data:ResetPasswordRequest)=>{
        try {
            const response = await api.post('/auth/resetPassword',data);
            return response.data;
        } catch (error) {
            try {
                const response = await api.post('/photographer/auth/resetPassword',data);
                return response.data;
            } catch (err) {
                throw error;
            }
        }
    },

    verifyResetOtp:async(data:VerifyEmailRequest)=>{
        try {
            const response = await api.post('/auth/verifyResendOtp',data);
            return response.data;
        } catch (error) {
            try {
                const response = await api.post('/photographer/auth/verifyResendOtp',data);
                return response.data;
            } catch (err) {
                throw error;
            }
        }
    },

    forgetPassword:async(data:ForgotPasswordRequest)=>{
        try {
            const response = await api.post('/auth/forgotPassword',data);
            return response.data;
        } catch (error) {
            try {
                const response = await api.post('/photographer/auth/forgotPassword',data);
                return response.data;
            } catch (err) {
                throw error;
            }
        }
    },
    
    adminGetCurrentUser() {
        return api.get('/admin/me');
    },
    
    adminRefresh() {
        return api.post('/admin/auth/refresh');
    }
};

export default authService;