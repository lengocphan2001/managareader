"use client";

import { useState, useMemo, useEffect } from "react";
import { useChapterContext } from "@/contexts/chapter";
import { useSettingsContext } from "@/contexts/settings";
import { useChapterPages } from "@/hooks/mangadex";
import { Utils } from "@/utils";
import { Constants } from "@/constants";
import Link from "next/link";
import Iconify from "@/components/iconify";
import {
  FaTimes,
  FaExpand,
  FaBookmark,
  FaFileAlt,
  FaChevronLeft,
  FaChevronRight,
  FaFlag,
  FaShare,
  FaComment,
  FaCog,
} from "react-icons/fa";
import { Button } from "../Button";
import { Select } from "../Select";

interface ChapterControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

export default function ChapterControlPanel({
  isOpen,
  onClose,
  onToggleFullscreen,
  isFullscreen,
}: ChapterControlPanelProps) {
  const {
    manga,
    chapter,
    chapters,
    chapterId,
    canNext,
    canPrev,
    next,
    prev,
    goTo,
    group,
  } = useChapterContext();
  const { onToggleDrawer, dataSaver, maxImageWidth } = useSettingsContext();
  
  // Get pages for current chapter
  const { pages } = useChapterPages(
    chapter?.attributes.externalUrl ? null : chapterId,
  );
  const totalPages = pages?.length || 1;
  const [currentPage, setCurrentPage] = useState(1);

  // Update current page when chapter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [chapterId]);

  // Scroll to page
  const scrollToPage = (pageNum: number) => {
    const pageElement = document.querySelector(`[data-index="${pageNum - 1}"]`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
      setCurrentPage(pageNum);
    }
  };

  // Listen to scroll to update current page
  useEffect(() => {
    if (!pages || pages.length === 0) return;

    const handleScroll = () => {
      const pageElements = document.querySelectorAll("[data-index]");
      let current = 1;
      
      pageElements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
          current = index + 1;
        }
      });
      
      setCurrentPage(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pages]);

  const mangaTitle = useMemo(() => Utils.Mangadex.getMangaTitle(manga), [manga]);
  const chapterTitle = useMemo(
    () => Utils.Mangadex.getChapterTitle(chapter),
    [chapter],
  );

  // Get uploader info
  const uploader = (chapter as any)?.user?.attributes?.username || "Unknown";
  const groupName = group?.attributes?.name || "Unknown Group";

  // Get comment count
  const commentCount = (chapter as any)?.comments?.repliesCount || 0;

  // Reader settings
  const [readerMode, setReaderMode] = useState<"single" | "double">("single");
  const [fitMode, setFitMode] = useState<"width" | "height" | "both">("both");
  const [readingDirection, setReadingDirection] = useState<"ltr" | "rtl">("ltr");
  const [headerHidden, setHeaderHidden] = useState(false);
  const [progressMode, setProgressMode] = useState<"normal" | "webtoon">("normal");

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={onClose}
      />

      {/* Control Panel */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full bg-neutral-900 shadow-2xl transition-transform duration-300 lg:w-96 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-700 p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800 text-white transition-colors hover:bg-neutral-700"
                aria-label="Close panel"
              >
                <FaTimes className="h-5 w-5" />
              </button>
              <button
                onClick={onToggleFullscreen}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800 text-white transition-colors hover:bg-neutral-700"
                aria-label="Toggle fullscreen"
              >
                <FaExpand className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* Manga Information */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Iconify icon="fa:bookmark" className="h-5 w-5 text-orange-500" />
                <Link
                  href={Constants.Routes.nettrom.manga(manga?.id || "")}
                  className="text-lg sm:text-xl font-semibold text-orange-500 hover:text-orange-400 line-clamp-2"
                >
                  {mangaTitle}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <Iconify icon="fa:file-alt" className="h-4 w-4 text-gray-400" />
                <p className="text-base sm:text-lg text-gray-300 line-clamp-2">{chapterTitle}</p>
              </div>
            </div>

            {/* Progress Bar */}
            {totalPages > 1 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Page {currentPage}</span>
                  <span>of {totalPages}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className="h-full bg-orange-500 transition-all duration-300"
                    style={{ width: `${(currentPage / totalPages) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Page Selector */}
            {totalPages > 1 && (
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium text-gray-400">Page</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800 text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
                  >
                    <FaChevronLeft className="h-4 w-4" />
                  </button>
                  <Select
                    classNames={{
                      trigger: "h-10 flex-1 rounded-lg text-sm sm:text-base",
                      content: "max-h-[300px]",
                    }}
                    value={currentPage.toString()}
                    onValueChange={(value) => scrollToPage(parseInt(value))}
                    items={Array.from({ length: totalPages }, (_, i) => ({
                      label: `Page ${i + 1}`,
                      value: (i + 1).toString(),
                    }))}
                  />
                  <button
                    onClick={() => scrollToPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800 text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
                  >
                    <FaChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Chapter Selector */}
            <div className="space-y-2">
              <label className="text-sm sm:text-base font-medium text-gray-400">
                Chapter
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={prev}
                  disabled={!canPrev}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800 text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
                >
                  <FaChevronLeft className="h-4 w-4" />
                </button>
                <Select
                  classNames={{
                    trigger: "h-10 flex-1 rounded-lg text-sm sm:text-base",
                    content: "max-h-[500px]",
                  }}
                  value={chapterId || ""}
                  onValueChange={(value) => goTo(value)}
                  items={chapters.map((item) => ({
                    label:
                      item.volume !== "none"
                        ? item.chapter !== "none"
                          ? `Vol. ${item.volume} Ch. ${item.chapter}`
                          : `Oneshot Vol. ${item.volume}`
                        : item.chapter !== "none"
                          ? `Chapter ${item.chapter}`
                          : "Oneshot",
                    value: item.id,
                  }))}
                />
                <button
                  onClick={next}
                  disabled={!canNext}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800 text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
                >
                  <FaChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start border-neutral-700 text-sm sm:text-base text-white hover:bg-neutral-800"
              >
                <FaFlag className="mr-2 h-4 w-4" />
                Report Chapter
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-neutral-700 text-sm sm:text-base text-white hover:bg-neutral-800"
              >
                <FaShare className="mr-2 h-4 w-4" />
                Share Chapter
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-neutral-700 text-sm sm:text-base text-white hover:bg-neutral-800"
              >
                <FaComment className="mr-2 h-4 w-4" />
                {commentCount} comments
              </Button>
            </div>

            {/* Upload Information */}
            <div className="space-y-2 border-t border-neutral-700 pt-4">
              <p className="text-sm sm:text-base font-medium text-gray-400">
                Uploaded By
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Iconify icon="fa:user" className="h-4 w-4 text-gray-400" />
                  <span className="text-base sm:text-lg text-gray-300 truncate">{groupName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Iconify icon="fa:user" className="h-4 w-4 text-blue-400" />
                  <Link
                    href="#"
                    className="text-base sm:text-lg text-blue-400 hover:text-blue-300 truncate"
                  >
                    {uploader}
                  </Link>
                </div>
              </div>
            </div>

            {/* Reader Settings */}
            <div className="space-y-3 border-t border-neutral-700 pt-4">
              <p className="text-sm sm:text-base font-medium text-gray-400">
                Reader Settings
              </p>

              {/* Single Page / Double Page */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Iconify icon="fa:file" className="h-4 w-4 text-gray-400" />
                  <span className="text-base sm:text-lg text-white">
                    {readerMode === "single" ? "Single Page" : "Double Page"}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setReaderMode(readerMode === "single" ? "double" : "single")
                  }
                  className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs sm:text-sm text-white hover:bg-neutral-700"
                >
                  Switch
                </button>
              </div>

              {/* Fit Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Iconify
                    icon="fa:expand"
                    className="h-4 w-4 text-gray-400"
                  />
                  <span className="text-base sm:text-lg text-white">Fit Both</span>
                </div>
                <button
                  onClick={onToggleDrawer}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 text-white hover:bg-neutral-700"
                >
                  <FaCog className="h-4 w-4" />
                </button>
              </div>

              {/* Reading Direction */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Iconify
                    icon="fa:arrow-right"
                    className="h-4 w-4 text-gray-400"
                  />
                  <span className="text-base sm:text-lg text-white">Left To Right</span>
                </div>
                <button
                  onClick={() =>
                    setReadingDirection(
                      readingDirection === "ltr" ? "rtl" : "ltr",
                    )
                  }
                  className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs sm:text-sm text-white hover:bg-neutral-700"
                >
                  Switch
                </button>
              </div>

              {/* Header Hidden */}
              <div className="flex items-center justify-between">
                <span className="text-base sm:text-lg text-white">Header Hidden</span>
                <input
                  type="checkbox"
                  checked={headerHidden}
                  onChange={(e) => setHeaderHidden(e.target.checked)}
                  className="h-5 w-5 rounded border-neutral-700 bg-neutral-800 text-orange-500 focus:ring-orange-500"
                />
              </div>

              {/* Progress Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Iconify
                    icon="fa:chart-line"
                    className="h-4 w-4 text-gray-400"
                  />
                  <span className="text-base sm:text-lg text-white">Normal Progress</span>
                </div>
                <button
                  onClick={onToggleDrawer}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 text-white hover:bg-neutral-700"
                >
                  <FaCog className="h-4 w-4" />
                </button>
              </div>

              {/* Reader Settings Button */}
              <Button
                variant="outline"
                className="w-full justify-start border-neutral-700 text-sm sm:text-base text-white hover:bg-neutral-800"
                onClick={onToggleDrawer}
              >
                <FaCog className="mr-2 h-4 w-4" />
                Reader Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

