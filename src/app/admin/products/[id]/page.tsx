import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { NotFoundError } from "@/lib/errors/app-error";
import { listActiveCategoryOptions } from "@/modules/categories/admin-repository";
import { getAdminProduct } from "@/modules/products/admin-repository";

export default async function EditAdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let product;
  let categories;
  try {
    [product, categories] = await Promise.all([getAdminProduct(id), listActiveCategoryOptions()]);
  } catch (error) { if (error instanceof NotFoundError) notFound(); throw error; }
  return <><AdminPageHeader title={product.name} description={`Edit ${product.slug}. Historical order snapshots are not affected.`} /><ProductForm product={product} categories={categories} /></>;
}
