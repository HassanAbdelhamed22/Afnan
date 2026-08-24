import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { listActiveCategoryOptions } from "@/modules/categories/admin-repository";

export default async function NewAdminProductPage() {
  const categories = await listActiveCategoryOptions();
  return <><AdminPageHeader title="New product" description="Create the catalog record and compose its primary storefront image in one flow." /><ProductForm categories={categories} /></>;
}
