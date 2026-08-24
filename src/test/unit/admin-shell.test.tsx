import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminShell } from "@/components/admin/admin-shell";

const navigationMocks = vi.hoisted(() => ({ pathname: "/admin/orders" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationMocks.pathname,
}));
vi.mock("@/components/layout/theme-toggle", () => ({ ThemeToggle: () => <button type="button">Toggle theme</button> }));

describe("AdminShell", () => {
  beforeEach(() => {
    navigationMocks.pathname = "/admin/orders";
  });

  it("marks the current operational section and omits notifications", () => {
    render(<AdminShell adminName="Moamen" adminEmail="admin@example.com"><p>Queue</p></AdminShell>);

    expect(screen.getAllByRole("link", { name: "Orders" })[0]).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Queue")).toBeInTheDocument();
    expect(screen.queryByText(/notifications/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Toggle theme" })).toBeInTheDocument();
    const desktopSidebar = screen.getByRole("complementary", { name: "Desktop admin sidebar" });
    expect(desktopSidebar).toHaveClass("lg:sticky", "lg:h-screen");
    expect(within(desktopSidebar).getByRole("link", { name: "View storefront" })).toHaveAttribute("href", "/");
  });

  it("opens and closes the mobile navigation", () => {
    render(<AdminShell adminName="Moamen" adminEmail="admin@example.com"><p>Overview</p></AdminShell>);

    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    expect(screen.getByRole("button", { name: "Close admin navigation" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "View storefront" })).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Close admin navigation" }));
    expect(screen.queryByRole("button", { name: "Close admin navigation" })).not.toBeInTheDocument();
  });
});
