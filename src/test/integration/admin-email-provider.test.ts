import { beforeEach, describe, expect, it, vi } from "vitest";

import type { EmailMessage, EmailSender } from "@/modules/email/email-sender";
import { sendNewCustomRequestAdminEmail } from "@/modules/email/custom-requests";
import { sendNewOrderAdminEmail } from "@/modules/email/orders";

const mocks = vi.hoisted(() => ({ settings: vi.fn() }));

vi.mock("@/modules/settings", () => ({
  getStoreSettings: mocks.settings,
}));

function createSender(
  implementation: (message: EmailMessage) => Promise<void> = async () => {},
): EmailSender & { send: ReturnType<typeof vi.fn> } {
  return { send: vi.fn(implementation) };
}

describe("admin email provider boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.settings.mockResolvedValue({ adminEmail: "operations@afnan.eg" });
  });

  it("uses the configured operational inbox without knowing the provider", async () => {
    const sender = createSender();

    await sendNewOrderAdminEmail(
      {
        orderNumber: "AFN-1",
        customerName: "Customer",
        customerPhone: "+201012345678",
        governorateName: "Cairo",
        totalAmount: 10_000,
      },
      sender,
    );

    expect(sender.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "operations@afnan.eg",
        subject: expect.stringContaining("AFN-1"),
      }),
    );
  });

  it("returns only a generic application error", async () => {
    const sender = createSender(async () => {
      throw new Error("secret provider detail");
    });

    await expect(
      sendNewCustomRequestAdminEmail(
        {
          requestNumber: "CR-1",
          customerName: "Customer",
          customerPhone: "+201012345678",
          summary: "Runner",
        },
        sender,
      ),
    ).rejects.toThrow("Custom request email failed");
  });
});
