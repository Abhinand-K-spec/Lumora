import type { IOTPService } from '../interfaces/IOTPService.js';

export class OTPService implements IOTPService {

    generateOTP(): string {
        return Math.floor(
            100000 + Math.random() * 900000
        ).toString();
    }

    getOTPExpiry(minutes: number = 15): Date {
        return new Date(
            Date.now() + minutes * 60 * 1000
        );
    }

}
