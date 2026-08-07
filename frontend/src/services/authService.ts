import api from "../api/axios";
import type {
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResendOtpRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
} from "../types/auth";

const authService = {
    register: async (data: RegisterRequest) => {
        const response = await api.post("/auth/register", data);
        return response.data;
    },

    login: async (data: LoginRequest) => {
        const response = await api.post("/auth/login", data);
        return response.data;
    },

    logout: async () => {
        const response = await api.post("/auth/logout");
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get("/auth/me");
        return response.data;
    },

    verifyEmail: async (data: VerifyEmailRequest) => {
        const response = await api.post("/auth/verify-email", data);
        return response.data;
    },

    resendOtp: async (data: ResendOtpRequest) => {
        const response = await api.post("/auth/resend-otp", data);
        return response.data;
    },

    verifyResetOtp: async (data: VerifyEmailRequest) => {
        const response = await api.post("/auth/verify-reset-otp", data);
        return response.data;
    },

    forgotPassword: async (data: ForgotPasswordRequest) => {
        const response = await api.post("/auth/forgot-password", data);
        return response.data;
    },

    resetPassword: async (data: ResetPasswordRequest) => {
        const response = await api.post("/auth/reset-password", data);

        return response.data;
    },

    googleLogin: () => {
        window.location.href = "http://localhost:3000/api/auth/google";
    },
};

export default authService;