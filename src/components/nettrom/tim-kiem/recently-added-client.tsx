"use client";

import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { Constants } from "@/constants";
import { MangadexApi } from "@/api";
import MangaResults from "./manga-results";
import DisplayModeSelector from "./display-mode-selector";

export default function RecentlyAddedClient() {
  return (
    <>
      {/* Header with back arrow */}
      <div className="p-5 mb-6 sm:mb-8 md:mb-10">
        <Link
          href={Constants.Routes.nettrom.index}
          className="inline-flex items-center gap-3 sm:gap-4 text-white text-4xl sm:text-5xl md:text-6xl font-semibold no-underline hover:no-underline"
        >
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors">
            <FaArrowLeft className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10" />
          </div>
          <span>Recently Added</span>
        </Link>
      </div>

      {/* Display Mode Selector */}
      <div className="mb-6 sm:mb-8 md:mb-10 flex justify-end">
        <DisplayModeSelector />
      </div>

      {/* Results */}
      <MangaResults 
        basePath="/recently-added" 
        defaultOptions={{
          order: { createdAt: MangadexApi.Static.Order.DESC },
          originalLanguage: ["en"],
          availableTranslatedLanguage: ["en", "ja-ro"],
        }}
      />
    </>
  );
}

