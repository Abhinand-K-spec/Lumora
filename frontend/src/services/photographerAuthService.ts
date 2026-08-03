
import api from "../api/axios";
import type {
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResendOtpRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
} from "../types/auth";

const photographerAuthService = {
    register: async (data: RegisterRequest) => {
        const response = await api.post(
            "/photographer/auth/register",
            data
        );
        return response.data;
    },

    login: async (data: LoginRequest) => {
        const response = await api.post(
            "/photographer/auth/login",
            data
        );
        return response.data;
    },

    logout: async () => {
        const response = await api.post(
            "/photographer/auth/logout"
        );
        return response.data;
    },

    getCurrentPhotographer: async () => {
        const response = await api.get(
            "/photographer/auth/me"
        );
        return response.data;
    },

    verifyEmail: async (data: VerifyEmailRequest) => {
        const response = await api.post(
            "/photographer/auth/verifyEmail",
            data
        );
        return response.data;
    },

    resendOtp: async (data: ResendOtpRequest) => {
        const response = await api.post(
            "/photographer/auth/resendOtp",
            data
        );
        return response.data;
    },

    verifyResetOtp: async (data: VerifyEmailRequest) => {
        const response = await api.post(
            "/photographer/auth/verifyResendOtp",
            data
        );
        return response.data;
    },

    forgotPassword: async (data: ForgotPasswordRequest) => {
        const response = await api.post(
            "/photographer/auth/forgotPassword",
            data
        );
        return response.data;
    },

    resetPassword: async (data: ResetPasswordRequest) => {
        const response = await api.post(
            "/photographer/auth/resetPassword",
            data
        );
        return response.data;
    },

    googleLogin: () => {
        window.location.href =
            "http://localhost:3000/api/photographer/auth/google";
    },
};

export default photographerAuthService;