import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/settings/actions", () => ({ saveStoreSettingsAction: vi.fn() }));

import { StoreSettingsForm } from "@/components/admin/store-settings-form";

describe("store settings prefix help", () => {
  it("explains how order and request prefixes are used", () => {
    render(
      <StoreSettingsForm
        settings={{
          storeName: "Afnan",
          adminEmail: "admin@example.com",
          adminWhatsappE164: "+201000000000",
          orderPrefix: "AFN",
          customRequestPrefix: "CR",
          whatsappOrderTemplate: "Hello {customerName}, confirm {orderNumber} totaling {total} for {deliveryArea}.",
          socialLinks: {},
        }}
      />,
    );

    expect(screen.getByRole("button", { name: "Help for Order prefix" })).toHaveAttribute("type", "button");
    expect(screen.getByRole("button", { name: "Help for Request prefix" })).toHaveAttribute("type", "button");
    expect(screen.getByText(/AFN creates order numbers/)).toBeInTheDocument();
    expect(screen.getByText(/CR creates request numbers/)).toBeInTheDocument();
  });
});
