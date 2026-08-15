import React from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState } from "@/components/admin/admin-primitives";

export default function AdminDashboardPage() {
  return (
    <>
      <AdminPageHeader title="Overview" description="The operational view for orders, requests, and catalog work." />
      <AdminEmptyState title="Operational summary is being prepared" description="Dashboard counts and recent work will appear here after the operational modules are connected." />
    </>
  );
}
