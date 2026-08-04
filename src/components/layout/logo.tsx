"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center no-underline group select-none",
        className,
      )}
    >
      {/*
       * The logo.webp has an opaque white background with black content.
       *
       * Light mode:
       *   mix-blend-multiply makes white pixels transparent (white × bg = bg)
       *   and keeps black pixels visible (black × anything = black).
       *
       * Dark mode:
       *   invert flips white→black and black→white.
       *   mix-blend-screen makes black pixels transparent (1-(1-black)(1-bg)=bg)
       *   and keeps white pixels visible (screen of white = white).
       */}
      <Image
        src="/logo.webp"
        alt="Afnan Brand Logo"
        width={280}
        height={112}
        className={cn(
          "h-28 w-auto object-contain -my-10 transition-transform duration-300 group-hover:scale-105",
          "mix-blend-multiply dark:invert dark:mix-blend-screen",
        )}
        priority
        unoptimized
      />
    </Link>
  );
}
