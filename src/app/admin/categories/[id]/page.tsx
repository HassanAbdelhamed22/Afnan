import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CategoryForm } from "@/components/admin/category-form";
import { NotFoundError } from "@/lib/errors/app-error";
import { getAdminCategory } from "@/modules/categories/admin-repository";
export default async function EditAdminCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let category;
  try { category = await getAdminCategory(id); }
  catch (error) { if (error instanceof NotFoundError) notFound(); throw error; }
  return <><AdminPageHeader title={category.name} description={`${category.productCount} catalog product${category.productCount === 1 ? "" : "s"} currently use this category.`} /><CategoryForm category={category} /></>;
}
