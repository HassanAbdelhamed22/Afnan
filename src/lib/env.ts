// src/lib/env.ts
import "server-only";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  MONGODB_URI: z.string().min(1),
  MONGODB_DB_NAME: z.string().min(1).default("afnan"),

  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  RESEND_API_KEY: z.string().min(1),
  AUTH_EMAIL_FROM: z.string().min(1),
  ADMIN_EMAIL: z.string().email(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );

  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;
