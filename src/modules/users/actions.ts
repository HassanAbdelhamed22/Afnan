"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth/auth";
import { NotFoundError } from "@/lib/errors/app-error";
import { actionFailure, actionSuccess, type ActionResult } from "@/lib/results/action-result";
import { getZodFieldErrors } from "@/lib/utils";
import { requireUser } from "@/modules/auth/dal";

import {
  createAddressRecord,
  deleteAddressRecord,
  setDefaultAddressRecord,
  updateAddressRecord,
} from "./repository";
import { addressIdSchema, addressInputSchema, profileInputSchema } from "./schemas";
import type { AddressDTO, CustomerProfileDTO } from "./dto";

type EmptyData = Record<string, never>;

function formText(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

export async function updateProfileAction(
  _previousState: ActionResult<CustomerProfileDTO | null>,
  formData: FormData,
): Promise<ActionResult<CustomerProfileDTO | null>> {
  const session = await requireUser();
  const parsed = profileInputSchema.safeParse({
    name: formText(formData, "name"),
    phone: formText(formData, "phone"),
    whatsappPhone: formText(formData, "whatsappPhone"),
  });

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_ERROR",
      "Please correct the highlighted fields",
      getZodFieldErrors(parsed.error),
    );
  }

  try {
    await auth.api.updateUser({
      headers: await headers(),
      body: {
        name: parsed.data.name,
        phoneE164: parsed.data.phone,
        whatsappE164: parsed.data.whatsappPhone,
      },
    });

    revalidatePath("/account/profile");
    return actionSuccess(
      {
        id: session.user.id,
        name: parsed.data.name,
        email: session.user.email,
        emailVerified: session.user.emailVerified,
        phoneE164: parsed.data.phone,
        whatsappE164: parsed.data.whatsappPhone,
        avatarUrl: session.user.image || undefined,
      },
      "Profile updated",
    );
  } catch {
    return actionFailure("INTERNAL_ERROR", "Profile could not be updated");
  }
}

export async function saveAddressAction(
  _previousState: ActionResult<AddressDTO | null>,
  formData: FormData,
): Promise<ActionResult<AddressDTO | null>> {
  const session = await requireUser();
  const parsed = addressInputSchema.safeParse({
    label: formText(formData, "label"),
    recipientName: formText(formData, "recipientName"),
    phone: formText(formData, "phone"),
    governorateCode: formText(formData, "governorateCode"),
    city: formText(formData, "city"),
    area: formText(formData, "area"),
    street: formText(formData, "street"),
    building: formText(formData, "building"),
    floor: formText(formData, "floor"),
    apartment: formText(formData, "apartment"),
    landmark: formText(formData, "landmark"),
    notes: formText(formData, "notes"),
    isDefault: formData.get("isDefault") === "on",
  });

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_ERROR",
      "Please correct the highlighted fields",
      getZodFieldErrors(parsed.error),
    );
  }

  const rawAddressId = formData.get("addressId");
  const addressId = typeof rawAddressId === "string" && rawAddressId ? rawAddressId : null;
  if (addressId) {
    const parsedId = addressIdSchema.safeParse(addressId);
    if (!parsedId.success) {
      return actionFailure("VALIDATION_ERROR", "Invalid address identifier");
    }
  }

  try {
    const address = addressId
      ? await updateAddressRecord(session.user.id, addressId, parsed.data)
      : await createAddressRecord(session.user.id, parsed.data);
    revalidatePath("/account/addresses");
    return actionSuccess(address, addressId ? "Address updated" : "Address added");
  } catch (error) {
    if (error instanceof NotFoundError) {
      return actionFailure("NOT_FOUND", error.message);
    }
    return actionFailure("INTERNAL_ERROR", "Address could not be saved");
  }
}

export async function deleteAddressAction(
  _previousState: ActionResult<EmptyData>,
  formData: FormData,
): Promise<ActionResult<EmptyData>> {
  const session = await requireUser();
  const parsedId = addressIdSchema.safeParse(formData.get("addressId"));
  if (!parsedId.success) {
    return actionFailure("VALIDATION_ERROR", "Invalid address identifier");
  }

  try {
    await deleteAddressRecord(session.user.id, parsedId.data);
    revalidatePath("/account/addresses");
    return actionSuccess({}, "Address deleted");
  } catch (error) {
    if (error instanceof NotFoundError) {
      return actionFailure("NOT_FOUND", error.message);
    }
    return actionFailure("INTERNAL_ERROR", "Address could not be deleted");
  }
}

export async function setDefaultAddressAction(
  _previousState: ActionResult<EmptyData>,
  formData: FormData,
): Promise<ActionResult<EmptyData>> {
  const session = await requireUser();
  const parsedId = addressIdSchema.safeParse(formData.get("addressId"));
  if (!parsedId.success) {
    return actionFailure("VALIDATION_ERROR", "Invalid address identifier");
  }

  try {
    await setDefaultAddressRecord(session.user.id, parsedId.data);
    revalidatePath("/account/addresses");
    return actionSuccess({}, "Default address updated");
  } catch (error) {
    if (error instanceof NotFoundError) {
      return actionFailure("NOT_FOUND", error.message);
    }
    return actionFailure("INTERNAL_ERROR", "Default address could not be updated");
  }
}
