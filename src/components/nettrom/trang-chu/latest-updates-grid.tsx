"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { FaClock, FaComment } from "react-icons/fa";

import { useLastUpdates } from "@/hooks/mangadex";
import { useMangadex } from "@/contexts/mangadex";
import { ExtendChapter } from "@/types/mangadex";
import { Constants } from "@/constants";
import { DataLoader } from "@/components/DataLoader";
import { Utils } from "@/utils";
import useReadingHistory from "@/hooks/useReadingHistory";
import { useSettingsContext } from "@/contexts/settings";
import { AspectRatio } from "@/components/shadcn/aspect-ratio";
import Link from "next/link";
import LanguageIcon from "@/components/language-icon";

export default function LatestUpdatesGrid() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const page = Number(params.get("page")) || 0;
  const [totalPage, setTotalPage] = useState(0);
  const { history } = useReadingHistory();
  const { filteredLanguages, filteredContent, originLanguages } =
    useSettingsContext();
  const { chapters, isLoading, error, total } = useLastUpdates({
    page,
    filteredLanguages,
    filteredContentRating: filteredContent,
    originLanguages,
  });
  const { mangas, mangaStatistics, updateMangas, updateMangaStatistics } =
    useMangadex();
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
  }, [chapters]);

  useEffect(() => {
    if (chapters?.length > 0) {
      updateMangaStatistics({
        manga: chapters.filter((c) => !!c?.manga?.id).map((c) => c.manga!.id!),
      });
    }
  }, [chapters]);

  useEffect(() => {
    if (!total) return;
    setTotalPage(Math.floor(total / Constants.Mangadex.LAST_UPDATES_LIMIT));
  }, [total]);

  // Chia data thành 4 cột cho PC, list 1 cột cho mobile
  const columns: Array<Array<[string, ExtendChapter[]]>> = [[], [], [], []];
  const allEntries = Object.entries(updates);
  const pcEntries = allEntries.slice(0, 24); // Lấy tối đa 24 items cho PC (4 cột x 6 items)
  const mobileEntries = allEntries.slice(0, 10); // Lấy tối đa 10 items cho mobile
  
  // Chia thành 4 cột cho PC
  pcEntries.forEach((entry, index) => {
    const columnIndex = index % 4;
    columns[columnIndex].push(entry);
  });

  return (
    <div className="Module Module-163 px-2 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6" id="latest-updates">
      <div className="ModuleContent">
        <h1 className="my-0 mb-3 sm:mb-4 md:mb-6 flex items-center gap-2 sm:gap-3 text-2xl sm:text-3xl md:text-4xl font-semibold text-white">
          <span>Latest Updates</span>
        </h1>
        <DataLoader isLoading={isLoading} error={error}>
          {/* Mobile: List 1 cột */}
          <div className="flex flex-col gap-3 lg:hidden">
            {mobileEntries.map(([mangaId, chapterList]) => {
              const manga = mangas[mangaId];
              if (!manga) return null;

              const coverArt = Utils.Mangadex.getCoverArt(manga);
              const mangaTitle = Utils.Mangadex.getMangaTitle(manga);
              const readedChapters = history[mangaId];
              const latestChapter = chapterList[0];
              const chapterTitle = Utils.Mangadex.getChapterTitle(latestChapter);
              const chapterTime = Utils.Date.formatNowDistance(
                new Date(latestChapter.attributes.readableAt)
              );
              const stats = mangaStatistics[mangaId];

              return (
                <div
                  key={mangaId}
                  className="flex flex-row gap-4 rounded-lg bg-neutral-800 p-4 sm:p-5 md:p-6"
                >
                  {/* Ảnh */}
                  <Link
                    href={Constants.Routes.nettrom.manga(mangaId)}
                    className="shrink-0 no-underline hover:no-underline"
                  >
                    <div
                      className="relative overflow-hidden rounded"
                      style={{ width: "80px", aspectRatio: Constants.Nettrom.MANGA_COVER_RATIO }}
                    >
                      <img
                        src={coverArt}
                        alt={mangaTitle}
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                      />
                    </div>
                  </Link>

                  {/* Nội dung */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={Constants.Routes.nettrom.manga(mangaId)}
                      className="block no-underline hover:no-underline"
                    >
                      <h3 className="text-xl font-semibold text-white mb-2 truncate">
                        {mangaTitle}
                      </h3>
                    </Link>

                    {/* Description */}
                    {manga.attributes.description && (
                      <p className="text-xl text-neutral-400 mb-2 line-clamp-2">
                        {Utils.Mangadex.transLocalizedStr(manga.attributes.description)}
                      </p>
                    )}

                    {latestChapter && (
                      <div className="mb-2">
                        <Link
                          href={Constants.Routes.nettrom.chapter(latestChapter.id)}
                          className="block text-xl text-white hover:text-orange-500 transition-colors truncate no-underline hover:no-underline"
                        >
                          {chapterTitle}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <LanguageIcon
                            languageCode={latestChapter?.attributes?.translatedLanguage || "en"}
                            className="w-5 h-5 flex-shrink-0"
                          />
                          <span className="text-xl text-white truncate">
                            {latestChapter?.relationships?.find(
                              (r) => r.type === "scanlation_group"
                            )?.attributes?.name || "No Group"}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 sm:gap-5 text-xl text-white">
                      <div className="flex items-center gap-2 shrink-0">
                        <FaClock className="w-5 h-5" />
                        <span>{chapterTime} ago</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <FaComment className="w-5 h-5" />
                        <span>0</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PC: Grid 4 cột */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-6">
            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className="flex flex-col gap-3 bg-neutral-800/50 rounded-lg p-4">
                {column.map(([mangaId, chapterList]) => {
                  const manga = mangas[mangaId];
                  if (!manga) return null;

                  const coverArt = Utils.Mangadex.getCoverArt(manga);
                  const mangaTitle = Utils.Mangadex.getMangaTitle(manga);
                  const readedChapters = history[mangaId];
                  const latestChapter = chapterList[0];
                  const chapterTitle = Utils.Mangadex.getChapterTitle(latestChapter);
                  const chapterTime = Utils.Date.formatNowDistance(
                    new Date(latestChapter.attributes.readableAt)
                  );
                  const stats = mangaStatistics[mangaId];

                  return (
                    <div
                      key={mangaId}
                      className="flex flex-row gap-4 rounded-lg bg-neutral-800 p-4 sm:p-5 md:p-6"
                    >
                      {/* Ảnh */}
                      <Link
                        href={Constants.Routes.nettrom.manga(mangaId)}
                        className="shrink-0 no-underline hover:no-underline"
                      >
                        <div
                          className="relative overflow-hidden rounded"
                          style={{ width: "80px", aspectRatio: Constants.Nettrom.MANGA_COVER_RATIO }}
                        >
                          <img
                            src={coverArt}
                            alt={mangaTitle}
                            className="h-full w-full object-cover transition duration-300 hover:scale-105"
                          />
                        </div>
                      </Link>

                      {/* Nội dung */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={Constants.Routes.nettrom.manga(mangaId)}
                          className="block no-underline hover:no-underline"
                        >
                          <h3 className="text-xl font-semibold text-white mb-2 truncate">
                            {mangaTitle}
                          </h3>
                        </Link>

                        {/* Description */}
                        {manga.attributes.description && (
                          <p className="text-xl text-neutral-400 mb-2 line-clamp-2">
                            {Utils.Mangadex.transLocalizedStr(manga.attributes.description)}
                          </p>
                        )}

                        {latestChapter && (
                          <div className="mb-2">
                            <Link
                              href={Constants.Routes.nettrom.chapter(latestChapter.id)}
                              className="block text-xl text-white hover:text-orange-500 transition-colors truncate no-underline hover:no-underline"
                            >
                              {chapterTitle}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <LanguageIcon
                                languageCode={latestChapter?.attributes?.translatedLanguage || "en"}
                                className="w-5 h-5 flex-shrink-0"
                              />
                              <span className="text-xl text-white truncate">
                                {latestChapter?.relationships?.find(
                                  (r) => r.type === "scanlation_group"
                                )?.attributes?.name || "No Group"}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-4 sm:gap-5 text-xl text-white">
                          <div className="flex items-center gap-2 shrink-0">
                            <FaClock className="w-5 h-5" />
                            <span>{chapterTime} ago</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <FaComment className="w-5 h-5" />
                            <span>0</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </DataLoader>
      </div>
    </div>
  );
}

