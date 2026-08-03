import type { Response, CookieOptions } from "express";
import { COOKIE } from "../constants/cookie.constant.js";

export class CookieUtil {
    private static getCookieOptions(maxAge: number): CookieOptions {
        return {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge,
        };
    }

    static setAuthCookies(res: Response,accessToken: string,refreshToken: string): void {
        res.cookie(
            COOKIE.ACCESS_TOKEN,
            accessToken,
            this.getCookieOptions(
                Number(process.env.COOKIE_ACCESS_EXPIRES_IN)
            )
        );

        res.cookie(
            COOKIE.REFRESH_TOKEN,
            refreshToken,
            this.getCookieOptions(
                Number(process.env.COOKIE_REFRESH_EXPIRES_IN)
            )
        );
    }

    static setAccessToken(res: Response,accessToken: string ): void {
        res.cookie(
            COOKIE.ACCESS_TOKEN,
            accessToken,
            this.getCookieOptions(
                Number(process.env.COOKIE_ACCESS_EXPIRES_IN)
            )
        );
    }

    static clearAuthCookies(res: Response): void {
        res.clearCookie(COOKIE.ACCESS_TOKEN);
        res.clearCookie(COOKIE.REFRESH_TOKEN);
    }
}