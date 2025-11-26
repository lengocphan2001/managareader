"use client";

import useSWR from "swr/immutable";
import { useMemo } from "react";
import { MangadexApi, AppApi } from "@/api";
import { ExtendManga, MangaList } from "@/types/mangadex";
import { Utils } from "@/utils";
import { useAuth } from "@/hooks/useAuth";

export default function useLibraryManga(
  status: string,
  { limit = 12, offset = 0 }: { limit?: number; offset?: number } = {}
) {
  const { user } = useAuth();
  const page = Math.floor(offset / limit) + 1;

  const { data: libraryData, error: libraryError, isLoading: libraryLoading } = useSWR(
    user ? ["library", status, user.id, page, limit] : null,
    async () => {
      if (!user) return null;
      return AppApi.User.getLibrary({ status, page, limit });
    }
  );

  const mangaIds = useMemo(() => {
    if (libraryData?.success && libraryData.data) {
      return libraryData.data;
    }
    return [];
  }, [libraryData]);

  const { data: mangaData, error: mangaError, isLoading: mangaLoading } = useSWR(
    mangaIds.length > 0 ? ["library-manga", mangaIds, limit, offset] : null,
    async () => {
      if (mangaIds.length === 0) return null;
      // Split into chunks of 100 (Mangadex limit)
      const chunks: string[][] = [];
      for (let i = 0; i < mangaIds.length; i += 100) {
        chunks.push(mangaIds.slice(i, i + 100));
      }
      
      // Fetch all chunks
      const allManga: any[] = [];
      for (const chunk of chunks) {
        const response = await MangadexApi.Manga.getSearchManga({
          ids: chunk,
          limit: 100,
          includes: [
            MangadexApi.Static.Includes.COVER_ART,
            MangadexApi.Static.Includes.AUTHOR,
            MangadexApi.Static.Includes.ARTIST,
          ],
        });
        if (response.data.result === "ok") {
          allManga.push(...response.data.data);
        }
      }

      // Apply pagination
      const paginatedManga = allManga.slice(offset % limit, (offset % limit) + limit);
      
      return {
        result: "ok" as const,
        response: "collection" as const,
        data: paginatedManga,
        limit: limit,
        offset: offset,
        total: libraryData?.pagination?.total || 0,
      } as MangaList;
    }
  );

  const mangaList = useMemo(() => {
    if (mangaData && mangaData.result === "ok") {
      return mangaData.data.map(
        (m) => Utils.Mangadex.extendRelationship(m) as ExtendManga
      );
    }
    return [];
  }, [mangaData]);

  return {
    data: mangaData,
    error: libraryError || mangaError,
    isLoading: libraryLoading || mangaLoading,
    mangaList,
    total: libraryData?.pagination?.total || 0,
  };
}

