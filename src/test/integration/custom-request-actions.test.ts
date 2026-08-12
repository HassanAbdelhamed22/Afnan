import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireUser: vi.fn(), createCustomRequest: vi.fn(), revalidatePath: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/modules/auth/dal", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/modules/custom-requests/service", () => ({ createCustomRequest: mocks.createCustomRequest }));

import { createCustomRequestAction } from "@/modules/custom-requests/actions";

const valid = { title: "Custom table runner", description: "A handmade linen runner with embroidered blue flowers.", quantity: 1, uploadIntentIds: [] };

describe("custom request action", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.requireUser.mockResolvedValue({ user: { id: "customer-1", name: "Afnan", email: "a@example.com", phoneE164: "+201012345678", whatsappE164: "+201012345678" } }); mocks.createCustomRequest.mockResolvedValue("CR-1"); });
  it("authenticates before returning validation errors", async () => {
    const result = await createCustomRequestAction({});
    expect(mocks.requireUser).toHaveBeenCalledOnce();
    expect(mocks.createCustomRequest).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
  });
  it("uses the authenticated contact snapshot", async () => {
    await createCustomRequestAction(valid);
    expect(mocks.createCustomRequest).toHaveBeenCalledWith(expect.objectContaining({ id: "customer-1", email: "a@example.com" }), expect.objectContaining({ title: valid.title }));
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/account/custom-requests");
  });
});
