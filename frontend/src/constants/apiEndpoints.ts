
const API_ENDPOINTS = {
    AUTH: {
      REGISTER: "/auth/register",
      LOGIN: "/auth/login",
      LOGOUT: "/auth/logout",
      ME: "/auth/me",
      VERIFY_EMAIL: "/auth/verify-email",
      RESEND_OTP: "/auth/resend-otp",
      VERIFY_RESET_OTP: "/auth/verify-reset-otp",
      FORGOT_PASSWORD: "/auth/forgot-password",
      RESET_PASSWORD: "/auth/reset-password",
      GOOGLE_LOGIN: "/auth/google",
    },
  
    ADMIN: {
      PHOTOGRAPHERS: {
        REQUESTS: "/admin/photographers/requests",
        METRICS: "/admin/photographers/metrics",
        REVIEW_REQUEST: (requestId: string) =>
          `/admin/photographers/requests/${requestId}/review`,
      },
  
      USERS: {
        BASE: "/admin/userManagement/users",
        BY_ID: (id: string) => `/admin/userManagement/users/${id}`,
        STATUS: (id: string) =>
          `/admin/userManagement/users/${id}/status`,
        DELETE: (id: string) =>
          `/admin/userManagement/users/${id}/delete`,
      },
    },
  
    BOOKINGS: {
      BASE: "/bookings",
      MY_BOOKINGS: "/bookings/my-bookings",
      PHOTOGRAPHER_REQUESTS: "/bookings/photographer-requests",
      BY_ID:(bookingId:string) => `/bookings/${bookingId}`,
      STATUS: (bookingId: string) => `/bookings/${bookingId}/status`,
    },
    
    QUOTATION: {
      CREATE: (bookingId: string) => `/quotation/create/${bookingId}`,
      BY_ID: (quotationId: string) => `/quotation/${quotationId}`,
      UPDATE: (quotationId: string) => `/quotation/${quotationId}`,
      SEND: (quotationId: string) => `/quotation/${quotationId}/send`,
      ACCEPT: (quotationId: string) => `/quotation/${quotationId}/accept`,
      REJECT: (quotationId: string) => `/quotation/${quotationId}/reject`,
      BY_BOOKING: (bookingId: string) => `/quotation/bookings/${bookingId}/quotation`,
      USER_QUOTATIONS: "/quotation/user",
      PHOTOGRAPHER_QUOTATIONS: "/quotation/photographer",
    },
  
    FEED: {
      BASE: "/feed",
      POSTS: "/feed/posts",
      MY_POSTS: "/feed/my-posts",
      POST_BY_ID: (postId: string) => `/feed/${postId}`,
    },
  
    PHOTOGRAPHER: {
      BASE: "/photographer",
      PROFILE: "/photographer/profile",
      UPLOAD: "/photographer/uploads/presign",
      PROFILE_UPLOAD: "/photographer/profile/upload",
      COVER_UPLOAD: "/photographer/profile/upload-cover",
      PACKAGES: "/photographer/profile/packages",
      PACKAGE_BY_ID: (packageId: string) =>
        `/photographer/profile/packages/${packageId}`,
      APPROVAL_REQUEST: "/photographer/approval-request",
      APPROVAL_REQUESTS: "/photographer/approval-requests",
      SERVICE_AREAS: "/photographer/profile/service-areas",
      BY_ID: (userId: string) => `/photographer/${userId}`,
    },
  
    APP: {
      PROFILE: "/app/profile",
      PROFILE_UPLOAD: "/app/profile/upload",
      SAVED_PHOTOGRAPHERS: "/app/saved-photographers",
      SAVED_PHOTOGRAPHER_IDS: "/app/saved-photographers/ids",
      SAVED_PHOTOGRAPHER_STATUS: (photographerId: string) =>
        `/app/saved-photographers/${photographerId}/status`,
      TOGGLE_SAVED_PHOTOGRAPHER: (photographerId: string) =>
        `/app/saved-photographers/${photographerId}`,
    },
  
    NOTIFICATIONS: {
      BASE: "/notifications",
      UNREAD_COUNT: "/notifications/unread-count",
      READ: (id: string) => `/notifications/${id}/read`,
      READ_ALL: "/notifications/read-all",
    },

    AVAILABILITY: {
      BASE: "/availability",
      MY_CALENDAR: "/availability/my-calendar",
      PHOTOGRAPHER_CALENDAR: (photographerId: string) =>
        `/availability/calendar/${photographerId}`,
      BLOCK: "/availability/block",
      UNBLOCK: (availabilityId: string) =>
        `/availability/unblock/${availabilityId}`,
    },
  } as const;
  
  export default API_ENDPOINTS;
  