import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

interface SendOtpEmailOptions {
  to: string;
  otp: string;
  purpose: "login" | "register";
}

let transporter: Transporter | null = null;

function createConfiguredTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (!user || !pass) {
    return null;
  }

  // If host is smtp.gmail.com or gmail is specified
  if (host === "smtp.gmail.com" || process.env.SMTP_SERVICE?.toLowerCase() === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  // Custom SMTP server configuration
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });
}

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  transporter = createConfiguredTransporter();
  return transporter;
}

/**
 * Send branded CampusOS 6-digit OTP verification email
 */
export async function sendOtpEmail({
  to,
  otp,
  purpose,
}: SendOtpEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getTransporter();

    // If no credentials have been configured in environment variables
    if (!client) {
      console.warn(
        `[CampusOS Mailer] Email dispatch failed: SMTP credentials missing. Please set SMTP_USER and SMTP_PASS in .env.local to enable real email delivery.`
      );
      return {
        success: false,
        error:
          "Email delivery service is not configured. Please configure SMTP_USER and SMTP_PASS (Gmail App Password) in .env.local on the server.",
      };
    }

    const from =
      process.env.SMTP_FROM ||
      `"CampusOS — City University" <${process.env.SMTP_USER}>`;
    const actionName =
      purpose === "register" ? "Account Registration" : "Sign In";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>CampusOS Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 10px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 36px 32px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);">
                  <tr>
                    <td align="center" style="padding-bottom: 24px;">
                      <div style="font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
                        Campus<span style="color: #3b82f6;">OS</span>
                      </div>
                      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-top: 4px;">
                        City University Digital Platform
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top: 1px solid #334155; padding-top: 24px;">
                      <h2 style="font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0;">
                        ${actionName} Verification Code
                      </h2>
                      <p style="font-size: 14px; line-height: 22px; color: #cbd5e1; margin: 0 0 24px 0;">
                        Use the verification code below to complete your ${purpose === "register" ? "City University student registration" : "secure login"} to CampusOS.
                      </p>
                      
                      <!-- OTP Box -->
                      <div style="background-color: #0f172a; border: 1px solid #2563eb; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #60a5fa; display: inline-block;">
                          ${otp}
                        </span>
                      </div>

                      <p style="font-size: 13px; color: #94a3b8; line-height: 20px; margin: 0 0 24px 0;">
                        • This code is valid for <strong>10 minutes</strong>.<br>
                        • This code is for one-time use only.<br>
                        • If you did not request this verification, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top: 1px solid #334155; padding-top: 20px; text-align: center;">
                      <p style="font-size: 12px; color: #64748b; margin: 0;">
                        © 2026 CampusOS. City University. All rights reserved.
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

    const textContent = `CampusOS — City University Verification Code\n\nYour ${actionName} verification code is: ${otp}\n\nThis code expires in 10 minutes.\nIf you did not request this code, you can safely ignore this email.\n\nCampusOS Platform.`;

    const info = await client.sendMail({
      from,
      to,
      subject: `Your CampusOS Verification Code [${otp}]`,
      text: textContent,
      html: htmlContent,
    });

    console.log(
      `[CampusOS Mailer] Successfully delivered ${purpose} verification email to ${to} (MessageId: ${info.messageId})`
    );

    return { success: true };
  } catch (err: unknown) {
    const errorObj = err as Record<string, unknown>;
    const code = errorObj?.code as string | undefined;
    const msg = errorObj?.message as string | undefined;

    console.error("[CampusOS Mailer] SMTP delivery error:", code || msg || err);

    if (code === "EAUTH") {
      return {
        success: false,
        error:
          "Email delivery authentication failed. Please check your Gmail address and 16-character Google App Password in .env.local.",
      };
    }

    if (code === "ETIMEDOUT" || code === "ECONNREFUSED") {
      return {
        success: false,
        error:
          "Unable to connect to the mail server. Please verify network access to smtp.gmail.com.",
      };
    }

    return {
      success: false,
      error:
        "Failed to deliver verification email. Please check your email address or server SMTP settings.",
    };
  }
}
