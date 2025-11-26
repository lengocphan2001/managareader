"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { MouseEvent, useCallback, useState, Suspense, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";

import { MangadexApi } from "@/api";
import { DataLoader } from "@/components/DataLoader";
import { TooltipComponent } from "@/components/shadcn/tooltip";
import { Constants } from "@/constants";
import { useSearchManga } from "@/hooks/mangadex";
import useDebounce from "@/hooks/useDebounce";
import { Utils } from "@/utils";
import Link from "next/link";
import MobileSearchModal from "./mobile-search-modal";

function SearchInputContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [title, setTitle] = useState(params.get("title") || "");
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const deboucedTitle = useDebounce(title, 500);
  const searchRef = useRef<HTMLFormElement>(null);
  const { mangaList, isLoading, error } = useSearchManga(
    {
      title: deboucedTitle,
      includes: [
        MangadexApi.Static.Includes.ARTIST,
        MangadexApi.Static.Includes.AUTHOR,
        MangadexApi.Static.Includes.COVER_ART,
      ],
    },
    { enable: !!deboucedTitle },
  );

  const handleSubmit = (event: any) => {
    event.preventDefault();
    const options = Utils.Mangadex.normalizeParams(params);
    options.title = title;
    clearTitle();
    router.push(Utils.Url.getSearchNetTromUrl(options));
  };

  const clearTitle = useCallback(() => setTitle(""), [setTitle]);

  const handleBackdropClick = useCallback(
    (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.id === "suggest-backdrop") {
        clearTitle();
      }
    },
    [clearTitle],
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    if (isFocused) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFocused]);

  return (
    <>
      {/* Mobile: Only show icon */}
      <button
        type="button"
        onClick={() => setIsMobileModalOpen(true)}
        className="lg:hidden flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all duration-200 border border-neutral-700 hover:border-orange-500/50 shadow-lg hover:shadow-orange-500/20"
        aria-label="Search"
      >
        <FaSearch className="w-6 h-6" />
      </button>

      {/* Desktop: Full search input */}
      <form 
        ref={searchRef} 
        onSubmit={handleSubmit} 
        className="relative hidden lg:block"
        style={{
          width: isFocused ? '800px' : '100%',
          maxWidth: isFocused ? '800px' : '28rem',
          transition: 'width 150ms ease-out, max-width 150ms ease-out',
          marginLeft: 'auto',
          marginRight: 0,
          transformOrigin: 'right center',
        }}
      >
        <div className={`relative flex items-center bg-neutral-800 rounded-lg border border-neutral-700 transition-all duration-150 ${isFocused ? 'ring-2 ring-orange-500 border-transparent shadow-lg' : 'focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent'}`}>
        <input
          type="text"
            className="flex-1 px-4 py-3 bg-transparent text-white placeholder-neutral-400 rounded-l-lg focus:outline-none text-2xl"
            placeholder="Enter a search query..."
          value={title}
          onChange={(event) => setTitle(event.target.value)}
            onFocus={() => setIsFocused(true)}
        />
          <div className="flex items-center gap-1 px-2 text-neutral-400 text-xl">
            <span className="bg-neutral-700 px-2 py-1 rounded text-white text-base">Ctrl</span>
            <span className="bg-neutral-700 px-2 py-1 rounded text-white text-base">K</span>
          </div>
        <button
          type="submit"
            className="p-3 text-neutral-400 hover:text-white transition-colors rounded-r-lg"
          aria-label="Search"
        >
            <FaSearch className="w-6 h-6" />
        </button>
      </div>
      {(isFocused || title) && (
        <div className="absolute left-0 top-full z-[100] mt-2 w-full overflow-visible border border-neutral-700 bg-neutral-800 rounded-lg shadow-2xl transition-all duration-300 ease-out">
            <div className="border-b border-neutral-700 bg-neutral-900 px-4 py-3">
              <h3 className="mb-1 text-2xl font-semibold text-white">
                Search Results
              </h3>
              <p className="text-xl text-neutral-400">
                {isLoading ? "Searching..." : title ? `${mangaList.length} results` : "Start typing to search..."}
              </p>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              <DataLoader isLoading={isLoading} error={error}>
                {mangaList.length > 0 ? (
                  <ul className="m-0 list-none p-0">
                    {mangaList.map((manga) => {
                      const title = Utils.Mangadex.getMangaTitle(manga);
                      const altTitles = Utils.Mangadex.getMangaAltTitles(manga);
                      const cover = Utils.Mangadex.getCoverArt(manga);
                      const tags = manga.attributes.tags.map(
                        (t) => t.attributes.name.en,
                      );

                      return (
                        <li className="border-b border-neutral-700 transition-colors duration-150 last:border-b-0 hover:bg-neutral-700/50">
                          <Link
                            href={Constants.Routes.nettrom.manga(manga.id)}
                            onClick={() => { clearTitle(); setIsFocused(false); }}
                            className="p-4 text-inherit no-underline hover:text-inherit focus:text-inherit active:text-inherit"
                            style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}
                          >
                            <div className="flex-shrink-0 h-32 w-24 overflow-hidden rounded shadow-sm">
                              <img
                                className="h-full w-full object-cover"
                                src={cover}
                                alt={title}
                                loading="lazy"
                              />
                            </div>
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <h3 className="mb-1 overflow-hidden text-ellipsis whitespace-nowrap text-2xl font-semibold leading-tight text-white">
                                <TooltipComponent
                                  size="xl"
                                  content={title}
                                  side="top"
                                >
                                  <span className="text-2xl font-semibold leading-tight text-white">
                                    {title}
                                  </span>
                                </TooltipComponent>
                              </h3>
                              {altTitles.length > 0 && (
                                <p className="mb-1.5 overflow-hidden text-ellipsis whitespace-nowrap text-xl text-neutral-400">
                                  {altTitles.join(", ")}
                                </p>
                              )}
                              <div className="mb-1.5 text-lg text-neutral-400">
                                {manga.author?.attributes?.name && (
                                  <span className="mb-0.5 block overflow-hidden text-ellipsis whitespace-nowrap">
                                    Tác giả: {manga.author.attributes.name}
                                  </span>
                                )}
                                {manga.artist?.attributes?.name && (
                                  <span className="mb-0.5 block overflow-hidden text-ellipsis whitespace-nowrap">
                                    Họa sĩ: {manga.artist.attributes.name}
                                  </span>
                                )}
                              </div>
                              {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {tags.map((tag, index) => (
                                    <span
                                      key={index}
                                      className="whitespace-nowrap rounded-full bg-blue-100 px-2 py-1 text-sm font-medium text-blue-700"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : !isLoading && title ? (
                  <div className="px-4 py-8 text-center">
                    <div className="mb-3 text-4xl">📚</div>
                    <h3 className="mb-1 text-xl font-semibold text-white">
                      No manga found
                    </h3>
                    <p className="text-lg text-neutral-400">
                      Try searching with different keywords
                    </p>
                  </div>
                ) : !title && isFocused ? (
                  <div className="px-4 py-8 text-center">
                    <div className="mb-3 text-4xl">🔍</div>
                    <h3 className="mb-1 text-xl font-semibold text-white">
                      Start typing to search
                    </h3>
                    <p className="text-lg text-neutral-400">
                      Enter keywords to find manga
                    </p>
                  </div>
                ) : null}
              </DataLoader>
            </div>

            {mangaList.length > 0 && (
              <div className="border-t border-neutral-700 bg-neutral-900 px-4 py-2 text-center">
                <p className="text-lg text-neutral-400">
                  Press Enter for advanced search
                </p>
              </div>
            )}
          </div>
      )}
    </form>

      {/* Mobile Search Modal */}
      <MobileSearchModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
      />
    </>
  );
}

export default function SearchInput() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchInputContent />
    </Suspense>
  );
}
