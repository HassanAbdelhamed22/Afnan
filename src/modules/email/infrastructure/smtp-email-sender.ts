import "server-only";

import type { EmailMessage, EmailSender } from "../email-sender";

type SmtpTransport = {
  sendMail(message: EmailMessage & { from: string }): Promise<unknown>;
};

export class SmtpEmailSender implements EmailSender {
  constructor(
    private readonly transport: SmtpTransport,
    private readonly from: string,
  ) {}

  async send(message: EmailMessage): Promise<void> {
    try {
      await this.transport.sendMail({
        from: this.from,
        ...message,
      });
    } catch {
      throw new Error("Email delivery failed");
    }
  }
}
