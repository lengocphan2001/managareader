"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useDisplayMode } from "@/contexts/display-mode";
import { useMangadex } from "@/contexts/mangadex";
import { Utils } from "@/utils";
import { Constants } from "@/constants";
import LanguageIcon from "@/components/language-icon";
import DisplayModeSelector from "../tim-kiem/display-mode-selector";
import useLibraryManga from "@/hooks/mangadex/useLibraryManga";
import PaginationNew from "../common/pagination-new";
import Markdown from "../Markdown";
import { FaClock } from "react-icons/fa";

const LIMIT = 12;

interface LibraryListProps {
  status: string;
}

export default function LibraryList({ status }: LibraryListProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const { displayMode } = useDisplayMode();
  const { updateMangaStatistics, mangaStatistics, addMangas } = useMangadex();
  const offset = currentPage * LIMIT;

  const { mangaList, data, isLoading, total } = useLibraryManga(status, {
    limit: LIMIT,
    offset,
  });

  useEffect(() => {
    if (mangaList.length > 0) {
      addMangas(mangaList);
      updateMangaStatistics({ manga: mangaList.map((m) => m.id) });
    }
  }, [mangaList, addMangas, updateMangaStatistics]);

  const renderMangaItem = (manga: any) => {
    const mangaTitle = Utils.Mangadex.getMangaTitle(manga);
    const coverArt = Utils.Mangadex.getCoverArt(manga);
    const mangaStatistic = mangaStatistics[manga.id];
    const url = Constants.Routes.nettrom.manga(manga.id);
    const status = manga.attributes.status;
    const statusColor = status === "ongoing" ? "bg-green-500" : status === "completed" ? "bg-blue-500" : "bg-gray-500";
    const statusText = status === "ongoing" ? "Ongoing" : status === "completed" ? "Completed" : status;

    if (displayMode === "list") {
      return (
        <div key={manga.id} className="flex flex-row gap-4 rounded-lg bg-neutral-800 p-4 sm:p-5 md:p-6">
          {/* Cover Image */}
          <Link href={url} className="shrink-0">
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
              <div className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full ${statusColor} shrink-0`} title={status} />
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl text-white shrink-0">{statusText}</span>
            </div>

            {/* Metadata */}
            <div className="mb-3 flex flex-wrap items-center gap-4 sm:gap-5 text-base sm:text-lg md:text-xl lg:text-2xl text-white">
              <span className="flex items-center gap-2 shrink-0">
                <i className="fa fa-star text-yellow-400 text-base sm:text-lg md:text-xl lg:text-2xl"></i>
                {Utils.Number.formatViews(
                  Math.round((mangaStatistic?.rating?.bayesian || 0) * 100) / 100
                )}
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <i className="fa fa-bookmark text-base sm:text-lg md:text-xl lg:text-2xl"></i>
                {Utils.Number.formatViews(mangaStatistic?.follows || 0)}
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <i className="fa fa-eye text-base sm:text-lg md:text-xl lg:text-2xl"></i>
                N/A
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <i className="fa fa-comment text-base sm:text-lg md:text-xl lg:text-2xl"></i>
                {Utils.Number.formatViews(mangaStatistic?.comments?.repliesCount || 0)}
              </span>
            </div>

            {/* Tags */}
            <div className="mb-3 flex flex-wrap gap-2 sm:gap-2.5">
              {manga.attributes.tags.slice(0, 10).map((tag: any) => {
                const tagName = tag.attributes.name.en?.toUpperCase() || "";
                const isSuggestive = tagName === "SUGGESTIVE";
                return (
                  <span
                    key={tag.id}
                    className={`rounded px-2.5 py-1 sm:px-3 sm:py-1.5 text-sm sm:text-base md:text-lg lg:text-xl font-medium uppercase text-white shrink-0 ${
                      isSuggestive ? "bg-orange-500" : "bg-neutral-700"
                    }`}
                  >
                    {tagName}
                  </span>
                );
              })}
              {manga.attributes.tags.length > 10 && (
                <span className="rounded bg-red-600 px-2.5 py-1 sm:px-3 sm:py-1.5 text-sm sm:text-base md:text-lg lg:text-xl font-medium text-white shrink-0">
                  MORE
                </span>
              )}
            </div>

            {/* Description */}
            <div className="text-base sm:text-lg md:text-xl lg:text-2xl text-white line-clamp-3 sm:line-clamp-4">
              <Markdown
                content={
                  manga.attributes.description.vi ||
                  manga.attributes.description.en ||
                  ""
                }
              />
            </div>
          </div>
        </div>
      );
    } else if (displayMode === "compact-grid") {
      return (
        <div key={manga.id} className="flex flex-row gap-3 rounded-lg bg-neutral-800 p-3 sm:p-4">
          {/* Cover Image */}
          <Link href={url} className="shrink-0">
            <div
              className="relative overflow-hidden rounded"
              style={{ width: "80px", aspectRatio: Constants.Nettrom.MANGA_COVER_RATIO }}
            >
              <img
                src={coverArt}
                className="h-full w-full object-cover transition duration-300 hover:scale-105"
                alt={mangaTitle}
                loading="lazy"
              />
            </div>
          </Link>

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
              <div className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full ${statusColor} shrink-0`} title={status} />
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl text-white shrink-0">{statusText}</span>
            </div>

            {/* Metadata */}
            <div className="mb-3 flex flex-wrap items-center gap-4 sm:gap-5 text-base sm:text-lg md:text-xl lg:text-2xl text-white">
              <span className="flex items-center gap-2 shrink-0">
                <i className="fa fa-star text-yellow-400 text-base sm:text-lg md:text-xl lg:text-2xl"></i>
                {Utils.Number.formatViews(
                  Math.round((mangaStatistic?.rating?.bayesian || 0) * 100) / 100
                )}
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <i className="fa fa-bookmark text-base sm:text-lg md:text-xl lg:text-2xl"></i>
                {Utils.Number.formatViews(mangaStatistic?.follows || 0)}
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <i className="fa fa-eye text-base sm:text-lg md:text-xl lg:text-2xl"></i>
                N/A
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <i className="fa fa-comment text-base sm:text-lg md:text-xl lg:text-2xl"></i>
                {Utils.Number.formatViews(mangaStatistic?.comments?.repliesCount || 0)}
              </span>
            </div>

            {/* Tags */}
            <div className="mb-3 flex flex-wrap gap-2 sm:gap-2.5">
              {manga.attributes.tags.slice(0, 5).map((tag: any) => {
                const tagName = tag.attributes.name.en?.toUpperCase() || "";
                const isSuggestive = tagName === "SUGGESTIVE";
                return (
                  <span
                    key={tag.id}
                    className={`rounded px-2.5 py-1 sm:px-3 sm:py-1.5 text-sm sm:text-base md:text-lg lg:text-xl font-medium uppercase text-white shrink-0 ${
                      isSuggestive ? "bg-orange-500" : "bg-neutral-700"
                    }`}
                  >
                    {tagName}
                  </span>
                );
              })}
              {manga.attributes.tags.length > 5 && (
                <span className="rounded bg-red-600 px-2.5 py-1 sm:px-3 sm:py-1.5 text-sm sm:text-base md:text-lg lg:text-xl font-medium text-white shrink-0">
                  MORE
                </span>
              )}
            </div>

            {/* Description */}
            <div className="text-base sm:text-lg md:text-xl lg:text-2xl text-white line-clamp-2">
              <Markdown
                content={
                  manga.attributes.description.vi ||
                  manga.attributes.description.en ||
                  ""
                }
              />
            </div>
          </div>
        </div>
      );
    } else {
      // large-grid - chỉ ảnh và title overlay
      return (
        <div key={manga.id} className="group relative overflow-hidden rounded-lg">
          <Link href={url} className="block w-full h-full">
            <div
              className="relative w-full overflow-hidden"
              style={{ aspectRatio: "3/4" }}
            >
              <img
                src={coverArt}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                alt={mangaTitle}
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-transparent p-4">
                <div className="flex items-center gap-2">
                  <LanguageIcon languageCode={manga.attributes.originalLanguage} />
                  <h3 className="text-2xl font-semibold text-white truncate">
                    {mangaTitle}
                  </h3>
                </div>
              </div>
            </div>
          </Link>
        </div>
      );
    }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const goToPage = (toPage: number) => {
    setCurrentPage(toPage);
  };

  return (
    <div className="w-full">
      {/* Display Mode Selector and Title Count */}
      <div className="mb-6 sm:mb-8 md:mb-10 flex flex-row items-center justify-between w-full">
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white font-semibold">
          {total} {total === 1 ? "Title" : "Titles"}
        </div>
        <DisplayModeSelector />
      </div>

      {/* Manga Items */}
      {isLoading ? (
        <div className="text-2xl text-white text-center py-12 bg-neutral-800 rounded-lg">Loading...</div>
      ) : mangaList.length === 0 ? (
        <div className="text-2xl text-white text-center py-12 bg-neutral-800 rounded-lg">No titles</div>
      ) : displayMode === "list" ? (
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {mangaList.map(renderMangaItem)}
        </div>
      ) : (
        <div className={displayMode === "compact-grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4" : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"}>
          {mangaList.map(renderMangaItem)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <PaginationNew
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </div>
      )}
    </div>
  );
}

