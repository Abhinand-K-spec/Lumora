export const AUTH_MESSAGES = {
    LOGIN_SUCCESS: "Successfully logged in.",
    ADMIN_LOGIN_SUCCESS: "Successfully logged in as admin.",
    LOGOUT_SUCCESS: "Logged out successfully.",

    REGISTER_SUCCESS: "OTP sent to the email.",
    OTP_SENT: "OTP sent successfully.",
    OTP_VERIFIED: "OTP verified.",

    EMAIL_VERIFIED: "Email verified successfully.",

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

} as const;
