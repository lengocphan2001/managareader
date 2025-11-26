"use client";

import useSWR from "swr/immutable";
import { useMemo } from "react";
import { AppApi } from "@/api";
import { ExtendChapter } from "@/types/mangadex";
import { Utils } from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import { MangadexApi } from "@/api";

const LIMIT = 24; // Number of series per page
const CHAPTERS_PER_SERIES = 100; // Number of chapters to fetch per series (for list view, show all)

export default function useLibraryUpdates({
  page = 0,
  limit = LIMIT,
  chaptersPerSeries = CHAPTERS_PER_SERIES,
}: {
  page?: number;
  limit?: number;
  chaptersPerSeries?: number;
} = {}) {
  const { user } = useAuth();

  // Get paginated manga from library (all statuses)
  const { data: libraryData, error: libraryError, isLoading: libraryLoading } = useSWR(
    user ? ["user-library-updates", user.id, page, limit] : null,
    async () => {
      if (!user) return null;
      // Get paginated manga from library (no status filter)
      const response = await AppApi.User.getLibrary({ 
        limit: limit, 
        page: page + 1 // Backend uses 1-based page
      });
      
      if (!response.success || !response.data) {
        return {
          seriesIds: [],
          total: 0,
        };
      }

      return {
        seriesIds: response.data,
        total: response.pagination?.total || 0,
      };
    }
  );

  // Get latest chapters for each series
  const { data: chaptersData, error: chaptersError, isLoading: chaptersLoading } = useSWR(
    libraryData?.seriesIds && libraryData.seriesIds.length > 0
      ? ["library-updates-chapters", libraryData.seriesIds]
      : null,
    async () => {
      if (!libraryData?.seriesIds || libraryData.seriesIds.length === 0) return null;

      // Fetch latest chapters for each series
      const allChapters: ExtendChapter[] = [];

      for (const seriesId of libraryData.seriesIds) {
        try {
          const response = await MangadexApi.Manga.getMangaIdFeed(seriesId, {
            includes: [
              MangadexApi.Static.Includes.SCANLATION_GROUP,
              MangadexApi.Static.Includes.USER,
              MangadexApi.Static.Includes.MANGA,
            ],
            order: {
              readableAt: MangadexApi.Static.Order.DESC,
            },
            limit: chaptersPerSeries,
            contentRating: [
              MangadexApi.Static.MangaContentRating.SAFE,
              MangadexApi.Static.MangaContentRating.SUGGESTIVE,
              MangadexApi.Static.MangaContentRating.EROTICA,
            ],
          });

          if (response.data.result === "ok") {
            const chapters = response.data.data.map((c) =>
              Utils.Mangadex.extendRelationship(c)
            ) as ExtendChapter[];
            allChapters.push(...chapters);
          }
        } catch (error) {
          console.error(`Error fetching chapters for series ${seriesId}:`, error);
        }
      }

      return allChapters;
    }
  );

  // Group chapters by mangaId
  const updates = useMemo(() => {
    const grouped: Record<string, ExtendChapter[]> = {};
    if (chaptersData) {
      for (const chapter of chaptersData) {
        const mangaId = chapter.manga?.id;
        if (!mangaId) continue;
        if (!grouped[mangaId]) {
          grouped[mangaId] = [];
        }
        grouped[mangaId].push(chapter);
      }
    }
    return grouped;
  }, [chaptersData]);

  return {
    updates,
    isLoading: libraryLoading || chaptersLoading,
    error: libraryError || chaptersError,
    total: libraryData?.total || 0,
    totalPages: Math.ceil((libraryData?.total || 0) / limit),
  };
}

