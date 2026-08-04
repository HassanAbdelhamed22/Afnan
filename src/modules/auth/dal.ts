import "server-only";

import { cache } from "react";
import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";
import {
  ForbiddenError,
  UnauthenticatedError,
} from "@/lib/errors/app-error";

export const getCurrentSession =
  cache(async () => {
    return auth.api.getSession({
      headers: await headers(),
    });
  });

export async function requireUser() {
  const session =
    await getCurrentSession();

  if (!session) {
    throw new UnauthenticatedError();
  }

  if (
    session.user.status !== "ACTIVE"
  ) {
    throw new ForbiddenError(
      "This account is unavailable",
    );
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireUser();

  if (session.user.role !== "ADMIN") {
    throw new ForbiddenError(
      "Administrator access is required",
    );
  }

  return session;
}

export async function getCurrentUserDTO() {
  const session =
    await getCurrentSession();

  if (!session) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    phoneE164:
      session.user.phoneE164,
    whatsappE164:
      session.user.whatsappE164,
  };
}
