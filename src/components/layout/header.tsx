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
        className={cn(
          "relative py-2 text-sm font-sans label-caps text-on-background no-underline transition-opacity duration-300 group",
          isActive ? "opacity-100" : "opacity-75 hover:opacity-100"
        )}
      >
        <span>{label}</span>
        <span
          className={cn(
            "absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-transform duration-300 origin-left ease-out",
            isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
          )}
        />
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background border-b border-solid border-outline-variant transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Left Side: Logo */}
        <div className="flex items-center gap-4">
          <MobileMenu />
          <Logo />
        </div>

        {/* Centered: Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          {navItem("/", "Home")}
          {navItem("/shop", "Shop")}
          {navItem("/custom-request", "Custom Request")}
        </nav>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2">
          <SearchControl />

          {/* Account */}
          <Link
            href="/account/profile"
            className="p-2 text-on-background hover:opacity-60 transition-opacity flex items-center justify-center"
            aria-label="Account"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </Link>

          {/* Wishlist */}
          <Link
            href="/account/wishlist"
            className="p-2 text-on-background hover:opacity-60 transition-opacity flex items-center justify-center relative"
            aria-label="Wishlist"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-on-primary rounded-full text-[9px] font-sans flex items-center justify-center font-bold">
              0
            </span>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="p-2 text-on-background hover:opacity-60 transition-opacity flex items-center justify-center relative"
            aria-label="Cart"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-on-primary rounded-full text-[9px] font-sans flex items-center justify-center font-bold">
              0
            </span>
          </Link>

          <div className="w-px h-5 bg-outline-variant mx-1 hidden sm:block" />

          <ThemeToggle />
        </div>

      </div>
    </header>
  );
}
