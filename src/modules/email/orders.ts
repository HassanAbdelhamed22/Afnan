import "server-only";

import { env } from "@/lib/env";
import { getStoreSettings } from "@/modules/settings";
import type { EmailSender } from "./email-sender";
import { getEmailSender } from "./provider";
import { buildNewOrderAdminEmail, type NewOrderEmailInput } from "./views";

export async function sendNewOrderAdminEmail(
  input: NewOrderEmailInput,
  sender: EmailSender = getEmailSender(),
): Promise<void> {
  const settings = await getStoreSettings();
  const view = buildNewOrderAdminEmail(input, env.NEXT_PUBLIC_APP_URL);

  try {
    await sender.send({
      to: settings.adminEmail,
      subject: view.subject,
      html: view.html,
    });
  } catch {
    throw new Error("Order email failed");
  }
}
