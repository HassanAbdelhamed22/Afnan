"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Drawer } from "../ui/drawer";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/custom-request", label: "Custom request" },
];

const accountLinks = [
  { href: "/account/profile", label: "My account" },
  { href: "/account/orders", label: "My orders" },
  { href: "/account/wishlist", label: "Wishlist" },
];

export function MobileMenu() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const closeMenu = React.useCallback(() => setIsOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex size-11 cursor-pointer items-center justify-center border-none bg-transparent text-on-background outline-none transition-colors hover:bg-surface-container-low focus-visible:ring-2 focus-visible:ring-primary md:hidden"
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeWidth="1.75" d="M3 7h18M3 12h13M3 17h18" />
        </svg>
      </button>

      <Drawer isOpen={isOpen} onClose={closeMenu} title="Menu">
        <div className="flex min-h-full flex-col">
          <p className="mb-5 font-sans text-[0.625rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
            Explore Afnan
          </p>

          <nav aria-label="Mobile navigation" className="border-t border-outline-variant">
            {primaryLinks.map(({ href, label }) => {
              const isActive = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex min-h-16 items-center justify-between border-b border-outline-variant font-serif text-[1.75rem] leading-none text-on-background no-underline outline-none transition-colors hover:bg-surface-container-low focus-visible:bg-surface-container-low",
                    isActive && "font-medium",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-px w-0 bg-primary transition-all duration-300",
                        isActive && "w-5",
                      )}
                    />
                    {label}
                  </span>
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 text-on-surface-variant transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h14m-5-5 5 5-5 5" />
                  </svg>
                </Link>
              );
            })}
          </nav>

          <div className="mt-9">
            <p className="mb-3 font-sans text-[0.625rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
              Your account
            </p>
            <nav aria-label="Account navigation" className="grid gap-1">
              {accountLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className="flex min-h-11 items-center justify-between px-3 font-sans text-sm font-medium text-on-background no-underline outline-none transition-colors hover:bg-surface-container-low focus-visible:bg-surface-container-low"
                >
                  {label}
                  <span aria-hidden="true" className="text-on-surface-variant">→</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-auto border-t border-outline-variant pt-5">
            <p className="font-sans text-[0.6875rem] uppercase leading-5 tracking-[0.1em] text-on-surface-variant">
              Handmade in Egypt<br />Cash on delivery · EGP only
            </p>
          </div>
        </div>
      </Drawer>
    </>
  );
}
