import "server-only";

import type { EmailMessage, EmailSender } from "../email-sender";

type ResendSendInput = EmailMessage & {
  from: string;
};

type ResendClient = {
  emails: {
    send(input: ResendSendInput): Promise<{ error: unknown }>;
  };
};

export class ResendEmailSender implements EmailSender {
  constructor(
    private readonly client: ResendClient,
    private readonly from: string,
  ) {}

  async send(message: EmailMessage): Promise<void> {
    try {
      const { error } = await this.client.emails.send({
        from: this.from,
        ...message,
      });

      if (error) {
        throw new Error("Resend rejected the email");
      }
    } catch {
      throw new Error("Email delivery failed");
    }
  }
}
