import { describe, expect, it, vi } from "vitest";

import { sendEmailVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import type { EmailMessage, EmailSender } from "@/modules/email/email-sender";

function createSender(
  implementation: (message: EmailMessage) => Promise<void> = async () => {},
): EmailSender & { send: ReturnType<typeof vi.fn> } {
  return { send: vi.fn(implementation) };
}

describe("authentication emails", () => {
  it("uses the provider-neutral sender and escapes verification content", async () => {
    const sender = createSender();

    await sendEmailVerificationEmail(
      {
        email: "customer@example.com",
        name: "<Customer>",
        verificationUrl: 'https://afnan.eg/verify?token=\"unsafe\"',
      },
      sender,
    );

    expect(sender.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "customer@example.com",
        html: expect.not.stringContaining("<Customer>"),
      }),
    );
  });

  it("escapes the password reset URL", async () => {
    const sender = createSender();

    await sendPasswordResetEmail(
      {
        email: "customer@example.com",
        name: "Customer",
        resetUrl: 'https://afnan.eg/reset?token=\"unsafe\"',
      },
      sender,
    );

    expect(sender.send).toHaveBeenCalledWith(
      expect.objectContaining({ html: expect.stringContaining("&quot;unsafe&quot;") }),
    );
  });

  it("does not expose provider details when delivery fails", async () => {
    const sender = createSender(async () => {
      throw new Error("secret SMTP response");
    });

    await expect(
      sendEmailVerificationEmail(
        {
          email: "customer@example.com",
          name: "Customer",
          verificationUrl: "https://afnan.eg/verify",
        },
        sender,
      ),
    ).rejects.toThrow("Email verification email failed");
  });
});
