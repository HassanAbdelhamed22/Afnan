import { fireEvent, render, screen } from "@testing-library/react";
import { createElement, useState, type ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminImageUploadField } from "@/components/admin/image-upload-field";
import type { ImageFitMode } from "@/modules/uploads/presentation";

vi.mock("next/image", () => ({
  default: ({ fill, unoptimized, ...props }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; unoptimized?: boolean }) => {
    void fill;
    void unoptimized;
    return createElement("img", props);
  },
}));

function PreviewHarness() {
  const [fitMode, setFitMode] = useState<ImageFitMode>("CONTAIN");
  return <AdminImageUploadField file={new File(["image"], "basket.png", { type: "image/png" })} alt="Woven basket" fitMode={fitMode} onFileChange={() => undefined} onAltChange={() => undefined} onCropChange={() => undefined} onFitModeChange={setFitMode} accept={["image/png"]} maxBytes={1024} aspect={4 / 5} frameLabel="4:5 product" recommendedWidth={1200} recommendedHeight={1500} />;
}

describe("admin image display-style preview", () => {
  beforeEach(() => {
    vi.stubGlobal("URL", { ...URL, createObjectURL: vi.fn(() => "blob:preview"), revokeObjectURL: vi.fn() });
  });

  it("shows the selected display style in the live storefront preview", () => {
    render(<PreviewHarness />);
    expect(screen.getByText("Live storefront preview")).toBeInTheDocument();
    expect(screen.getByText("Fit entire image", { selector: "span[aria-live]" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: /Stretch/ }));
    expect(screen.getByText("Stretch", { selector: "span[aria-live]" })).toBeInTheDocument();
    expect(screen.getByAltText("Woven basket")).toHaveClass("object-fill");
  });
});
