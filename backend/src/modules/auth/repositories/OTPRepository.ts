import redisClient from "../../../shared/config/redis";
import { otpPurpose } from "../../../shared/enums/OTPPurpose"
import type { IOTPRepository } from "../interfaces/IOTPRepository"



export class OtpRepository implements IOTPRepository{
    private _generateKey(userId:string,purpose:otpPurpose):string{
        return  `otp:${purpose} : ${userId}`;
    }


    async save(userId:string,purpose:otpPurpose,otp:string,expiry:number):Promise<void>{
        const key = this._generateKey(userId,purpose);


        await redisClient.set(key,otp,{EX:expiry});
    }


    async get(userId:string,purpose:otpPurpose):Promise<string | null>{
        const key = this._generateKey(userId,purpose);

        return await redisClient.get(key);
    }


    async delete(userId:string,purpose:otpPurpose):Promise<void>{


        const key = this._generateKey(userId,purpose);

        await redisClient.del(key);
    }
}