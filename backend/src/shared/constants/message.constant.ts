export const COMMON_MESSAGES = {
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  BAD_REQUEST: "Bad request",
  NOT_FOUND: "Not found",
  ROUTE_NOT_FOUND: "Route not found",
  USER_ID_REQUIRED: "User ID is required",
  INTERNAL_SERVER_ERROR: "Internal server error",
} as const;

export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: "Successfully logged in.",
  ADMIN_LOGIN_SUCCESS: "Successfully logged in as admin.",
  LOGOUT_SUCCESS: "Logged out successfully.",

  REGISTER_SUCCESS: "OTP sent to the email.",
  OTP_SENT: "OTP sent successfully.",
  OTP_VERIFIED: "OTP verified.",
  OTP_EXPIRED: "OTP is expired",
  NO_OTP: "No OTP found. Please request a new OTP.",
  OTP_INVALID: "Invalid OTP",

  EMAIL_VERIFIED: "Email verified successfully.",
  EMAIL_ALREADY_VERIFIED: "Email is already verified",
  EMAIL_NOT_VERIFIED: "Please verify your email before logging in.",

  PASSWORD_RESET_OTP_SENT: "Password reset OTP sent successfully.",
  PASSWORD_RESET_SUCCESS: "Password reset successfully.",

  ACCESS_TOKEN_REFRESHED: "Access token refreshed successfully.",

  CURRENT_ADMIN_FETCHED: "Current admin fetched successfully.",

  ACCESS_TOKEN_MISSING: "Access token is missing",
  UNAUTHORIZED: COMMON_MESSAGES.UNAUTHORIZED,

  INVALID_CREDENTIALS: "Please enter the valid credentials",
  INVALID_REFRESH_TOKEN: "Invalid refresh token",

  FORBIDEN: COMMON_MESSAGES.FORBIDDEN,
  FORBIDDEN: COMMON_MESSAGES.FORBIDDEN,
  ADMIN_NOT_FOUND: "Admin not found",
  USER_NOT_FOUND: "User not found",

  PROFILE: "Profile fetched successfully",
  PHOTOGRAPHER_FETCHED: "Photographers fetched successfully",

  USER_ALREADY_LOGGED: "User already exists",
  USER_ALREADY_EXISTS: "User already exists",
  CURRENT_USER_FETCHED: "Current user fetched successfully",
  PROFILE_UPDATED: "Profile updated successfully",

  PACKAGE_ADDED: "Package added successfully",
  PACKAGE_UPDATED: "Package updated successfully",
  PACKAGE_DELETED: "Package deleted successfully",

  STATUS_UPDATED: "User status updated successfully.",

  SUSPENDED: "Your account is suspended.",
  DELETED: "Your account is deleted by admin",

  GOOGLE_AUTH_CODE_REQUIRED: "Google authorization code is required",
} as const;

export const USER_MESSAGES = {
  USERS_FETCHED: "Users fetched successfully.",
  CURRENT_USER_FETCHED: "Current user fetched successfully.",
  USER_NOT_FOUND: "User not found",
  PROFILE_FETCHED: "Profile fetched successfully",
  PROFILE_UPDATED: "Profile updated successfully",
  PHOTO_UPLOADED: "Photo uploaded successfully",
  STATUS_UPDATED: "User status updated successfully.",
  USER_DELETED: "User deleted successfully",
  PHOTOGRAPHER_SAVED: "Photographer saved successfully",
  PHOTOGRAPHER_UNSAVED: "Photographer removed from saved successfully",
  SAVED_PHOTOGRAPHERS_FETCHED: "Saved photographers fetched successfully",
} as const;

export const ADMIN_MESSAGES = {
  CURRENT_ADMIN_FETCHED: "Current admin fetched successfully.",
  ADMIN_NOT_FOUND: "Admin not found",
} as const;

export const PHOTOGRAPHER_MESSAGES = {
  PROFILE_FETCHED: "Profile fetched successfully",
  PHOTOGRAPHERS_FETCHED: "Photographers fetched successfully",
  PROFILE_UPDATED: "Profile updated successfully",
  PROFILE_NOT_FOUND: "No profile found",
  COVER_PHOTO_UPDATED: "Cover photo updated successfully",
  PHOTO_UPLOADED: "Photo uploaded successfully",
  PACKAGE_ADDED: "Package added successfully",
  PACKAGE_UPDATED: "Package updated successfully",
  PACKAGE_DELETED: "Package deleted successfully",
  PACKAGE_NOT_FOUND: "Package not found",
  MISSING_PACKAGE_DETAILS: "Missing package details",
  MISSING_PACKAGE_ID: "Missing package ID",
  USER_ID_REQUIRED: COMMON_MESSAGES.USER_ID_REQUIRED,
} as const;

export const APPROVAL_MESSAGES = {
  // Submission
  APPROVAL_REQUESTED:
    "Verification request submitted successfully. Our team will review your profile.",
  APPROVAL_HISTORY_FETCHED: "Approval history fetched successfully.",
  // Validation errors
  INSTAGRAM_URL_REQUIRED:
    "Instagram profile URL is required before requesting verification.",
  BIO_REQUIRED: "Please add a bio before requesting verification.",
  LOCATION_REQUIRED: "Please add your location before requesting verification.",
  PHONE_REQUIRED: "Please add a phone number before requesting verification.",
  PENDING_REQUEST_EXISTS:
    "You already have a pending verification request. Please wait for it to be reviewed.",
  // Admin actions
  REQUESTS_FETCHED: "Verification requests fetched successfully.",
  METRICS_FETCHED: "Dashboard metrics fetched successfully.",
  REQUEST_NOT_FOUND: "Verification request not found.",
  REQUEST_APPROVED: "Photographer application approved successfully.",
  REQUEST_REJECTED: "Photographer application rejected.",
  REJECTION_REASON_REQUIRED:
    "A rejection reason must be provided when rejecting an application.",
  REQUEST_ALREADY_REVIEWED: "This request has already been reviewed.",
  REQUEST_ID_REQUIRED: "Request ID is required.",
} as const;

export const FEED_MESSAGES = {
  MAX_CAPTION: "Caption must be less than 1000 characters",
  MIN_IMAGES: "A post must contain minimum 1 image",
  DUPLICATE_IMAGES: "Duplicate images are not allowed",
  INVALID_IMAGE_KEY: "Invalid image key",
  INVALID_TYPE: "Unsupported uploaded image type",
  POSTED_SUCCESS: "Feed posted successfully",
  FETCHED_SUCCESS: "Feed fetched successfully",
  INVALID_CURSOR: "Invalid pagination cursor",
};

export const BOOKING_MESSAGES ={
  DATE_INVALID : 'Enter a valid date',
  BOOKING_NOT_FOUND: 'Booking not found',
  BOOKING_CREATED :'Booking created successfully',
  BOOKINGS_FETCHED:'Bookings fetched successfully',
  BOOKING_STATUS_UPDATED:'Booking status updated successfully'
}

export const NOTIFICATION_MESSAGES = {
  BOOKING: {
    CREATED: "Your booking request has been sent successfully.",
    RECEIVED: "You have received a new booking request.",
    ACCEPTED: "Your booking request has been accepted.",
    REJECTED: "Your booking request has been rejected.",
    CANCELLED: "The booking has been cancelled.",
    COMPLETED: "Your booking has been marked as completed.",
    UPDATED: "Your booking details have been updated.",
  },

  QUOTATION: {
    CREATED: "A new quotation has been created for your event.",
    RECEIVED: "You have received a new quotation.",
    ACCEPTED: "Your quotation has been accepted.",
    REJECTED: "Your quotation has been rejected.",
    UPDATED: "The quotation has been updated.",
    CANCELLED: "The quotation has been cancelled.",
  },

  PAYMENT: {
    SUCCESS: "Your payment has been completed successfully.",
    FAILED: "Your payment could not be completed.",
    REFUNDED: "Your payment has been refunded.",
    RELEASED: "Your payment has been released to the photographer.",
  },

  FEED: {
    NEW_POST: "A photographer you follow has shared a new post.",
    NEW_LIKE: "Someone liked your post.",
    NEW_COMMENT: "Someone commented on your post.",
    NEW_FOLLOWER: "You have a new follower.",
    POST_REMOVED: "Your post has been removed.",
  },

  PROFILE: {
    APPROVAL_REQUESTED: "Your profile has been submitted for approval.",
    APPROVED: "Your photographer profile has been approved.",
    REJECTED: "Your photographer profile has been rejected.",
    UPDATED: "Your photographer profile has been updated.",
  },

  EVENT: {
    CREATED: "A new event has been created.",
    UPDATED: "Your event details have been updated.",
    CANCELLED: "Your event has been cancelled.",
    REMINDER: "You have an upcoming event.",
  },

  GENERAL: {
    WELCOME: "Welcome to Lumora! We're glad to have you here.",
    ACCOUNT_UPDATED: "Your account details have been updated.",
    NEW_NOTIFICATION: "You have a new notification.",
    NOTIFICATIONS_FETCHED:'Notifications fetched successfully',
    UNREAD_COUNT_FETCHED:'Unread count fetched successfully',
    NOTIFICATION_READ:'Notification marked as read',
    ALL_NOTIFICATION_READ:'Marked all notifications as read'
  },
} as const;

export const MESSAGES = {
  COMMON: COMMON_MESSAGES,
  AUTH: AUTH_MESSAGES,
  USER: USER_MESSAGES,
  ADMIN: ADMIN_MESSAGES,
  PHOTOGRAPHER: PHOTOGRAPHER_MESSAGES,
  FEED: FEED_MESSAGES,
} as const;
