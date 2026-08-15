import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  saveCategory: vi.fn(),
  saveProduct: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace }) }));
vi.mock("@/modules/categories/admin-actions", () => ({ saveCategoryAction: mocks.saveCategory }));
vi.mock("@/modules/products/admin-actions", () => ({ saveProductAction: mocks.saveProduct }));

import { CategoryForm } from "@/components/admin/category-form";
import { ProductForm } from "@/components/admin/product-form";

describe("admin catalog form preservation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps entered category fields after an invalid submission", async () => {
    mocks.saveCategory.mockResolvedValue({
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Please correct the category details", fieldErrors: { slug: ["Use lowercase letters"] } },
    });
    render(<CategoryForm />);

    const name = screen.getByLabelText("Name");
    const slug = screen.getByLabelText("Slug");
    fireEvent.change(name, { target: { value: "Woven Baskets" } });
    fireEvent.change(slug, { target: { value: "Woven Baskets" } });
    fireEvent.click(screen.getByRole("button", { name: "Create category" }));

    await screen.findByText("Please correct the category details");
    expect(name).toHaveValue("Woven Baskets");
    expect(slug).toHaveValue("Woven Baskets");
    const submitted = mocks.saveCategory.mock.calls[0][1] as FormData;
    expect(submitted.get("name")).toBe("Woven Baskets");
  });

  it("keeps entered product fields after an invalid submission", async () => {
    mocks.saveProduct.mockResolvedValue({
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Please correct the product details", fieldErrors: { slug: ["Use lowercase letters"] } },
    });
    render(<ProductForm categories={[{ id: "category-1", name: "Baskets" }]} />);

    const name = screen.getByLabelText("Name");
    const slug = screen.getByLabelText("Slug");
    fireEvent.change(name, { target: { value: "Palm Leaf Basket" } });
    fireEvent.change(slug, { target: { value: "Palm Leaf Basket" } });
    fireEvent.click(screen.getByRole("button", { name: "Create product" }));

    await waitFor(() => expect(mocks.saveProduct).toHaveBeenCalledOnce());
    await screen.findByText("Please correct the product details");
    expect(name).toHaveValue("Palm Leaf Basket");
    expect(slug).toHaveValue("Palm Leaf Basket");
    const submitted = mocks.saveProduct.mock.calls[0][1] as FormData;
    expect(submitted.get("slug")).toBe("Palm Leaf Basket");
  });
});
