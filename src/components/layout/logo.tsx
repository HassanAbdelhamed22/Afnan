"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  const { theme } = useTheme();

  return (
    <Link
      href="/"
      className={cn(
        "group flex shrink-0 items-center no-underline outline-none select-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <Image
        src={theme === "dark" ? "/logo-white.svg" : "/logo-black.svg"}
        alt="Afnan Brand Logo"
        width={680}
        height={260}
        className="h-9 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
        priority
        unoptimized
      />
    </Link>
  );
}
