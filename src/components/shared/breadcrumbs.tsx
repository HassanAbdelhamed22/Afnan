import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items, className, ...props }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex py-4 font-sans text-xs label-caps opacity-75 select-none", className)} {...props}>
      <ol className="flex items-center gap-2 m-0 p-0 list-none flex-wrap">
        <li>
          <Link href="/" className="no-underline text-on-surface hover:opacity-60 transition-opacity">
            Home
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <li className="text-on-surface/40 flex items-center justify-center pointer-events-none" aria-hidden="true">
                /
              </li>
              <li>
                {isLast || !item.href ? (
                  <span className="text-on-surface font-semibold" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className="no-underline text-on-surface hover:opacity-60 transition-opacity">
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
