"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MangadexApi } from "@/api";
import { Constants } from "@/constants";
import { Utils } from "@/utils";
import { ExtendChapter } from "@/types/mangadex";
import Iconify from "@/components/iconify";
import LanguageIcon from "@/components/language-icon";

interface HistoryItemProps {
  mangaId: string;
  mangaTitle: string;
  cover: string;
  chapterId: string;
  chapterTitle: string;
  onRemove: () => void;
  showImage?: boolean;
}

export default function HistoryItem({
  mangaId,
  mangaTitle,
  cover,
  chapterId,
  chapterTitle,
  onRemove,
  showImage = true,
}: HistoryItemProps) {
  const [chapter, setChapter] = useState<ExtendChapter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const { data } = await MangadexApi.Chapter.getChapterId(chapterId, {
          includes: [
            MangadexApi.Static.Includes.SCANLATION_GROUP,
            MangadexApi.Static.Includes.USER,
          ],
        });
        const extendedChapter = Utils.Mangadex.extendRelationship(
          data.data,
        ) as ExtendChapter;
        setChapter(extendedChapter);
      } catch (error) {
        console.error("Failed to fetch chapter:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [chapterId]);

  if (loading) {
    return (
      <div className="flex items-center gap-4 border-b border-gray-700/50 py-4">
        <div className="h-32 w-20 animate-pulse rounded bg-gray-700/50" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-1/3 animate-pulse rounded bg-gray-700/50" />
          <div className="h-4 w-1/4 animate-pulse rounded bg-gray-700/50" />
        </div>
      </div>
    );
  }

  if (!chapter) {
    return null;
  }

  const volume = chapter.attributes.volume;
  const chapterNum = chapter.attributes.chapter;
  const volumeChapterText = volume
    ? chapterNum
      ? `Vol. ${volume} Ch. ${chapterNum}`
      : `Vol. ${volume}`
    : chapterNum
      ? `Ch. ${chapterNum}`
      : "Oneshot";

  const readableAt = new Date(chapter.attributes.readableAt);
  const timeAgo = Utils.Date.formatNowDistance(readableAt, { addSuffix: true });
  const groupName = chapter.scanlation_group?.attributes?.name || "No Group";
  const uploader = (chapter as any).user?.attributes?.username || "Unknown";
  const language = chapter.attributes.translatedLanguage || "en";
  const commentCount = (chapter as any).comments?.repliesCount || 0;
  const manga = (chapter as any).manga;
  const originalLanguage = manga?.attributes?.originalLanguage || "en";

  if (showImage) {
    // Compact grid view - similar to advanced search compact-grid
    return (
      <div className="flex flex-row gap-4 rounded-lg bg-neutral-800 p-4 sm:p-5 md:p-6">
        {/* Cover Image */}
        <Link
          href={Constants.Routes.nettrom.manga(mangaId)}
          className="shrink-0"
        >
          <div
            className="relative overflow-hidden rounded"
            style={{
              width: "100px",
              aspectRatio: Constants.Nettrom.MANGA_COVER_RATIO,
            }}
          >
            <img
              src={cover}
              className="h-full w-full object-cover transition duration-300 hover:scale-105"
              alt={mangaTitle}
              loading="lazy"
            />
          </div>
        </Link>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Title and Language */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <LanguageIcon languageCode={originalLanguage} />
            <h2 className="min-w-0 flex-1 truncate text-xl font-semibold text-white sm:text-2xl md:text-3xl">
              <Link
                href={Constants.Routes.nettrom.manga(mangaId)}
                className="no-underline hover:no-underline"
              >
                {mangaTitle}
              </Link>
            </h2>
          </div>

          {/* Chapter Link */}
          <div className="mb-3">
            <Link
              href={Constants.Routes.nettrom.chapter(chapterId)}
              className="inline-block rounded bg-green-600 px-3 py-1.5 text-base font-medium text-white no-underline transition-colors hover:bg-green-700 hover:no-underline sm:text-lg md:text-xl lg:text-2xl"
            >
              {volumeChapterText}
            </Link>
          </div>

          {/* Metadata */}
          <div className="mb-3 flex flex-wrap items-center gap-4 text-base text-white sm:gap-5 sm:text-lg md:text-xl lg:text-2xl">
            <span className="flex shrink-0 items-center gap-2">
              <Iconify icon="fa:clock" className="h-5 w-5" />
              {timeAgo}
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <Iconify icon="fa:users" className="h-5 w-5" />
              {groupName}
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <Iconify icon="fa:user" className="h-5 w-5" />
              <span className="text-blue-400">{uploader}</span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <Iconify icon="fa:eye" className="h-5 w-5" />
              N/A
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <Iconify icon="fa:comment" className="h-5 w-5" />
              {commentCount}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // List view - no image, similar to advanced search list view
  return (
    <div className="flex flex-row gap-4 rounded-lg bg-neutral-800 p-4 sm:p-5 md:p-6">
      {/* Content - no image */}
      <div className="min-w-0 flex-1">
        {/* Title and Language */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <LanguageIcon languageCode={originalLanguage} />
          <h2 className="min-w-0 flex-1 truncate text-xl font-semibold text-white sm:text-2xl md:text-3xl">
            <Link
              href={Constants.Routes.nettrom.manga(mangaId)}
              className="no-underline hover:no-underline"
            >
              {mangaTitle}
            </Link>
          </h2>
        </div>

        {/* Chapter Link */}
        <div className="mb-3">
          <Link
            href={Constants.Routes.nettrom.chapter(chapterId)}
            className="inline-block rounded bg-green-600 px-3 py-1.5 text-base font-medium text-white no-underline transition-colors hover:bg-green-700 hover:no-underline sm:text-lg md:text-xl lg:text-2xl"
          >
            {volumeChapterText}
          </Link>
        </div>

        {/* Metadata */}
        <div className="mb-3 flex flex-wrap items-center gap-4 text-base text-white sm:gap-5 sm:text-lg md:text-xl lg:text-2xl">
          <span className="flex shrink-0 items-center gap-2">
            <Iconify icon="fa:clock" className="h-5 w-5" />
            {timeAgo}
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <Iconify icon="fa:users" className="h-5 w-5" />
            {groupName}
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <Iconify icon="fa:user" className="h-5 w-5" />
            <span className="text-blue-400">{uploader}</span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <Iconify icon="fa:eye" className="h-5 w-5" />
            N/A
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <Iconify icon="fa:comment" className="h-5 w-5" />
            {commentCount}
          </span>
        </div>
      </div>
    </div>
  );
}
