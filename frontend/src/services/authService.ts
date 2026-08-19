import api from "../api/axios";
import type { ApiResponse } from "../types/api";
import type { User } from "../types/user";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResendOtpRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "../types/auth";

const authService = {
  register: async (data: RegisterRequest): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post<ApiResponse<{ user: User }>>(
      "/auth/login",
      data,
    );
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>("/auth/logout");
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>("/auth/me");
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailRequest): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>("/auth/verify-email", data);
    return response.data;
  },

  resendOtp: async (data: ResendOtpRequest): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>("/auth/resend-otp", data);
    return response.data;
  },

  verifyResetOtp: async (data: VerifyEmailRequest): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(
      "/auth/verify-reset-otp",
      data,
    );
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>("/auth/forgot-password", data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>("/auth/reset-password", data);
    return response.data;
  },

  googleLogin: (): void => {
    window.location.href = "http://localhost:3000/api/auth/google";
  },
};

export default authService;
