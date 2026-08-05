import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

/**
 * Matches Egyptian mobile numbers: 01[0125] followed by 8 digits.
 * Accepts optional country prefix (+20, 0020, 20).
 */
export const EGYPTIAN_PHONE_REGEX = /^(?:\+?20|0020)?0?1[0125]\d{8}$/;

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name is too short")
      .max(80, "Name is too long"),

    email: z.string().trim().toLowerCase().email("Enter a valid email"),

    phone: z
      .string()
      .trim()
      .min(1, "Phone number is required")
      .regex(EGYPTIAN_PHONE_REGEX, "Enter a valid Egyptian mobile number"),

    whatsappPhone: z.string().trim().optional().default(""),

    sameAsWhatsApp: z
      .enum(["true", "false", "on", ""])
      .optional()
      .default("true"),

    password: passwordSchema,

    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine(
    (value) => {
      const isSame =
        value.sameAsWhatsApp === "true" || value.sameAsWhatsApp === "on";
      if (isSame) return true;
      /* When not same, whatsappPhone must be a valid Egyptian number */
      return (
        !!value.whatsappPhone && EGYPTIAN_PHONE_REGEX.test(value.whatsappPhone)
      );
    },
    {
      path: ["whatsappPhone"],
      message: "Enter a valid Egyptian mobile number",
    },
  );

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),

  password: z.string().min(1, "Password is required"),

  returnTo: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
