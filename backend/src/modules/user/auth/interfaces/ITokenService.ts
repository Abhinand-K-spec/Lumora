import type { AuthPayload } from "../types/authPayload.js";

export interface ITokenService {
    generateAccessToken(payload: object): string;
    generateRefreshToken(payload: object): string;
    verifyAccessToken(token: string): AuthPayload;
    verifyRefreshToken(token: string): AuthPayload;
}
