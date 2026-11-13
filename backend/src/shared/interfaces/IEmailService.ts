import type { SendMailOptions } from "nodemailer";

export interface IEmailService {
  sendEmail(to: string, subject: string, html: string): Promise<void>;
  sendEmailWithAttachment(
    to: string,
    subject: string,
    html: string,
    attachments: SendMailOptions["attachments"]
  ): Promise<void>;
}