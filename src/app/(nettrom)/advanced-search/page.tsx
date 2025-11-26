import { Metadata } from "next";
import { Suspense } from "react";
import SearchMangaForm from "@/components/nettrom/tim-kiem/search-manga-form-new";
import MangaResults from "@/components/nettrom/tim-kiem/manga-results";
import { Constants } from "@/constants";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export const metadata: Metadata = {
  title: `Search manga at ${Constants.APP_NAME}`,
};

export default function AdvancedSearch() {
  return (
    <div className="w-full px-2 py-3 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:px-24 lg:py-12">
      {/* Header with back arrow */}
      <div className="p-5 mb-6 sm:mb-8 md:mb-10">
        <Link
          href={Constants.Routes.nettrom.index}
          className="inline-flex items-center gap-3 sm:gap-4 text-white text-4xl sm:text-5xl md:text-6xl font-semibold no-underline hover:no-underline"
        >
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors">
            <FaArrowLeft className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10" />
          </div>
          <span>Advanced Search</span>
        </Link>
      </div>

      {/* Search Form */}
      <Suspense>
        <SearchMangaForm />
      </Suspense>

      {/* Results */}
      <Suspense>
        <MangaResults />
      </Suspense>
    </div>
  );
}
