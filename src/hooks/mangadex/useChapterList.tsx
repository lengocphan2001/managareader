import useSWR from "swr";
import { MangadexApi } from "@/api";
import { ExtendChapter } from "@/types/mangadex";
import { Constants } from "@/constants";
import { Utils } from "@/utils";

export const chaptersPerPage = Constants.Mangadex.CHAPTER_LIST_LIMIT;

export default function useChapterList(
  mangaId: string,
  options: MangadexApi.Manga.GetMangaIdFeedRequestOptions,
) {
  // Don't restrict by translatedLanguage at API level - fetch all available chapters
  // and prioritize by scanlation group language focus instead
  const apiOptions = { ...options };

  // Remove translatedLanguage filter to fetch all available chapters
  delete apiOptions.translatedLanguage;

  apiOptions.includes = [
    MangadexApi.Static.Includes.SCANLATION_GROUP,
    MangadexApi.Static.Includes.USER,
  ];
  apiOptions.order = {
    volume: MangadexApi.Static.Order.DESC,
    chapter: MangadexApi.Static.Order.DESC,
  };
  if (!apiOptions.contentRating)
    apiOptions.contentRating = [
      MangadexApi.Static.MangaContentRating.EROTICA,
      MangadexApi.Static.MangaContentRating.PORNOGRAPHIC,
      MangadexApi.Static.MangaContentRating.SAFE,
      MangadexApi.Static.MangaContentRating.SUGGESTIVE,
    ];
  apiOptions.limit = chaptersPerPage;
  if (apiOptions.offset && apiOptions.offset > 10000) {
    apiOptions.offset = 10000 - apiOptions.limit;
  }
  const { data, isLoading, error } = useSWR(
    [mangaId, apiOptions],
    () => MangadexApi.Manga.getMangaIdFeed(mangaId, apiOptions),
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
    },
  );

  data?.data.data.forEach(
    (c) => Utils.Mangadex.extendRelationship(c) as ExtendChapter,
  );

  const chapters = (data?.data.data || []) as ExtendChapter[];
  const prioritizedChapters = Utils.Mangadex.prioritizeChaptersByGroupLanguage(
    chapters,
    options.translatedLanguage || ["en", "ja-ro"],
  );

  return {
    chapters: prioritizedChapters,
    data,
    isLoading,
    error,
  };
}
