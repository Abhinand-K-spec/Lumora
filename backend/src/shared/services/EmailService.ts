import type { IEmailService } from "../interfaces/IEmailService.js";
import nodemailer from 'nodemailer';

export class EmailService implements IEmailService {

    async sendEmail(
        to: string,
        subject: string,
        html: string
    ): Promise<void> {
        await transporter.sendMail({
            from:process.env.EMAIL_USER,
            to,
            subject,
            html
        })
    }

}


const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL_USER ,
        pass : process.env.EMAIL_PASSWORD
    }
})
