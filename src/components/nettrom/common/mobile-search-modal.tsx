"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "nextjs-toploader/app";
import { FaSearch, FaTimes, FaChevronRight } from "react-icons/fa";
import { MangadexApi } from "@/api";
import { Constants } from "@/constants";
import { useSearchManga } from "@/hooks/mangadex";
import useSearchGroup from "@/hooks/mangadex/useSearchGroup";
import useDebounce from "@/hooks/useDebounce";
import { Utils } from "@/utils";
import Link from "next/link";
import { DataLoader } from "@/components/DataLoader";

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSearchModal({
  isOpen,
  onClose,
}: MobileSearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);

  const {
    mangaList,
    isLoading: isLoadingManga,
    error: mangaError,
  } = useSearchManga(
    {
      title: debouncedQuery,
      includes: [
        MangadexApi.Static.Includes.ARTIST,
        MangadexApi.Static.Includes.AUTHOR,
        MangadexApi.Static.Includes.COVER_ART,
      ],
      limit: 5,
    },
    { enable: !!debouncedQuery && isOpen },
  );

  const {
    groupList,
    isLoading: isLoadingGroup,
    error: groupError,
  } = useSearchGroup(
    {
      name: debouncedQuery,
      limit: 3,
      includes: [MangadexApi.Static.Includes.LEADER],
    },
    { enable: !!debouncedQuery && isOpen },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const options = Utils.Mangadex.normalizeParams(new URLSearchParams());
      options.title = searchQuery;
      router.push(Utils.Url.getSearchNetTromUrl(options));
      onClose();
    }
  };

  const handleClose = useCallback(() => {
    setSearchQuery("");
    onClose();
  }, [onClose]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-neutral-900">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-neutral-700 px-4 py-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 items-center gap-3"
        >
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 py-3 pl-10 pr-4 text-2xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoFocus
            />
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-neutral-400 transition-colors hover:text-white"
            aria-label="Close"
          >
            <FaTimes className="text-2xl" />
          </button>
        </form>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {debouncedQuery ? (
          <>
            {/* Manga Results */}
            <div className="px-4 py-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Manga</h2>
                {mangaList.length > 0 && (
                  <Link
                    href={Utils.Url.getSearchNetTromUrl({
                      title: debouncedQuery,
                    })}
                    onClick={handleClose}
                    className="flex items-center gap-1 text-xl text-orange-500 hover:text-orange-400"
                  >
                    <span>View All</span>
                    <FaChevronRight className="text-lg" />
                  </Link>
                )}
              </div>
              <DataLoader isLoading={isLoadingManga} error={mangaError}>
                {mangaList.length > 0 ? (
                  <div className="space-y-3">
                    {mangaList.map((manga) => {
                      const title = Utils.Mangadex.getMangaTitle(manga);
                      const cover = Utils.Mangadex.getCoverArt(manga);
                      const status = Utils.Mangadex.translateStatus(
                        manga.attributes.status,
                      );
                      const statusColor =
                        status === "Ongoing"
                          ? "bg-green-500"
                          : status === "Completed"
                            ? "bg-blue-500"
                            : status === "Hiatus"
                              ? "bg-orange-500"
                              : "bg-gray-500";
                      const mangaStatistic = manga.statistic;

                      return (
                        <Link
                          key={manga.id}
                          href={Constants.Routes.nettrom.manga(manga.id)}
                          onClick={handleClose}
                          className="flex gap-4 rounded-lg bg-neutral-800 p-3 transition-colors hover:bg-neutral-700"
                        >
                          <div className="h-28 w-20 shrink-0 overflow-hidden rounded">
                            <img
                              src={cover}
                              alt={title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="mb-2 line-clamp-2 text-xl font-semibold text-white">
                              {title}
                            </h3>
                            <div className="mb-2 flex flex-wrap items-center gap-3 text-base text-neutral-400">
                              <span className="flex items-center gap-1">
                                <i className="fa fa-star text-yellow-400"></i>
                                {Utils.Number.formatViews(
                                  Math.round(
                                    (mangaStatistic?.rating?.bayesian || 0) *
                                      100,
                                  ) / 100,
                                )}
                              </span>
                              <span className="flex items-center gap-1">
                                <i className="fa fa-bookmark"></i>
                                {Utils.Number.formatViews(
                                  mangaStatistic?.follows || 0,
                                )}
                              </span>
                              <span className="flex items-center gap-1">
                                <i className="fa fa-eye"></i>
                                N/A
                              </span>
                              <span className="flex items-center gap-1">
                                <i className="fa fa-comment"></i>
                                {Utils.Number.formatViews(
                                  mangaStatistic?.comments?.repliesCount || 0,
                                )}
                              </span>
                            </div>
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-sm font-medium text-white ${statusColor}`}
                            >
                              {status}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : !isLoadingManga ? (
                  <p className="py-8 text-center text-xl text-neutral-400">
                    No manga found
                  </p>
                ) : null}
              </DataLoader>
            </div>

            {/* Groups Results */}
            <div className="border-t border-neutral-700 px-4 py-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Groups</h2>
                {groupList.length > 0 && (
                  <Link
                    href={Utils.Url.getSearchNetTromUrl({
                      title: debouncedQuery,
                    })}
                    onClick={handleClose}
                    className="flex items-center gap-1 text-xl text-orange-500 hover:text-orange-400"
                  >
                    <span>View All</span>
                    <FaChevronRight className="text-lg" />
                  </Link>
                )}
              </div>
              <DataLoader isLoading={isLoadingGroup} error={groupError}>
                {groupList.length > 0 ? (
                  <div className="space-y-3">
                    {groupList.map((group) => {
                      const leaders =
                        group.relationships?.filter(
                          (r) => r.type === "leader",
                        ) || [];

                      return (
                        <Link
                          key={group.id}
                          href={Constants.Routes.nettrom.scanlationGroup(
                            group.id,
                          )}
                          onClick={handleClose}
                          className="flex gap-4 rounded-lg bg-neutral-800 p-3 transition-colors hover:bg-neutral-700"
                        >
                          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-700">
                            {/* Fox head avatar placeholder */}
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                                <div className="h-8 w-8 rounded-full bg-orange-500"></div>
                              </div>
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="mb-1 text-xl font-semibold text-white">
                              {group.attributes.name}
                            </h3>
                            <p className="text-base text-neutral-400">
                              {leaders.length > 0
                                ? leaders
                                    .map((l: any) => l.attributes?.username)
                                    .filter(Boolean)
                                    .join(", ") || "No Leader"
                                : "No Leader"}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : !isLoadingGroup ? (
                  <p className="py-8 text-center text-xl text-neutral-400">
                    No groups found
                  </p>
                ) : null}
              </DataLoader>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-xl text-neutral-400">
              Start typing to search...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
