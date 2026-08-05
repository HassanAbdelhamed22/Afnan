"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { SearchControl } from "./search-control";
import { MobileMenu } from "./mobile-menu";
import { Logo } from "./logo";

export function Header() {
  const pathname = usePathname();

  const navItem = (href: string, label: string) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "group relative py-3 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-on-background no-underline outline-none transition-opacity duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background",
          isActive ? "opacity-100" : "opacity-75 hover:opacity-100",
        )}
      >
        <span>{label}</span>
        <span
          className={cn(
            "absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-transform duration-300 origin-left ease-out",
            isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
          )}
        />
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-solid border-outline-variant/80 bg-background/95 transition-colors duration-300 supports-backdrop-filter:backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[100rem] items-center justify-between px-3 sm:h-20 sm:px-6 lg:px-10 xl:px-12">
        {/* Left Side: Mobile Menu & Brand Logo */}
        <div className="flex min-w-0 items-center gap-1 sm:gap-4">
          <MobileMenu />
          <Logo className="h-9 sm:h-12" />
        </div>

        {/* Centered: Desktop Navigation */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-10 md:flex lg:gap-12"
        >
          {navItem("/", "Home")}
          {navItem("/shop", "Shop")}
          {navItem("/custom-request", "Custom Request")}
        </nav>

        {/* Right Side: Actions (Optimized Responsive Layout) */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {/* Search */}
          <SearchControl />

          {/* Account (hidden on mobile, available in MobileMenu) */}
          <Link
            href="/account/profile"
            className="hidden size-11 items-center justify-center text-on-background outline-none transition-opacity hover:opacity-60 focus-visible:ring-2 focus-visible:ring-primary sm:flex"
            aria-label="Account"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </Link>

          {/* Wishlist (hidden on mobile, available in MobileMenu) */}
          <Link
            href="/account/wishlist"
            className="relative hidden size-11 items-center justify-center text-on-background outline-none transition-opacity hover:opacity-60 focus-visible:ring-2 focus-visible:ring-primary sm:flex"
            aria-label="Wishlist, 0 items"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span
              aria-hidden="true"
              className="absolute right-0.5 top-0.5 flex h-4 min-w-4 select-none items-center justify-center bg-primary px-1 font-sans text-[9px] font-bold text-on-primary"
            >
              0
            </span>
          </Link>

          {/* Cart (always visible) */}
          <Link
            href="/cart"
            className="relative flex size-11 items-center justify-center text-on-background outline-none transition-opacity hover:opacity-60 focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Cart, 0 items"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span
              aria-hidden="true"
              className="absolute right-0.5 top-0.5 flex h-4 min-w-4 select-none items-center justify-center bg-primary px-1 font-sans text-[9px] font-bold text-on-primary"
            >
              0
            </span>
          </Link>

          <div
            aria-hidden="true"
            className="mx-1 hidden h-6 w-px bg-outline-variant sm:block"
          />

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
