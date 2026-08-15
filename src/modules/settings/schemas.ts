import { z } from "zod";
import { normalizeEgyptianPhone } from "@/lib/phone";

const supportedPlaceholders = new Set(["{customerName}", "{orderNumber}", "{total}", "{deliveryArea}"]);
const socialUrl = z.union([z.literal(""), z.string().url().max(300)]).transform((value) => value || undefined);

export const storeSettingsInputSchema = z.object({
  storeName: z.string().trim().min(2).max(120), adminEmail: z.string().trim().toLowerCase().email().max(200),
  adminWhatsapp: z.string().trim().transform((value, context) => { try { return normalizeEgyptianPhone(value); } catch { context.addIssue({ code: "custom", message: "Enter a valid Egyptian mobile number" }); return z.NEVER; } }),
  orderPrefix: z.string().trim().toUpperCase().min(2).max(12).regex(/^[A-Z0-9-]+$/),
  customRequestPrefix: z.string().trim().toUpperCase().min(2).max(12).regex(/^[A-Z0-9-]+$/),
  whatsappOrderTemplate: z.string().trim().min(20).max(1000),
  instagram: socialUrl, facebook: socialUrl, tiktok: socialUrl,
}).superRefine((value, context) => {
  const placeholders: string[] = value.whatsappOrderTemplate.match(/\{[^{}]+\}/g) ?? [];
  const unknown = placeholders.find((placeholder) => !supportedPlaceholders.has(placeholder));
  if (unknown) context.addIssue({ code: "custom", path: ["whatsappOrderTemplate"], message: `Unsupported placeholder: ${unknown}` });
  for (const required of supportedPlaceholders) if (!placeholders.includes(required)) context.addIssue({ code: "custom", path: ["whatsappOrderTemplate"], message: `Template must include ${required}` });
});

export type StoreSettingsInput = z.infer<typeof storeSettingsInputSchema>;
