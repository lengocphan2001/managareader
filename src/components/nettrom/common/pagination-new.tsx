"use client";

import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PaginationNewProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PaginationNew({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationNewProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the start
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-3 py-6">
      {/* Previous Button */}
      <button
        onClick={() => {
          if (currentPage > 0) {
            onPageChange(currentPage - 1);
          }
        }}
        disabled={currentPage === 0}
        className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-800 text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Previous page"
      >
        <FaChevronLeft className="h-5 w-5" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-2">
        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-lg text-white"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage + 1;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum - 1)}
              className={`flex h-12 w-12 items-center justify-center rounded-lg text-lg font-medium transition-colors ${
                isActive
                  ? "bg-orange-500 text-white"
                  : "bg-neutral-800 text-white hover:bg-neutral-700"
              }`}
              aria-label={`Go to page ${pageNum}`}
              aria-current={isActive ? "page" : undefined}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => {
          if (currentPage < totalPages - 1) {
            onPageChange(currentPage + 1);
          }
        }}
        disabled={currentPage >= totalPages - 1}
        className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-800 text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Next page"
      >
        <FaChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
