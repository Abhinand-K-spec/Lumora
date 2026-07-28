import bcrypt from 'bcrypt';

export class PasswordService{
    private readonly salt = 10;

    async hashPassword(password:string):Promise<string>{
        return await bcrypt.hash(password, this.salt);
    }

    async comparePassword(password:string,hashedPassword:string):Promise<boolean>{
        return await bcrypt.compare(password,hashedPassword);
    }
}
