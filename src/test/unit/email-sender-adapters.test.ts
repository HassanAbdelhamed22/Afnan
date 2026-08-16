import { describe, expect, it, vi } from "vitest";

import { ResendEmailSender } from "@/modules/email/infrastructure/resend-email-sender";
import { SmtpEmailSender } from "@/modules/email/infrastructure/smtp-email-sender";

const message = {
  to: "customer@example.com",
  subject: "Afnan test",
  html: "<p>Hello</p>",
};

describe("email sender adapters", () => {
  it("maps a provider-neutral email to Resend", async () => {
    const send = vi.fn(async () => ({ error: null }));
    const sender = new ResendEmailSender(
      { emails: { send } },
      "Afnan <mail@example.com>",
    );

    await sender.send(message);

    expect(send).toHaveBeenCalledWith({
      from: "Afnan <mail@example.com>",
      ...message,
    });
  });

  it("hides Resend provider errors", async () => {
    const sender = new ResendEmailSender(
      {
        emails: {
          send: vi.fn(async () => ({ error: { message: "secret detail" } })),
        },
      },
      "Afnan <mail@example.com>",
    );

    await expect(sender.send(message)).rejects.toThrow("Email delivery failed");
  });

  it("maps a provider-neutral email to SMTP", async () => {
    const sendMail = vi.fn(async () => ({ messageId: "test-id" }));
    const sender = new SmtpEmailSender(
      { sendMail },
      "Afnan <mail@example.com>",
    );

    await sender.send(message);

    expect(sendMail).toHaveBeenCalledWith({
      from: "Afnan <mail@example.com>",
      ...message,
    });
  });

  it("hides SMTP provider errors", async () => {
    const sender = new SmtpEmailSender(
      {
        sendMail: vi.fn(async () => {
          throw new Error("authentication failed for a secret account");
        }),
      },
      "Afnan <mail@example.com>",
    );

    await expect(sender.send(message)).rejects.toThrow("Email delivery failed");
  });
});
