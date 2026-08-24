import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { CatalogDeleteButton } from "@/components/admin/catalog-delete-button";
import { NotFoundError } from "@/lib/errors/app-error";
import { listActiveCategoryOptions } from "@/modules/categories/admin-repository";
import { getAdminProduct } from "@/modules/products/admin-repository";

export default async function EditAdminProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ image?: string; publish?: string }> }) {
  const { id } = await params;
  const notice = await searchParams;
  let product;
  let categories;
  try {
    [product, categories] = await Promise.all([getAdminProduct(id), listActiveCategoryOptions()]);
  } catch (error) { if (error instanceof NotFoundError) notFound(); throw error; }
  return <><AdminPageHeader title={product.name} description={`Edit ${product.slug}. Historical order snapshots are not affected.`} />{notice.image === "failed" ? <p role="alert" className="mb-6 border-l-2 border-error bg-error-container/20 px-4 py-3 body-sm text-error">The product was created as a draft, but its image could not be attached. Please try the image workflow below.</p> : null}{notice.publish === "failed" ? <p role="alert" className="mb-6 border-l-2 border-error bg-error-container/20 px-4 py-3 body-sm text-error">The product and image were saved, but publishing failed. Review the details and activate it after correcting the issue.</p> : null}<ProductForm product={product} categories={categories} /><ProductImageManager productId={product.id} images={product.images} /><section className="mt-8 border border-error/40 p-5"><h2 className="title-md">Danger zone</h2><p className="mt-2 mb-4 body-sm text-on-surface-variant">Archive this product first. Products included in orders cannot be permanently removed.</p><CatalogDeleteButton entity="product" entityId={product.id} entityName={product.name} redirectTo="/admin/products" /></section></>;
}
