import Link from "next/link";
import { useState } from "react";

import { Utils } from "@/utils";
import { Constants } from "@/constants";
import { DataLoader } from "@/components/DataLoader";
import { ChapterList, ExtendChapter } from "@/types/mangadex";
import Pagination from "../Pagination";

export default function ListChapter({
  mangaId,
  ...props
}: {
  mangaId: string;
  onPageChange?: (page: number) => void;
  page: number;
  data?: ChapterList;
  items: ExtendChapter[];
}) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(),
  );

  // Group chapters by volume and chapter number
  const groupedChapters = Utils.Mangadex.groupChaptersByVolumeAndChapter(
    props.items,
  );

  const toggleChapterExpansion = (chapterKey: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterKey)) {
      newExpanded.delete(chapterKey);
    } else {
      newExpanded.add(chapterKey);
    }
    setExpandedChapters(newExpanded);
  };

  return (
    <div id="nt_listchapter">
      <h2 className="mb-4 flex items-center gap-4 text-[24px] font-medium text-web-title">
        <i className="fa fa-list"></i>
        <span>Chapter List</span>
      </h2>
      <DataLoader isLoading={!props.data} loadingText="Loading chapter list">
        <div className="rounded-xl border border-muted-foreground p-4 md:p-6">
          {/* Desktop headers - hidden on mobile */}
          <div className="hidden grid-cols-[4fr_3fr_3fr] border-b border-muted-foreground pb-4 text-lg font-medium text-muted-foreground md:grid">
            <div className="no-wrap">Chapter Name</div>
            <div className="no-wrap text-center">Updated</div>
            <div className="no-wrap text-right">Scanlation Groups</div>
          </div>
          <nav>
            <ul className="flex flex-col gap-3 py-4">
              {groupedChapters.map((chapterGroup) => {
                const chapterKey = `${chapterGroup.volume}-${chapterGroup.chapter}`;
                const isExpanded = expandedChapters.has(chapterKey);
                const hasMultipleTranslations =
                  chapterGroup.chapters.length > 1;
                const primaryChapter = chapterGroup.chapters[0];

                return (
                  <li
                    key={chapterKey}
                    className="rounded-lg border border-muted-foreground/30 bg-muted/20 p-3 transition-colors hover:bg-muted/30 md:p-4"
                  >
                    {/* Mobile layout */}
                    <div className="space-y-3 md:hidden">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <Link
                            className="block text-lg font-medium text-web-title transition visited:text-web-titleDisabled hover:text-web-titleLighter"
                            href={Constants.Routes.nettrom.chapter(
                              primaryChapter.id,
                            )}
                          >
                            {Utils.Mangadex.getChapterTitle(primaryChapter)}
                          </Link>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {Utils.Date.formatDateTime(
                              new Date(chapterGroup.latestUpdate),
                            )}
                          </div>
                        </div>
                        {hasMultipleTranslations && (
                          <button
                            onClick={() => toggleChapterExpansion(chapterKey)}
                            className="flex flex-shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary transition-colors hover:bg-primary/20"
                            title={
                              isExpanded
                                ? "Hide translations"
                                : "Show all translations"
                            }
                          >
                            <i
                              className={`fa fa-chevron-${isExpanded ? "up" : "down"} text-xs`}
                            ></i>
                            <span className="font-medium">
                              {chapterGroup.chapters.length}
                            </span>
                          </button>
                        )}
                      </div>
                      {primaryChapter.scanlation_group?.attributes && (
                        <div>
                          <Link
                            href={Constants.Routes.nettrom.scanlationGroup(
                              primaryChapter.scanlation_group.id,
                            )}
                            className="inline-block rounded-full bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-500 transition-colors hover:bg-orange-500/20"
                          >
                            {primaryChapter.scanlation_group.attributes.name}
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden grid-cols-[4fr_3fr_3fr] items-center gap-4 md:grid">
                      <div className="flex items-center gap-3">
                        <Link
                          className="text-xl font-medium text-web-title transition visited:text-web-titleDisabled hover:text-web-titleLighter"
                          href={Constants.Routes.nettrom.chapter(
                            primaryChapter.id,
                          )}
                        >
                          {Utils.Mangadex.getChapterTitle(primaryChapter)}
                        </Link>
                        {hasMultipleTranslations && (
                          <button
                            onClick={() => toggleChapterExpansion(chapterKey)}
                            className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-lg text-primary transition-colors hover:bg-primary/20"
                            title={
                              isExpanded
                                ? "Hide translations"
                                : "Show all translations"
                            }
                          >
                            <i
                              className={`fa fa-chevron-${isExpanded ? "up" : "down"} text-xs`}
                            ></i>
                            <span className="font-medium">
                              {chapterGroup.chapters.length} translations
                            </span>
                          </button>
                        )}
                      </div>
                      <div className="no-wrap text-center text-lg text-muted-foreground">
                        {Utils.Date.formatDateTime(
                          new Date(chapterGroup.latestUpdate),
                        )}
                      </div>
                      <div className="text-right">
                        {primaryChapter.scanlation_group?.attributes && (
                          <Link
                            href={Constants.Routes.nettrom.scanlationGroup(
                              primaryChapter.scanlation_group.id,
                            )}
                            className="inline-block rounded-full bg-orange-500/10 px-4 py-2 text-lg font-medium text-orange-500 transition-colors hover:bg-orange-500/20"
                          >
                            {primaryChapter.scanlation_group.attributes.name}
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Expanded translations */}
                    {isExpanded && hasMultipleTranslations && (
                      <div className="mt-4 border-t border-muted-foreground/20 pt-4">
                        <div className="space-y-3">
                          <h4 className="mb-3 text-base font-medium text-muted-foreground md:text-lg">
                            Available Translations:
                          </h4>
                          {chapterGroup.chapters
                            .slice(1)
                            .map((chapter, index) => (
                              <div
                                key={chapter.id}
                                className="rounded-lg border border-muted-foreground/20 bg-background/50 p-3"
                              >
                                {/* Mobile layout for translations */}
                                <div className="space-y-2 md:hidden">
                                  <div className="flex items-start gap-2">
                                    <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary"></div>
                                    <div className="min-w-0 flex-1">
                                      <Link
                                        className="block text-base font-medium text-foreground transition-colors hover:text-primary"
                                        href={Constants.Routes.nettrom.chapter(
                                          chapter.id,
                                        )}
                                      >
                                        {chapter.attributes.title ||
                                          `Translation ${index + 2}`}
                                      </Link>
                                      <div className="mt-1 text-sm text-muted-foreground">
                                        {Utils.Date.formatDateTime(
                                          new Date(
                                            chapter.attributes.readableAt,
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {chapter.scanlation_group?.attributes && (
                                    <div>
                                      <Link
                                        href={Constants.Routes.nettrom.scanlationGroup(
                                          chapter.scanlation_group.id,
                                        )}
                                        className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-500 transition-colors hover:bg-blue-500/20"
                                      >
                                        {
                                          chapter.scanlation_group.attributes
                                            .name
                                        }
                                      </Link>
                                    </div>
                                  )}
                                </div>

                                {/* Desktop layout for translations */}
                                <div className="hidden grid-cols-[4fr_3fr_3fr] items-center gap-4 md:grid">
                                  <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                                    <Link
                                      className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                                      href={Constants.Routes.nettrom.chapter(
                                        chapter.id,
                                      )}
                                    >
                                      {chapter.attributes.title ||
                                        `Translation ${index + 2}`}
                                    </Link>
                                  </div>
                                  <div className="no-wrap text-center text-lg text-muted-foreground">
                                    {Utils.Date.formatDateTime(
                                      new Date(chapter.attributes.readableAt),
                                    )}
                                  </div>
                                  <div className="text-right">
                                    {chapter.scanlation_group?.attributes && (
                                      <Link
                                        href={Constants.Routes.nettrom.scanlationGroup(
                                          chapter.scanlation_group.id,
                                        )}
                                        className="inline-block rounded-full bg-blue-500/10 px-4 py-2 text-lg font-medium text-blue-500 transition-colors hover:bg-blue-500/20"
                                      >
                                        {
                                          chapter.scanlation_group.attributes
                                            .name
                                        }
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
              {groupedChapters.length === 0 && (
                <li className="py-8 text-center text-muted-foreground">
                  <div className="mb-2 text-2xl font-medium">
                    No chapters found
                  </div>
                  <div className="text-lg">
                    Try changing the language in settings or this manga may have
                    been removed from MangaDex.
                  </div>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </DataLoader>
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Pagination
          onPageChange={(event) => {
            props.onPageChange?.(event.selected);
          }}
          pageCount={
            Math.floor(
              (props.data?.total || 0) / Constants.Mangadex.CHAPTER_LIST_LIMIT,
            ) + 1
          }
          forcePage={props.page}
        />
        <p className="mb-0 py-2 text-center text-sm text-muted-foreground sm:py-4 sm:text-right sm:text-lg">
          Showing{" "}
          <span className="text-foreground">
            {groupedChapters.length} / {props.data?.total || 0}
          </span>{" "}
          chapters
        </p>
      </div>
    </div>
  );
}
