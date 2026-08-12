import { beforeEach, describe, expect, it, vi } from "vitest";
import { Types } from "mongoose";

const mocks = vi.hoisted(() => ({
  connectMongoose: vi.fn(), countDocuments: vi.fn(), requestSave: vi.fn(),
  uploadFind: vi.fn(), uploadUpdateMany: vi.fn(), sendEmail: vi.fn(),
}));

vi.mock("@/lib/mongoose", () => ({ connectMongoose: mocks.connectMongoose }));
vi.mock("@/modules/email", () => ({ sendNewCustomRequestAdminEmail: mocks.sendEmail }));
vi.mock("@/modules/uploads/model", () => ({ UploadIntentModel: { find: mocks.uploadFind, updateMany: mocks.uploadUpdateMany } }));
vi.mock("@/modules/custom-requests/model", () => ({
  CustomRequestModel: Object.assign(
    vi.fn(function CustomRequestMock() { return { save: mocks.requestSave }; }),
    { countDocuments: mocks.countDocuments },
  ),
}));

import { createCustomRequest } from "@/modules/custom-requests/service";

const intentId = "507f1f77bcf86cd799439011";
const customer = { id: "customer-1", name: "Afnan", email: "a@example.com", phoneE164: "+201012345678", whatsappE164: "+201012345678" };
const input = { title: "Custom runner", description: "A detailed handmade embroidered linen table runner.", colors: [], quantity: 1, uploadIntentIds: [intentId] };

describe("custom request creation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const session = { withTransaction: vi.fn(async (callback: () => Promise<void>) => callback()), endSession: vi.fn() };
    mocks.connectMongoose.mockResolvedValue({ startSession: vi.fn(async () => session) });
    mocks.countDocuments.mockResolvedValue(0);
    mocks.requestSave.mockResolvedValue(undefined);
    mocks.sendEmail.mockResolvedValue(undefined);
    const intents = [{ _id: new Types.ObjectId(intentId), asset: { url: "https://res.cloudinary.com/cloud/image/upload/ref.png", publicId: "ref" } }];
    mocks.uploadFind.mockReturnValue({ session: vi.fn(() => ({ lean: vi.fn(async () => intents) })) });
    mocks.uploadUpdateMany.mockResolvedValue({ modifiedCount: 1 });
  });

  it("claims only completed upload intents owned by the customer", async () => {
    await createCustomRequest(customer, input);

    expect(mocks.uploadFind).toHaveBeenCalledWith(expect.objectContaining({
      userId: "customer-1", purpose: "CUSTOM_REQUEST_REFERENCE", status: "COMPLETED",
    }));
    expect(mocks.uploadUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "customer-1", status: "COMPLETED" }),
      { $set: { status: "CLAIMED" } },
      expect.anything(),
    );
    expect(mocks.requestSave).toHaveBeenCalledOnce();
  });

  it("rejects a customer without a phone before database work", async () => {
    await expect(createCustomRequest({ ...customer, phoneE164: undefined }, input)).rejects.toThrow("Add a phone number");
    expect(mocks.connectMongoose).not.toHaveBeenCalled();
  });
});
