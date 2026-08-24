import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ deleteProduct: vi.fn(), deleteCategory: vi.fn(), replace: vi.fn(), refresh: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }) }));
vi.mock("@/modules/products/admin-actions", () => ({ deleteProductAction: mocks.deleteProduct }));
vi.mock("@/modules/categories/admin-actions", () => ({ deleteCategoryAction: mocks.deleteCategory }));

import { CatalogDeleteButton } from "@/components/admin/catalog-delete-button";

describe("CatalogDeleteButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.deleteProduct.mockResolvedValue({ ok: true, data: { productId: "product-1" }, message: "Product removed" });
  });

  it("uses an in-app confirmation dialog and allows cancellation", () => {
    render(<CatalogDeleteButton entity="product" entityId="product-1" entityName="Woven basket" redirectTo="/admin/products" />);
    fireEvent.click(screen.getByRole("button", { name: "Delete product" }));
    expect(screen.getByRole("dialog", { name: "Delete product?" })).toBeInTheDocument();
    expect(screen.getByText("Woven basket")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Keep product" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mocks.deleteProduct).not.toHaveBeenCalled();
  });

  it("deletes only after explicit modal confirmation", async () => {
    render(<CatalogDeleteButton entity="product" entityId="product-1" entityName="Woven basket" redirectTo="/admin/products" />);
    fireEvent.click(screen.getByRole("button", { name: "Delete product" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete product permanently" }));
    await waitFor(() => expect(mocks.deleteProduct).toHaveBeenCalledOnce());
    const form = mocks.deleteProduct.mock.calls[0][0] as FormData;
    expect(form.get("productId")).toBe("product-1");
    expect(mocks.replace).toHaveBeenCalledWith("/admin/products");
  });
});
