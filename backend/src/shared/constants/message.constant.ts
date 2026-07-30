export const AUTH_MESSAGES = {
    LOGIN_SUCCESS: "Successfully logged in.",
    ADMIN_LOGIN_SUCCESS: "Successfully logged in as admin.",
    LOGOUT_SUCCESS: "Logged out successfully.",

    REGISTER_SUCCESS: "OTP sent to the email.",
    OTP_SENT: "OTP sent successfully.",
    OTP_VERIFIED: "OTP verified.",
    OTP_EXPIRED:'OTP Is expired',
    NO_OTP:"No OTP found. Please request a new OTP.",
    OTP_INVALID: 'Invalid OTP',

    EMAIL_VERIFIED: "Email verified successfully.",
    EMAIL_ALREADY_VERIFIED : 'Email is already verified',

    PASSWORD_RESET_OTP_SENT: "Password reset OTP sent successfully.",
    PASSWORD_RESET_SUCCESS: "Password reset successfully.",

    ACCESS_TOKEN_REFRESHED: "Access token refreshed successfully.",

    CURRENT_ADMIN_FETCHED: "Current admin fetched successfully.",

    ACCESS_TOKEN_MISSING: 'Access token is missing',
    UNAUTHORIZED: 'Unauthorized',

    INVALID_CREDENTIALS :'Please enter the valid credentials',
    INVALID_REFRESH_TOKEN : 'Invalid refresh token',

    FORBIDEN: 'Forbidden',
    ADMIN_NOT_FOUND : 'Admin not found',
    USER_NOT_FOUND: 'User not found',

    USER_ALREADY_LOGGED : 'User already exists',

} as const;
