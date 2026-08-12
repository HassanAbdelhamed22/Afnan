import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ connectMongoose: vi.fn(), findOne: vi.fn() }));
vi.mock("@/lib/mongoose", () => ({ connectMongoose: mocks.connectMongoose }));
vi.mock("@/modules/custom-requests/model", () => ({ CustomRequestModel: { findOne: mocks.findOne, find: vi.fn() } }));

import { getCustomerCustomRequestByNumber } from "@/modules/custom-requests/repository";

describe("custom request ownership", () => {
  beforeEach(() => vi.clearAllMocks());
  it("uses both customer ID and request number and projects no internal notes", async () => {
    const select = vi.fn(() => ({ lean: vi.fn(async () => null) }));
    mocks.findOne.mockReturnValue({ select });
    await expect(getCustomerCustomRequestByNumber("customer-1", "CR-1")).rejects.toThrow("Custom request not found");
    expect(mocks.findOne).toHaveBeenCalledWith({ userId: "customer-1", requestNumber: "CR-1" });
    expect(select).toHaveBeenCalledWith(expect.not.stringContaining("internalNotes"));
  });
});
