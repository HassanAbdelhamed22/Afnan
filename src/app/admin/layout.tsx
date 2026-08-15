import React from "react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/modules/auth/dal";
import { ForbiddenError, UnauthenticatedError } from "@/lib/errors/app-error";
import { AdminShell } from "@/components/admin/admin-shell";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      redirect("/login?returnTo=/admin&message=Please+sign+in+first");
    }
    if (error instanceof ForbiddenError) {
      redirect("/unauthorized");
    }
    throw error;
  }

  return <AdminShell adminName={admin.user.name} adminEmail={admin.user.email}>{children}</AdminShell>;
}
