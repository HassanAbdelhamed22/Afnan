"use client";

import { useTheme } from "./theme-provider";

const benefits = [
  {
    label: "Handmade in Egypt",
    icon: (
      <svg
        className="w-5 h-5 shrink-0 text-current"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="1.4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    ),
  },
  {
    label: "Cash on delivery",
    icon: (
      <svg
        className="w-5 h-5 shrink-0 text-current"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="1.4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5a1.5 1.5 0 011.5 1.5v9.75a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V6a1.5 1.5 0 011.5-1.5zm13.5 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
        />
      </svg>
    ),
  },
  {
    label: "Shipping across Egypt",
    icon: (
      <svg
        className="w-5 h-5 shrink-0 text-current"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="1.4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v11.177M14.25 7.575A2.056 2.056 0 0012.67 6.715H9.75"
        />
      </svg>
    ),
  },
];

export function BrandPanel() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <aside
      aria-label="About Afnan"
      className="relative hidden overflow-hidden border-l border-solid border-outline-variant/70 transition-colors duration-500 lg:sticky lg:top-20 lg:flex lg:h-[calc(100svh-5rem)] lg:min-h-0 lg:w-[52%] lg:max-w-248 lg:shrink-0 lg:self-start"
      style={{
        backgroundColor: isDark ? "#141311" : "#eee7dc",
      }}
    >
      {/* Full-panel editorial background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/afnan_handbag_enhanced.png"
        alt="Afnan handmade black woven handbag"
        className="
          absolute inset-0 w-full h-full object-cover
          object-[54%_center]
          scale-[1.035]
          z-0 select-none pointer-events-none transition-opacity duration-500
        "
        style={{
          opacity: isDark ? 0.65 : 1,
        }}
      />

      {/* Light/Dark gradient overlay for readability */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 transition-colors duration-500"
        style={{
          background: isDark
            ? "linear-gradient(180deg, rgba(10,10,10,0.12) 0%, rgba(10,10,10,0.08) 40%, rgba(10,10,10,0.72) 67%, rgba(10,10,10,0.96) 86%, rgba(10,10,10,0.99) 100%)"
            : "linear-gradient(180deg, rgba(247,242,234,0.12) 0%, rgba(247,242,234,0.04) 40%, rgba(239,231,220,0.72) 67%, rgba(239,231,220,0.96) 86%, rgba(239,231,220,0.99) 100%)",
        }}
      />

      {/* Bottom storytelling content */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-10 pb-8 text-on-background xl:px-16 xl:pb-11">
        <div className="max-w-152">
          <p className="mb-4 inline-flex items-center gap-2 border border-outline-variant/70 bg-surface/85 px-2.5 py-1.5 font-sans text-[0.625rem] font-bold uppercase tracking-[0.2em] text-on-background shadow-sm backdrop-blur-md xl:text-[0.6875rem]">
            <span aria-hidden="true" className="h-px w-5 bg-current opacity-60" />
            Handmade in Egypt
          </p>

          <h2 className="font-serif text-[clamp(2.7rem,3.6vw,4rem)] leading-[0.98] tracking-[-0.035em] text-on-background">
            Crafted by hand.
            <br />
            Made to be yours.
          </h2>

          <p className="mt-4 max-w-md text-sm leading-6 text-on-surface-variant/90 xl:text-[0.9375rem]">
            Unique handmade pieces created with care in Egypt and delivered
            directly to your door.
          </p>
        </div>

        <div className="my-6 h-px bg-outline-variant/70" />

        {/* Benefits Trust Row */}
        <div className="grid grid-cols-3 gap-4 xl:gap-7">
          {benefits.map(({ label, icon }) => (
            <div key={label} className="flex min-w-0 items-center gap-2.5">
              <span className="shrink-0 text-on-background/75">{icon}</span>
              <span className="font-sans text-[0.5625rem] font-semibold uppercase leading-tight tracking-[0.09em] text-on-surface-variant/95 xl:text-[0.625rem]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
