import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState, AdminFilterBar, AdminTable } from "@/components/admin/admin-primitives";
import { CategoryStatusButton } from "@/components/admin/catalog-status-button";
import { listAdminCategories } from "@/modules/categories/admin-repository";
import { categoryAdminFiltersSchema } from "@/modules/categories/admin-schemas";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
function scalar(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

export default async function AdminCategoriesPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const filters = categoryAdminFiltersSchema.parse(Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, scalar(value)])));
  const result = await listAdminCategories(filters);
  return <>
    <AdminPageHeader title="Categories" description="Control storefront navigation order and category availability." action={{ href: "/admin/categories/new", label: "New category" }} />
    <AdminFilterBar><form method="get" className="grid gap-4 md:grid-cols-4"><label className="md:col-span-2"><span className="label-caps">Search</span><input name="search" defaultValue={filters.search} className="mt-2 w-full border-b border-outline-variant bg-transparent py-2 body-sm outline-none focus:border-primary" /></label><label><span className="label-caps">State</span><select name="state" defaultValue={filters.state} className="themed-native-select mt-2 w-full border-b border-outline-variant bg-transparent py-2 body-sm"><option value="ALL">All</option><option value="ACTIVE">Active</option><option value="ARCHIVED">Archived</option></select></label><label><span className="label-caps">Sort</span><select name="sort" defaultValue={filters.sort} className="themed-native-select mt-2 w-full border-b border-outline-variant bg-transparent py-2 body-sm"><option value="order">Display order</option><option value="name">Name</option><option value="newest">Newest update</option></select></label><div className="flex gap-4"><button className="bg-primary px-5 py-3 label-caps text-on-primary">Apply</button><Link href="/admin/categories" className="self-center label-caps underline underline-offset-4">Reset</Link></div></form></AdminFilterBar>
    {result.categories.length ? <AdminTable caption="Admin categories" headings={["Category", "Order", "Products", "Active products", "State", "Actions"]}>{result.categories.map((category) => <tr key={category.id}><td className="px-4 py-4"><Link href={`/admin/categories/${category.id}`} className="font-medium underline-offset-4 hover:underline">{category.name}</Link><p className="text-on-surface-variant">{category.slug}</p></td><td className="px-4 py-4">{category.sortOrder}</td><td className="px-4 py-4">{category.productCount}</td><td className="px-4 py-4">{category.activeProductCount}</td><td className="px-4 py-4"><span className="border border-outline-variant px-2 py-1 label-caps">{category.isActive ? "Active" : "Archived"}</span></td><td className="px-4 py-4"><div className="flex flex-wrap gap-4"><Link href={`/admin/categories/${category.id}`} className="label-caps underline underline-offset-4">Edit</Link><CategoryStatusButton categoryId={category.id} isActive={!category.isActive} label={category.isActive ? "Archive" : "Restore"} /></div></td></tr>)}</AdminTable> : <AdminEmptyState title="No categories found" description="Create a category or adjust the current filters." />}
  </>;
}
