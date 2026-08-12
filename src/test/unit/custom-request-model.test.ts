import { describe, expect, it } from "vitest";
import { CustomRequestModel } from "@/modules/custom-requests/model";

describe("custom request model", () => {
  it("indexes unique request numbers and customer history", () => {
    expect(CustomRequestModel.schema.indexes()).toContainEqual([{ requestNumber: 1 }, expect.objectContaining({ unique: true })]);
    expect(CustomRequestModel.schema.indexes()).toContainEqual([{ userId: 1, createdAt: -1 }, expect.any(Object)]);
  });

  it("keeps internal notes outside customer DTO mapping contracts", () => {
    expect(CustomRequestModel.schema.path("internalNotes")).toBeDefined();
    expect(CustomRequestModel.schema.path("referenceImages")).toBeDefined();
  });
});
