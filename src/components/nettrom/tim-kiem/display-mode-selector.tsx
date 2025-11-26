"use client";

import { twMerge } from "tailwind-merge";
import { FaList, FaTh, FaThLarge } from "react-icons/fa";
import { useDisplayMode } from "@/contexts/display-mode";

export default function DisplayModeSelector() {
  const { displayMode, setDisplayMode } = useDisplayMode();

  return (
    <div className="flex items-center gap-2 bg-neutral-800 rounded-lg p-1">
      <button
        type="button"
        onClick={() => setDisplayMode("list")}
        className={twMerge(
          "p-4 rounded transition-colors",
          displayMode === "list"
            ? "bg-orange-500 text-white"
            : "text-white hover:bg-neutral-700"
        )}
        title="List view"
        aria-label="List view"
      >
        <FaList className="h-8 w-8" />
      </button>
      <button
        type="button"
        onClick={() => setDisplayMode("compact-grid")}
        className={twMerge(
          "p-4 rounded transition-colors",
          displayMode === "compact-grid"
            ? "bg-orange-500 text-white"
            : "text-white hover:bg-neutral-700"
        )}
        title="Compact grid view"
        aria-label="Compact grid view"
      >
        <FaTh className="h-8 w-8" />
      </button>
      <button
        type="button"
        onClick={() => setDisplayMode("large-grid")}
        className={twMerge(
          "p-4 rounded transition-colors",
          displayMode === "large-grid"
            ? "bg-orange-500 text-white"
            : "text-white hover:bg-neutral-700"
        )}
        title="Large grid view"
        aria-label="Large grid view"
      >
        <FaThLarge className="h-8 w-8" />
      </button>
    </div>
  );
}

