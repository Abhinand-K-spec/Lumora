import api from "../api/axios";
import type { ApiResponse } from "../types/api";

export interface ApprovalRequestItem {
  _id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  reviewedBy?: { name: string; email: string };
  photographer: {
    _id: string;
    userId: string;
    bio: string;
    phone: string;
    location: string;
    specialities: string[];
    equipment: string[];
    instagramUrl?: string;
    approvalStatus: string;
    user: {
      _id: string;
      name: string;
      email: string;
      profilePhoto?: string;
    } | null;
    packages: Array<{ price: number; packageName: string; status: string }>;
  } | null;
}

export interface ApprovalMetrics {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalReviewed: number;
  approvalRate: number;
  recentlyApproved: Array<{
    _id: string;
    photographerName: string;
    avatarUrl: string;
    reviewerName: string;
    reviewedAt: string;
  }>;
  recentlyRejected: Array<{
    _id: string;
    photographerName: string;
    avatarUrl: string;
    reviewerName: string;
    reviewedAt: string;
    rejectionReason?: string;
  }>;
}

export interface PaginatedRequestsResponse {
  items: ApprovalRequestItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const adminPhotographerService = {
  getRequests: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedRequestsResponse>> => {
    const response = await api.get<ApiResponse<PaginatedRequestsResponse>>(
      "/admin/photographers/requests",
      { params },
    );
    return response.data;
  },

  getMetrics: async (): Promise<ApiResponse<{ metrics: ApprovalMetrics }>> => {
    const response = await api.get<ApiResponse<{ metrics: ApprovalMetrics }>>(
      "/admin/photographers/metrics",
    );
    return response.data;
  },

  reviewRequest: async (
    requestId: string,
    decision: { status: "APPROVED" | "REJECTED"; rejectionReason?: string },
  ): Promise<ApiResponse<{ request: ApprovalRequestItem }>> => {
    const response = await api.patch<
      ApiResponse<{ request: ApprovalRequestItem }>
    >(`/admin/photographers/requests/${requestId}/review`, decision);
    return response.data;
  },
};

export default adminPhotographerService;
