import React from "react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/modules/auth/dal";
import { ForbiddenError, UnauthenticatedError } from "@/lib/errors/app-error";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      redirect("/login?returnTo=/admin&message=Please+sign+in+first");
    }
    if (error instanceof ForbiddenError) {
      redirect("/unauthorized");
    }
    throw error;
  }

  return (
    <div className="flex min-h-screen bg-[#F7F7F5]">
      {/* Admin Operations Layout Container */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
