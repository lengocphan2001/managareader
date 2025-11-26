"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "nextjs-toploader/app";
import { FaExclamationTriangle } from "react-icons/fa";

import { useMangadex } from "@/contexts/mangadex";
import { AppApi, MangadexApi } from "@/api";
import Iconify from "@/components/iconify";
import { useSeriesInfo } from "@/hooks/core";
import { Utils } from "@/utils";
import ChapterList from "./chapter-list";
import { Constants } from "@/constants";
import { Button } from "../Button";
import { DataLoader } from "@/components/DataLoader";
import { useChapterList } from "@/hooks/mangadex";
import { useSettingsContext } from "@/contexts/settings";
import { ExtendManga } from "@/types/mangadex";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/shadcn/tabs";
import CommentSection from "../binh-luan/comment-section";

import Markdown from "../Markdown";

export default function Manga({
  mangaId,
  prefetchedManga,
}: {
  mangaId: string;
  prefetchedManga: ExtendManga;
}) {
  const { mangas, updateMangas, updateMangaStatistics, mangaStatistics } =
    useMangadex();
  const { filteredLanguages, filteredContent } = useSettingsContext();
  const manga = mangas[mangaId] || prefetchedManga;
  const { data: seriesInfo, mutate } = useSeriesInfo(mangaId);
  const title = Utils.Mangadex.getMangaTitle(manga);
  const altTitles = Utils.Mangadex.getMangaAltTitles(manga);
  const url = Constants.Routes.nettrom.manga(mangaId);
  const [page, setPage] = useState(0);
  const { data, chapters, error } = useChapterList(mangaId, {
    offset: page * Constants.Mangadex.CHAPTER_LIST_LIMIT,
    translatedLanguage: filteredLanguages,
  });
  const chapterListData = useMemo(() => data?.data, [data]);
  const router = useRouter();
  const [showPorngraphic, setShowPorngraphic] = useState(false);

  const handleLogin = () => {
    router.push(Constants.Routes.loginWithRedirect(window.location.pathname));
  };

  const handleConfirmPorngraphic = useCallback(() => {
    setShowPorngraphic(true);
  }, [setShowPorngraphic]);

  const followManga = useCallback(async () => {
    try {
      const { followed } = await AppApi.Series.followOrUnfollow(mangaId);
      toast(followed ? "Followed successfully" : "Unfollowed successfully");
      await mutate();
    } catch {
      toast("An error occurred");
    }
  }, [mutate, mangaId]);

  useEffect(() => {
    updateMangas({
      ids: [mangaId],
      includes: [
        MangadexApi.Static.Includes.ARTIST,
        MangadexApi.Static.Includes.AUTHOR,
      ],
    });
    updateMangaStatistics({ manga: [mangaId] });
  }, [mangaId]);

  if (
    !showPorngraphic &&
    !filteredContent.includes(
      MangadexApi.Static.MangaContentRating.PORNOGRAPHIC,
    ) &&
    manga.attributes.contentRating ===
      MangadexApi.Static.MangaContentRating.PORNOGRAPHIC
  )
    return (
      <div className="mb-2">
        <div className="flex flex-col justify-center">
          <FaExclamationTriangle className="mx-auto text-[100px] text-red-600" />
          <p className="text-center">
            This manga may contain sensitive content and you have set up
            filtering for manga with "adult" content
          </p>
        </div>
        <div className="mt-4 flex justify-center">
          <Button onClick={handleConfirmPorngraphic}>
            I take responsibility for my decision
          </Button>
        </div>
      </div>
    );

  const originalTitle = Utils.Mangadex.getOriginalMangaTitle(manga);
  const rating = mangaStatistics[mangaId]?.rating.bayesian.toFixed(2) || "0.00";
  const follows = mangaStatistics[mangaId]?.follows || 0;
  const commentCount = seriesInfo?.comment_count || 0;
  const status = manga?.attributes.status || "ongoing";
  const year = manga?.attributes.year;
  const isOngoing = status === "ongoing";
  const demographic = manga?.attributes.publicationDemographic;
  // Find format tag (4-Koma, Web Comic, etc.)
  const formatTag = manga?.attributes.tags.find((tag) => {
    const name = tag.attributes.name.en?.toLowerCase() || "";
    return (
      name.includes("4-koma") ||
      name.includes("4koma") ||
      name.includes("web comic") ||
      name.includes("oneshot")
    );
  });
  const format = formatTag?.attributes.name.en || "Manga";

  return (
    <DataLoader
      isLoading={!manga}
      loadingText="Loading manga information..."
      error={error}
    >
      <article className="dark:text-foreground">
        {/* Cover, Title, Author đã được di chuyển lên background section */}
        {/* Action Buttons, Tags, Publication Status, Stats đã được di chuyển vào MangaInfoBlock */}

        {/* Synopsis */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="text-xl text-gray-300 sm:text-xl md:text-xl lg:text-2xl">
            <Markdown
              content={
                manga?.attributes?.description.vi ||
                manga?.attributes?.description.en ||
                "No description available."
              }
            />
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="chapters" className="w-full">
          <div className="mb-4 overflow-x-auto sm:mb-6">
            <TabsList className="!h-auto gap-2 bg-transparent">
              <TabsTrigger
                value="chapters"
                className="shrink-0 whitespace-nowrap rounded px-3 py-2 text-xl data-[state=active]:bg-gray-700 data-[state=inactive]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-white data-[state=inactive]:text-gray-400 sm:px-4 sm:py-2.5 sm:text-xl md:px-6 md:py-3 md:text-xl lg:text-2xl"
              >
                Chapters
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="shrink-0 whitespace-nowrap rounded px-3 py-2 text-xl data-[state=active]:bg-gray-700 data-[state=inactive]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-white data-[state=inactive]:text-gray-400 sm:px-4 sm:py-2.5 sm:text-xl md:px-6 md:py-3 md:text-xl lg:text-2xl"
              >
                Comments {commentCount > 0 && `(${commentCount})`}
              </TabsTrigger>
              <TabsTrigger
                value="art"
                className="shrink-0 whitespace-nowrap rounded px-3 py-2 text-xl data-[state=active]:bg-gray-700 data-[state=inactive]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-white data-[state=inactive]:text-gray-400 sm:px-4 sm:py-2.5 sm:text-xl md:px-6 md:py-3 md:text-xl lg:text-2xl"
              >
                Art
              </TabsTrigger>
              <TabsTrigger
                value="related"
                className="shrink-0 whitespace-nowrap rounded px-3 py-2 text-xl data-[state=active]:bg-gray-700 data-[state=inactive]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-white data-[state=inactive]:text-gray-400 sm:px-4 sm:py-2.5 sm:text-xl md:px-6 md:py-3 md:text-xl lg:text-2xl"
              >
                Related
              </TabsTrigger>
              <TabsTrigger
                value="recommendations"
                className="shrink-0 whitespace-nowrap rounded px-3 py-2 text-xl data-[state=active]:bg-gray-700 data-[state=inactive]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-white data-[state=inactive]:text-gray-400 sm:px-4 sm:py-2.5 sm:text-xl md:px-6 md:py-3 md:text-xl lg:text-2xl"
              >
                Recommendations
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chapters" className="mt-0">
            {/* 2 Column Layout: Left (Metadata) and Right (Chapter List) */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-3">
              {/* Left Panel - Metadata */}
              <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:col-span-1">
                {/* Authors/Artist */}
                <div>
                  <p className="mb-2 text-xl font-medium text-gray-400 sm:mb-3 sm:text-xl md:text-xl lg:text-2xl">
                    Author
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {manga?.author?.attributes && (
                      <span className="rounded-full bg-gray-700/50 px-2 py-1 text-xl text-gray-300 sm:px-3 sm:py-1.5 sm:text-xl md:px-4 md:py-2 md:text-xl lg:text-xl xl:text-2xl">
                        {manga.author.attributes.name}
                      </span>
                    )}
                  </div>
                  {manga?.artist?.attributes && (
                    <>
                      <p className="mb-2 mt-3 text-xl font-medium text-gray-400 sm:mb-3 sm:mt-4 sm:text-xl md:text-xl lg:text-2xl">
                        Artist
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-gray-700/50 px-2 py-1 text-xl text-gray-300 sm:px-3 sm:py-1.5 sm:text-xl md:px-4 md:py-2 md:text-xl lg:text-xl xl:text-2xl">
                          {manga.artist.attributes.name}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Genres */}
                <div>
                  <p className="mb-2 text-xl font-medium text-gray-400 sm:mb-3 sm:text-xl md:text-xl lg:text-2xl">
                    Genres
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {manga?.attributes.tags.slice(0, 10).map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-full bg-gray-700/50 px-2 py-1 text-xl text-gray-300 sm:px-3 sm:py-1.5 sm:text-xl md:px-4 md:py-2 md:text-xl lg:text-xl xl:text-2xl"
                      >
                        {tag.attributes.name.en}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Demographic */}
                {demographic && (
                  <div>
                    <p className="mb-2 text-xl font-medium text-gray-400 sm:mb-3 sm:text-xl md:text-xl lg:text-2xl">
                      Demographic
                    </p>
                    <span className="rounded-full bg-gray-700/50 px-2 py-1 text-xl capitalize text-gray-300 sm:px-3 sm:py-1.5 sm:text-xl md:px-4 md:py-2 md:text-xl lg:text-xl xl:text-2xl">
                      {demographic}
                    </span>
                  </div>
                )}

                {/* Alternative Titles */}
                {altTitles.length > 0 && (
                  <div>
                    <p className="mb-2 text-xl font-medium text-gray-400 sm:mb-3 sm:text-xl md:text-xl lg:text-2xl">
                      Alternative Titles
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {altTitles.map((altTitle, idx) => {
                        const isJapanese =
                          idx === altTitles.length - 1 &&
                          altTitle.match(
                            /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/,
                          );
                        return (
                          <span
                            key={idx}
                            className="flex items-center gap-2 rounded-full bg-gray-700/50 px-2 py-1 text-xl text-gray-300 sm:px-3 sm:py-1.5 sm:text-xl md:px-4 md:py-2 md:text-xl lg:text-xl xl:text-2xl"
                          >
                            {altTitle}
                            {isJapanese ? (
                              <Iconify
                                icon="circle-flags:jp"
                                className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6"
                              />
                            ) : (
                              <Iconify
                                icon="circle-flags:gb"
                                className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6"
                              />
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Panel - Chapter List */}
              <div className="lg:col-span-2">
                <ChapterList
                  mangaId={mangaId}
                  page={page}
                  onPageChange={setPage}
                  data={chapterListData}
                  items={chapters}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="mt-0">
            <CommentSection typeId={mangaId} type="series" />
          </TabsContent>

          <TabsContent value="art" className="mt-0">
            <div className="text-center text-gray-400">
              Art section coming soon
            </div>
          </TabsContent>

          <TabsContent value="related" className="mt-0">
            <div className="text-center text-gray-400">
              Related titles coming soon
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-0">
            <div className="text-center text-gray-400">
              Recommendations coming soon
            </div>
          </TabsContent>
        </Tabs>
      </article>
    </DataLoader>
  );
}
