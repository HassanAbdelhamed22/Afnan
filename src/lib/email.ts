import "server-only";

import type { EmailSender } from "@/modules/email/email-sender";
import { getEmailSender } from "@/modules/email/provider";

type PasswordResetEmailInput = {
  email: string;
  name: string;
  resetUrl: string;
};

type VerificationEmailInput = {
  email: string;
  name: string;
  verificationUrl: string;
};

export async function sendEmailVerificationEmail(
  input: VerificationEmailInput,
  sender: EmailSender = getEmailSender(),
): Promise<void> {
  try {
    await sender.send({
      to: input.email,
      subject: "Verify your Afnan email",
      html: `
        <div style="font-family:Arial,sans-serif">
          <h1>Verify your email</h1>
          <p>Hello ${escapeHtml(input.name)},</p>
          <p>Confirm that this email address belongs to you:</p>
          <p>
            <a href="${escapeHtml(input.verificationUrl)}">
              Verify email address
            </a>
          </p>
          <p>This link expires in one hour. If you did not create an Afnan account, ignore this email.</p>
        </div>
      `,
    });
  } catch {
    throw new Error("Email verification email failed");
  }
}

export async function sendPasswordResetEmail(
  input: PasswordResetEmailInput,
  sender: EmailSender = getEmailSender(),
): Promise<void> {
  try {
    await sender.send({
      to: input.email,
      subject: "Reset your Afnan password",
      html: `
        <div style="font-family:Arial,sans-serif">
          <h1>Reset your password</h1>
          <p>Hello ${escapeHtml(input.name)},</p>
          <p>Use the link below to reset your password:</p>
          <p>
            <a href="${escapeHtml(input.resetUrl)}">
              Reset password
            </a>
          </p>
          <p>If you did not request this, ignore this email.</p>
        </div>
      `,
    });
  } catch {
    throw new Error("Password reset email failed");
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
