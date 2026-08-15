import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { listActiveCategoryOptions } from "@/modules/categories/admin-repository";

export default async function NewAdminProductPage() {
  const categories = await listActiveCategoryOptions();
  return <><AdminPageHeader title="New product" description="Create the catalog record as a draft, then add approved imagery before publishing." /><ProductForm categories={categories} /></>;
}
