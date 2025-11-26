"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useRouter } from "nextjs-toploader/app";
import Link from "next/link";

import { useSearchManga } from "@/hooks/mangadex";
import { useMangadex } from "@/contexts/mangadex";
import { Utils } from "@/utils";
import { Constants } from "@/constants";
import LanguageIcon from "@/components/language-icon";
import { useDisplayMode } from "@/contexts/display-mode";
import { MangadexApi } from "@/api";

import PaginationNew from "../common/pagination-new";
import Markdown from "../Markdown";
import ScrollToButton from "../scroll-to-button";
import Skeleton from "react-loading-skeleton";
import { FaClock } from "react-icons/fa";

const LIMIT = 12;

interface MangaResultsContentProps {
  basePath?: string;
  defaultOptions?: MangadexApi.Manga.GetSearchMangaRequestOptions;
  showUpdateTime?: boolean;
}

function MangaResultsContent({
  basePath,
  defaultOptions,
  showUpdateTime = false,
}: MangaResultsContentProps = {}) {
  const router = useRouter();
  const params = useSearchParams();
  const normalizedParams = Utils.Mangadex.normalizeParams(params);

  // Merge default options with params (params override defaults)
  const options: MangadexApi.Manga.GetSearchMangaRequestOptions = {
    // Start with default options
    ...defaultOptions,
    // Override with params from URL
    ...normalizedParams,
    // Merge arrays: use params if present, otherwise use defaults
    originalLanguage: normalizedParams.originalLanguage?.length
      ? normalizedParams.originalLanguage
      : defaultOptions?.originalLanguage || normalizedParams.originalLanguage,
    availableTranslatedLanguage: normalizedParams.availableTranslatedLanguage
      ?.length
      ? normalizedParams.availableTranslatedLanguage
      : defaultOptions?.availableTranslatedLanguage ||
        normalizedParams.availableTranslatedLanguage,
    // Merge order object: params override defaults
    order:
      normalizedParams.order && Object.keys(normalizedParams.order).length > 0
        ? normalizedParams.order
        : defaultOptions?.order || normalizedParams.order || {},
    // Keep limit and offset from params (or use defaults)
    limit: normalizedParams.limit || defaultOptions?.limit || LIMIT,
    offset: normalizedParams.offset ?? defaultOptions?.offset ?? 0,
  };

  const { mangaList, data, isLoading } = useSearchManga(options);
  const { updateMangaStatistics, mangaStatistics, addMangas } = useMangadex();
  const { displayMode } = useDisplayMode();
  const offset = params.get("offset") ? parseInt(params.get("offset")!) : 0;
  const total = data ? data.total : 0;
  const limit = params.get("limit") ? parseInt(params.get("limit")!) : LIMIT;
  const page = Math.floor(offset / limit);
  const goToPage = (toPage: number) => {
    // Only include offset in URL, not default options
    const newOffset = toPage * limit;
    if (basePath) {
      if (newOffset === 0) {
        router.push(`${basePath}#results`);
      } else {
        router.push(`${basePath}?offset=${newOffset}#results`);
      }
    } else {
      options.offset = newOffset;
      router.push(Utils.Url.getSearchNetTromUrl(options));
    }
  };

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
    const statusColor =
      status === "ongoing"
        ? "bg-green-500"
        : status === "completed"
          ? "bg-blue-500"
          : "bg-gray-500";
    const statusText =
      status === "ongoing"
        ? "Ongoing"
        : status === "completed"
          ? "Completed"
          : status;

    if (displayMode === "list") {
      return (
        <div
          key={manga.id}
          className="flex flex-row gap-4 rounded-lg bg-neutral-800 p-4 sm:p-5 md:p-6"
        >
          {/* Cover Image */}
          <Link href={url} className="mx-auto shrink-0 sm:mx-0">
            <div
              className="relative overflow-hidden rounded"
              style={{
                width: "100px",
                aspectRatio: Constants.Nettrom.MANGA_COVER_RATIO,
              }}
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
          <div className="min-w-0 flex-1">
            {/* Title and Language */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <LanguageIcon languageCode={manga.attributes.originalLanguage} />
              <h2 className="min-w-0 flex-1 truncate text-xl font-semibold text-white sm:text-2xl md:text-3xl">
                <Link href={url} className="no-underline hover:no-underline">
                  {mangaTitle}
                </Link>
              </h2>
              <div
                className={`h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3 ${statusColor} shrink-0`}
                title={status}
              />
              <span className="shrink-0 text-base text-white sm:text-lg md:text-xl lg:text-2xl">
                {statusText}
              </span>
            </div>

            {/* Metadata */}
            <div className="mb-3 flex flex-wrap items-center gap-4 text-base text-white sm:gap-5 sm:text-lg md:text-xl lg:text-2xl">
              {showUpdateTime && manga.attributes.updatedAt && (
                <span className="flex shrink-0 items-center gap-2">
                  <FaClock className="h-5 w-5" />
                  {Utils.Date.formatNowDistance(
                    new Date(manga.attributes.updatedAt),
                    { addSuffix: true },
                  )}
                </span>
              )}
              <span className="flex shrink-0 items-center gap-2">
                <i className="fa fa-star text-base text-yellow-400 sm:text-lg md:text-xl lg:text-2xl"></i>
                {Utils.Number.formatViews(
                  Math.round((mangaStatistic?.rating?.bayesian || 0) * 100) /
                    100,
                )}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <i className="fa fa-bookmark text-base sm:text-lg md:text-xl lg:text-2xl"></i>
                {Utils.Number.formatViews(mangaStatistic?.follows || 0)}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <i className="fa fa-eye text-base sm:text-lg md:text-xl lg:text-2xl"></i>
                N/A
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <i className="fa fa-comment text-base sm:text-lg md:text-xl lg:text-2xl"></i>
                {Utils.Number.formatViews(
                  mangaStatistic?.comments?.repliesCount || 0,
                )}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <i className="fa fa-file-alt text-base sm:text-lg md:text-xl lg:text-2xl"></i>
                {mangaStatistic?.chapters?.repliesCount || 0}
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
                    className={`shrink-0 rounded px-2.5 py-1 text-sm font-medium uppercase text-white sm:px-3 sm:py-1.5 sm:text-base md:text-lg lg:text-xl ${
                      isSuggestive ? "bg-orange-500" : "bg-neutral-700"
                    }`}
                  >
                    {tagName}
                  </span>
                );
              })}
              {manga.attributes.tags.length > 10 && (
                <span className="shrink-0 rounded bg-red-600 px-2.5 py-1 text-sm font-medium text-white sm:px-3 sm:py-1.5 sm:text-base md:text-lg lg:text-xl">
                  MORE
                </span>
              )}
            </div>

            {/* Description */}
            <div className="line-clamp-3 text-base text-white sm:line-clamp-4 sm:text-lg md:text-xl lg:text-2xl">
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
        <div
          key={manga.id}
          className="flex flex-row gap-3 rounded-lg bg-neutral-800 p-3 sm:p-4"
        >
          {/* Cover Image */}
          <Link href={url} className="shrink-0">
            <div
              className="relative overflow-hidden rounded"
              style={{
                width: "80px",
                aspectRatio: Constants.Nettrom.MANGA_COVER_RATIO,
              }}
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
          <div className="min-w-0 flex-1">
            {/* Title and Language */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <LanguageIcon languageCode={manga.attributes.originalLanguage} />
              <h2 className="min-w-0 flex-1 truncate text-xl font-semibold text-white sm:text-2xl md:text-3xl">
                <Link href={url} className="no-underline hover:no-underline">
                  {mangaTitle}
                </Link>
              </h2>
              <div
                className={`h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3 ${statusColor} shrink-0`}
                title={status}
              />
              <span className="shrink-0 text-base text-white sm:text-lg md:text-xl lg:text-2xl">
                {statusText}
              </span>
            </div>

            {/* Metadata */}
            <div className="mb-3 flex flex-wrap items-center gap-4 text-base text-white sm:gap-5 sm:text-lg md:text-xl lg:text-2xl">
              {showUpdateTime && manga.attributes.updatedAt && (
                <span className="flex shrink-0 items-center gap-2">
                  <FaClock className="h-5 w-5" />
                  {Utils.Date.formatNowDistance(
                    new Date(manga.attributes.updatedAt),
                    { addSuffix: true },
                  )}
                </span>
              )}
              <span className="flex shrink-0 items-center gap-2">
                <i className="fa fa-star text-base text-yellow-400 sm:text-lg md:text-xl lg:text-2xl"></i>
                {Utils.Number.formatViews(
                  Math.round((mangaStatistic?.rating?.bayesian || 0) * 100) /
                    100,
                )}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <i className="fa fa-bookmark text-base sm:text-lg md:text-xl lg:text-2xl"></i>
                {Utils.Number.formatViews(mangaStatistic?.follows || 0)}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <i className="fa fa-eye text-base sm:text-lg md:text-xl lg:text-2xl"></i>
                N/A
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <i className="fa fa-comment text-base sm:text-lg md:text-xl lg:text-2xl"></i>
                {Utils.Number.formatViews(
                  mangaStatistic?.comments?.repliesCount || 0,
                )}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <i className="fa fa-file-alt text-base sm:text-lg md:text-xl lg:text-2xl"></i>
                {mangaStatistic?.chapters?.repliesCount || 0}
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
                    className={`shrink-0 rounded px-2.5 py-1 text-sm font-medium uppercase text-white sm:px-3 sm:py-1.5 sm:text-base md:text-lg lg:text-xl ${
                      isSuggestive ? "bg-orange-500" : "bg-neutral-700"
                    }`}
                  >
                    {tagName}
                  </span>
                );
              })}
              {manga.attributes.tags.length > 5 && (
                <span className="shrink-0 rounded bg-red-600 px-2.5 py-1 text-sm font-medium text-white sm:px-3 sm:py-1.5 sm:text-base md:text-lg lg:text-xl">
                  MORE
                </span>
              )}
            </div>

            {/* Description */}
            <div className="line-clamp-2 text-base text-white sm:text-lg md:text-xl lg:text-2xl">
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
        <div
          key={manga.id}
          className="group relative overflow-hidden rounded-lg"
        >
          <Link href={url} className="block h-full w-full">
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
                  <LanguageIcon
                    languageCode={manga.attributes.originalLanguage}
                  />
                  <h3 className="truncate text-2xl font-semibold text-white">
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

  return (
    <div
      className={` ${mangaList.length > 0 ? "min-h-0" : "min-h-screen"}`}
      id="results"
    >
      <ScrollToButton targetId="results" />
      {displayMode === "list" ? (
        <div className="space-y-6">
          {mangaList.map(renderMangaItem)}
          {isLoading && <ListResultSkeleton />}
        </div>
      ) : (
        <div
          className={
            displayMode === "compact-grid"
              ? "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
              : "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          }
        >
          {mangaList.map(renderMangaItem)}
          {isLoading && <GridResultSkeleton mode={displayMode} />}
        </div>
      )}

      <PaginationNew
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
        onPageChange={goToPage}
      />
    </div>
  );
}

interface MangaResultsProps {
  basePath?: string;
  defaultOptions?: MangadexApi.Manga.GetSearchMangaRequestOptions;
}

export default function MangaResults({
  basePath,
  defaultOptions,
}: MangaResultsProps = {}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MangaResultsContent
        basePath={basePath}
        defaultOptions={defaultOptions}
      />
    </Suspense>
  );
}

function ListResultSkeleton() {
  return [...Array(LIMIT)].map((_, index) => (
    <div key={index} className="flex gap-6 rounded-lg bg-neutral-800 p-6">
      <div className="shrink-0">
        <Skeleton
          width={140}
          height={Math.round(140 * Constants.Nettrom.MANGA_COVER_RATIO)}
          className="rounded"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-3 flex items-center gap-3">
          <Skeleton circle width={20} height={20} />
          <Skeleton width="60%" height={32} />
        </div>
        <div className="mb-4 flex gap-6">
          <Skeleton width={80} height={20} />
          <Skeleton width={80} height={20} />
          <Skeleton width={80} height={20} />
        </div>
        <div className="mb-4 flex gap-2">
          <Skeleton width={100} height={28} />
          <Skeleton width={100} height={28} />
          <Skeleton width={100} height={28} />
        </div>
        <Skeleton count={4} height={20} />
      </div>
    </div>
  ));
}

function GridResultSkeleton({ mode }: { mode: "compact-grid" | "large-grid" }) {
  return [...Array(LIMIT)].map((_, index) => (
    <div key={index} className="overflow-hidden rounded-lg bg-neutral-800">
      <Skeleton
        width="100%"
        height={mode === "compact-grid" ? 200 : 280}
        className="rounded"
      />
    </div>
  ));
}
