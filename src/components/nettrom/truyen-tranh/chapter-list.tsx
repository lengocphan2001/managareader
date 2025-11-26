import Link from "next/link";
import { useMemo, useState } from "react";

import { Utils } from "@/utils";
import { Constants } from "@/constants";
import { DataLoader } from "@/components/DataLoader";
import { ChapterList, ExtendChapter } from "@/types/mangadex";
import PaginationNew from "../common/pagination-new";
import Iconify from "@/components/iconify";

export default function ListChapter({
  mangaId: _mangaId,
  ...props
}: {
  mangaId: string;
  onPageChange?: (page: number) => void;
  page: number;
  data?: ChapterList;
  items: ExtendChapter[];
}) {
  // Group chapters by volume and chapter number
  const groupedChapters = Utils.Mangadex.groupChaptersByVolumeAndChapter(
    props.items,
  );

  // Group chapters by volume
  const volumeGroups = useMemo(() => {
    const volumes = new Map<string | null, ExtendChapter[]>();
    groupedChapters.forEach((group) => {
      const volume = group.volume === "none" ? null : group.volume;
      if (!volumes.has(volume)) {
        volumes.set(volume, []);
      }
      volumes.get(volume)!.push(...group.chapters);
    });
    return Array.from(volumes.entries()).sort((a, b) => {
      if (a[0] === null) return 1;
      if (b[0] === null) return -1;
      return parseFloat(b[0]) - parseFloat(a[0]);
    });
  }, [groupedChapters]);

  const [expandedVolumes, setExpandedVolumes] = useState<Set<string | null>>(
    new Set(),
  );

  const toggleVolume = (volume: string | null) => {
    setExpandedVolumes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(volume)) {
        newSet.delete(volume);
      } else {
        newSet.add(volume);
      }
      return newSet;
    });
  };

  return (
    <div id="nt_listchapter">
      <div className="mb-3 flex items-center sm:mb-4">
        <button className="rounded bg-gray-700/50 px-3 py-1.5 text-xl text-white hover:bg-gray-700 sm:px-4 sm:py-2 sm:text-xl md:text-xl lg:text-2xl">
          Descending
        </button>
      </div>
      <DataLoader isLoading={!props.data} loadingText="Loading chapter list">
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {volumeGroups.map(([volume, chapters]) => {
            const sortedChapters = [...chapters].sort((a, b) => {
              const aChapter = parseFloat(a.attributes.chapter || "0");
              const bChapter = parseFloat(b.attributes.chapter || "0");
              return bChapter - aChapter;
            });

            // Get chapter range for display
            const chapterNumbers = sortedChapters
              .map((c) => parseFloat(c.attributes.chapter || "0"))
              .filter((n) => n > 0)
              .sort((a, b) => b - a);

            const firstChapter = chapterNumbers[chapterNumbers.length - 1];
            const lastChapter = chapterNumbers[0];
            const chapterRange =
              firstChapter === lastChapter
                ? `Ch. ${firstChapter}`
                : `Ch. ${firstChapter} - ${lastChapter}`;

            const isExpanded = expandedVolumes.has(volume);

            return (
              <div key={volume || "none"} className="space-y-2">
                {volume && (
                  <button
                    onClick={() => toggleVolume(volume)}
                    className="mb-2 flex w-full items-center justify-between rounded p-2 hover:bg-gray-800/30 sm:mb-3 sm:p-3"
                  >
                    <h3 className="text-xl font-semibold text-white sm:text-xl md:text-xl lg:text-2xl">
                      Volume {volume}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xl text-gray-400 sm:text-xl md:text-xl lg:text-2xl">
                        {chapterRange}
                      </span>
                      <Iconify
                        icon={isExpanded ? "fa:chevron-up" : "fa:chevron-down"}
                        className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5 md:h-6 md:w-6"
                      />
                      <span className="text-xl text-gray-400 sm:text-xl md:text-xl lg:text-2xl">
                        {sortedChapters.length}
                      </span>
                    </div>
                  </button>
                )}
                {(!volume || isExpanded) && (
                  <div className="space-y-1">
                    {sortedChapters.map((chapter) => {
                      const chapterTitle =
                        Utils.Mangadex.getChapterTitle(chapter);
                      const readableAt = new Date(
                        chapter.attributes.readableAt,
                      );
                      const timeAgo = Utils.Date.formatNowDistance(readableAt);
                      const groupName =
                        chapter.scanlation_group?.attributes?.name ||
                        "No Group";
                      const uploader =
                        (chapter as any).user?.attributes?.username ||
                        "Unknown";
                      const language =
                        chapter.attributes.translatedLanguage || "en";
                      const commentCount =
                        (chapter as any).comments?.repliesCount || 0;

                      return (
                        <div
                          key={chapter.id}
                          className="flex flex-wrap items-center gap-2 border-b border-gray-700/50 py-2 hover:bg-gray-800/30 sm:flex-nowrap sm:gap-3 sm:py-2.5 md:gap-4 md:py-3"
                        >
                          <div className="flex flex-shrink-0 items-center gap-2">
                            <Iconify
                              icon="fa:eye"
                              className="h-4 w-4 text-gray-500 sm:h-5 sm:w-5 md:h-6 md:w-6"
                            />
                            <Iconify
                              icon={`circle-flags:${language}`}
                              className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6"
                            />
                          </div>
                          <Link
                            href={Constants.Routes.nettrom.chapter(chapter.id)}
                            className="min-w-0 flex-1 truncate text-xl text-white hover:text-orange-500 sm:text-xl md:text-xl lg:text-2xl"
                          >
                            {chapterTitle}
                          </Link>
                          <span className="hidden flex-shrink-0 text-xl text-gray-400 sm:inline sm:text-xl md:text-xl lg:text-xl xl:text-2xl">
                            {groupName}
                          </span>
                          <span className="hidden flex-shrink-0 text-xl text-gray-500 sm:text-xl md:inline md:text-xl lg:text-xl xl:text-2xl">
                            {timeAgo} ago
                          </span>
                          <span className="hidden flex-shrink-0 text-xl text-gray-400 sm:text-xl md:text-xl lg:inline lg:text-xl xl:text-2xl">
                            N/A
                          </span>
                          <span className="hidden flex-shrink-0 text-xl text-gray-400 sm:text-xl md:text-xl lg:text-xl xl:inline xl:text-2xl">
                            {uploader}
                          </span>
                          <div className="flex flex-shrink-0 items-center gap-1">
                            <Iconify
                              icon="fa:comment"
                              className="h-4 w-4 text-gray-500 sm:h-5 sm:w-5 md:h-6 md:w-6"
                            />
                            <span className="text-xl text-gray-400 sm:text-xl md:text-xl lg:text-xl xl:text-2xl">
                              {commentCount}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {groupedChapters.length === 0 && (
            <div className="py-6 text-center text-gray-400 sm:py-8">
              <div className="mb-2 text-xl font-medium sm:text-xl md:text-xl lg:text-2xl">
                No chapters found
              </div>
              <div className="text-xl sm:text-xl md:text-xl">
                Try changing the language in settings or this manga may have
                been removed from MangaDex.
              </div>
            </div>
          )}
        </div>
      </DataLoader>
      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="flex w-full justify-center">
          <PaginationNew
            currentPage={props.page}
            totalPages={
              Math.floor(
                (props.data?.total || 0) /
                  Constants.Mangadex.CHAPTER_LIST_LIMIT,
              ) + 1
            }
            onPageChange={(page) => {
              props.onPageChange?.(page);
            }}
          />
        </div>
        <p className="mb-0 py-2 text-center text-xl text-gray-400 sm:py-4 sm:text-xl md:text-xl lg:text-xl">
          Showing{" "}
          <span className="text-white">
            {groupedChapters.length} / {props.data?.total || 0}
          </span>{" "}
          chapters
        </p>
      </div>
    </div>
  );
}
