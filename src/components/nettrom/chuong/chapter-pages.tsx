import { useChapterPages } from "@/hooks/mangadex";
import LazyImages from "./lazy-images";
import useWindowSize from "@/hooks/useWindowSize";
import { useChapterContext } from "@/contexts/chapter";
import { DataLoader } from "@/components/DataLoader";
import { Button } from "../Button";
import CommentSection from "../binh-luan/comment-section";
import { Alert } from "../Alert";
import ScanlationGroupInformation from "./scanlation-group-information";
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
    <div>
      {error ? (
        <div className="container flex flex-col items-center justify-center gap-2">
          <div className="text-2xl font-bold">This chapter has been deleted</div>
          <Link href={Constants.Routes.nettrom.manga(manga?.id || "")}>
            <Button icon={<Iconify icon="fa:arrow-left" />}>
              Back to manga page
            </Button>
          </Link>
        </div>
      ) : chapter?.attributes.externalUrl ? (
        <div className="container flex justify-center">
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
          <div className="reading-detail box_doc">
            <LazyImages images={pages} threshold={(height || 1000) * 3} />
          </div>
        </DataLoader>
      )}
      <div className="container">
        <div className="mb-2 mt-4 flex flex-col gap-2">
          <Button disabled={!canNext} onClick={next}>
            Next Chapter
          </Button>
          <Button disabled={!canPrev} onClick={prev}>
            Previous Chapter
          </Button>
        </div>
        <DataLoader isLoading={!group} loadingText="Loading scanlation group...">
          {group && (
            <ScanlationGroupInformation group={group} canNext={canNext} />
          )}
        </DataLoader>
        <DataLoader isLoading={!chapter} loadingText="Loading comments...">
          {chapterId && (
            <CommentSection type="chapter" typeId={chapterId} />
          )}
        </DataLoader>
      </div>
    </div>
  );
}
