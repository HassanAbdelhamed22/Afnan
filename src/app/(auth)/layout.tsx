import type { Metadata } from "next";
import { BrandPanel } from "@/components/layout/brand-panel";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100svh-4rem)] w-full overflow-x-clip bg-background sm:min-h-[calc(100svh-5rem)] lg:flex-row-reverse lg:items-start">
      {/* ── Brand panel (desktop only, flipped to right, 50% width) ── */}
      <BrandPanel />

      {/* ── Form panel (flipped to left) ── */}
      <section
        aria-label="Account access"
        className="flex min-w-0 flex-1 items-center justify-center overflow-y-auto px-5 py-10 sm:px-10 sm:py-14 lg:px-12 xl:px-20"
      >
        <div className="my-auto w-full max-w-124">{children}</div>
      </section>
    </div>
  );
}
