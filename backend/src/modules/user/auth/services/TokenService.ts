import jwt, { type SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";
import type { AuthPayload } from "../types/authPayload.js";
import type { ITokenService } from "../interfaces/ITokenService.js";

dotenv.config();

export class TokenService implements ITokenService {
    
    private readonly accessSecret = process.env.JWT_ACCESS_SECRET!;
    private readonly refreshSecret = process.env.JWT_REFRESH_SECRET!;

    private readonly accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN!;
    private readonly refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN!;

    generateAccessToken(payload: object): string {
        
        return jwt.sign(payload, this.accessSecret, {
            expiresIn: this.accessExpiresIn,
        } as SignOptions);
    }

    generateRefreshToken(payload: object): string {
        return jwt.sign(payload, this.refreshSecret, {
            expiresIn: this.refreshExpiresIn,
        } as SignOptions);
    }

    verifyAccessToken(token: string): AuthPayload {
        
        return jwt.verify(token, this.accessSecret) as AuthPayload;
    }

    verifyRefreshToken(token: string): AuthPayload {
        return jwt.verify(token, this.refreshSecret) as AuthPayload;
    }
}
