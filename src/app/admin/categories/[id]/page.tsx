import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CategoryForm } from "@/components/admin/category-form";
import { CategoryImageManager } from "@/components/admin/category-image-manager";
import { CatalogDeleteButton } from "@/components/admin/catalog-delete-button";
import { NotFoundError } from "@/lib/errors/app-error";
import { getAdminCategory } from "@/modules/categories/admin-repository";
export default async function EditAdminCategoryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ image?: string }> }) {
  const { id } = await params;
  const notice = await searchParams;
  let category;
  try { category = await getAdminCategory(id); }
  catch (error) { if (error instanceof NotFoundError) notFound(); throw error; }
  return <><AdminPageHeader title={category.name} description={`${category.productCount} catalog product${category.productCount === 1 ? "" : "s"} currently use this category.`} />{notice.image === "failed" ? <p role="alert" className="mb-6 border-l-2 border-error bg-error-container/20 px-4 py-3 body-sm text-error">The category was created, but its image could not be attached. Please try the image workflow below.</p> : null}<CategoryForm category={category} /><CategoryImageManager categoryId={category.id} categoryName={category.name} image={category.image} /><section className="mt-8 border border-error/40 p-5"><h2 className="title-md">Danger zone</h2><p className="mt-2 mb-4 body-sm text-on-surface-variant">Archive this category and move or remove all of its products before permanent removal.</p><CatalogDeleteButton entity="category" entityId={category.id} entityName={category.name} redirectTo="/admin/categories" /></section></>;
}
