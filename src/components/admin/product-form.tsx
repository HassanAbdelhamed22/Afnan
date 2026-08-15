"use client";

import { startTransition, useActionState, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import type { ActionResult } from "@/lib/results/action-result";
import { saveProductAction } from "@/modules/products/admin-actions";
import type { AdminCategoryOptionDTO } from "@/modules/categories/admin-dto";
import type { AdminProductDTO } from "@/modules/products/admin-dto";

type ProductActionData = { productId: string } | null;
const initialState: ActionResult<ProductActionData> = { ok: true, data: null };

type EditableVariant = {
  id?: string; sku: string; label: string; options: string; price: string; stock: string; isActive: boolean;
};

function moneyForInput(amount?: number) { return amount === undefined ? "" : (amount / 100).toFixed(2); }
function parseMoney(value: string) {
  if (!value) return undefined;
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return Number.NaN;
  const [whole, fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
function parseOptions(value: string) {
  return Object.fromEntries(value.split(",").map((pair) => pair.split(":").map((part) => part.trim())).filter((pair): pair is [string, string] => pair.length === 2 && Boolean(pair[0] && pair[1])));
}

export function ProductForm({ product, categories }: { product?: AdminProductDTO; categories: AdminCategoryOptionDTO[] }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveProductAction, initialState);
  const [fulfillmentType, setFulfillmentType] = useState(product?.fulfillmentType ?? "READY_MADE");
  const [variants, setVariants] = useState<EditableVariant[]>(() => product?.variants.map((variant) => ({
    id: variant.id, sku: variant.sku, label: variant.label,
    options: Object.entries(variant.optionValues).map(([key, value]) => `${key}:${value}`).join(", "),
    price: moneyForInput(variant.priceAmount), stock: variant.stockQuantity?.toString() ?? "", isActive: variant.isActive,
  })) ?? [{ sku: "", label: "Default", options: "Style:Default", price: "", stock: "0", isActive: true }]);
  const errors = state.ok ? undefined : state.error.fieldErrors;

  useEffect(() => {
    if (state.ok && state.data?.productId && !product) router.replace(`/admin/products/${state.data.productId}`);
  }, [product, router, state]);

  const serializedVariants = useMemo(() => JSON.stringify(variants.map((variant) => ({
    id: variant.id, sku: variant.sku, label: variant.label, optionValues: parseOptions(variant.options),
    priceAmount: parseMoney(variant.price), stockQuantity: fulfillmentType === "READY_MADE" ? Number(variant.stock) : undefined,
    isActive: variant.isActive,
  }))), [fulfillmentType, variants]);

  function updateVariant(index: number, patch: Partial<EditableVariant>) {
    setVariants((current) => current.map((variant, variantIndex) => variantIndex === index ? { ...variant, ...patch } : variant));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => action(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10" noValidate>
      <input type="hidden" name="productId" value={product?.id ?? ""} />
      <input type="hidden" name="variants" value={serializedVariants} />

      <section className="border border-outline-variant bg-surface p-6">
        <p className="label-caps text-on-surface-variant">Catalog record</p>
        <h2 className="headline-sm mt-2">Product details</h2>
        <div className="mt-7 grid gap-x-8 gap-y-7 md:grid-cols-2">
          <FormField htmlFor="product-name" label="Name" error={errors?.name?.[0]}><Input id="product-name" name="name" defaultValue={product?.name} required /></FormField>
          <FormField htmlFor="product-slug" label="Slug" hint="This becomes the product's web address. Use short lowercase words joined by hyphens, for example: handmade-linen-bag. Avoid changing it after publishing because old links may stop working." error={errors?.slug?.[0]}><Input id="product-slug" name="slug" defaultValue={product?.slug} placeholder="handmade-linen-bag" required /></FormField>
          <FormField htmlFor="product-description" label="Description" error={errors?.description?.[0]} className="md:col-span-2">
            <textarea id="product-description" name="description" rows={6} defaultValue={product?.description} className="w-full resize-y border-b border-outline-variant bg-transparent py-2 body-md outline-none focus:border-primary" required />
          </FormField>
          <FormField htmlFor="product-category" label="Category" error={errors?.categoryId?.[0]}>
            <select id="product-category" name="categoryId" defaultValue={product?.categoryId ?? ""} className="themed-native-select w-full border-b border-outline-variant bg-transparent py-2 body-md outline-none focus:border-primary" required>
              <option value="" disabled>Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </FormField>
          <FormField htmlFor="product-price" label="Base price (EGP)" error={errors?.basePriceAmount?.[0]}><Input id="product-price" name="basePrice" inputMode="decimal" defaultValue={moneyForInput(product?.basePriceAmount)} required /></FormField>
          <FormField htmlFor="product-fulfillment" label="Fulfillment" error={errors?.fulfillmentType?.[0]}>
            <select id="product-fulfillment" name="fulfillmentType" value={fulfillmentType} onChange={(event) => setFulfillmentType(event.target.value as typeof fulfillmentType)} className="themed-native-select w-full border-b border-outline-variant bg-transparent py-2 body-md outline-none focus:border-primary">
              <option value="READY_MADE">Ready made</option><option value="MADE_TO_ORDER">Made to order</option>
            </select>
          </FormField>
          <FormField htmlFor="product-status" label="Lifecycle status" hint="Draft keeps the product private, Active publishes it in the shop, and Archived hides it without deleting its order history." error={errors?.status?.[0]}>
            <select id="product-status" name="status" defaultValue={product?.status ?? "DRAFT"} className="themed-native-select w-full border-b border-outline-variant bg-transparent py-2 body-md outline-none focus:border-primary">
              <option value="DRAFT">Draft</option><option value="ACTIVE">Active</option><option value="ARCHIVED">Archived</option>
            </select>
          </FormField>
          <FormField htmlFor="product-materials" label="Materials (comma separated)" error={errors?.materials?.[0]}><Input id="product-materials" name="materials" defaultValue={product?.materials.join(", ")} /></FormField>
          <FormField htmlFor="product-colors" label="Colors (comma separated)" error={errors?.colors?.[0]}><Input id="product-colors" name="colors" defaultValue={product?.colors.join(", ")} /></FormField>
          <FormField htmlFor="product-tags" label="Tags (comma separated)" error={errors?.tags?.[0]} className="md:col-span-2"><Input id="product-tags" name="tags" defaultValue={product?.tags.join(", ")} /></FormField>
          <div className="grid grid-cols-3 gap-4 md:col-span-2">
            <FormField htmlFor="product-width" label="Width cm"><Input id="product-width" name="width" type="number" min="1" defaultValue={product?.dimensions?.width} /></FormField>
            <FormField htmlFor="product-height" label="Height cm"><Input id="product-height" name="height" type="number" min="1" defaultValue={product?.dimensions?.height} /></FormField>
            <FormField htmlFor="product-depth" label="Depth cm"><Input id="product-depth" name="depth" type="number" min="1" defaultValue={product?.dimensions?.depth} /></FormField>
          </div>
          {fulfillmentType === "MADE_TO_ORDER" ? (
            <div className="grid grid-cols-2 gap-5 md:col-span-2">
              <FormField htmlFor="prep-min" label="Minimum preparation days" error={errors?.preparationDaysMin?.[0]}><Input id="prep-min" name="preparationDaysMin" type="number" min="1" defaultValue={product?.preparationDaysMin} required /></FormField>
              <FormField htmlFor="prep-max" label="Maximum preparation days" error={errors?.preparationDaysMax?.[0]}><Input id="prep-max" name="preparationDaysMax" type="number" min="1" defaultValue={product?.preparationDaysMax} required /></FormField>
            </div>
          ) : null}
          <FormField htmlFor="care-instructions" label="Care instructions" className="md:col-span-2"><textarea id="care-instructions" name="careInstructions" rows={3} defaultValue={product?.careInstructions} className="w-full border-b border-outline-variant bg-transparent py-2 body-md outline-none focus:border-primary" /></FormField>
          <Checkbox name="personalizationAvailable" label="Personalization available" defaultChecked={product?.personalizationAvailable} />
          <Checkbox name="isFeatured" label="Featured on storefront" defaultChecked={product?.isFeatured} />
          <FormField htmlFor="personalization-instructions" label="Personalization instructions" error={errors?.personalizationInstructions?.[0]} className="md:col-span-2"><textarea id="personalization-instructions" name="personalizationInstructions" rows={3} defaultValue={product?.personalizationInstructions} className="w-full border-b border-outline-variant bg-transparent py-2 body-md outline-none focus:border-primary" /></FormField>
        </div>
      </section>

      <section className="border border-outline-variant bg-surface p-6">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="label-caps text-on-surface-variant">Purchasable options</p><h2 className="headline-sm mt-2">Variants</h2></div><Button type="button" variant="secondary" onClick={() => setVariants((current) => [...current, { sku: "", label: "", options: "", price: "", stock: fulfillmentType === "READY_MADE" ? "0" : "", isActive: true }])}>Add variant</Button></div>
        {errors?.variants?.[0] ? <p role="alert" className="mt-4 body-sm text-error">{errors.variants[0]}</p> : null}
        <div className="mt-6 space-y-5">
          {variants.map((variant, index) => (
            <fieldset key={variant.id ?? index} className="grid gap-5 border border-outline-variant bg-surface-container-low p-5 md:grid-cols-2 lg:grid-cols-3">
              <legend className="px-2 label-caps">Variant {index + 1}</legend>
              <FormField label="SKU" hint="Your internal code for this exact variant. Every variant must have a different SKU. Combine recognizable details, for example: BAG-LINEN-NAT-L."><Input value={variant.sku} onChange={(event) => updateVariant(index, { sku: event.target.value })} placeholder="BAG-LINEN-NAT-L" required /></FormField>
              <FormField label="Label" hint="The short variant name customers see, such as Natural / Large or Blue / Standard."><Input value={variant.label} onChange={(event) => updateVariant(index, { label: event.target.value })} placeholder="Natural / Large" required /></FormField>
              <FormField label="Options (Name:Value)" hint="List each choice as a name and value separated by a colon. Separate multiple choices with commas, for example: Size:Large, Color:Natural."><Input value={variant.options} onChange={(event) => updateVariant(index, { options: event.target.value })} placeholder="Size:Large, Color:Natural" required /></FormField>
              <FormField label="Price override (EGP)" hint="Leave this empty to use the product's base price. Enter a value only when this variant costs more or less."><Input inputMode="decimal" value={variant.price} onChange={(event) => updateVariant(index, { price: event.target.value })} placeholder="Uses base price" /></FormField>
              {fulfillmentType === "READY_MADE" ? <FormField label="Stock" hint="The number of finished units currently available for this exact variant. The shop prevents customers from ordering more than this amount."><Input type="number" min="0" value={variant.stock} onChange={(event) => updateVariant(index, { stock: event.target.value })} required /></FormField> : null}
              <div className="flex items-end justify-between gap-4">
                <Checkbox label="Active" checked={variant.isActive} onChange={(event) => updateVariant(index, { isActive: event.target.checked })} />
                {variants.length > 1 ? <Button type="button" variant="text" className="text-error" onClick={() => setVariants((current) => current.filter((_, variantIndex) => variantIndex !== index))}>Remove</Button> : null}
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      {!state.ok ? <p role="alert" className="border-l-2 border-error bg-error-container/30 px-4 py-3 body-sm text-error">{state.error.message}</p> : state.message ? <p role="status" className="border-l-2 border-primary bg-surface px-4 py-3 body-sm">{state.message}</p> : null}
      <div className="flex justify-end border-t border-outline-variant pt-6"><Button type="submit" disabled={pending}>{pending ? "Saving…" : product ? "Save product" : "Create product"}</Button></div>
    </form>
  );
}
