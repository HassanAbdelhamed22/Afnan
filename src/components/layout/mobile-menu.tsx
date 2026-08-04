"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Drawer } from "../ui/drawer";

export function MobileMenu() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-on-background hover:opacity-60 transition-opacity bg-transparent border-none cursor-pointer flex items-center justify-center"
        aria-label="Open menu"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="Menu">
        <nav className="flex flex-col gap-6 font-sans label-caps text-lg tracking-wide text-on-background mt-4">
          <Link href="/" className="hover:opacity-60 transition-opacity no-underline text-on-background">
            Home
          </Link>
          <Link href="/shop" className="hover:opacity-60 transition-opacity no-underline text-on-background">
            Shop
          </Link>
          <Link href="/custom-request" className="hover:opacity-60 transition-opacity no-underline text-on-background">
            Custom Request
          </Link>
          <div className="border-t border-solid border-outline-variant my-4" />
          <Link href="/account/profile" className="body-md no-underline text-on-surface opacity-75 hover:opacity-100 flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Account
          </Link>
        </nav>
      </Drawer>
    </>
  );
}
