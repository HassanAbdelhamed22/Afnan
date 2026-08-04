import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .max(128, "Password is too long");

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name is too short")
      .max(80, "Name is too long"),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email"),

    phone: z
      .string()
      .trim()
      .min(1, "Phone number is required"),

    whatsappPhone: z
      .string()
      .trim()
      .min(
        1,
        "WhatsApp number is required",
      ),

    password: passwordSchema,

    confirmPassword: z.string(),
  })
  .refine(
    (value) =>
      value.password === value.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    },
  );

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email"),

  password: z
    .string()
    .min(1, "Password is required"),

  returnTo: z
    .string()
    .optional(),
});

export const forgotPasswordSchema =
  z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email"),
  });

export const resetPasswordSchema =
  z
    .object({
      token: z.string().min(1),
      password: passwordSchema,
      confirmPassword: z.string(),
    })
    .refine(
      (value) =>
        value.password ===
        value.confirmPassword,
      {
        path: ["confirmPassword"],
        message: "Passwords do not match",
      },
    );
