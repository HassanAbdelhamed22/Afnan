import "server-only";

import nodemailer from "nodemailer";
import { Resend } from "resend";

import { env } from "@/lib/env";

import type { EmailSender } from "./email-sender";
import { ResendEmailSender } from "./infrastructure/resend-email-sender";
import { SmtpEmailSender } from "./infrastructure/smtp-email-sender";

let emailSender: EmailSender | undefined;

export function getEmailSender(): EmailSender {
  emailSender ??= createEmailSender();
  return emailSender;
}

function createEmailSender(): EmailSender {
  if (env.EMAIL_PROVIDER === "smtp") {
    const transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });

    return new SmtpEmailSender(transport, env.AUTH_EMAIL_FROM);
  }

  return new ResendEmailSender(
    new Resend(env.RESEND_API_KEY),
    env.AUTH_EMAIL_FROM,
  );
}
