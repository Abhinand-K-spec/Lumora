import type { IOTPService } from '../interfaces/IOTPService.js';
import crypto from 'crypto';

export class OTPService implements IOTPService {

    generateOTP(): string {
        return crypto.randomInt(100000, 999999).toString();
    }

    getOTPExpiry(minutes: number = 15): Date {
        return new Date(
            Date.now() + minutes * 60 * 1000
        );
    }

}
