"use client";

import { useEffect, Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaEye, FaUser, FaClock, FaComment } from "react-icons/fa";

import useLibraryUpdates from "@/hooks/mangadex/useLibraryUpdates";
import { useMangadex } from "@/contexts/mangadex";
import { ExtendChapter } from "@/types/mangadex";
import { Constants } from "@/constants";
import { Utils } from "@/utils";
import { useDisplayMode } from "@/contexts/display-mode";
import LanguageIcon from "@/components/language-icon";
import PaginationNew from "../common/pagination-new";
import DisplayModeSelector from "../tim-kiem/display-mode-selector";
import Skeleton from "react-loading-skeleton";

const LIMIT = 20; // Number of series per page

function UpdatesListContent() {
  const router = useRouter();
  const params = useSearchParams();
  const page = Number(params.get("page")) || 0;
  const { displayMode } = useDisplayMode();
  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());
  
  // Fetch more chapters when in list view or compact grid view
  const { updates, isLoading, error, total, totalPages } = useLibraryUpdates({
    page,
    limit: LIMIT,
    chaptersPerSeries: (displayMode === "list" || displayMode === "compact-grid") ? 100 : 4, // Fetch more chapters in list/compact-grid view
  });

  const { mangas, mangaStatistics, updateMangas, updateMangaStatistics } = useMangadex();

  // Get all manga IDs from updates
  const mangaIds = Object.keys(updates);

  // Reset expanded state when page changes
  useEffect(() => {
    setExpandedSeries(new Set());
  }, [page]);

  useEffect(() => {
    if (mangaIds.length > 0) {
      updateMangas({ ids: mangaIds });
      updateMangaStatistics({ manga: mangaIds });
    }
  }, [mangaIds, updateMangas, updateMangaStatistics]);

  const goToPage = (toPage: number) => {
    if (toPage === 0) {
      router.push("/following");
    } else {
      router.push(`/following?page=${toPage}`);
    }
  };

  const renderSeriesItem = ([mangaId, chapterList]: [string, ExtendChapter[]]) => {
    const manga = mangas[mangaId];
    if (!manga) return null;

    const coverArt = Utils.Mangadex.getCoverArt(manga);
    const mangaTitle = Utils.Mangadex.getMangaTitle(manga);
    const url = Constants.Routes.nettrom.manga(mangaId);
    const mangaUrl = `${url}#chapters`;

    // Sort chapters by readableAt descending
    const sortedChapters = [...chapterList].sort((a, b) => {
      const dateA = new Date(a.attributes.readableAt).getTime();
      const dateB = new Date(b.attributes.readableAt).getTime();
      return dateB - dateA;
    });

    const isExpanded = expandedSeries.has(mangaId);
    
    // Determine max chapters to show based on view mode
    let maxChapters: number;
    if (displayMode === "list") {
      maxChapters = 8;
    } else if (displayMode === "compact-grid") {
      maxChapters = 3;
    } else {
      maxChapters = 4;
    }

    // Show all chapters if expanded, otherwise limit to maxChapters
    const displayChapters = isExpanded ? sortedChapters : sortedChapters.slice(0, maxChapters);
    
    const hasMoreChapters = sortedChapters.length > maxChapters;

    return (
      <div key={mangaId} className="rounded-lg bg-neutral-800 p-4 sm:p-5 md:p-6">
        <div className="flex flex-row gap-4">
          {/* Thumbnail - Hidden in list view */}
          {displayMode !== "list" && (
            <Link href={url} className="shrink-0 mx-auto sm:mx-0">
              <div
                className="relative overflow-hidden rounded"
                style={{ width: "100px", aspectRatio: Constants.Nettrom.MANGA_COVER_RATIO }}
              >
                <img
                  src={coverArt}
                  className="h-full w-full object-cover transition duration-300 hover:scale-105"
                  alt={mangaTitle}
                  loading="lazy"
                />
              </div>
            </Link>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title and Language */}
            <div className="mb-3 flex items-center gap-2 flex-wrap">
              <LanguageIcon languageCode={manga.attributes.originalLanguage} />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white truncate flex-1 min-w-0">
                <Link href={url} className="no-underline hover:no-underline">
                  {mangaTitle}
                </Link>
              </h2>
            </div>

            {/* Chapters List */}
            <div className="space-y-2">
              {displayChapters.map((chapter) => {
                const chapterTitle = Utils.Mangadex.getChapterTitle(chapter);
                const chapterUrl = Constants.Routes.nettrom.chapter(chapter.id);
                const chapterTime = Utils.Date.formatNowDistance(
                  new Date(chapter.attributes.readableAt),
                  { addSuffix: true }
                );
                const scanlationGroup = chapter.relationships?.find(
                  (r) => r.type === "scanlation_group"
                );
                const groupName = scanlationGroup?.attributes?.name || "No Group";
                const uploader = chapter.relationships?.find((r) => r.type === "user");
                const uploaderName = uploader?.attributes?.username || "Unknown";
                const uploaderId = uploader?.id;
                const translatedLanguage = chapter.attributes.translatedLanguage || "en";

                return (
                  <div key={chapter.id} className="flex flex-row items-start gap-4 border-b border-neutral-700 pb-2 last:border-0">
                    {/* Left: Chapter Info */}
                    <div className="flex-1 min-w-0">
                      {/* Line 1: Eye icon, Flag, Chapter title */}
                      <div className="mb-1 flex items-center gap-2">
                        <FaEye className="h-4 w-4 sm:h-5 sm:w-5 text-white shrink-0" />
                        <LanguageIcon languageCode={translatedLanguage} className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                        <Link
                          href={chapterUrl}
                          className="text-base sm:text-lg md:text-xl lg:text-2xl text-white hover:text-orange-500 transition-colors truncate no-underline hover:no-underline"
                        >
                          {chapterTitle}
                        </Link>
                      </div>

                      {/* Line 2: User icon, Scanlation group */}
                      <div className="flex items-center gap-2">
                        <FaUser className="h-4 w-4 sm:h-5 sm:w-5 text-white shrink-0" />
                        <span className="text-base sm:text-lg md:text-xl lg:text-2xl text-white">{groupName}</span>
                      </div>
                    </div>

                    {/* Right: Metadata */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
                      <span className="flex items-center gap-2 text-base sm:text-lg md:text-xl lg:text-2xl text-white">
                        <FaClock className="h-4 w-4 sm:h-5 sm:w-5" />
                        {chapterTime}
                      </span>
                      {uploaderId ? (
                        <Link
                          href={`/user/${uploaderId}`}
                          className="flex items-center gap-2 text-base sm:text-lg md:text-xl lg:text-2xl text-blue-400 hover:text-blue-300 no-underline hover:no-underline"
                        >
                          <FaUser className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="hidden sm:inline">{uploaderName}</span>
                        </Link>
                      ) : (
                        <span className="flex items-center gap-2 text-base sm:text-lg md:text-xl lg:text-2xl text-white">
                          <FaUser className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="hidden sm:inline">{uploaderName}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-2 text-base sm:text-lg md:text-xl lg:text-2xl text-white">
                        <FaEye className="h-4 w-4 sm:h-5 sm:w-5" />
                        N/A
                      </span>
                      <Link
                        href={`${chapterUrl}#comments`}
                        className="flex items-center gap-2 text-base sm:text-lg md:text-xl lg:text-2xl text-white hover:text-orange-500 no-underline hover:no-underline"
                      >
                        <FaComment className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show All / Show Less Button */}
            {hasMoreChapters && (
              <div className="mt-3 text-center">
                <button
                  onClick={() => {
                    const newExpanded = new Set(expandedSeries);
                    if (isExpanded) {
                      newExpanded.delete(mangaId);
                    } else {
                      newExpanded.add(mangaId);
                    }
                    setExpandedSeries(newExpanded);
                  }}
                  className="text-base sm:text-lg md:text-xl lg:text-2xl text-orange-500 hover:text-orange-400 bg-transparent border-none cursor-pointer px-3 py-1.5 rounded transition-colors"
                >
                  {isExpanded ? "Show Less" : "Show All"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton height={400} count={3} />
      </div>
    );
  }

  if (error) {
    return <div className="text-2xl text-white">Error loading updates</div>;
  }

  const entries = Object.entries(updates);

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl text-gray-400">No updates found. Add manga to your library to see updates here.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8 md:mb-10 flex flex-row items-center justify-between w-full">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white">
          {total} Series{total !== 1 ? "" : ""}
        </h2>
        <DisplayModeSelector />
      </div>

      <div className={displayMode === "list" || displayMode === "compact-grid" ? "space-y-3 sm:space-y-4 md:space-y-6" : "space-y-0"}>
        {entries.map(renderSeriesItem)}
      </div>

      {total > LIMIT && (
        <div className="mt-4 sm:mt-6 md:mt-8">
          <PaginationNew
            currentPage={page}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </div>
      )}
    </div>
  );
}

export default function UpdatesList() {
  return (
    <Suspense fallback={<Skeleton height={400} count={3} />}>
      <UpdatesListContent />
    </Suspense>
  );
}

