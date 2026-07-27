export const verificationEmail = (
    name: string,
    otp: string
): string => {
    return `
        <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5; padding: 40px;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

                <div style="background: #111827; color: white; padding: 24px; text-align: center;">
                    <h1 style="margin: 0;">Lumora</h1>
                </div>

                <div style="padding: 32px;">

                    <h2>Hello, ${name} </h2>

                    <p>
                        Welcome to <strong>Lumora</strong>.
                        Please use the verification code below to verify your email address.
                    </p>

                    <div style="
                        margin: 32px 0;
                        text-align: center;
                        font-size: 32px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        color: #2563eb;
                    ">
                        ${otp}
                    </div>

                    <p>
                        This OTP is valid for
                        <strong>10 minutes</strong>.
                    </p>

                    <p>
                        If you did not create a Lumora account,
                        you can safely ignore this email.
                    </p>

                    <hr style="margin:32px 0;" />

                    <p style="font-size:12px;color:#666;">
                        This is an automated email. Please do not reply.
                    </p>

                </div>

            </div>
        </div>
    `;
};