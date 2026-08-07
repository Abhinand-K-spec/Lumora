import type { GoogleUser } from "../services/GoogleOauthService.js";

export interface IGoogleAuthService {
    getGoogleAuthUrl(state?: string): string;
    verifyGoogleUser(code: string): Promise<GoogleUser>;
}
