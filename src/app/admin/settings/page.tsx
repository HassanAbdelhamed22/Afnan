import React from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import { requireAdmin } from "@/modules/auth/dal";
import { getAdminStoreSettings } from "@/modules/settings/repository";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  const settings = await getAdminStoreSettings(admin.user.email);
  return (
    <><AdminPageHeader title="Store settings" description="Manage public contact details, operational prefixes, and the WhatsApp confirmation template. Provider secrets remain in environment variables." /><StoreSettingsForm settings={settings} /></>
  );
}
