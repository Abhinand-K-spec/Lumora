import api from "../api/axios";
import API_ENDPOINTS from "../constants/apiEndpoints";
import type { ApiResponse } from "../types/api";

export type QuotationStatus =
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "SUPERSEDED";

export interface QuotationLineItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface QuotationItem {
  _id: string;
  bookingId: string;
  userId:
    | string
    | {
        _id: string;
        name: string;
        email?: string;
        phone?: string;
      };
  photographerId:
    | string
    | {
        _id: string;
        name: string;
        email?: string;
        phone?: string;
      };
  quotationNumber: string;
  items: QuotationLineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  advanceAmount: number;
  remainingAmount: number;
  notes?: string;
  validUntil: string;
  status: QuotationStatus;
  submittedAt?: string;
  respondedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuotationItemDTO {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateQuotationDTO {
  items: CreateQuotationItemDTO[];
  discount?: number;
  tax?: number;
  advanceAmount: number;
  validUntil: string;
  notes?: string;
}

const quotationService = {
  create: async (
    bookingId: string,
    data: CreateQuotationDTO,
  ): Promise<ApiResponse<QuotationItem>> => {
    const response = await api.post<ApiResponse<QuotationItem>>(
      API_ENDPOINTS.QUOTATION.CREATE(bookingId),
      data,
    );

    return response.data;
  },

  update: async (
    quotationId: string,
    data: CreateQuotationDTO,
  ): Promise<ApiResponse<QuotationItem>> => {
    const response = await api.patch<ApiResponse<QuotationItem>>(
      API_ENDPOINTS.QUOTATION.UPDATE(quotationId),
      data,
    );

    return response.data;
  },

  send: async (quotationId: string): Promise<ApiResponse<QuotationItem>> => {
    const response = await api.patch<ApiResponse<QuotationItem>>(
      API_ENDPOINTS.QUOTATION.SEND(quotationId),
    );

    return response.data;
  },

  accept: async (quotationId: string): Promise<ApiResponse<QuotationItem>> => {
    const response = await api.patch<ApiResponse<QuotationItem>>(
      API_ENDPOINTS.QUOTATION.ACCEPT(quotationId),
    );

    return response.data;
  },

  reject: async (
    quotationId: string,
    reason?: string,
  ): Promise<ApiResponse<QuotationItem>> => {
    const response = await api.patch<ApiResponse<QuotationItem>>(
      API_ENDPOINTS.QUOTATION.REJECT(quotationId),
      reason ? { reason } : {},
    );

    return response.data;
  },

  getById: async (quotationId: string): Promise<ApiResponse<QuotationItem>> => {
    const response = await api.get<ApiResponse<QuotationItem>>(
      API_ENDPOINTS.QUOTATION.BY_ID(quotationId),
    );

    return response.data;
  },

  getByBookingId: async (
    bookingId: string,
  ): Promise<ApiResponse<QuotationItem[]>> => {
    const response = await api.get<ApiResponse<QuotationItem[]>>(
      API_ENDPOINTS.QUOTATION.BY_BOOKING(bookingId),
    );

    return response.data;
  },

  getUserQuotations: async (): Promise<ApiResponse<QuotationItem[]>> => {
    const response = await api.get<ApiResponse<QuotationItem[]>>(
      API_ENDPOINTS.QUOTATION.USER_QUOTATIONS,
    );

    return response.data;
  },

  getPhotographerQuotations: async (): Promise<
    ApiResponse<QuotationItem[]>
  > => {
    const response = await api.get<ApiResponse<QuotationItem[]>>(
      API_ENDPOINTS.QUOTATION.PHOTOGRAPHER_QUOTATIONS,
    );

    return response.data;
  },
};

export default quotationService;
