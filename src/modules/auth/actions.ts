"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  isAPIError,
} from "better-auth/api";

import { auth } from "@/lib/auth/auth";
import { env } from "@/lib/env";
import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "@/lib/results/action-result";
import { normalizeEgyptianPhone } from "@/lib/phone";

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./schemas";
import { getSafeReturnTo } from "./utils";
import { getZodFieldErrors } from "@/lib/utils";

type EmptyData = Record<string, never>;

export async function registerAction(
  _previousState: ActionResult<EmptyData>,
  formData: FormData,
): Promise<ActionResult<EmptyData>> {
  const rawWhatsAppPhone = formData.get("whatsappPhone");
  const rawSameAsWhatsApp = formData.get("sameAsWhatsApp");
  
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    whatsappPhone: rawWhatsAppPhone ?? "",
    sameAsWhatsApp: rawSameAsWhatsApp ?? (rawWhatsAppPhone ? "false" : "true"),
    password: formData.get("password"),
    confirmPassword:
      formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_ERROR",
      "Please correct the highlighted fields",
      getZodFieldErrors(parsed.error),
    );
  }

  const isSame =
    parsed.data.sameAsWhatsApp === "true" ||
    parsed.data.sameAsWhatsApp === "on";

  const rawWhatsApp = isSame
    ? parsed.data.phone
    : parsed.data.whatsappPhone || parsed.data.phone;

  let phoneE164: string;
  let whatsappE164: string;

  try {
    phoneE164 =
      normalizeEgyptianPhone(
        parsed.data.phone,
      );

    whatsappE164 =
      normalizeEgyptianPhone(rawWhatsApp);
  } catch {
    return actionFailure(
      "VALIDATION_ERROR",
      "Enter valid Egyptian phone numbers",
      {
        phone: [
          "Enter a valid Egyptian mobile number",
        ],
      },
    );
  }

  try {
    await auth.api.signUpEmail({
      headers: await headers(),

      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        phoneE164,
        whatsappE164,
      },
    });

    /*
     * With autoSignIn false, keep this message
     * generic whether the email was new or existing.
     */
    return actionSuccess(
      {},
      "Registration completed. You can now sign in.",
    );
  } catch (error) {
    console.error(
      "Registration failure",
      error,
    );

    return actionFailure(
      "INTERNAL_ERROR",
      "Registration could not be completed",
    );
  }
}

export async function loginAction(
  _previousState: ActionResult<EmptyData>,
  formData: FormData,
): Promise<ActionResult<EmptyData>> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    returnTo: formData.get("returnTo") || undefined,
  });

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_ERROR",
      "Please correct the highlighted fields",
      getZodFieldErrors(parsed.error),
    );
  }

  const returnTo =
    getSafeReturnTo(
      parsed.data.returnTo ?? null,
    );

  try {
    await auth.api.signInEmail({
      headers: await headers(),

      body: {
        email: parsed.data.email,
        password: parsed.data.password,
        rememberMe: true,
      },
    });
  } catch (error) {
    /*
     * Do not reveal whether the email,
     * password or account status failed.
     */
    if (isAPIError(error)) {
      return actionFailure(
        "INVALID_CREDENTIALS",
        "Invalid email or password",
      );
    }

    throw error;
  }

  /*
   * redirect() throws internally, so keep it
   * outside the try/catch.
   */
  redirect(returnTo);
}

export async function logoutAction(): Promise<never> {
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/");
}

export async function forgotPasswordAction(
  _previousState: ActionResult<EmptyData>,
  formData: FormData,
): Promise<ActionResult<EmptyData>> {
  const parsed =
    forgotPasswordSchema.safeParse({
      email: formData.get("email"),
    });

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_ERROR",
      "Enter a valid email",
      getZodFieldErrors(parsed.error),
    );
  }

  try {
    await auth.api.requestPasswordReset({
      body: {
        email: parsed.data.email,

        redirectTo:
          `${env.NEXT_PUBLIC_APP_URL}` +
          "/reset-password",
      },
    });
  } catch (error) {
    /*
     * Log internally, but return the same
     * public response.
     */
    console.error(
      "Password reset request failed",
      error,
    );
  }

  return actionSuccess(
    {},
    "If the account exists, a reset link has been sent.",
  );
}

export async function resetPasswordAction(
  _previousState: ActionResult<EmptyData>,
  formData: FormData,
): Promise<ActionResult<EmptyData>> {
  const parsed =
    resetPasswordSchema.safeParse({
      token: formData.get("token"),
      password: formData.get("password"),
      confirmPassword:
        formData.get("confirmPassword"),
    });

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_ERROR",
      "Please correct the highlighted fields",
      getZodFieldErrors(parsed.error),
    );
  }

  try {
    await auth.api.resetPassword({
      body: {
        token: parsed.data.token,
        newPassword:
          parsed.data.password,
      },
    });

    return actionSuccess(
      {},
      "Your password has been reset",
    );
  } catch {
    return actionFailure(
      "INVALID_STATE",
      "This reset link is invalid or expired",
    );
  }
}
