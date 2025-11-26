import { MangadexApi } from "@/api";
import Manga from "@/components/nettrom/truyen-tranh/manga";
import { ExtendManga } from "@/types/mangadex";
import { Utils } from "@/utils";
import { MangaDexError } from "@/api/mangadex/util";
import { notFound } from "next/navigation";
import MangaHeaderBlock from "@/components/nettrom/truyen-tranh/manga-header-block";
import MangaInfoBlock from "@/components/nettrom/truyen-tranh/manga-info-block";

export default async function MangaPage({
  params,
}: {
  params: { mangaId: string };
}) {
  try {
    const {
      data: { data: manga },
    } = await MangadexApi.Manga.getMangaId(params.mangaId, {
      includes: [
        MangadexApi.Static.Includes.COVER_ART,
        MangadexApi.Static.Includes.AUTHOR,
        MangadexApi.Static.Includes.ARTIST,
      ],
    });

    const extendedManga = Utils.Mangadex.extendRelationship(
      manga,
    ) as ExtendManga;
    const coverArt = Utils.Mangadex.getCoverArt(extendedManga, 512);
    const title = Utils.Mangadex.getMangaTitle(extendedManga);
    const originalTitle = Utils.Mangadex.getOriginalMangaTitle(extendedManga);
    const author = extendedManga?.author?.attributes?.name || "N/A";
    const artist = extendedManga?.artist?.attributes?.name;
    const description = Utils.Mangadex.transLocalizedStr(
      extendedManga.attributes.description,
    );
    const tags = extendedManga.attributes.tags?.slice(0, 2) || [];

    return (
      <div className="relative w-full">
        {/* Background Image Section - chỉ nửa màn hình, sát mép trên */}
        {coverArt && coverArt !== "/images/truyendex-loading.jpg" && (
          <div
            className="relative -mt-16 h-[200px] overflow-visible bg-neutral-800 sm:h-[250px] md:h-[300px]"
            style={{
              position: "relative",
              left: 0,
              right: 0,
            }}
          >
            {/* Background Image */}
            <div
              className="absolute bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${coverArt})`,
                filter: "brightness(0.6)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "100vw",
                height: "100%",
                left: "50%",
                right: "50%",
                marginLeft: "-50vw",
                marginRight: "-50vw",
                top: 0,
                bottom: 0,
              }}
            />
            <div className="absolute inset-0 overflow-hidden bg-gradient-to-r from-neutral-900/70 via-neutral-900/50 to-transparent" />

            {/* Block chứa thumbnail, title, nội dung và action buttons - relative với background */}
            <MangaHeaderBlock
              mangaId={params.mangaId}
              manga={extendedManga}
              coverArt={coverArt}
              title={title}
              originalTitle={originalTitle}
              author={author}
              artist={artist}
              description={description}
              tags={tags}
            />
          </div>
        )}

        {/* Info Block - căn giữa màn hình, nằm dưới background */}
        <div className="z-10">
          <MangaInfoBlock mangaId={params.mangaId} manga={extendedManga} />
        </div>

        {/* Content */}
        <div className="z-10 px-2 py-3 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:px-24 lg:py-12">
          <Manga mangaId={params.mangaId} prefetchedManga={extendedManga} />
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof MangaDexError) {
      if (error.status === 404) {
        return notFound();
      }
    }
    throw error;
  }
}
