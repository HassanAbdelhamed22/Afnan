import { describe, expect, it } from "vitest";
import { UploadIntentModel } from "@/modules/uploads/model";

describe("upload intent model", () => {
  it("has unique asset and expiry indexes", () => {
    expect(UploadIntentModel.schema.indexes()).toContainEqual([{ publicId: 1 }, expect.objectContaining({ unique: true })]);
    expect(UploadIntentModel.schema.indexes()).toContainEqual([{ expiresAt: 1 }, expect.objectContaining({ expireAfterSeconds: 0 })]);
  });
});
