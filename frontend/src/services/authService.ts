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
import API_ENDPOINTS from "../constants/apiEndpoints";

const authService = {
  register: async (data: RegisterRequest): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post<ApiResponse<{ user: User }>>(
      API_ENDPOINTS.AUTH.LOGIN,
      data,
    );
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailRequest): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data);
    return response.data;
  },

  resendOtp: async (data: ResendOtpRequest): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(API_ENDPOINTS.AUTH.RESEND_OTP, data);
    return response.data;
  },

  verifyResetOtp: async (data: VerifyEmailRequest): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(
      API_ENDPOINTS.AUTH.VERIFY_RESET_OTP,
      data,
    );
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
    return response.data;
  },

  googleLogin: (): void => {
    window.location.href = "http://localhost:3000/api/auth/google";
  },
};

export default authService;
