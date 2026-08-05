import * as React from "react";

import { cn } from "@/lib/utils";

export interface ImagePlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  aspectRatio?: "4-5" | "1-1" | "16-9";
  text?: string;
}

export function ImagePlaceholder({
  className,
  aspectRatio = "4-5",
  text = "No image available",
  ...props
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center bg-surface border border-solid border-outline-variant text-on-surface/40 p-4 select-none w-full",
        aspectRatio === "4-5" && "aspect-4/5",
        aspectRatio === "1-1" && "aspect-square",
        aspectRatio === "16-9" && "aspect-video",
        className
      )}
      {...props}
    >
      <svg
        className="h-10 w-10 opacity-40 mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <span className="font-sans text-xs label-caps opacity-60 tracking-wider text-center">{text}</span>
    </div>
  );
}
