"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const shopLinks = [
  ["All products", "/shop"],
  ["Ready-made", "/shop?fulfillment=READY_MADE"],
  ["Made-to-order", "/shop?fulfillment=MADE_TO_ORDER"],
  ["Custom request", "/custom-request"],
] as const;

const accountLinks = [
  ["My profile", "/account/profile"],
  ["Orders", "/account/orders"],
  ["Wishlist", "/wishlist"],
  ["Addresses", "/account/addresses"],
] as const;

export function Footer() {
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname?.startsWith("/reset-password");

  if (isAuthPage || pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-white/15 bg-[#171512] text-white">
      <div className="mx-auto max-w-[100rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-block font-serif text-4xl text-white no-underline outline-none focus-visible:ring-2 focus-visible:ring-white">
              Afnan
            </Link>
            <p className="mt-5 max-w-md font-serif text-2xl leading-snug text-white/75 sm:text-3xl">
              Handmade pieces, shaped with patience in Egypt.
            </p>
            <Link
              href="/custom-request"
              className="group mt-8 inline-flex min-h-11 items-center gap-4 border-b border-white/50 font-sans text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white no-underline outline-none transition-colors hover:border-white focus-visible:ring-2 focus-visible:ring-white"
            >
              Start a custom request
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>

          <FooterNav title="Shop" links={shopLinks} className="lg:col-span-2 lg:col-start-8" />
          <FooterNav title="Account" links={accountLinks} className="lg:col-span-2" />

          <div className="lg:col-span-2">
            <h2 className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.18em] text-white/45">We deliver</h2>
            <ul className="mt-5 space-y-3 font-sans text-sm text-white/70">
              <li>Across Egypt</li>
              <li>Cash on delivery</li>
              <li>Prices in EGP</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-5 border-t border-white/15 pt-7 font-sans text-[0.6875rem] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Afnan Egypt. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <Link href="/terms" className="text-white/45 no-underline outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white">Terms &amp; Conditions</Link>
            <Link href="/privacy" className="text-white/45 no-underline outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterNav({ title, links, className = "" }: { title: string; links: ReadonlyArray<readonly [string, string]>; className?: string }) {
  return (
    <nav aria-label={`${title} links`} className={className}>
      <h2 className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.18em] text-white/45">{title}</h2>
      <ul className="mt-5 space-y-3">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="font-sans text-sm text-white/70 no-underline outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white">{label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
