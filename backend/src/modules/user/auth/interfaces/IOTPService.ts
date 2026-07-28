export interface IOTPService {
    generateOTP(): string;
    getOTPExpiry(minutes?: number): Date;
}
