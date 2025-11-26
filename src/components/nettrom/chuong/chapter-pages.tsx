import { useChapterPages } from "@/hooks/mangadex";
import LazyImages from "./lazy-images";
import useWindowSize from "@/hooks/useWindowSize";
import { useChapterContext } from "@/contexts/chapter";
import { DataLoader } from "@/components/DataLoader";
import { Button } from "../Button";
import Link from "next/link";
import Iconify from "@/components/iconify";
import { Constants } from "@/constants";

export default function ChapterPages() {
  const { height } = useWindowSize();

  const { chapterId, canNext, canPrev, next, prev, chapter, group, manga } =
    useChapterContext();

  const { pages, isLoading, error } = useChapterPages(
    chapter?.attributes.externalUrl ? null : chapterId,
  );

  return (
    <div className="flex min-h-screen flex-col bg-neutral-900">
      {error ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
          <div className="text-2xl font-bold text-white">
            This chapter has been deleted
          </div>
          <Link href={Constants.Routes.nettrom.manga(manga?.id || "")}>
            <Button icon={<Iconify icon="fa:arrow-left" />}>
              Back to manga page
            </Button>
          </Link>
        </div>
      ) : chapter?.attributes.externalUrl ? (
        <div className="flex flex-1 items-center justify-center p-8">
          <Link href={chapter.attributes.externalUrl} target="_blank">
            <Button icon={<Iconify icon="fa:external-link" />}>
              Read at {group?.attributes.name} website
            </Button>
          </Link>
        </div>
      ) : (
        <DataLoader
          isLoading={isLoading}
          loadingText="Loading chapter content..."
        >
          <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 py-4">
            <LazyImages images={pages} threshold={(height || 1000) * 3} />
          </div>
        </DataLoader>
      )}
    </div>
  );
}
