import { z } from "zod";

import { egyptGovernorateCodes } from "@/config/egypt-governorates";
import { normalizeEgyptianPhone } from "@/lib/phone";

const optionalText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum, `Must contain at most ${maximum} characters`)
    .transform((value) => value || undefined)
    .optional();

export const normalizedEgyptianPhoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .transform((value, context) => {
    try {
      return normalizeEgyptianPhone(value);
    } catch {
      context.addIssue({
        code: "custom",
        message: "Enter a valid Egyptian mobile number",
      });
      return z.NEVER;
    }
  });

export const profileInputSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80, "Name is too long"),
  phone: normalizedEgyptianPhoneSchema,
  whatsappPhone: normalizedEgyptianPhoneSchema,
});

export const addressIdSchema = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Invalid address identifier");

export const addressInputSchema = z.object({
  label: z.string().trim().min(2, "Label is too short").max(40, "Label is too long"),
  recipientName: z
    .string()
    .trim()
    .min(2, "Recipient name is too short")
    .max(80, "Recipient name is too long"),
  phone: normalizedEgyptianPhoneSchema,
  governorateCode: z
    .string()
    .trim()
    .toLowerCase()
    .refine((value) => egyptGovernorateCodes.has(value), "Select a governorate"),
  city: z.string().trim().min(2, "City is required").max(80, "City is too long"),
  area: optionalText(80),
  street: z.string().trim().min(2, "Street is required").max(160, "Street is too long"),
  building: z.string().trim().min(1, "Building is required").max(40, "Building is too long"),
  floor: z.string().trim().min(1, "Floor is required").max(20, "Floor is too long"),
  apartment: z.string().trim().min(1, "Apartment is required").max(20, "Apartment is too long"),
  landmark: optionalText(160),
  notes: optionalText(500),
  isDefault: z.boolean().default(false),
});

export type ProfileInput = z.infer<typeof profileInputSchema>;
export type AddressInput = z.infer<typeof addressInputSchema>;
