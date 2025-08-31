import { Metadata, ResolvingMetadata } from "next";
import { MangadexApi } from "@/api";
import { Utils } from "@/utils";
import { Constants } from "@/constants";
import { MangaDexError } from "@/api/mangadex/util";
import { notFound } from "next/navigation";

export async function generateMetadata(
  { params }: { params: { mangaId: string } },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // read route params
  const id = params.mangaId;

  const previousImages = (await parent).openGraph?.images || [];
  const mdImage = {
    url: `https://og.mangadex.org/og-image/manga/${id}`,
    width: 1200,
    height: 630,
  };
  try {
    // fetch data
    const {
      data: { data: manga },
    } = await MangadexApi.Manga.getMangaId(id);
    return {
      title: `${Utils.Mangadex.getMangaTitle(manga)} - Read now at ${Constants.APP_NAME}`,
      description: Utils.Mangadex.transLocalizedStr(
        manga.attributes.description,
      ),
      openGraph: {
        images: [mdImage],
      },
      twitter: {
        images: [mdImage],
      },
    };
  } catch (error) {
    if (error instanceof MangaDexError) {
      if (error.status === 404) {
        return notFound();
      }
    }
    throw error;
  }

  return {
    title: "Read now at NetTrom",
    description: "NetTrom - Civilized Manga Reading Website",
    openGraph: {
      images: [mdImage, ...previousImages],
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="">{children}</div>;
}
