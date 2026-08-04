import React from "react";

export default function StoreHomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 mb-4">
        Afnan Handmade E-Commerce
      </h1>
      <p className="text-lg text-neutral-600 max-w-md mb-8">
        Welcome to Afnan, your premier destination for high-quality, Egyptian handmade products.
      </p>
      <div className="flex gap-4">
        <a
          href="/shop"
          className="px-6 py-3 bg-neutral-900 text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
        >
          Browse Shop
        </a>
        <a
          href="/custom-request"
          className="px-6 py-3 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors"
        >
          Custom Request
        </a>
      </div>
    </div>
  );
}
