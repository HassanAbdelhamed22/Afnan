import { beforeEach, describe, expect, it, vi } from "vitest";
import { Types } from "mongoose";

const mocks = vi.hoisted(() => ({
  connectMongoose: vi.fn(),
  exists: vi.fn(),
  updateMany: vi.fn(),
  create: vi.fn(),
  findOne: vi.fn(),
  findOneAndUpdate: vi.fn(),
  findOneAndDelete: vi.fn(),
  updateOne: vi.fn(),
}));

vi.mock("@/lib/mongoose", () => ({ connectMongoose: mocks.connectMongoose }));
vi.mock("@/modules/users/model", () => ({
  AddressModel: {
    exists: mocks.exists,
    updateMany: mocks.updateMany,
    create: mocks.create,
    findOne: mocks.findOne,
    findOneAndUpdate: mocks.findOneAndUpdate,
    findOneAndDelete: mocks.findOneAndDelete,
    updateOne: mocks.updateOne,
  },
}));

import {
  createAddressRecord,
  deleteAddressRecord,
  updateAddressRecord,
} from "@/modules/users/repository";

const addressInput = {
  label: "Home",
  recipientName: "Afnan Customer",
  phone: "+201012345678",
  governorateCode: "cairo",
  city: "Nasr City",
  street: "Makram Ebeid Street",
  building: "12",
  floor: "3",
  apartment: "8",
  isDefault: false,
};

function addressRecord(overrides: Record<string, unknown> = {}) {
  return {
    _id: new Types.ObjectId("507f1f77bcf86cd799439011"),
    label: "Home",
    recipientName: "Afnan Customer",
    phoneE164: "+201012345678",
    governorateCode: "cairo",
    city: "Nasr City",
    street: "Makram Ebeid Street",
    building: "12",
    floor: "3",
    apartment: "8",
    isDefault: true,
    createdAt: new Date("2026-08-01T00:00:00Z"),
    updatedAt: new Date("2026-08-01T00:00:00Z"),
    ...overrides,
  };
}

function leanResult<T>(value: T) {
  return {
    select: vi.fn(() => ({ lean: vi.fn(async () => value) })),
  };
}

describe("address repository ownership and default behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.connectMongoose.mockResolvedValue(undefined);
  });

  it("makes the first customer address the default", async () => {
    mocks.exists.mockResolvedValue(null);
    mocks.updateMany.mockResolvedValue({ modifiedCount: 0 });
    mocks.create.mockResolvedValue(addressRecord());

    const result = await createAddressRecord("customer-1", addressInput);

    expect(mocks.updateMany).toHaveBeenCalledWith(
      { userId: "customer-1", isDefault: true },
      { $set: { isDefault: false } },
    );
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "customer-1", isDefault: true }),
    );
    expect(result.isDefault).toBe(true);
  });

  it("uses userId in both edit lookup and mutation filters", async () => {
    mocks.findOne.mockReturnValue(leanResult({ isDefault: false }));
    mocks.findOneAndUpdate.mockReturnValue({ lean: vi.fn(async () => addressRecord({ isDefault: false })) });

    await updateAddressRecord(
      "customer-1",
      "507f1f77bcf86cd799439011",
      addressInput,
    );

    expect(mocks.findOne).toHaveBeenCalledWith({
      _id: expect.any(Types.ObjectId),
      userId: "customer-1",
    });
    expect(mocks.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: expect.any(Types.ObjectId), userId: "customer-1" },
      expect.anything(),
      expect.anything(),
    );
  });

  it("promotes another owned address after deleting the default", async () => {
    mocks.findOneAndDelete.mockReturnValue(leanResult({ isDefault: true }));
    mocks.findOne.mockReturnValue({
      sort: vi.fn(() => leanResult({ _id: new Types.ObjectId("507f191e810c19729de860ea") })),
    });
    mocks.updateOne.mockResolvedValue({ modifiedCount: 1 });

    await deleteAddressRecord("customer-1", "507f1f77bcf86cd799439011");

    expect(mocks.findOneAndDelete).toHaveBeenCalledWith({
      _id: expect.any(Types.ObjectId),
      userId: "customer-1",
    });
    expect(mocks.findOne).toHaveBeenCalledWith({ userId: "customer-1" });
    expect(mocks.updateOne).toHaveBeenCalledWith(
      { _id: expect.any(Types.ObjectId), userId: "customer-1" },
      { $set: { isDefault: true } },
    );
  });
});
