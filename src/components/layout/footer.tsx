import * as React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-solid border-outline-variant py-16 text-on-surface transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Brand & Egypt Policy Column */}
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-xl tracking-wide font-normal">Afnan</h3>
          <p className="body-md text-on-surface opacity-70">
            Egypt's dedicated platform for premium handmade products. Crafted with love, delivered to your doorstep.
          </p>
          <div className="mt-2 flex flex-col gap-1.5 font-sans label-caps text-xs text-on-surface opacity-60">
            <div>Egypt Shipping Only</div>
            <div>Cash on Delivery (COD)</div>
            <div>EGP Currency Only</div>
          </div>
        </div>

        {/* Shop Column */}
        <div className="flex flex-col gap-4">
          <h4 className="font-sans label-caps text-sm tracking-wider opacity-70">Shop</h4>
          <nav className="flex flex-col gap-2 font-sans text-sm">
            <Link href="/shop" className="hover:opacity-60 transition-opacity no-underline text-on-surface">
              All Products
            </Link>
            <Link href="/custom-request" className="hover:opacity-60 transition-opacity no-underline text-on-surface">
              Custom Orders
            </Link>
            <Link href="/shop?fulfillment=READY_MADE" className="hover:opacity-60 transition-opacity no-underline text-on-surface">
              Ready-Made Items
            </Link>
            <Link href="/shop?fulfillment=MADE_TO_ORDER" className="hover:opacity-60 transition-opacity no-underline text-on-surface">
              Made-to-Order Items
            </Link>
          </nav>
        </div>

        {/* Account Column */}
        <div className="flex flex-col gap-4">
          <h4 className="font-sans label-caps text-sm tracking-wider opacity-70">Customer Service</h4>
          <nav className="flex flex-col gap-2 font-sans text-sm">
            <Link href="/account/profile" className="hover:opacity-60 transition-opacity no-underline text-on-surface">
              My Profile
            </Link>
            <Link href="/account/orders" className="hover:opacity-60 transition-opacity no-underline text-on-surface">
              Order History
            </Link>
            <Link href="/account/custom-requests" className="hover:opacity-60 transition-opacity no-underline text-on-surface">
              Handmade Requests
            </Link>
            <Link href="/account/addresses" className="hover:opacity-60 transition-opacity no-underline text-on-surface">
              Shipping Addresses
            </Link>
          </nav>
        </div>

        {/* Contacts Column */}
        <div className="flex flex-col gap-4">
          <h4 className="font-sans label-caps text-sm tracking-wider opacity-70">Connect with Us</h4>
          <p className="body-md text-on-surface opacity-70">
            For inquiries or order issues, reach our admin instantly via WhatsApp.
          </p>
          <a
            href="https://wa.me/201000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-primary text-on-primary font-sans label-caps text-xs py-3 px-5 hover:bg-neutral-800 transition-colors duration-300 no-underline"
          >
            Contact Admin
          </a>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-solid border-outline-variant/60 mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-sans opacity-60">
        <div>&copy; {new Date().getFullYear()} Afnan Egypt. All rights reserved.</div>
        <div className="flex gap-6">
          <Link href="/terms" className="no-underline text-on-surface hover:opacity-60">Terms & Conditions</Link>
          <Link href="/privacy" className="no-underline text-on-surface hover:opacity-60">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
