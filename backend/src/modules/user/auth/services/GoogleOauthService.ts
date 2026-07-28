import  { OAuth2Client } from "google-auth-library";
import  type { TokenPayload } from "google-auth-library";

import type { IGoogleAuthService } from "../interfaces/IGoogleAuthService.js";

export interface GoogleUser {
    googleId: string;
    email: string;
    name: string;
    emailVerified: boolean;
}

export class GoogleAuthService implements IGoogleAuthService {
    private readonly client: OAuth2Client;

    constructor() {
        this.client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
    }

    public getGoogleAuthUrl(state?: string): string {
        const opts: any = {
            access_type: "offline",
            prompt: "consent",
            scope: [
                "openid",
                "email",
                "profile"
            ]
        };
        if (state !== undefined) {
            opts.state = state;
        }
        return this.client.generateAuthUrl(opts);
    }

    public async verifyGoogleUser(code: string): Promise<GoogleUser> {
        const { tokens } = await this.client.getToken(code);

        if (!tokens.id_token) {
            throw new Error("Google ID token not found.");
        }

        const ticket = await this.client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID!
        });

        const payload = ticket.getPayload();

        if (!payload) {
            throw new Error("Unable to retrieve Google user.");
        }

        return this.mapPayload(payload);
    }

    private mapPayload(payload: TokenPayload): GoogleUser {
        return {
            googleId: payload.sub,
            email: payload.email!,
            name: payload.name!,
            emailVerified: payload.email_verified ?? false
        };
    }
}