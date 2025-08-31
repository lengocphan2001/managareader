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
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  
  // Group chapters by volume and chapter number
  const groupedChapters = Utils.Mangadex.groupChaptersByVolumeAndChapter(props.items);
  
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
      <DataLoader
        isLoading={!props.data}
        loadingText="Loading chapter list"
      >
        <div className="rounded-xl border border-muted-foreground p-4 md:p-6">
          {/* Desktop headers - hidden on mobile */}
          <div className="hidden md:grid grid-cols-[4fr_3fr_3fr] border-b border-muted-foreground pb-4 text-muted-foreground text-lg font-medium">
            <div className="no-wrap">Chapter Name</div>
            <div className="no-wrap text-center">Updated</div>
            <div className="no-wrap text-right">Scanlation Groups</div>
          </div>
          <nav>
            <ul className="flex flex-col gap-3 py-4">
              {groupedChapters.map((chapterGroup) => {
                const chapterKey = `${chapterGroup.volume}-${chapterGroup.chapter}`;
                const isExpanded = expandedChapters.has(chapterKey);
                const hasMultipleTranslations = chapterGroup.chapters.length > 1;
                const primaryChapter = chapterGroup.chapters[0];
                
                return (
                  <li key={chapterKey} className="border border-muted-foreground/30 rounded-lg p-3 md:p-4 bg-muted/20 hover:bg-muted/30 transition-colors">
                    {/* Mobile layout */}
                    <div className="md:hidden space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <Link
                            className="text-web-title text-lg font-medium transition visited:text-web-titleDisabled hover:text-web-titleLighter block"
                            href={Constants.Routes.nettrom.chapter(primaryChapter.id)}
                          >
                            {Utils.Mangadex.getChapterTitle(primaryChapter)}
                          </Link>
                          <div className="text-sm text-muted-foreground mt-1">
                            {Utils.Date.formatDateTime(new Date(chapterGroup.latestUpdate))}
                          </div>
                        </div>
                        {hasMultipleTranslations && (
                          <button
                            onClick={() => toggleChapterExpansion(chapterKey)}
                            className="flex items-center gap-1 px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-sm rounded-full transition-colors flex-shrink-0"
                            title={isExpanded ? "Hide translations" : "Show all translations"}
                          >
                            <i className={`fa fa-chevron-${isExpanded ? 'up' : 'down'} text-xs`}></i>
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
                            className="inline-block px-3 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 text-sm font-medium rounded-full transition-colors"
                          >
                            {primaryChapter.scanlation_group.attributes.name}
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden md:grid grid-cols-[4fr_3fr_3fr] gap-4 items-center">
                      <div className="flex items-center gap-3">
                        <Link
                          className="text-web-title text-xl font-medium transition visited:text-web-titleDisabled hover:text-web-titleLighter"
                          href={Constants.Routes.nettrom.chapter(primaryChapter.id)}
                        >
                          {Utils.Mangadex.getChapterTitle(primaryChapter)}
                        </Link>
                        {hasMultipleTranslations && (
                          <button
                            onClick={() => toggleChapterExpansion(chapterKey)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-lg rounded-full transition-colors"
                            title={isExpanded ? "Hide translations" : "Show all translations"}
                          >
                            <i className={`fa fa-chevron-${isExpanded ? 'up' : 'down'} text-xs`}></i>
                            <span className="font-medium">
                              {chapterGroup.chapters.length} translations
                            </span>
                          </button>
                        )}
                      </div>
                      <div className="no-wrap text-center text-muted-foreground text-lg">
                        {Utils.Date.formatDateTime(new Date(chapterGroup.latestUpdate))}
                      </div>
                      <div className="text-right">
                        {primaryChapter.scanlation_group?.attributes && (
                          <Link
                            href={Constants.Routes.nettrom.scanlationGroup(
                              primaryChapter.scanlation_group.id,
                            )}
                            className="inline-block px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 text-lg font-medium rounded-full transition-colors"
                          >
                            {primaryChapter.scanlation_group.attributes.name}
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    {/* Expanded translations */}
                    {isExpanded && hasMultipleTranslations && (
                      <div className="mt-4 pt-4 border-t border-muted-foreground/20">
                        <div className="space-y-3">
                          <h4 className="text-base md:text-lg font-medium text-muted-foreground mb-3">Available Translations:</h4>
                          {chapterGroup.chapters.slice(1).map((chapter, index) => (
                            <div key={chapter.id} className="bg-background/50 rounded-lg border border-muted-foreground/20 p-3">
                              {/* Mobile layout for translations */}
                              <div className="md:hidden space-y-2">
                                <div className="flex items-start gap-2">
                                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                  <div className="flex-1 min-w-0">
                                    <Link
                                      className="text-foreground hover:text-primary transition-colors text-base font-medium block"
                                      href={Constants.Routes.nettrom.chapter(chapter.id)}
                                    >
                                      {chapter.attributes.title || `Translation ${index + 2}`}
                                    </Link>
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {Utils.Date.formatDateTime(new Date(chapter.attributes.readableAt))}
                                    </div>
                                  </div>
                                </div>
                                {chapter.scanlation_group?.attributes && (
                                  <div>
                                    <Link
                                      href={Constants.Routes.nettrom.scanlationGroup(
                                        chapter.scanlation_group.id,
                                      )}
                                      className="inline-block px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-sm font-medium rounded-full transition-colors"
                                    >
                                      {chapter.scanlation_group.attributes.name}
                                    </Link>
                                  </div>
                                )}
                              </div>

                              {/* Desktop layout for translations */}
                              <div className="hidden md:grid grid-cols-[4fr_3fr_3fr] gap-4 items-center">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                  <Link
                                    className="text-foreground hover:text-primary transition-colors text-lg font-medium"
                                    href={Constants.Routes.nettrom.chapter(chapter.id)}
                                  >
                                    {chapter.attributes.title || `Translation ${index + 2}`}
                                  </Link>
                                </div>
                                <div className="no-wrap text-center text-muted-foreground text-lg">
                                  {Utils.Date.formatDateTime(new Date(chapter.attributes.readableAt))}
                                </div>
                                <div className="text-right">
                                  {chapter.scanlation_group?.attributes && (
                                    <Link
                                      href={Constants.Routes.nettrom.scanlationGroup(
                                        chapter.scanlation_group.id,
                                      )}
                                      className="inline-block px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-lg font-medium rounded-full transition-colors"
                                    >
                                      {chapter.scanlation_group.attributes.name}
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
                  <div className="text-2xl font-medium mb-2">No chapters found</div>
                  <div className="text-lg">
                    Try changing the language in settings or this manga may have been removed from MangaDex.
                  </div>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </DataLoader>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
        <p className="mb-0 py-2 sm:py-4 text-muted-foreground text-sm sm:text-lg text-center sm:text-right">
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
