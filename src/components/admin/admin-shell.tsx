"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

const navigation = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/custom-requests", label: "Custom requests" },
  { href: "/admin/shipping", label: "Shipping" },
  { href: "/admin/settings", label: "Settings" },
] as const;

interface AdminShellProps {
  children: ReactNode;
  adminName: string;
  adminEmail: string;
}

function isActivePath(pathname: string, item: (typeof navigation)[number]) {
  return "exact" in item && item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

export function AdminShell({ children, adminName, adminEmail }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeItem = navigation.find((item) => isActivePath(pathname, item));

  const navigationContent = (
    <>
      <div className="border-b border-outline-variant px-6 py-7">
        <Link href="/admin" className="headline-sm text-on-background">
          Afnan
        </Link>
        <p className="label-caps mt-2 text-on-surface-variant">Admin atelier</p>
      </div>
      <nav aria-label="Admin navigation" className="flex-1 px-3 py-5">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const active = isActivePath(pathname, item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`block border-l px-4 py-3 label-caps transition-colors duration-300 ease-expo-out ${
                    active
                      ? "border-primary bg-surface-container text-on-background"
                      : "border-transparent text-on-surface-variant hover:border-outline hover:bg-surface-container-low"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-outline-variant px-6 py-5">
        <p className="body-sm font-medium text-on-background">{adminName}</p>
        <p className="body-sm break-all text-on-surface-variant">{adminEmail}</p>
        <Link href="/" className="mt-4 inline-block label-caps underline underline-offset-4 hover:opacity-60">
          View storefront
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-on-background lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="hidden min-h-screen border-r border-outline-variant bg-surface lg:flex lg:flex-col">
        {navigationContent}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-primary/40"
            aria-label="Close admin navigation"
            onClick={() => setMobileOpen(false)}
          />
          <aside id="admin-mobile-navigation" className="relative flex h-full w-[min(85vw,20rem)] flex-col border-r border-outline-variant bg-surface">
            {navigationContent}
          </aside>
        </div>
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-outline-variant bg-background px-5 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="border border-primary bg-transparent px-3 py-2 label-caps text-primary lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-controls="admin-mobile-navigation"
            >
              Menu
            </button>
            <div>
              <p className="label-caps text-on-surface-variant">Operations</p>
              <p className="body-sm text-on-background">{activeItem?.label ?? "Admin"}</p>
            </div>
          </div>
          <div className="hidden text-right sm:block">
            <p className="body-sm font-medium">{adminName}</p>
            <p className="label-caps text-on-surface-variant">Administrator</p>
          </div>
        </header>
        <main className="px-5 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
