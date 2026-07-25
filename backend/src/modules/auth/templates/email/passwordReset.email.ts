export const passwordResetEmail = (
    name: string,
    otp: string
): string => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset Your Password</title>
    </head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">

        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
            <tr>
                <td align="center">

                    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;padding:40px;box-shadow:0 2px 10px rgba(0,0,0,0.08);">

                        <tr>
                            <td align="center">
                                <h1 style="margin:0;color:#111827;">
                                    Lumora
                                </h1>

                                <p style="color:#6b7280;margin-top:8px;">
                                    Password Reset Request
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding-top:30px;">
                                <h2 style="color:#111827;">
                                    Hello ${name},
                                </h2>

                                <p style="color:#4b5563;font-size:16px;line-height:1.6;">
                                    We received a request to reset the password for your Lumora account.
                                </p>

                                <p style="color:#4b5563;font-size:16px;line-height:1.6;">
                                    Please use the One-Time Password (OTP) below to continue.
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td align="center" style="padding:30px 0;">
                                <div style="
                                    display:inline-block;
                                    padding:18px 40px;
                                    background:#111827;
                                    color:#ffffff;
                                    font-size:32px;
                                    font-weight:bold;
                                    letter-spacing:8px;
                                    border-radius:10px;
                                ">
                                    ${otp}
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <p style="color:#4b5563;font-size:15px;">
                                    This OTP is valid for <strong>15 minutes</strong>.
                                </p>

                                <p style="color:#4b5563;font-size:15px;line-height:1.6;">
                                    If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding-top:35px;border-top:1px solid #e5e7eb;">
                                <p style="color:#9ca3af;font-size:13px;text-align:center;">
                                    This is an automated email. Please do not reply.
                                </p>

                                <p style="color:#9ca3af;font-size:13px;text-align:center;margin-top:8px;">
                                    © ${new Date().getFullYear()} Lumora. All rights reserved.
                                </p>
                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

    </body>
    </html>
    `;
};