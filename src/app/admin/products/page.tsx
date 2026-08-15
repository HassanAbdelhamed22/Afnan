import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState, AdminFilterBar, AdminTable } from "@/components/admin/admin-primitives";
import { ProductStatusButton } from "@/components/admin/catalog-status-button";
import { formatEGP } from "@/lib/money";
import { listActiveCategoryOptions } from "@/modules/categories/admin-repository";
import { listAdminProducts } from "@/modules/products/admin-repository";
import { productAdminFiltersSchema } from "@/modules/products/admin-schemas";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function scalar(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

export default async function AdminProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const filters = productAdminFiltersSchema.parse(Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, scalar(value)])));
  const [result, categories] = await Promise.all([listAdminProducts(filters), listActiveCategoryOptions()]);
  const pageHref = (page: number) => { const params = new URLSearchParams(); Object.entries(filters).forEach(([key, value]) => { if (value !== "" && value !== "ALL" && key !== "limit") params.set(key, String(value)); }); params.set("page", String(page)); return `/admin/products?${params}`; };
  return (
    <>
      <AdminPageHeader title="Products" description="Manage publication, fulfillment, variants, pricing, and stock." action={{ href: "/admin/products/new", label: "New product" }} />
      <AdminFilterBar>
        <form method="get" className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <label className="md:col-span-2"><span className="label-caps">Search</span><input name="search" defaultValue={filters.search} placeholder="Name, slug, or SKU" className="mt-2 w-full border-b border-outline-variant bg-transparent py-2 body-sm outline-none focus:border-primary" /></label>
          <label><span className="label-caps">Status</span><select name="status" defaultValue={filters.status} className="themed-native-select mt-2 w-full border-b border-outline-variant bg-transparent py-2 body-sm"><option value="ALL">All</option><option value="DRAFT">Draft</option><option value="ACTIVE">Active</option><option value="ARCHIVED">Archived</option></select></label>
          <label><span className="label-caps">Fulfillment</span><select name="fulfillmentType" defaultValue={filters.fulfillmentType} className="themed-native-select mt-2 w-full border-b border-outline-variant bg-transparent py-2 body-sm"><option value="ALL">All</option><option value="READY_MADE">Ready made</option><option value="MADE_TO_ORDER">Made to order</option></select></label>
          <label><span className="label-caps">Category</span><select name="categoryId" defaultValue={filters.categoryId} className="themed-native-select mt-2 w-full border-b border-outline-variant bg-transparent py-2 body-sm"><option value="ALL">All</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label><span className="label-caps">Sort</span><select name="sort" defaultValue={filters.sort} className="themed-native-select mt-2 w-full border-b border-outline-variant bg-transparent py-2 body-sm"><option value="newest">Newest update</option><option value="name_asc">Name</option><option value="price_asc">Price low</option><option value="price_desc">Price high</option></select></label>
          <div className="flex items-end gap-4"><button type="submit" className="bg-primary px-5 py-3 label-caps text-on-primary">Apply</button><Link href="/admin/products" className="label-caps underline underline-offset-4">Reset</Link></div>
        </form>
      </AdminFilterBar>
      {result.products.length ? (
        <>
          <p className="mb-3 body-sm text-on-surface-variant">{result.total} product{result.total === 1 ? "" : "s"}</p>
          <AdminTable caption="Admin products" headings={["Product", "Category", "Fulfillment", "Price", "Stock", "Status", "Actions"]}>
            {result.products.map((product) => <tr key={product.id}>
              <td className="px-4 py-4"><Link href={`/admin/products/${product.id}`} className="font-medium underline-offset-4 hover:underline">{product.name}</Link><p className="text-on-surface-variant">{product.slug}</p></td>
              <td className="px-4 py-4">{product.categoryName}</td><td className="px-4 py-4">{product.fulfillmentType === "READY_MADE" ? "Ready made" : "Made to order"}</td>
              <td className="px-4 py-4">{formatEGP(product.basePriceAmount)}</td><td className="px-4 py-4">{product.totalStock ?? "—"}</td>
              <td className="px-4 py-4"><span className="border border-outline-variant px-2 py-1 label-caps">{product.status}</span></td>
              <td className="px-4 py-4"><div className="flex flex-wrap gap-4"><Link href={`/admin/products/${product.id}`} className="label-caps underline underline-offset-4">Edit</Link>{product.status === "ARCHIVED" ? <ProductStatusButton productId={product.id} status="DRAFT" label="Restore" /> : <ProductStatusButton productId={product.id} status="ARCHIVED" label="Archive" />}{product.status === "DRAFT" ? <ProductStatusButton productId={product.id} status="ACTIVE" label="Publish" /> : null}</div></td>
            </tr>)}
          </AdminTable>
          {result.totalPages > 1 ? <nav aria-label="Product pages" className="mt-6 flex justify-end gap-3"><Link aria-disabled={result.page <= 1} href={pageHref(Math.max(1, result.page - 1))} className="border border-primary px-4 py-2 label-caps aria-disabled:pointer-events-none aria-disabled:opacity-40">Previous</Link><span className="body-sm self-center">Page {result.page} of {result.totalPages}</span><Link aria-disabled={result.page >= result.totalPages} href={pageHref(Math.min(result.totalPages, result.page + 1))} className="border border-primary px-4 py-2 label-caps aria-disabled:pointer-events-none aria-disabled:opacity-40">Next</Link></nav> : null}
        </>
      ) : <AdminEmptyState title="No products found" description="Create a product or adjust the current filters." />}
    </>
  );
}
