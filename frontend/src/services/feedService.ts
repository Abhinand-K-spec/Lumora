import api from "../api/axios";

export interface PresignedUploadResponse {
  key: string;
  uploadUrl: string;
  expiresIn: number;
}

export interface CreateFeedPostPayload {
  caption: string;
  mediaKeys: string[];
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export interface FeedAuthor {
  id: string;
  name: string;
  profilePhoto?: string;
  location?: string;
}

export interface FeedMedia {
  url: string;
  contentType: string;
  order: number;
}

export interface FeedPost {
  id: string;
  caption: string;
  media: FeedMedia[];
  author: FeedAuthor;
  createdAt: string;
}

export interface GetFeedResponse {
  posts: FeedPost[];
  hasMore: boolean;
  nextCursor?: string;
}

export const feedService = {
  async requestUploadUrl(
    file: File
  ): Promise<PresignedUploadResponse> {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error("Only JPEG, PNG, and WebP images are supported");
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      throw new Error("Each image must be no larger than 15 MB");
    }

    const response = await api.post<
      ApiResponse<PresignedUploadResponse>
    >("/photographer/uploads/presign", {
      contentType: file.type,
      size: file.size,
    });

    const resData = response.data?.data as any;
    // Support both direct object { key, uploadUrl } and nested { data: { key, uploadUrl } }
    const presigned = resData?.uploadUrl ? resData : (resData?.data ?? resData);

    if (!presigned?.uploadUrl || !presigned?.key) {
      throw new Error("Failed to obtain secure upload URL from server");
    }

    return presigned as PresignedUploadResponse;
  },

  async uploadToR2(
    uploadUrl: string,
    file: File
  ): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(
        `Direct upload failed with HTTP status ${response.status}`
      );
    }
  },

  async createPost(
    payload: CreateFeedPostPayload
  ) {
    const response = await api.post<
      ApiResponse<unknown>
    >("/feed/posts", payload);

    return response.data;
  },

  async getFeed(params?: {
    cursor?: string;
    limit?: number;
    photographerId?: string;
  }): Promise<GetFeedResponse> {
    const response = await api.get<ApiResponse<GetFeedResponse>>("/feed", {
      params: {
        limit: params?.limit || 10,
        cursor: params?.cursor,
        photographerId: params?.photographerId,
      },
    });

    return response.data.data;
  },

  async getMyPosts(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<GetFeedResponse> {
    const response = await api.get<ApiResponse<GetFeedResponse>>("/feed/my-posts", {
      params: {
        limit: params?.limit || 20,
        cursor: params?.cursor,
      },
    });

    return response.data.data;
  },

  async deletePost(postId: string): Promise<void> {
    await api.delete(`/feed/${postId}`);
  },
};
