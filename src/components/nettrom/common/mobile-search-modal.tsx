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

export default function MobileSearchModal({ isOpen, onClose }: MobileSearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);

  const { mangaList, isLoading: isLoadingManga, error: mangaError } = useSearchManga(
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

  const { groupList, isLoading: isLoadingGroup, error: groupError } = useSearchGroup(
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
    <div className="fixed inset-0 z-[200] bg-neutral-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-neutral-700">
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xl" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-10 pr-4 py-3 bg-neutral-800 text-white placeholder-neutral-400 rounded-lg border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-2xl"
              autoFocus
            />
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-neutral-400 hover:text-white transition-colors"
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Manga</h2>
                {mangaList.length > 0 && (
                  <Link
                    href={Utils.Url.getSearchNetTromUrl({
                      title: debouncedQuery,
                    })}
                    onClick={handleClose}
                    className="flex items-center gap-1 text-orange-500 hover:text-orange-400 text-xl"
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
                      const status = Utils.Mangadex.translateStatus(manga.attributes.status);
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
                          className="flex gap-4 p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
                        >
                          <div className="shrink-0 w-20 h-28 overflow-hidden rounded">
                            <img
                              src={cover}
                              alt={title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">
                              {title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-base text-neutral-400 mb-2">
                              <span className="flex items-center gap-1">
                                <i className="fa fa-star text-yellow-400"></i>
                                {Utils.Number.formatViews(
                                  Math.round((mangaStatistic?.rating?.bayesian || 0) * 100) / 100
                                )}
                              </span>
                              <span className="flex items-center gap-1">
                                <i className="fa fa-bookmark"></i>
                                {Utils.Number.formatViews(mangaStatistic?.follows || 0)}
                              </span>
                              <span className="flex items-center gap-1">
                                <i className="fa fa-eye"></i>
                                N/A
                              </span>
                              <span className="flex items-center gap-1">
                                <i className="fa fa-comment"></i>
                                {Utils.Number.formatViews(mangaStatistic?.comments?.repliesCount || 0)}
                              </span>
                            </div>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${statusColor}`}
                            >
                              {status}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : !isLoadingManga ? (
                  <p className="text-neutral-400 text-xl text-center py-8">No manga found</p>
                ) : null}
              </DataLoader>
            </div>

            {/* Groups Results */}
            <div className="px-4 py-4 border-t border-neutral-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Groups</h2>
                {groupList.length > 0 && (
                  <Link
                    href={Utils.Url.getSearchNetTromUrl({
                      title: debouncedQuery,
                    })}
                    onClick={handleClose}
                    className="flex items-center gap-1 text-orange-500 hover:text-orange-400 text-xl"
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
                      const leaders = group.relationships?.filter(
                        (r) => r.type === "leader"
                      ) || [];

                      return (
                        <Link
                          key={group.id}
                          href={Constants.Routes.nettrom.scanlationGroup(group.id)}
                          onClick={handleClose}
                          className="flex gap-4 p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
                        >
                          <div className="shrink-0 w-16 h-16 rounded-full overflow-hidden bg-neutral-700 flex items-center justify-center relative">
                            {/* Fox head avatar placeholder */}
                            <div className="w-full h-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-semibold text-white mb-1">
                              {group.attributes.name}
                            </h3>
                            <p className="text-base text-neutral-400">
                              {leaders.length > 0 
                                ? leaders.map((l: any) => l.attributes?.username).filter(Boolean).join(", ") || "No Leader"
                                : "No Leader"}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : !isLoadingGroup ? (
                  <p className="text-neutral-400 text-xl text-center py-8">No groups found</p>
                ) : null}
              </DataLoader>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-neutral-400 text-xl">Start typing to search...</p>
          </div>
        )}
      </div>
    </div>
  );
}

