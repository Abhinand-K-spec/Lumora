import { otpPurpose } from "../../../shared/enums/OTPPurpose"

export interface IOTPRepository {
    save(
        userId: string,
        purpose: otpPurpose,
        otp: string,
        expiresIn: number

    ): Promise<void>;

    get(userId: string, purpose: otpPurpose): Promise<string | null>;

    delete(userId: string, purpose: otpPurpose): Promise<void>;
}