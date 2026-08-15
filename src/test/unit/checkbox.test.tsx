import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Checkbox } from "@/components/ui/checkbox";

describe("Checkbox", () => {
  it("exposes a clear checked state without changing native checkbox behavior", () => {
    render(<Checkbox name="featured" label="Featured on storefront" defaultChecked />);

    const checkbox = screen.getByRole("checkbox", { name: "Featured on storefront" });
    const label = screen.getByText("Featured on storefront");

    expect(checkbox).toBeChecked();
    expect(checkbox).toHaveAttribute("name", "featured");
    expect(checkbox.nextElementSibling).toHaveClass("peer-checked:bg-primary");
    expect(label).toHaveClass("group-has-[:checked]:text-primary");

    fireEvent.click(label);
    expect(checkbox).not.toBeChecked();
  });
});
