import React from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/modules/auth/dal";
import { ForbiddenError, UnauthenticatedError } from "@/lib/errors/app-error";

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
  try {
    await requireUser();
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      redirect("/login?returnTo=/account/profile&message=Please+sign+in+first");
    }
    if (error instanceof ForbiddenError) {
      redirect("/unauthorized");
    }
    throw error;
  }

  return (
    <div className="flex-1 flex flex-col">
      {children}
    </div>
  );
}
