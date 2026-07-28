import bcrypt from 'bcrypt';
import type { IPasswordService } from '../interfaces/IPasswordService.js';

export class PasswordService implements IPasswordService {
    private readonly salt = 10;

    async hashPassword(password:string):Promise<string>{
        return await bcrypt.hash(password, this.salt);
    }

    async comparePassword(password:string,hashedPassword:string):Promise<boolean>{
        return await bcrypt.compare(password,hashedPassword);
    }
}
