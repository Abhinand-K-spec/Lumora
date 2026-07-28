export class OTPService {

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
