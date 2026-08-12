"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { SearchControl } from "./search-control";
import { MobileMenu } from "./mobile-menu";
import { Logo } from "./logo";
import { useSession, signOut } from "@/lib/auth/auth-client";
import { toast } from "@/components/ui/toast";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await signOut();
    toast.show("Logged out successfully.", "success");
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 800);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleClose = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClose);
    return () => window.removeEventListener("mousedown", handleClose);
  }, [menuOpen]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

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

          {/* Account Profile Menu Dropdown (hidden on mobile, available in MobileMenu) */}
          <div ref={menuRef} className="relative hidden sm:block">
            {user ? (
              <>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex h-11 items-center gap-1.5 px-1 outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Account Menu"
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                >
                  <span className={cn(
                    "flex size-7 items-center justify-center border border-solid font-sans text-xs font-bold uppercase transition-colors duration-200 select-none",
                    menuOpen
                      ? "border-primary bg-primary text-on-primary"
                      : "border-outline-variant text-on-background hover:border-primary hover:text-primary"
                  )}>
                    {user.name.charAt(0)}
                  </span>
                  <svg
                    className={cn(
                      "w-3 h-3 text-on-surface-variant/70 transition-transform duration-200",
                      menuOpen && "rotate-180 text-primary"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 border border-solid border-outline-variant bg-surface p-4 text-on-surface transition-all duration-200">
                    <div className="border-b border-solid border-outline-variant pb-2.5 mb-2.5">
                      <p className="font-sans text-[9px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/75">
                        Logged in as
                      </p>
                      <p className="truncate font-sans text-xs font-semibold text-on-background">
                        {user.name}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-on-background hover:opacity-60 transition-opacity"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/account/profile"
                        onClick={() => setMenuOpen(false)}
                        className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-on-background hover:opacity-60 transition-opacity"
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/account/addresses"
                        onClick={() => setMenuOpen(false)}
                        className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-on-background hover:opacity-60 transition-opacity"
                      >
                        Delivery Addresses
                      </Link>
                      <Link
                        href="/account/orders"
                        onClick={() => setMenuOpen(false)}
                        className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-on-background hover:opacity-60 transition-opacity"
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          handleLogout();
                        }}
                        className="mt-1 border-t border-solid border-outline-variant border-x-0 border-b-0 pt-2 text-left font-sans text-xs font-bold uppercase tracking-[0.08em] text-error hover:opacity-60 transition-opacity cursor-pointer bg-transparent p-0 w-full"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant sm:flex">
                  <Link
                    href="/login"
                    className="text-on-background outline-none transition-opacity hover:opacity-60 focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Sign In
                  </Link>
                  <span className="text-outline-variant/60 select-none">/</span>
                  <Link
                    href="/register"
                    className="text-on-surface-variant/75 outline-none hover:text-on-background transition-colors"
                  >
                    Register
                  </Link>
                </div>
                <Link
                  href="/login"
                  className="flex size-11 items-center justify-center text-on-background outline-none transition-opacity hover:opacity-60 focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Sign In"
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
              </div>
            )}
          </div>

          {/* Wishlist (hidden on mobile, available in MobileMenu, only visible when logged in) */}
          {user && (
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
          )}

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
