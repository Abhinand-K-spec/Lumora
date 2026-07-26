import api from '../api/axios';
import type {  ForgotPasswordRequest, ResendOtpRequest, ResetPasswordRequest, VerifyEmailRequest } from '../types/auth';

const authService = {
    register:async(data:unknown)=>{
        const response = await api.post('/auth/register',data);

        return response.data;
    },

    login:async(data:unknown)=>{
        const response = await api.post('/auth/login',data);

        return response.data;
    },

    logout() {
        return api.post('/auth/logout');
    },

    getCurrentUser(){
        return api.get('/app/me')
    },

    verifyEmail:async(data:VerifyEmailRequest)=>{
        const response = await api.post('/auth/verifyEmail',data);
        return response.data;
    },

    resendOtp:async(data:ResendOtpRequest)=>{
        const response = await api.post('auth/resendOtp',data);
        return response.data;
    },

    resetPasword:async(data:ResetPasswordRequest)=>{
        const response = await api.post('/auth/resetPassword',data);
        return response.data;
    },

    verifyResetOtp:async(data:VerifyEmailRequest)=>{
        const response = await api.post('/auth/verifyResendOtp',data);
        return response.data;
    },

    forgetPassword:async(data:ForgotPasswordRequest)=>{
        const response = await api.post('/auth/forgotPassword',data);
        return response.data;
    }
};

export default authService;