"use client";

import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { Constants } from "@/constants";
import LatestUpdatesResults from "./latest-updates-results";
import DisplayModeSelector from "./display-mode-selector";

export default function LatestUpdatesClient() {
  return (
    <>
      {/* Header with back arrow */}
      <div className="mb-6 p-5 sm:mb-8 md:mb-10">
        <Link
          href={Constants.Routes.nettrom.index}
          className="inline-flex items-center gap-3 text-4xl font-semibold text-white no-underline hover:no-underline sm:gap-4 sm:text-5xl md:text-6xl"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-800 transition-colors hover:bg-neutral-700 sm:h-16 sm:w-16 md:h-20 md:w-20">
            <FaArrowLeft className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10" />
          </div>
          <span>Latest Updates</span>
        </Link>
      </div>

      {/* Display Mode Selector */}
      <div className="mb-6 flex justify-end sm:mb-8 md:mb-10">
        <DisplayModeSelector />
      </div>

      {/* Results */}
      <LatestUpdatesResults />
    </>
  );
}
