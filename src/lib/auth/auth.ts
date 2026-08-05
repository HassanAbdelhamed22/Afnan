import "server-only";

import { after } from "next/server";
import { ObjectId } from "mongodb";

import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";

import {
  authDatabase,
  authMongoClient,
} from "@/lib/auth/mongo-client";
import { sendPasswordResetEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { normalizeEgyptianPhone } from "@/lib/phone";

type AdditionalUserFields = {
  phoneE164?: string;
  whatsappE164?: string;
  role?: "CUSTOMER" | "ADMIN";
  status?: "ACTIVE" | "SUSPENDED";
};

export const auth = betterAuth({
  appName: "Afnan",

  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  trustedOrigins: [
    env.NEXT_PUBLIC_APP_URL,
  ],

  database: mongodbAdapter(authDatabase, {
    client: authMongoClient,
  }),

  emailAndPassword: {
    enabled: true,

    minPasswordLength: 8,
    maxPasswordLength: 128,

    requireEmailVerification: false,

    /*
     * Keeping this false gives Better Auth stronger
     * duplicate-email enumeration protection.
     * The customer signs in after registration.
     */
    autoSignIn: false,

    resetPasswordTokenExpiresIn: 60 * 60,

    revokeSessionsOnPasswordReset: true,

    sendResetPassword: async ({ user, url }) => {
      /*
       * Avoid making response timing depend on the
       * email provider.
       */
      after(async () => {
        try {
          await sendPasswordResetEmail({
            email: user.email,
            name: user.name,
            resetUrl: url,
          });
        } catch (error) {
          console.error(
            "Password reset email failed",
            {
              userId: user.id,
              error,
            },
          );
        }
      });
    },
  },

  user: {
    additionalFields: {
      phoneE164: {
        type: "string",
        required: true,
        input: true,
        returned: true,
      },

      whatsappE164: {
        type: "string",
        required: true,
        input: true,
        returned: true,
      },

      role: {
        type: ["CUSTOMER", "ADMIN"],
        required: true,
        defaultValue: "CUSTOMER",
        input: false,
        returned: true,
      },

      status: {
        type: ["ACTIVE", "SUSPENDED"],
        required: true,
        defaultValue: "ACTIVE",
        input: false,
        returned: true,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const extendedUser =
            user as typeof user &
              AdditionalUserFields;

          try {
            return {
              data: {
                ...user,
                email: user.email
                  .trim()
                  .toLowerCase(),

                phoneE164:
                  normalizeEgyptianPhone(
                    extendedUser.phoneE164 ?? "",
                  ),

                whatsappE164:
                  normalizeEgyptianPhone(
                    extendedUser.whatsappE164 ?? "",
                  ),

                role: "CUSTOMER",
                status: "ACTIVE",
              },
            };
          } catch {
            throw new APIError("BAD_REQUEST", {
              message:
                "Enter valid Egyptian phone numbers",
            });
          }
        },
      },
    },

    session: {
      create: {
        before: async (session) => {
          /*
           * The MongoDB adapter persists user IDs in `_id` as ObjectId.
           * Better Auth exposes the same value to hooks as a string.
           */
          if (!ObjectId.isValid(session.userId)) {
            throw new APIError("FORBIDDEN", {
              message:
                "This account is unavailable",
            });
          }

          const user =
            await authDatabase
              .collection("user")
              .findOne(
                {
                  _id: new ObjectId(
                    session.userId,
                  ),
                },
                {
                  projection: {
                    status: 1,
                  },
                },
              );

          if (!user || user.status !== "ACTIVE") {
            throw new APIError("FORBIDDEN", {
              message:
                "This account is unavailable",
            });
          }

          return {
            data: session,
          };
        },
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,

    cookieCache: {
      enabled: false,
    },
  },

  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
  },

  advanced: {
    cookiePrefix: "afnan",
  },

  plugins: [
    /*
     * Keep nextCookies last.
     */
    nextCookies(),
  ],
});

export type AfnanSession =
  typeof auth.$Infer.Session;
