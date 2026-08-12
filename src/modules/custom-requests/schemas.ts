import { z } from "zod";
import { MAX_CUSTOM_REQUEST_IMAGES } from "@/modules/uploads/schemas";

const optionalText = (maximum: number) => z.preprocess((value) => typeof value === "string" && value.trim() === "" ? undefined : value, z.string().trim().max(maximum).optional());
const optionalMoney = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 100) : value;
}, z.number().int().nonnegative().max(100_000_000).optional());

export const customRequestSchema = z.object({
  title: z.string().trim().min(3, "Enter a request title").max(100),
  description: z.string().trim().min(20, "Describe what you would like in at least 20 characters").max(3000),
  material: optionalText(120),
  colors: optionalText(200).transform((value) => value ? value.split(",").map((color) => color.trim()).filter(Boolean).slice(0, 10) : []),
  dimensions: optionalText(200),
  quantity: z.coerce.number().int().min(1).max(99),
  desiredDate: z.preprocess((value) => value === "" ? undefined : value, z.string().date().optional()),
  budgetMinAmount: optionalMoney,
  budgetMaxAmount: optionalMoney,
  uploadIntentIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).max(MAX_CUSTOM_REQUEST_IMAGES),
}).superRefine((value, context) => {
  if (value.budgetMinAmount !== undefined && value.budgetMaxAmount !== undefined && value.budgetMinAmount > value.budgetMaxAmount) context.addIssue({ code: "custom", path: ["budgetMaxAmount"], message: "Maximum budget must be at least the minimum budget" });
  if (value.desiredDate && value.desiredDate < new Date().toISOString().slice(0, 10)) context.addIssue({ code: "custom", path: ["desiredDate"], message: "Desired date cannot be in the past" });
});

export type CustomRequestInput = z.infer<typeof customRequestSchema>;
