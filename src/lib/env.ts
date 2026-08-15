// src/lib/env.ts
import "server-only";

import { z } from "zod";

import { getZodFieldErrors } from "@/lib/utils";

import fs from "fs";
import path from "path";

if (process.env.NODE_ENV !== "test" && !process.env.MONGODB_URI) {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const firstEqual = trimmed.indexOf("=");
          if (firstEqual !== -1) {
            const key = trimmed.slice(0, firstEqual).trim();
            const val = trimmed.slice(firstEqual + 1).trim();
            process.env[key] ??= val;
          }
        }
      });
    }
  } catch (err) {
    console.error("Failed to load .env.local manually:", err);
  }
}

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

  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    getZodFieldErrors(parsed.error),
  );

  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;
