import { MangadexApi } from "@/api";
import { LocalizedString } from "@/types/mangadex";
import {
  Chapter,
  ExtendChapter,
  ExtendManga,
  Relationship,
} from "@/types/mangadex";
import axios from "axios";
import { ReadonlyURLSearchParams } from "next/navigation";

const defaultImage = "/images/truyendex-loading.jpg";

export class MangaDexUtils {
  axiosInstance = axios.create({
    baseURL: "https://api.mangadex.org",
    timeout: 10000,
  });

  transLocalizedStr(localizedString: LocalizedString) {
    if (!localizedString) return "";
    return localizedString.en || localizedString["ja-ro"] || "";
  }

  getMangaTitle(manga: ExtendManga | null | undefined) {
    if (!manga) return "";
    return (
      manga.attributes.title?.["en"] ||
      manga.attributes.title?.["ja-ro"] ||
      manga.attributes.altTitles.find((t) => t["en"])?.["en"] ||
      manga.attributes.altTitles.find((t) => t["ja-ro"])?.["ja-ro"] ||
      Object.values(manga.attributes.title)?.[0] ||
      "No title"
    );
  }

  getMangaAltTitles(manga: ExtendManga | null | undefined) {
    if (!manga) return [];
    return manga.attributes.altTitles
      .filter((aT) => aT["ja"] || aT["ja-ro"] || aT["en"])
      .map((aT) => Object.values(aT)[0]);
  }

  getOriginalMangaTitle(manga: ExtendManga | null | undefined) {
    if (!manga) return "";
    const originalLanguage = manga.attributes.originalLanguage || "ja";
    return (
      manga.attributes.altTitles.find((t) => t[originalLanguage])?.[
        originalLanguage
      ] ||
      manga.attributes.title?.["ja-ro"] ||
      ""
    );
  }

  getChapterTitle(chapter: Chapter | null) {
    if (!chapter) return "";
    if (chapter.attributes.title)
      return (
        (chapter.attributes.volume !== null
          ? `T${chapter.attributes.volume} `
          : "") +
        (chapter.attributes.chapter !== null
          ? `C${chapter.attributes.chapter} `
          : "") +
        chapter.attributes.title
      );
    if (chapter.attributes.volume) {
      if (chapter.attributes.chapter) {
        return `Chapter ${chapter.attributes.chapter} Volume ${chapter.attributes.volume}`;
      }
      return `Oneshot Volume ${chapter.attributes.volume}`;
    }
    if (chapter.attributes.chapter)
      return `Chapter ${chapter.attributes.chapter}`;
    return "Oneshot";
  }

  /**
   * Filter and prioritize chapters based on scanlation group focused languages
   * Prioritizes groups that focus on English/Japanese over Vietnamese
   */
  prioritizeChaptersByGroupLanguage(
    chapters: ExtendChapter[],
    preferredLanguages: string[] = ["en", "ja-ro"],
  ): ExtendChapter[] {
    return chapters.sort((a, b) => {
      const aGroup = a.scanlation_group;
      const bGroup = b.scanlation_group;

      // If no scanlation groups, maintain original order
      if (!aGroup && !bGroup) return 0;
      if (!aGroup) return 1;
      if (!bGroup) return -1;

      const aFocusedLanguages = aGroup.attributes.focusedLanguages || [];
      const bFocusedLanguages = bGroup.attributes.focusedLanguages || [];

      // Check if groups focus on preferred languages
      const aHasPreferred = aFocusedLanguages.some((lang) =>
        preferredLanguages.includes(lang),
      );
      const bHasPreferred = bFocusedLanguages.some((lang) =>
        preferredLanguages.includes(lang),
      );

      // Prioritize groups with preferred languages
      if (aHasPreferred && !bHasPreferred) return -1;
      if (!aHasPreferred && bHasPreferred) return 1;

      // If both have or don't have preferred languages, maintain original order
      return 0;
    });
  }

  /**
   * Group chapters by volume and chapter number, like MangaDex
   * Each group contains all translations for the same chapter
   */
  groupChaptersByVolumeAndChapter(chapters: ExtendChapter[]): Array<{
    volume: string | null;
    chapter: string | null;
    title: string | null;
    chapters: ExtendChapter[];
    latestUpdate: string;
  }> {
    const grouped = new Map<string, ExtendChapter[]>();

    // Group chapters by volume and chapter number
    chapters.forEach((chapter) => {
      const volume = chapter.attributes.volume || "none";
      const chapterNum = chapter.attributes.chapter || "none";
      const key = `${volume}-${chapterNum}`;

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(chapter);
    });

    // Convert to array and sort
    return Array.from(grouped.entries())
      .map(([key, chapterList]) => {
        // Sort chapters within each group by scanlation group language preference
        const sortedChapters =
          this.prioritizeChaptersByGroupLanguage(chapterList);

        // Get the latest update time
        const latestUpdate = Math.max(
          ...chapterList.map((c) =>
            new Date(c.attributes.readableAt).getTime(),
          ),
        );

        return {
          volume: chapterList[0].attributes.volume,
          chapter: chapterList[0].attributes.chapter,
          title: chapterList[0].attributes.title,
          chapters: sortedChapters,
          latestUpdate: new Date(latestUpdate).toISOString(),
        };
      })
      .sort((a, b) => {
        // Sort by volume first, then by chapter number
        const aVolume = a.volume === "none" ? "999" : a.volume;
        const bVolume = b.volume === "none" ? "999" : b.volume;

        if (aVolume !== bVolume) {
          return parseFloat(bVolume) - parseFloat(aVolume); // Descending order
        }

        const aChapter = a.chapter === "none" ? "0" : a.chapter;
        const bChapter = b.chapter === "none" ? "0" : b.chapter;

        return parseFloat(bChapter) - parseFloat(aChapter); // Descending order
      });
  }

  normalizeParams(
    params: ReadonlyURLSearchParams,
  ): MangadexApi.Manga.GetSearchMangaRequestOptions {
    const result: MangadexApi.Manga.GetSearchMangaRequestOptions = {};
    const limit = params.get("limit");
    result.limit = limit ? parseInt(limit) : 24;

    const offset = params.get("offset");
    result.offset = offset ? parseInt(offset) : 0;

    if (params.getAll("authors").length > 0) {
      result.authors = params.getAll("authors");
    }
    if (params.getAll("artists").length > 0) {
      result.artists = params.getAll("artists");
    }
    if (params.getAll("includedTags").length > 0) {
      result.includedTags = params.getAll("includedTags");
    }
    if (params.getAll("excludedTags").length > 0) {
      result.excludedTags = params.getAll("excludedTags");
    }
    if (params.getAll("excludedTags").length > 0) {
      result.excludedTags = params.getAll("excludedTags");
    }
    // Set default originalLanguage to "en" if not provided
    if (params.getAll("originalLanguage").length > 0) {
      result.originalLanguage = params.getAll("originalLanguage");
    } else {
      result.originalLanguage = ["en"];
    }
    if (params.getAll("publicationDemographic").length > 0) {
      result.publicationDemographic = params.getAll(
        "publicationDemographic",
      ) as MangadexApi.Static.MangaPublicationDemographic[];
    } else {
      result.publicationDemographic = [];
    }
    if (params.getAll("contentRating").length > 0) {
      result.contentRating = params.getAll(
        "contentRating",
      ) as MangadexApi.Static.MangaContentRating[];
    } else {
      result.contentRating = [];
    }
    if (params.getAll("status").length > 0) {
      result.status = params.getAll(
        "status",
      ) as MangadexApi.Static.MangaPublicationStatus[];
    } else {
      result.status = [];
    }
    if (params.get("title")) {
      result.title = params.get("title")!;
    }
    // Set default availableTranslatedLanguage to ["en", "ja-ro"] if not provided
    const availableTranslatedLanguage = params.getAll(
      "availableTranslatedLanguage",
    );
    result.availableTranslatedLanguage =
      availableTranslatedLanguage.length > 0
        ? availableTranslatedLanguage
        : ["en", "ja-ro"];
    const includedTagsMode = params.get("includedTagsMode");
    if (includedTagsMode) {
      result.includedTagsMode = includedTagsMode === "AND" ? "AND" : "OR";
    }
    const excludedTagsMode = params.get("excludedTagsMode");
    if (excludedTagsMode) {
      result.excludedTagsMode = excludedTagsMode === "AND" ? "AND" : "OR";
    }
    // order
    result.order = {};
    if (params.get("order[latestUploadedChapter]")) {
      result.order.latestUploadedChapter = params.get(
        "order[latestUploadedChapter]",
      ) as MangadexApi.Static.Order;
    }
    if (params.get("order[title]")) {
      result.order.title = params.get(
        "order[title]",
      ) as MangadexApi.Static.Order;
    }
    if (params.get("order[createdAt]")) {
      result.order.createdAt = params.get(
        "order[createdAt]",
      ) as MangadexApi.Static.Order;
    }
    if (params.get("order[followedCount]")) {
      result.order.followedCount = params.get(
        "order[followedCount]",
      ) as MangadexApi.Static.Order;
    }
    if (params.get("order[relevance]")) {
      result.order.relevance = params.get(
        "order[relevance]",
      ) as MangadexApi.Static.Order;
    }
    if (params.get("order[rating]")) {
      result.order.rating = params.get(
        "order[rating]",
      ) as MangadexApi.Static.Order;
    }

    return result;
  }

  getCoverArt(manga: ExtendManga | undefined, size: 256 | 512 = 256) {
    if (!manga) return defaultImage;
    if (manga.cover_art?.attributes) {
      return `https://resizer.f-ck.me/?url=https://mangadex.org/covers/${manga.id}/${manga.cover_art.attributes.fileName}.${size}.jpg`;
    }
    return defaultImage;
  }

  extendRelationship(
    object: Record<string, any> & { relationships: Relationship[] },
  ) {
    for (const rela of object.relationships) {
      object[rela.type] = rela;
    }
    return object;
  }

  extractRelationship(relationships: Relationship[], type: string) {
    return relationships.find((r) => r.type === type) || null;
  }

  translateStatus(status: string) {
    switch (status) {
      case "cancelled":
        return "Cancelled";
      case "completed":
        return "Completed";
      case "hiatus":
        return "Hiatus";
      default:
        return "Ongoing";
    }
  }

  translateContentRating(rating: string) {
    switch (rating) {
      case "safe":
        return "Safe";
      case "suggestive":
        return "Suggestive";
      case "erotica":
        return "Erotica";
      case "pornographic":
        return "Pornographic";
      default:
        return "Unknown";
    }
  }

  translateISOLanguage(isoLanguage: string) {
    switch (isoLanguage) {
      case "ja":
        return "Japanese";
      case "en":
        return "English";
      case "vi":
        return "Vietnamese";
      case "ko":
        return "Korean";
      case "zh":
        return "Chinese";
      case "fr":
        return "French";
      case "de":
        return "German";
      case "es":
        return "Spanish";
      case "it":
        return "Italian";
      case "ru":
        return "Russian";
      case "pt":
        return "Portuguese";
      case "id":
        return "Indonesian";
      case "th":
        return "Thai";
      case "ms":
        return "Malay";
      case "hi":
        return "Hindi";
      case "ar":
        return "Arabic";
      case "bn":
        return "Bengali";
      case "pa":
        return "Punjabi";
      case "jv":
        return "Javanese";
      case "te":
        return "Telugu";
      case "mr":
        return "Marathi";
      case "ta":
        return "Tamil";
      case "ur":
        return "Urdu";
      case "gu":
        return "Gujarati";
      case "kn":
        return "Kannada";
      case "ml":
        return "Malayalam";
      case "or":
        return "Odia";
      case "fa":
        return "Persian";
      case "tr":
        return "Turkish";
      case "pl":
        return "Polish";
      case "uk":
        return "Ukrainian";
      case "ro":
        return "Romanian";
      case "nl":
        return "Dutch";
      case "sv":
        return "Swedish";
      case "fi":
        return "Finnish";
      case "no":
        return "Norwegian";
      case "da":
        return "Danish";
      case "hu":
        return "Hungarian";
      case "cs":
        return "Czech";
      case "sk":
        return "Slovak";
      case "bg":
        return "Bulgarian";
      case "sr":
        return "Serbian";
      case "hr":
        return "Croatian";
      case "lt":
        return "Lithuanian";
      case "lv":
        return "Latvian";
      case "et":
        return "Estonian";
      case "sl":
        return "Slovenian";
      case "he":
        return "Hebrew";
      case "el":
        return "Greek";
      case "hy":
        return "Armenian";
      case "ka":
        return "Georgian";
      case "az":
        return "Azerbaijani";
      case "kk":
        return "Kazakh";
      case "uz":
        return "Uzbek";
      case "mn":
        return "Mongolian";
      case "ne":
        return "Nepali";
      case "si":
        return "Sinhala";
      case "my":
        return "Burmese";
      case "km":
        return "Khmer";
      case "lo":
        return "Lao";
      case "am":
        return "Amharic";
      case "sw":
        return "Swahili";
      case "yo":
        return "Yoruba";
      case "ig":
        return "Igbo";
      case "zu":
        return "Zulu";
      case "xh":
        return "Xhosa";
      case "af":
        return "Afrikaans";
      case "st":
        return "Sesotho";
      case "tn":
        return "Tswana";
      case "ts":
        return "Tsonga";
      case "ve":
        return "Venda";
      case "nr":
        return "Ndebele";
      case "ss":
        return "Swati";
      case "tn":
        return "Tswana";
      case "ts":
        return "Tsonga";
      case "ve":
        return "Venda";
      case "nr":
        return "Ndebele";
      case "ss":
        return "Swati";
      default:
        return isoLanguage;
    }
  }

  translateTagGroup(format: string) {
    // "content" | "format" | "genre" | "theme"
    switch (format) {
      case "content":
        return "Content Warning";
      case "format":
        return "Format";
      case "genre":
        return "Genre";
      case "theme":
        return "Theme";
      default:
        return format;
    }
  }
}
