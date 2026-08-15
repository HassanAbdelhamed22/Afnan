import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CategoryForm } from "@/components/admin/category-form";
export default function NewAdminCategoryPage() { return <><AdminPageHeader title="New category" description="Add a storefront category with an intentional display order." /><CategoryForm /><p className="mt-6 border border-outline-variant bg-surface-container-low p-5 body-sm text-on-surface-variant">Create the category first. Its secure storefront image workflow will appear on the edit page.</p></>; }
