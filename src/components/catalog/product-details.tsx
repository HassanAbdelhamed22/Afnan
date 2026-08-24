"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ProductDetailDTO } from "@/modules/catalog/dto";
import { formatEGP } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resolveImageFitMode } from "@/modules/uploads/presentation";
import { useSession } from "@/lib/auth/auth-client";
import { toast } from "@/components/ui/toast";
import { addToCartAction } from "@/modules/cart/actions";
import { WishlistButton } from "@/components/wishlist/wishlist-button";

interface ProductDetailsProps {
  product: ProductDetailDTO;
  categoryName?: string;
  categorySlug?: string;
}

export function ProductDetails({
  product,
  categoryName,
  categorySlug,
}: ProductDetailsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [addingToCart, startAddingToCart] = React.useTransition();
  // Gallery state
  const [activeImageIdx, setActiveImageIdx] = React.useState(0);
  const activeImage = product.images?.[activeImageIdx] || null;
  const [imageFade, setImageFade] = React.useState(true);

  const handleImageChange = (idx: number) => {
    setImageFade(false);
    setTimeout(() => {
      setActiveImageIdx(idx);
      setImageFade(true);
    }, 150);
  };

  // Accordion state
  const [openSection, setOpenSection] = React.useState<string | null>(null);
  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  // Variant state (default to first active variant if available)
  const activeVariants = product.variants.filter((v) => v.isActive);
  const [selectedVariantId, setSelectedVariantId] = React.useState(
    activeVariants[0]?.id || "",
  );

  const selectedVariant = React.useMemo(() => {
    return activeVariants.find((v) => v.id === selectedVariantId) || null;
  }, [activeVariants, selectedVariantId]);

  // Quantity state
  const [quantity, setQuantity] = React.useState(1);

  const maxStock = selectedVariant?.stockQuantity;
  const isOutOfStock =
    product.fulfillmentType === "READY_MADE" &&
    (!selectedVariant || (selectedVariant.stockQuantity ?? 0) <= 0);

  // Price resolution (use variant price or fallback to base price)
  const currentPrice = selectedVariant
    ? selectedVariant.priceAmount
    : product.basePriceAmount;

  // Personalization instructions state
  const [personalizationText, setPersonalizationText] = React.useState("");

  const handleQtyChange = (val: number) => {
    if (val < 1) return;
    if (
      product.fulfillmentType === "READY_MADE" &&
      maxStock !== undefined &&
      val > maxStock
    ) {
      return;
    }
    setQuantity(val);
  };

  const handleAddToCart = () => {
    if (!session?.user) {
      router.push(`/login?returnTo=${encodeURIComponent(`/product/${product.slug}`)}`);
      return;
    }
    if (!selectedVariant) {
      toast.show("Select a product option", "error");
      return;
    }

    startAddingToCart(async () => {
      try {
        const result = await addToCartAction({
          productId: product.id,
          variantId: selectedVariant.id,
          quantity,
          personalization: personalizationText,
        });
        if (!result.ok) {
          toast.show(result.error.message, "error");
          return;
        }
        toast.show(result.message ?? "Added to cart", "success");
        window.dispatchEvent(
          new CustomEvent("cart-updated", { detail: { itemCount: result.data.itemCount } }),
        );
        router.refresh();
      } catch {
        toast.show("Your session expired. Please sign in again.", "error");
        router.push(`/login?returnTo=${encodeURIComponent(`/product/${product.slug}`)}`);
      }
    });
  };

  return (
    <div className="w-full bg-background min-h-screen pb-24 lg:pb-0">
      {/* Breadcrumbs Navigation */}
      <nav
        className="mx-auto max-w-[100rem] px-5 pt-8 sm:px-8 lg:px-12"
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center gap-2.5 font-sans text-[0.625rem] font-bold uppercase tracking-[0.16em] text-on-surface-variant/80">
          <li>
            <Link
              href="/"
              className="hover:text-primary transition-colors underline underline-offset-4 decoration-1 decoration-outline-variant/60 hover:decoration-primary"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-outline-variant/60 select-none">/</li>
          <li>
            {categorySlug ? (
              <Link
                href={`/category/${categorySlug}`}
                className="hover:text-primary transition-colors underline underline-offset-4 decoration-1 decoration-outline-variant/60 hover:decoration-primary"
              >
                {categoryName}
              </Link>
            ) : (
              <Link
                href="/shop"
                className="hover:text-primary transition-colors underline underline-offset-4 decoration-1 decoration-outline-variant/60 hover:decoration-primary"
              >
                Shop
              </Link>
            )}
          </li>
          <li aria-hidden="true" className="text-outline-variant/60 select-none">/</li>
          <li className="text-on-background font-black" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Main Details Section Grid */}
      <main className="mx-auto max-w-[100rem] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Image Gallery Viewer */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            <div className="relative aspect-4/5 w-full overflow-hidden border border-outline-variant bg-[#F7F7F5]">
              {activeImage ? (
                <Image
                  src={activeImage.url}
                  alt={product.name}
                  fill
                  priority
                  className={cn(
                    resolveImageFitMode(activeImage.presentation) === "STRETCH" ? "object-fill" : resolveImageFitMode(activeImage.presentation) === "COVER" ? "object-cover" : "object-contain",
                    "transition-opacity duration-300 ease-expo-out",
                    imageFade ? "opacity-100" : "opacity-0",
                  )}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-sans text-sm text-on-surface-variant">
                  No image available
                </div>
              )}
            </div>

            {/* Thumbnail strips */}
            {product.images.length > 1 && (
              <div className="flex flex-wrap gap-3">
                {product.images.map((img, idx) => {
                  const isActive = idx === activeImageIdx;
                  return (
                    <button
                      key={img.publicId || idx}
                      type="button"
                      onClick={() => handleImageChange(idx)}
                      className={cn(
                        "relative aspect-4/5 w-16 overflow-hidden border transition-all rounded-none outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        isActive
                          ? "border-primary opacity-100"
                          : "border-outline-variant opacity-60 hover:opacity-100",
                      )}
                    >
                      <Image
                        src={img.url}
                        alt={`Photo ${idx + 1}`}
                        fill
                        className={resolveImageFitMode(img.presentation) === "STRETCH" ? "object-fill" : resolveImageFitMode(img.presentation) === "COVER" ? "object-cover" : "object-contain"}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Information, variant selection, metadata */}
          <div className="lg:col-span-6 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              {categoryName && (
                <span className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                  {categoryName}
                </span>
              )}
              <h1 className="font-serif text-[clamp(2rem,3.5vw,3.5rem)] leading-none tracking-[-0.03em] text-on-background">
                {product.name}
              </h1>
              <div className="mt-2 font-sans text-xl font-bold text-on-background">
                {formatEGP(currentPrice)}
              </div>
            </div>

            {/* Availability details & fulfillment badge */}
            <div className="flex flex-wrap gap-2 items-center">
              {product.fulfillmentType === "MADE_TO_ORDER" ? (
                <div className="inline-flex border border-solid border-primary bg-background/90 px-3 py-1 font-sans text-[0.625rem] font-bold uppercase tracking-[0.16em] text-primary">
                  Made to order
                </div>
              ) : isOutOfStock ? (
                <div className="inline-flex border border-solid border-error bg-error/10 px-3 py-1 font-sans text-[0.625rem] font-bold uppercase tracking-[0.16em] text-error">
                  Out of stock
                </div>
              ) : (
                <div className="inline-flex border border-solid border-outline-variant bg-surface px-3 py-1 font-sans text-[0.625rem] font-bold uppercase tracking-[0.16em] text-on-surface">
                  In stock
                </div>
              )}

              {/* Lead/Prep time */}
              {product.fulfillmentType === "MADE_TO_ORDER" &&
                product.preparationDaysMin && (
                  <span className="font-sans text-xs text-on-surface-variant ml-2">
                    Preparation time: {product.preparationDaysMin}–
                    {product.preparationDaysMax} days
                  </span>
                )}

              {/* Stock quantities for Ready-made */}
              {product.fulfillmentType === "READY_MADE" &&
                selectedVariant &&
                (selectedVariant.stockQuantity ?? 0) > 0 && (
                  <span className="font-sans text-xs text-on-surface-variant ml-2">
                    {selectedVariant.stockQuantity} pieces remaining
                  </span>
                )}
            </div>

            {/* Description */}
            <div className="border-t border-outline-variant pt-6">
              <p className="font-sans text-sm leading-6 text-on-surface opacity-90 whitespace-pre-line">
                {product.description}
              </p>
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-sans text-[0.625rem] font-bold uppercase tracking-wider text-on-surface-variant bg-surface border border-outline-variant px-2 py-0.5"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Variant picker selection */}
            {activeVariants.length > 1 && (
              <div className="flex flex-col gap-3 border-t border-outline-variant pt-6">
                <span className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                  Select Option
                </span>
                <div className="flex flex-wrap gap-3">
                  {activeVariants.map((v) => {
                    const isSelected = v.id === selectedVariantId;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariantId(v.id);
                          setQuantity(1);
                        }}
                        className={cn(
                          "border border-solid px-4 py-2 font-sans text-xs uppercase tracking-wider transition-colors rounded-none outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          isSelected
                            ? "border-primary bg-primary text-on-primary"
                            : "border-outline-variant bg-transparent text-on-surface hover:bg-surface-container-low",
                        )}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Personalization Form instructions */}
            {product.personalizationAvailable && (
              <div className="flex flex-col gap-3 border-t border-outline-variant pt-6">
                <label className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                  Personalization Instructions
                </label>
                {product.personalizationInstructions && (
                  <p className="font-sans text-xs text-on-surface-variant">
                    {product.personalizationInstructions}
                  </p>
                )}
                <textarea
                  value={personalizationText}
                  onChange={(e) => setPersonalizationText(e.target.value)}
                  placeholder="Type your engraving, embroidery, or custom sizing requests here..."
                  rows={3}
                  className="w-full border-b border-outline-variant bg-transparent py-2 text-sm text-on-background focus:border-primary outline-none transition-colors resize-none rounded-none"
                />
              </div>
            )}

            {/* Purchase action controllers: Quantity, Cart, Wishlist slots */}
            <div className="border-t border-outline-variant pt-6 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                {/* Quantity adjustments */}
                {!isOutOfStock && (
                  <div className="flex items-center border border-solid border-outline-variant bg-surface select-none h-11">
                    <button
                      type="button"
                      onClick={() => handleQtyChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="flex h-full w-11 items-center justify-center border-none border-r border-outline-variant bg-transparent text-on-surface outline-none transition-colors hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      &minus;
                    </button>
                    <span className="w-10 text-center font-sans text-xs font-semibold text-on-background">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQtyChange(quantity + 1)}
                      disabled={
                        product.fulfillmentType === "READY_MADE" &&
                        maxStock !== undefined &&
                        quantity >= maxStock
                      }
                      className="flex h-full w-11 items-center justify-center border-none border-l border-outline-variant bg-transparent text-on-surface outline-none transition-colors hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      &#43;
                    </button>
                  </div>
                )}

                {/* Add to Cart slot button */}
                <Button
                  variant="primary"
                  disabled={isOutOfStock || addingToCart}
                  onClick={handleAddToCart}
                  className="flex-1 py-3 text-xs tracking-wider"
                >
                  {isOutOfStock ? "Out of Stock" : addingToCart ? "Adding…" : "Add to Cart"}
                </Button>
              </div>

              {/* Wishlist slot button */}
              <WishlistButton
                productId={product.id}
                productName={product.name}
                returnTo={`/product/${product.slug}`}
                variant="full"
              />
            </div>

            {/* Specifications Collapsible Accordions */}
            <div className="border-t border-outline-variant pt-6 flex flex-col font-sans text-sm text-on-surface">
              {/* Materials & Details Accordion */}
              {(product.materials.length > 0 || product.colors.length > 0) && (
                <div className="border-b border-outline-variant">
                  <button
                    type="button"
                    onClick={() => toggleSection("details")}
                    className="flex w-full items-center justify-between py-4 text-left font-sans text-xs font-bold uppercase tracking-[0.12em] text-on-background outline-none hover:text-on-surface-variant cursor-pointer"
                  >
                    <span>Details & Materials</span>
                    <span className="text-base font-normal leading-none">
                      {openSection === "details" ? "−" : "+"}
                    </span>
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-expo-out",
                      openSection === "details" ? "max-h-40 pb-4 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="flex flex-col gap-2.5 text-xs text-on-surface-variant font-medium">
                      {product.materials.length > 0 && (
                        <div>
                          <span className="text-on-surface-variant/70 uppercase tracking-wider block mb-0.5">Materials:</span>
                          <span className="text-on-background font-semibold">{product.materials.join(", ")}</span>
                        </div>
                      )}
                      {product.colors.length > 0 && (
                        <div>
                          <span className="text-on-surface-variant/70 uppercase tracking-wider block mb-0.5">Colors:</span>
                          <span className="text-on-background font-semibold">{product.colors.join(", ")}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-on-surface-variant/70 uppercase tracking-wider block mb-0.5">Customizable:</span>
                        <span className="text-on-background font-semibold">{product.personalizationAvailable ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dimensions Accordion */}
              {product.dimensions && (
                <div className="border-b border-outline-variant">
                  <button
                    type="button"
                    onClick={() => toggleSection("dimensions")}
                    className="flex w-full items-center justify-between py-4 text-left font-sans text-xs font-bold uppercase tracking-[0.12em] text-on-background outline-none hover:text-on-surface-variant cursor-pointer"
                  >
                    <span>Dimensions</span>
                    <span className="text-base font-normal leading-none">
                      {openSection === "dimensions" ? "−" : "+"}
                    </span>
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-expo-out",
                      openSection === "dimensions" ? "max-h-24 pb-4 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <p className="text-xs text-on-background font-semibold">
                      {product.dimensions.width} × {product.dimensions.height}
                      {product.dimensions.depth ? ` × ${product.dimensions.depth}` : ""}{" "}
                      {product.dimensions.unit}
                    </p>
                  </div>
                </div>
              )}

              {/* Care Instructions Accordion */}
              {product.careInstructions && (
                <div className="border-b border-outline-variant">
                  <button
                    type="button"
                    onClick={() => toggleSection("care")}
                    className="flex w-full items-center justify-between py-4 text-left font-sans text-xs font-bold uppercase tracking-[0.12em] text-on-background outline-none hover:text-on-surface-variant cursor-pointer"
                  >
                    <span>Care Guide</span>
                    <span className="text-base font-normal leading-none">
                      {openSection === "care" ? "−" : "+"}
                    </span>
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-expo-out",
                      openSection === "care" ? "max-h-48 pb-4 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <p className="text-xs leading-relaxed text-on-surface-variant font-medium whitespace-pre-line">
                      {product.careInstructions}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Mobile Purchase Viewport Overlay Footer */}
      {!isOutOfStock && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-solid border-outline-variant bg-background/95 p-4 backdrop-blur-xs lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="truncate font-sans text-xs font-semibold text-on-background max-w-45">
                {product.name}
              </span>
              <span className="font-sans text-xs text-on-surface-variant">
                {formatEGP(currentPrice)}
              </span>
            </div>
            <Button
              variant="primary"
              disabled={isOutOfStock || addingToCart}
              onClick={handleAddToCart}
              className="py-3 px-6 text-xs tracking-wider min-h-11"
            >
              {isOutOfStock ? "Out of Stock" : addingToCart ? "Adding…" : "Add to Cart"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
