import * as React from "react";

import { Button } from "./button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2 mt-8 select-none" aria-label="Pagination">
      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-2 text-xs"
      >
        Previous
      </Button>
      <div className="flex items-center gap-1">
        {pages.map((page) => {
          const isActive = page === currentPage;
          return (
            <Button
              key={page}
              variant={isActive ? "primary" : "secondary"}
              onClick={() => onPageChange(page)}
              className="w-10 h-10 p-0 text-xs"
              aria-current={isActive ? "page" : undefined}
            >
              {page}
            </Button>
          );
        })}
      </div>
      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-2 text-xs"
      >
        Next
      </Button>
    </nav>
  );
}
