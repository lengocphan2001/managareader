"use client";

import { useMemo } from "react";
import Link from "next/link";
import useReadingHistory from "@/hooks/useReadingHistory";
import HistoryItem from "./history-item";
import DisplayModeSelector from "../tim-kiem/display-mode-selector";
import { useDisplayMode } from "@/contexts/display-mode";
import Pagination from "../Pagination";
import { Constants } from "@/constants";
import { useState } from "react";
import LanguageIcon from "@/components/language-icon";

export default function HistoryList() {
  const { history, removeHistory } = useReadingHistory();
  const { displayMode } = useDisplayMode();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12;

  const historyEntries = useMemo(
    () => Object.entries(history).reverse(), // Reverse to show newest first
    [history],
  );

  const paginatedEntries = useMemo(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return historyEntries.slice(start, end);
  }, [historyEntries, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(historyEntries.length / itemsPerPage);

  if (historyEntries.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-2xl text-gray-400">No reading history found</p>
      </div>
    );
  }

  const renderHistoryItem = (mangaId: string, manga: any) => {
    if (displayMode === "list") {
      return (
        <HistoryItem
          key={mangaId}
          mangaId={mangaId}
          mangaTitle={manga.mangaTitle}
          cover={manga.cover}
          chapterId={manga.chapterId}
          chapterTitle={manga.chapterTitle}
          onRemove={() => removeHistory(mangaId)}
          showImage={false}
        />
      );
    } else if (displayMode === "compact-grid") {
      return (
        <HistoryItem
          key={mangaId}
          mangaId={mangaId}
          mangaTitle={manga.mangaTitle}
          cover={manga.cover}
          chapterId={manga.chapterId}
          chapterTitle={manga.chapterTitle}
          onRemove={() => removeHistory(mangaId)}
          showImage={true}
        />
      );
    } else {
      // large-grid - chỉ ảnh và title overlay
      return (
        <div
          key={mangaId}
          className="group relative overflow-hidden rounded-lg"
        >
          <Link
            href={Constants.Routes.nettrom.manga(mangaId)}
            className="block h-full w-full"
          >
            <div
              className="relative w-full overflow-hidden"
              style={{ aspectRatio: "3/4" }}
            >
              <img
                src={manga.cover}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                alt={manga.mangaTitle}
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-transparent p-4">
                <div className="flex items-center gap-2">
                  <LanguageIcon languageCode="ja" />
                  <h3 className="truncate text-2xl font-semibold text-white">
                    {manga.mangaTitle}
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
    <div className="w-full">
      {/* Display Mode Selector and Title Count */}
      <div className="mb-6 flex w-full flex-row items-center justify-between sm:mb-8 md:mb-10">
        <div className="text-xl font-semibold text-white sm:text-2xl md:text-3xl lg:text-4xl">
          {historyEntries.length}{" "}
          {historyEntries.length === 1 ? "Item" : "Items"}
        </div>
        <DisplayModeSelector />
      </div>

      {/* History Items */}
      {displayMode === "list" ? (
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {paginatedEntries.map(([mangaId, manga]) =>
            renderHistoryItem(mangaId, manga),
          )}
        </div>
      ) : (
        <div
          className={
            displayMode === "compact-grid"
              ? "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
              : "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          }
        >
          {paginatedEntries.map(([mangaId, manga]) =>
            renderHistoryItem(mangaId, manga),
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            onPageChange={(event) => setCurrentPage(event.selected)}
            pageCount={totalPages}
            forcePage={currentPage}
          />
        </div>
      )}
    </div>
  );
}
