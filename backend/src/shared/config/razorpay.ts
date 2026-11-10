import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import { AppError } from '../errors/AppError';
import { HttpStatus } from '../enums/HTTP.status.code';

dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_SECRET;


if (!keyId || !keySecret) {
    throw new AppError(HttpStatus.BAD_REQUEST,"Razorpay credentials are missing.");
  }
  
  export const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });