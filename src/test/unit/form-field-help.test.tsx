import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

describe("FormField help", () => {
  it("exposes technical guidance from a non-submitting help control", () => {
    render(
      <form>
        <FormField htmlFor="variant-sku" label="SKU" hint="Use a unique internal code.">
          <Input id="variant-sku" />
        </FormField>
      </form>,
    );

    const help = screen.getByRole("button", { name: "Help for SKU" });
    const tooltip = screen.getByRole("tooltip");

    expect(help).toHaveAttribute("type", "button");
    expect(help).toHaveAttribute("aria-describedby", tooltip.id);
    expect(tooltip).toHaveTextContent("Use a unique internal code.");
  });
});
