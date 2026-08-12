"use server";

import { revalidatePath } from "next/cache";
import { AppError } from "@/lib/errors/app-error";
import { actionFailure, actionSuccess, type ActionResult } from "@/lib/results/action-result";
import { getZodFieldErrors } from "@/lib/utils";
import { requireUser } from "@/modules/auth/dal";
import type { CreateCustomRequestResultDTO } from "./dto";
import { customRequestSchema } from "./schemas";
import { createCustomRequest } from "./service";

export async function createCustomRequestAction(input: unknown): Promise<ActionResult<CreateCustomRequestResultDTO>> {
  const session = await requireUser();
  const parsed = customRequestSchema.safeParse(input);
  if (!parsed.success) return actionFailure("VALIDATION_ERROR", "Please correct the request details", getZodFieldErrors(parsed.error));
  try {
    const requestNumber = await createCustomRequest({ id: session.user.id, name: session.user.name, email: session.user.email, phoneE164: session.user.phoneE164, whatsappE164: session.user.whatsappE164 }, parsed.data);
    revalidatePath("/account/custom-requests");
    return actionSuccess({ requestNumber }, "Custom request submitted");
  } catch (error) {
    if (error instanceof AppError) return actionFailure(error.code, error.message);
    return actionFailure("INTERNAL_ERROR", "The custom request could not be submitted");
  }
}
