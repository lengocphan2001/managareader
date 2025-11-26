"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import Link from "next/link";
import { FaClock, FaComment } from "react-icons/fa";

import { useLastUpdates } from "@/hooks/mangadex";
import { useMangadex } from "@/contexts/mangadex";
import { ExtendChapter } from "@/types/mangadex";
import { Constants } from "@/constants";
import { Utils } from "@/utils";
import { useDisplayMode } from "@/contexts/display-mode";
import { useSettingsContext } from "@/contexts/settings";
import LanguageIcon from "@/components/language-icon";
import PaginationNew from "../common/pagination-new";
import Skeleton from "react-loading-skeleton";
import Markdown from "../Markdown";

const LIMIT = 24;

function LatestUpdatesResultsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const page = Number(params.get("page")) || 0;
  const { displayMode } = useDisplayMode();
  const { filteredLanguages, filteredContent, originLanguages } = useSettingsContext();
  
  const { chapters, isLoading, error, total } = useLastUpdates({
    page,
    filteredLanguages,
    filteredContentRating: filteredContent,
    originLanguages,
  });
  
  const { mangas, mangaStatistics, updateMangas, updateMangaStatistics } = useMangadex();
  
  // Group chapters by mangaId
  const updates: Record<string, ExtendChapter[]> = {};
  if (chapters) {
    for (const chapter of chapters) {
      const mangaId = chapter.manga?.id;
      if (!mangaId) continue;
      if (!updates[mangaId]) {
        updates[mangaId] = [];
      }
      updates[mangaId].push(chapter);
    }
  }

  useEffect(() => {
    if (chapters?.length > 0) {
      updateMangas({
        ids: chapters.filter((c) => !!c?.manga?.id).map((c) => c.manga!.id),
      });
    }
  }, [chapters, updateMangas]);

  useEffect(() => {
    if (chapters?.length > 0) {
      updateMangaStatistics({
        manga: chapters.filter((c) => !!c?.manga?.id).map((c) => c.manga!.id!),
      });
    }
  }, [chapters, updateMangaStatistics]);

  const totalPages = Math.ceil((total || 0) / LIMIT);
  const goToPage = (toPage: number) => {
    if (toPage === 0) {
      router.push("/latest-updates#results");
    } else {
      router.push(`/latest-updates?page=${toPage}#results`);
    }
  };

  const renderMangaItem = ([mangaId, chapterList]: [string, ExtendChapter[]]) => {
    const manga = mangas[mangaId];
    if (!manga) return null;

    const coverArt = Utils.Mangadex.getCoverArt(manga);
    const mangaTitle = Utils.Mangadex.getMangaTitle(manga);
    const latestChapter = chapterList[0];
    const chapterTitle = Utils.Mangadex.getChapterTitle(latestChapter);
    const chapterTime = Utils.Date.formatNowDistance(
      new Date(latestChapter.attributes.readableAt),
      { addSuffix: true }
    );
    const stats = mangaStatistics[mangaId];
    const url = Constants.Routes.nettrom.manga(mangaId);
    const chapterUrl = Constants.Routes.nettrom.chapter(latestChapter.id);
    const status = manga.attributes.status;
    const statusColor = status === "ongoing" ? "bg-green-500" : status === "completed" ? "bg-blue-500" : "bg-gray-500";
    const statusText = status === "ongoing" ? "Ongoing" : status === "completed" ? "Completed" : status;

    if (displayMode === "list") {
      return (
        <div key={mangaId} className="flex flex-row gap-4 rounded-lg bg-neutral-800 p-4 sm:p-5 md:p-6">
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

            {/* Latest Chapter */}
            {latestChapter && (
              <div className="mb-3">
                <Link
                  href={chapterUrl}
                  className="text-base sm:text-lg md:text-xl lg:text-2xl text-white hover:text-orange-500 transition-colors truncate block no-underline hover:no-underline"
                >
                  {chapterTitle}
                </Link>
                <div className="flex items-center gap-2 mt-2">
                  <LanguageIcon
                    languageCode={latestChapter.attributes.translatedLanguage || "en"}
                    className="w-5 h-5"
                  />
                  <span className="text-base sm:text-lg md:text-xl lg:text-2xl text-white">
                    {latestChapter.relationships?.find(
                      (r) => r.type === "scanlation_group"
                    )?.attributes?.name || "No Group"}
                  </span>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="mb-3 flex flex-wrap items-center gap-4 sm:gap-5 text-base sm:text-lg md:text-xl lg:text-2xl text-white">
              <span className="flex items-center gap-2 shrink-0">
                <FaClock className="h-5 w-5" />
                {chapterTime}
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <i className="fa fa-star text-yellow-400 text-base sm:text-lg md:text-xl lg:text-2xl"></i>
                {Utils.Number.formatViews(
                  Math.round((stats?.rating?.bayesian || 0) * 100) / 100
                )}
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <i className="fa fa-bookmark text-base sm:text-lg md:text-xl lg:text-2xl"></i>
                {Utils.Number.formatViews(stats?.follows || 0)}
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <FaComment className="h-5 w-5" />
                {Utils.Number.formatViews(stats?.comments?.repliesCount || 0)}
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
        <div key={mangaId} className="flex flex-row gap-3 rounded-lg bg-neutral-800 p-3 sm:p-4">
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

            {/* Latest Chapter */}
            {latestChapter && (
              <div className="mb-3">
                <Link
                  href={chapterUrl}
                  className="text-base sm:text-lg md:text-xl lg:text-2xl text-white hover:text-orange-500 transition-colors truncate block no-underline hover:no-underline"
                >
                  {chapterTitle}
                </Link>
                <div className="flex items-center gap-2 mt-2">
                  <LanguageIcon
                    languageCode={latestChapter.attributes.translatedLanguage || "en"}
                    className="w-5 h-5"
                  />
                  <span className="text-base sm:text-lg md:text-xl lg:text-2xl text-white">
                    {latestChapter.relationships?.find(
                      (r) => r.type === "scanlation_group"
                    )?.attributes?.name || "No Group"}
                  </span>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="mb-3 flex flex-wrap items-center gap-4 sm:gap-5 text-base sm:text-lg md:text-xl lg:text-2xl text-white">
              <span className="flex items-center gap-2 shrink-0">
                <FaClock className="h-5 w-5" />
                {chapterTime}
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <i className="fa fa-star text-yellow-400 text-base sm:text-lg md:text-xl lg:text-2xl"></i>
                {Utils.Number.formatViews(
                  Math.round((stats?.rating?.bayesian || 0) * 100) / 100
                )}
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <i className="fa fa-bookmark text-base sm:text-lg md:text-xl lg:text-2xl"></i>
                {Utils.Number.formatViews(stats?.follows || 0)}
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <i className="fa fa-eye text-base sm:text-lg md:text-xl lg:text-2xl"></i>
                N/A
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <i className="fa fa-comment text-base sm:text-lg md:text-xl lg:text-2xl"></i>
                {Utils.Number.formatViews(stats?.comments?.repliesCount || 0)}
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
        <div key={mangaId} className="group relative overflow-hidden rounded-lg">
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
                {latestChapter && (
                  <div className="mt-2 flex items-center gap-2 text-white">
                    <FaClock className="h-4 w-4" />
                    <span className="text-lg">{chapterTime}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>
      );
    }
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton height={400} count={3} />
      </div>
    );
  }

  if (error) {
    return <div className="text-white">Error loading updates</div>;
  }

  const entries = Object.entries(updates);

  if (displayMode === "list") {
    return (
      <div className="space-y-4" id="results">
        {entries.map(renderMangaItem)}
        <PaginationNew
          currentPage={page}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      </div>
    );
  } else if (displayMode === "compact-grid") {
    return (
      <div id="results">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {entries.map(renderMangaItem)}
        </div>
        <PaginationNew
          currentPage={page}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      </div>
    );
  } else {
    // large-grid
    return (
      <div id="results">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {entries.map(renderMangaItem)}
        </div>
        <PaginationNew
          currentPage={page}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      </div>
    );
  }
}

export default function LatestUpdatesResults() {
  return (
    <Suspense fallback={<Skeleton height={400} count={3} />}>
      <LatestUpdatesResultsContent />
    </Suspense>
  );
}

