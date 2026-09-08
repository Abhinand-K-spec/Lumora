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

export const MESSAGES = {
  COMMON: COMMON_MESSAGES,
  AUTH: AUTH_MESSAGES,
  USER: USER_MESSAGES,
  ADMIN: ADMIN_MESSAGES,
  PHOTOGRAPHER: PHOTOGRAPHER_MESSAGES,
} as const;
