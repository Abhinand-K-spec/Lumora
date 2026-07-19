import jwt,{ type JwtPayload, type SignOptions} from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


export class TokenService{
    private readonly accessSecret = process.env.JWT_ACCESS_SECRET!;
    private readonly refreshSecret = process.env.JWT_REFRESH_SECRET!;

    private readonly accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN!;
    private readonly refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN!;

    generateAccessToken(payload:object):string{
        return jwt.sign(payload, this.accessSecret,{
            expiresIn:this.accessExpiresIn,
        } as SignOptions)
    }

    generateRefreshToken(payload:object):string{
        return jwt.sign(payload,this.refreshSecret,{
            expiresIn:this.refreshExpiresIn,
        } as SignOptions);
    }


    verifyAccessToken(token:string): JwtPayload | string{
        return jwt.verify(token, this.accessSecret);
    }

    verifyRefreshToken(token:string): JwtPayload | string{
        return jwt.verify(token, this.refreshSecret);
    }
}